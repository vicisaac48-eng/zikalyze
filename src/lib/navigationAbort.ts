// ═══════════════════════════════════════════════════════════════════════════════
// 🔄 Navigation Abort Controller — Prevent Hanging During Route Changes
// ═══════════════════════════════════════════════════════════════════════════════
// Provides abort signals that cancel pending requests when navigating away
// ═══════════════════════════════════════════════════════════════════════════════

class NavigationAbortManager {
  private controllers: Map<string, AbortController> = new Map();
  private globalController: AbortController | null = null;

  /**
   * Get or create an abort controller for a specific key (e.g., component name)
   */
  getController(key: string): AbortController {
    if (!this.controllers.has(key)) {
      this.controllers.set(key, new AbortController());
    }
    return this.controllers.get(key)!;
  }

  /**
   * Get the abort signal for a specific key
   */
  getSignal(key: string): AbortSignal {
    return this.getController(key).signal;
  }

  /**
   * Get the global abort controller for app-wide operations
   */
  getGlobalController(): AbortController {
    if (!this.globalController || this.globalController.signal.aborted) {
      this.globalController = new AbortController();
    }
    return this.globalController;
  }

  /**
   * Get the global abort signal
   */
  getGlobalSignal(): AbortSignal {
    return this.getGlobalController().signal;
  }

  /**
   * Abort all pending requests for a specific key
   */
  abort(key: string): void {
    const controller = this.controllers.get(key);
    if (controller) {
      controller.abort();
      this.controllers.delete(key);
    }
  }

  /**
   * Abort all pending requests globally
   */
  abortAll(): void {
    this.controllers.forEach((controller) => {
      controller.abort();
    });
    this.controllers.clear();
    
    if (this.globalController) {
      this.globalController.abort();
      this.globalController = null;
    }
  }

  /**
   * Reset controller for a specific key
   */
  reset(key: string): void {
    this.abort(key);
    this.controllers.set(key, new AbortController());
  }

  /**
   * Clean up aborted controllers
   */
  cleanup(): void {
    const keysToDelete: string[] = [];
    this.controllers.forEach((controller, key) => {
      if (controller.signal.aborted) {
        keysToDelete.push(key);
      }
    });
    keysToDelete.forEach((key) => this.controllers.delete(key));
  }
}

// Singleton instance
export const navigationAbort = new NavigationAbortManager();

/**
 * React hook for using navigation abort signals
 */
export function useNavigationAbort(componentKey: string) {
  const getSignal = () => navigationAbort.getSignal(componentKey);
  const abort = () => navigationAbort.abort(componentKey);
  const reset = () => navigationAbort.reset(componentKey);

  return { getSignal, abort, reset };
}

export default navigationAbort;
