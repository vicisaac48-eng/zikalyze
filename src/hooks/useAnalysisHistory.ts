import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/hooks/useAuth";

export interface AnalysisRecord {
  id: string;
  symbol: string;
  price: number;
  change_24h: number;
  analysis_text: string;
  confidence: number | null;
  bias: string | null;
  created_at: string;
  user_id: string | null;
  was_correct: boolean | null;
  feedback_at: string | null;
}

export interface LearningStats {
  symbol: string;
  total_feedback: number;
  correct_predictions: number;
  incorrect_predictions: number;
  accuracy_percentage: number | null;
  avg_confidence_when_correct: number | null;
  avg_confidence_when_incorrect: number | null;
}

// LocalStorage key for analysis history
const HISTORY_STORAGE_KEY = 'zikalyze_analysis_history';
const MAX_HISTORY_PER_SYMBOL = 50; // Keep last 50 analyses per symbol

/**
 * Get all history from localStorage
 */
function getAllHistory(): AnalysisRecord[] {
  try {
    const stored = localStorage.getItem(HISTORY_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

/**
 * Save all history to localStorage
 */
function saveAllHistory(history: AnalysisRecord[]): void {
  try {
    localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(history));
  } catch (err) {
    console.error('[AnalysisHistory] Failed to save to localStorage:', err);
  }
}

/**
 * Generate a unique ID for analysis records
 */
function generateId(): string {
  return `analysis_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

export const useAnalysisHistory = (symbol: string) => {
  const [history, setHistory] = useState<AnalysisRecord[]>([]);
  const [learningStats, setLearningStats] = useState<LearningStats | null>(null);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  /**
   * Calculate learning stats from history
   */
  const calculateStats = useCallback((records: AnalysisRecord[]): LearningStats | null => {
    const withFeedback = records.filter(r => r.was_correct !== null);
    if (withFeedback.length === 0) return null;

    const correct = withFeedback.filter(r => r.was_correct === true);
    const incorrect = withFeedback.filter(r => r.was_correct === false);

    const avgConfidenceCorrect = correct.length > 0 
      ? correct.reduce((sum, r) => sum + (r.confidence || 0), 0) / correct.length 
      : null;
    const avgConfidenceIncorrect = incorrect.length > 0 
      ? incorrect.reduce((sum, r) => sum + (r.confidence || 0), 0) / incorrect.length 
      : null;

    return {
      symbol: symbol.toUpperCase(),
      total_feedback: withFeedback.length,
      correct_predictions: correct.length,
      incorrect_predictions: incorrect.length,
      accuracy_percentage: withFeedback.length > 0 
        ? Math.round((correct.length / withFeedback.length) * 100) 
        : null,
      avg_confidence_when_correct: avgConfidenceCorrect ? Math.round(avgConfidenceCorrect) : null,
      avg_confidence_when_incorrect: avgConfidenceIncorrect ? Math.round(avgConfidenceIncorrect) : null,
    };
  }, [symbol]);

  // Stable reference to user ID to prevent infinite re-renders
  const userId = user?.id;

  /**
   * Fetch history from localStorage for this symbol and user
   */
  const fetchHistory = useCallback(() => {
    if (!symbol || !userId) {
      setHistory([]);
      setLearningStats(null);
      return;
    }
    
    setLoading(true);
    try {
      const allHistory = getAllHistory();
      const userSymbolHistory = allHistory
        .filter(r => r.symbol === symbol.toUpperCase() && r.user_id === userId)
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, 10);
      
      setHistory(userSymbolHistory);
      setLearningStats(calculateStats(userSymbolHistory));
      console.log(`[AnalysisHistory] Loaded ${userSymbolHistory.length} records for ${symbol}`);
    } catch (err) {
      console.error("[AnalysisHistory] Error fetching history:", err);
      setHistory([]);
    } finally {
      setLoading(false);
    }
  }, [symbol, userId, calculateStats]);

  /**
   * Save a new analysis to localStorage
   */
  const saveAnalysis = useCallback((
    analysisText: string,
    price: number,
    change: number,
    confidence?: number,
    bias?: string
  ): string | null => {
    if (!userId) {
      console.error("[AnalysisHistory] User not authenticated");
      return null;
    }

    try {
      const newRecord: AnalysisRecord = {
        id: generateId(),
        symbol: symbol.toUpperCase(),
        price,
        change_24h: change,
        analysis_text: analysisText,
        confidence: confidence ?? null,
        bias: bias ?? null,
        created_at: new Date().toISOString(),
        user_id: userId,
        was_correct: null,
        feedback_at: null,
      };

      const allHistory = getAllHistory();
      
      // Add new record at the beginning
      allHistory.unshift(newRecord);
      
      // Keep only MAX_HISTORY_PER_SYMBOL per symbol per user
      const filtered = allHistory.filter((r, idx, arr) => {
        const sameSymbolUser = arr.filter(x => x.symbol === r.symbol && x.user_id === r.user_id);
        const indexInGroup = sameSymbolUser.findIndex(x => x.id === r.id);
        return indexInGroup < MAX_HISTORY_PER_SYMBOL;
      });
      
      saveAllHistory(filtered);
      fetchHistory();
      
      console.log(`[AnalysisHistory] Saved analysis for ${symbol}: ${newRecord.id}`);
      return newRecord.id;
    } catch (err) {
      console.error("[AnalysisHistory] Error saving analysis:", err);
      return null;
    }
  }, [symbol, userId, fetchHistory]);

  /**
   * Submit feedback for an analysis
   */
  const submitFeedback = useCallback((id: string, wasCorrect: boolean): boolean => {
    if (!userId) return false;

    try {
      const allHistory = getAllHistory();
      const index = allHistory.findIndex(r => r.id === id && r.user_id === userId);
      
      if (index === -1) return false;
      
      allHistory[index] = {
        ...allHistory[index],
        was_correct: wasCorrect,
        feedback_at: new Date().toISOString(),
      };
      
      saveAllHistory(allHistory);
      fetchHistory();
      
      console.log(`[AnalysisHistory] Feedback submitted for ${id}: ${wasCorrect ? 'correct' : 'incorrect'}`);
      return true;
    } catch (err) {
      console.error("[AnalysisHistory] Error submitting feedback:", err);
      return false;
    }
  }, [userId, fetchHistory]);

  /**
   * Delete a specific analysis
   */
  const deleteAnalysis = useCallback((id: string): void => {
    if (!userId) return;

    try {
      const allHistory = getAllHistory();
      const filtered = allHistory.filter(r => !(r.id === id && r.user_id === userId));
      saveAllHistory(filtered);
      fetchHistory();
      
      console.log(`[AnalysisHistory] Deleted analysis: ${id}`);
    } catch (err) {
      console.error("[AnalysisHistory] Error deleting analysis:", err);
    }
  }, [userId, fetchHistory]);

  /**
   * Clear all history for this symbol and user
   */
  const clearAllHistory = useCallback((): void => {
    if (!userId || !symbol) return;

    try {
      const allHistory = getAllHistory();
      const filtered = allHistory.filter(r => !(r.symbol === symbol.toUpperCase() && r.user_id === userId));
      saveAllHistory(filtered);
      setHistory([]);
      setLearningStats(null);
      
      console.log(`[AnalysisHistory] Cleared all history for ${symbol}`);
    } catch (err) {
      console.error("[AnalysisHistory] Error clearing history:", err);
    }
  }, [userId, symbol]);

  // Load history when symbol or user changes
  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  return { 
    history, 
    learningStats,
    loading, 
    saveAnalysis, 
    submitFeedback,
    deleteAnalysis, 
    clearAllHistory, 
    refreshHistory: fetchHistory,
    refreshStats: fetchHistory // Stats are calculated from history
  };
};
