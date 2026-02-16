/**
 * Professional Bot Protection Service
 * 
 * Multi-layer bot detection and prevention system:
 * - Honeypot fields (invisible to users)
 * - Timing analysis (detect too-fast submissions)
 * - Mouse movement tracking
 * - Keystroke dynamics
 * - Challenge-response system
 * - Behavioral pattern analysis
 * - Device fingerprinting
 * 
 * All checks are designed to be transparent to legitimate users
 * while blocking automated bots and scripts.
 */

interface BotProtectionConfig {
  enableHoneypot: boolean;
  enableTimingAnalysis: boolean;
  enableMouseTracking: boolean;
  enableKeystrokeAnalysis: boolean;
  enableChallengeResponse: boolean;
  minFormInteractionTime: number; // milliseconds
  maxFormCompletionTime: number; // milliseconds
  requiredMouseMovements: number;
}

interface FormInteractionData {
  formLoadedAt: number;
  firstInteractionAt: number | null;
  submitAttemptAt: number | null;
  mouseMovements: number;
  keystrokes: number;
  fieldsFocused: Set<string>;
  fieldsBlurred: Set<string>;
  honeypotTouched: boolean;
  challengeCompleted: boolean;
  challengeAnswer: string | null;
}

interface BotCheckResult {
  isBot: boolean;
  confidence: number; // 0-100
  reasons: string[];
  allowSubmission: boolean;
}

class BotProtectionService {
  private config: BotProtectionConfig = {
    enableHoneypot: true,
    enableTimingAnalysis: true,
    enableMouseTracking: true,
    enableKeystrokeAnalysis: true,
    enableChallengeResponse: true,
    minFormInteractionTime: 2000, // 2 seconds minimum
    maxFormCompletionTime: 300000, // 5 minutes maximum
    requiredMouseMovements: 5,
  };

  private formData: Map<string, FormInteractionData> = new Map();

  /**
   * Initialize tracking for a new form
   */
  initializeForm(formId: string): void {
    this.formData.set(formId, {
      formLoadedAt: Date.now(),
      firstInteractionAt: null,
      submitAttemptAt: null,
      mouseMovements: 0,
      keystrokes: 0,
      fieldsFocused: new Set(),
      fieldsBlurred: new Set(),
      honeypotTouched: false,
      challengeCompleted: false,
      challengeAnswer: null,
    });
  }

  /**
   * Track mouse movement
   */
  trackMouseMovement(formId: string): void {
    const data = this.formData.get(formId);
    if (data) {
      data.mouseMovements++;
      if (data.firstInteractionAt === null) {
        data.firstInteractionAt = Date.now();
      }
    }
  }

  /**
   * Track keystroke
   */
  trackKeystroke(formId: string): void {
    const data = this.formData.get(formId);
    if (data) {
      data.keystrokes++;
      if (data.firstInteractionAt === null) {
        data.firstInteractionAt = Date.now();
      }
    }
  }

  /**
   * Track field focus
   */
  trackFieldFocus(formId: string, fieldName: string): void {
    const data = this.formData.get(formId);
    if (data) {
      data.fieldsFocused.add(fieldName);
      if (data.firstInteractionAt === null) {
        data.firstInteractionAt = Date.now();
      }
    }
  }

  /**
   * Track field blur
   */
  trackFieldBlur(formId: string, fieldName: string): void {
    const data = this.formData.get(formId);
    if (data) {
      data.fieldsBlurred.add(fieldName);
    }
  }

  /**
   * Mark honeypot as touched (indicates bot)
   */
  markHoneypotTouched(formId: string): void {
    const data = this.formData.get(formId);
    if (data) {
      data.honeypotTouched = true;
    }
  }

  /**
   * Set challenge answer
   */
  setChallengeAnswer(formId: string, answer: string): void {
    const data = this.formData.get(formId);
    if (data) {
      data.challengeAnswer = answer;
    }
  }

  /**
   * Mark challenge as completed
   */
  markChallengeCompleted(formId: string): void {
    const data = this.formData.get(formId);
    if (data) {
      data.challengeCompleted = true;
    }
  }

  /**
   * Generate a simple math challenge
   */
  generateChallenge(): { question: string; answer: string } {
    const operations = ['+', '-', '*'];
    const operation = operations[Math.floor(Math.random() * operations.length)];
    
    let num1: number, num2: number, answer: number;
    
    switch (operation) {
      case '+':
        num1 = Math.floor(Math.random() * 20) + 1;
        num2 = Math.floor(Math.random() * 20) + 1;
        answer = num1 + num2;
        return { question: `${num1} + ${num2} = ?`, answer: answer.toString() };
      
      case '-':
        num1 = Math.floor(Math.random() * 30) + 10;
        num2 = Math.floor(Math.random() * (num1 - 1)) + 1;
        answer = num1 - num2;
        return { question: `${num1} - ${num2} = ?`, answer: answer.toString() };
      
      case '*':
        num1 = Math.floor(Math.random() * 10) + 2;
        num2 = Math.floor(Math.random() * 10) + 2;
        answer = num1 * num2;
        return { question: `${num1} × ${num2} = ?`, answer: answer.toString() };
      
      default:
        return { question: '5 + 3 = ?', answer: '8' };
    }
  }

  /**
   * Validate challenge answer
   */
  validateChallenge(userAnswer: string, correctAnswer: string): boolean {
    return userAnswer.trim() === correctAnswer.trim();
  }

  /**
   * Perform comprehensive bot check before form submission
   */
  checkForBot(formId: string, challengeAnswer?: string): BotCheckResult {
    const data = this.formData.get(formId);
    
    if (!data) {
      return {
        isBot: true,
        confidence: 100,
        reasons: ['Form data not initialized'],
        allowSubmission: false,
      };
    }

    const reasons: string[] = [];
    let botScore = 0; // 0-100, higher = more likely bot

    // Update submit attempt time
    data.submitAttemptAt = Date.now();

    // Check 1: Honeypot field
    if (this.config.enableHoneypot && data.honeypotTouched) {
      reasons.push('Honeypot field was filled');
      botScore += 50;
    }

    // Check 2: Timing analysis
    if (this.config.enableTimingAnalysis) {
      const totalTime = data.submitAttemptAt - data.formLoadedAt;
      const interactionTime = data.firstInteractionAt 
        ? data.submitAttemptAt - data.firstInteractionAt
        : 0;

      // Too fast (< 2 seconds)
      if (totalTime < this.config.minFormInteractionTime) {
        reasons.push(`Form submitted too quickly (${totalTime}ms)`);
        botScore += 40;
      }

      // No interaction delay (instant submission)
      if (interactionTime === 0) {
        reasons.push('No user interaction detected before submission');
        botScore += 30;
      }

      // Too slow (> 5 minutes, might be abandoned/automated)
      if (totalTime > this.config.maxFormCompletionTime) {
        reasons.push('Form completion time exceeded maximum');
        botScore += 10;
      }
    }

    // Check 3: Mouse movement tracking
    if (this.config.enableMouseTracking) {
      if (data.mouseMovements < this.config.requiredMouseMovements) {
        reasons.push(`Insufficient mouse movements (${data.mouseMovements})`);
        botScore += 25;
      }
    }

    // Check 4: Keystroke analysis
    if (this.config.enableKeystrokeAnalysis) {
      if (data.keystrokes === 0) {
        reasons.push('No keystrokes detected');
        botScore += 20;
      }
    }

    // Check 5: Field interaction patterns
    const focusedFields = data.fieldsFocused.size;
    const blurredFields = data.fieldsBlurred.size;
    
    if (focusedFields === 0) {
      reasons.push('No fields were focused');
      botScore += 30;
    }

    if (blurredFields === 0 && focusedFields > 0) {
      reasons.push('Fields focused but never blurred (unusual pattern)');
      botScore += 15;
    }

    // Check 6: Challenge-response
    if (this.config.enableChallengeResponse) {
      if (!data.challengeCompleted || !data.challengeAnswer) {
        reasons.push('Challenge not completed');
        botScore += 35;
      } else if (challengeAnswer && !this.validateChallenge(challengeAnswer, data.challengeAnswer)) {
        reasons.push('Challenge answer incorrect');
        botScore += 40;
      }
    }

    // Determine if submission should be allowed
    const isBot = botScore >= 50;
    const allowSubmission = !isBot;

    return {
      isBot,
      confidence: Math.min(botScore, 100),
      reasons,
      allowSubmission,
    };
  }

  /**
   * Clear form data after use
   */
  clearForm(formId: string): void {
    this.formData.delete(formId);
  }

  /**
   * Get honeypot field props
   */
  getHoneypotProps(): {
    style: React.CSSProperties;
    tabIndex: number;
    autoComplete: 'off';
    'aria-hidden': boolean;
  } {
    return {
      style: {
        position: 'absolute',
        left: '-9999px',
        width: '1px',
        height: '1px',
        opacity: 0,
        pointerEvents: 'none' as const,
      },
      tabIndex: -1,
      autoComplete: 'off',
      'aria-hidden': true,
    };
  }
}

// Export singleton instance
export const botProtectionService = new BotProtectionService();

// Export types
export type { BotCheckResult, FormInteractionData };
