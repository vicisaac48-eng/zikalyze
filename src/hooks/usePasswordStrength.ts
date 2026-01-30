import { useMemo } from "react";

// Common leaked/weak passwords to check against
const COMMON_PASSWORDS = new Set([
  "password", "123456", "12345678", "qwerty", "abc123", "monkey", "1234567",
  "letmein", "trustno1", "dragon", "baseball", "iloveyou", "master", "sunshine",
  "ashley", "bailey", "passw0rd", "shadow", "123123", "654321", "superman",
  "qazwsx", "michael", "football", "password1", "password123", "welcome",
  "jesus", "ninja", "mustang", "password1!", "admin", "login", "starwars",
  "121212", "dragon123", "princess", "hello", "charlie", "donald", "hunter",
  "love123", "zaq1zaq1", "monkey123", "qwerty123", "letmein123", "password!",
  "123456789", "1234567890", "000000", "111111", "bitcoin", "crypto", "ethereum"
]);

// Common keyboard patterns
const KEYBOARD_PATTERNS = [
  "qwerty", "asdfgh", "zxcvbn", "qwertyuiop", "asdfghjkl", "zxcvbnm",
  "1234567890", "0987654321", "qazwsx", "wsxedc", "rfvtgb"
];

// Sequential patterns
const hasSequentialChars = (password: string): boolean => {
  const lower = password.toLowerCase();
  for (let i = 0; i < lower.length - 2; i++) {
    const charCode1 = lower.charCodeAt(i);
    const charCode2 = lower.charCodeAt(i + 1);
    const charCode3 = lower.charCodeAt(i + 2);
    // Check for ascending or descending sequences
    if ((charCode2 === charCode1 + 1 && charCode3 === charCode2 + 1) ||
        (charCode2 === charCode1 - 1 && charCode3 === charCode2 - 1)) {
      return true;
    }
  }
  return false;
};

// Repeated characters
const hasRepeatedChars = (password: string): boolean => {
  return /(.)\1{2,}/.test(password);
};

export interface PasswordStrengthResult {
  score: number; // 0-4 (0=very weak, 4=very strong)
  level: "very-weak" | "weak" | "fair" | "strong" | "very-strong";
  feedback: string[];
  isValid: boolean;
  color: string;
}

export const usePasswordStrength = (password: string): PasswordStrengthResult => {
  return useMemo(() => {
    const feedback: string[] = [];
    let score = 0;

    if (!password) {
      return {
        score: 0,
        level: "very-weak",
        feedback: [],
        isValid: false,
        color: "bg-muted"
      };
    }

    // Check minimum length (12 characters required)
    if (password.length < 12) {
      feedback.push(`At least 12 characters required (${password.length}/12)`);
    } else {
      score += 1;
      if (password.length >= 16) score += 0.5;
    }

    // Check for lowercase
    if (!/[a-z]/.test(password)) {
      feedback.push("Add lowercase letters");
    } else {
      score += 0.5;
    }

    // Check for uppercase
    if (!/[A-Z]/.test(password)) {
      feedback.push("Add uppercase letters");
    } else {
      score += 0.5;
    }

    // Check for numbers
    if (!/\d/.test(password)) {
      feedback.push("Add numbers");
    } else {
      score += 0.5;
    }

    // Check for special characters
    if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?`~]/.test(password)) {
      feedback.push("Add special characters (!@#$%^&*)");
    } else {
      score += 0.5;
    }

    // Check against common passwords
    const lowerPassword = password.toLowerCase();
    if (COMMON_PASSWORDS.has(lowerPassword) || 
        COMMON_PASSWORDS.has(lowerPassword.replace(/[0-9]/g, '')) ||
        COMMON_PASSWORDS.has(lowerPassword.replace(/[!@#$%^&*]/g, ''))) {
      feedback.push("This is a commonly used password");
      score = Math.max(0, score - 2);
    }

    // Check for keyboard patterns
    for (const pattern of KEYBOARD_PATTERNS) {
      if (lowerPassword.includes(pattern)) {
        feedback.push("Avoid keyboard patterns");
        score = Math.max(0, score - 1);
        break;
      }
    }

    // Check for sequential characters
    if (hasSequentialChars(password)) {
      feedback.push("Avoid sequential characters (abc, 123)");
      score = Math.max(0, score - 0.5);
    }

    // Check for repeated characters
    if (hasRepeatedChars(password)) {
      feedback.push("Avoid repeating characters (aaa, 111)");
      score = Math.max(0, score - 0.5);
    }

    // Determine level
    let level: PasswordStrengthResult["level"];
    let color: string;
    
    if (score < 1) {
      level = "very-weak";
      color = "bg-destructive";
    } else if (score < 2) {
      level = "weak";
      color = "bg-warning";
    } else if (score < 2.5) {
      level = "fair";
      color = "bg-warning";
    } else if (score < 3.5) {
      level = "strong";
      color = "bg-primary";
    } else {
      level = "very-strong";
      color = "bg-primary";
    }

    // Password is valid if it meets minimum requirements
    const isValid = password.length >= 12 && 
                    /[a-z]/.test(password) && 
                    /[A-Z]/.test(password) && 
                    /\d/.test(password) && 
                    /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?`~]/.test(password) &&
                    !COMMON_PASSWORDS.has(lowerPassword);

    return {
      score: Math.min(4, Math.max(0, score)),
      level,
      feedback,
      isValid,
      color
    };
  }, [password]);
};
