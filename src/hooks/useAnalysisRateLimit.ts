// ═══════════════════════════════════════════════════════════════════════════════
// 🔒 Guest User Rate Limiting Hook
// ═══════════════════════════════════════════════════════════════════════════════
// Limits unauthenticated (guest) users to 5 AI analyses maximum.
// Prompts users to sign in/up when they hit the limit.
// ═══════════════════════════════════════════════════════════════════════════════

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "./useAuth";
import { generateClientFingerprint } from "@/lib/bot-protection";

// Storage key for guest analysis count
const GUEST_ANALYSIS_KEY = "zikalyze_guest_analysis_count";

// Maximum analyses allowed for guest users
const MAX_GUEST_ANALYSES = 5;

interface GuestAnalysisData {
  count: number;
  fingerprint: string;
  firstAnalysisTime: number;
}

interface UseAnalysisRateLimitResult {
  /** Whether the current user can run an analysis */
  canAnalyze: boolean;
  /** Number of remaining analyses for guest users */
  remainingAnalyses: number;
  /** Whether user has hit the rate limit */
  isLimitReached: boolean;
  /** Whether the current user is a guest (not signed in) */
  isGuest: boolean;
  /** Current analysis count for guests */
  analysisCount: number;
  /** Maximum allowed analyses for guests */
  maxAnalyses: number;
  /** Record a new analysis (call after successful analysis) */
  recordAnalysis: () => void;
  /** Reset the rate limit (for testing or admin purposes) */
  resetLimit: () => void;
  /** Show the rate limit modal */
  showRateLimitModal: boolean;
  /** Open the rate limit modal */
  openRateLimitModal: () => void;
  /** Close the rate limit modal */
  closeRateLimitModal: () => void;
}

/**
 * Hook for managing guest user rate limiting on AI analyses.
 * 
 * - Authenticated users: No limit, can always analyze
 * - Guest users: Limited to 5 analyses, then prompted to sign up
 * 
 * Uses localStorage with client fingerprint to persist across sessions.
 */
export function useAnalysisRateLimit(): UseAnalysisRateLimitResult {
  const { isSignedIn, loading } = useAuth();
  const [analysisData, setAnalysisData] = useState<GuestAnalysisData | null>(null);
  const [showRateLimitModal, setShowRateLimitModal] = useState(false);
  const [initialized, setInitialized] = useState(false);

  // Load saved analysis data on mount
  useEffect(() => {
    if (loading) return;

    const loadAnalysisData = () => {
      try {
        const saved = localStorage.getItem(GUEST_ANALYSIS_KEY);
        const fingerprint = generateClientFingerprint();
        
        if (saved) {
          const parsed: GuestAnalysisData = JSON.parse(saved);
          // Validate fingerprint matches (same device/browser)
          if (parsed.fingerprint === fingerprint) {
            setAnalysisData(parsed);
          } else {
            // Different device, start fresh
            const newData: GuestAnalysisData = {
              count: 0,
              fingerprint,
              firstAnalysisTime: 0
            };
            setAnalysisData(newData);
          }
        } else {
          // No saved data, initialize
          const newData: GuestAnalysisData = {
            count: 0,
            fingerprint,
            firstAnalysisTime: 0
          };
          setAnalysisData(newData);
        }
      } catch (error) {
        console.warn("[RateLimit] Failed to load analysis data:", error);
        // Initialize with empty data
        setAnalysisData({
          count: 0,
          fingerprint: generateClientFingerprint(),
          firstAnalysisTime: 0
        });
      }
      setInitialized(true);
    };

    loadAnalysisData();
  }, [loading]);

  // Persist analysis data to localStorage
  const saveAnalysisData = useCallback((data: GuestAnalysisData) => {
    try {
      localStorage.setItem(GUEST_ANALYSIS_KEY, JSON.stringify(data));
    } catch (error) {
      console.warn("[RateLimit] Failed to save analysis data:", error);
    }
  }, []);

  // Calculate rate limit status
  const isGuest = !isSignedIn && !loading;
  const analysisCount = analysisData?.count ?? 0;
  const remainingAnalyses = isGuest ? Math.max(0, MAX_GUEST_ANALYSES - analysisCount) : Infinity;
  const isLimitReached = isGuest && analysisCount >= MAX_GUEST_ANALYSES;
  const canAnalyze = !isGuest || !isLimitReached;

  // Record a new analysis
  const recordAnalysis = useCallback(() => {
    // Only count for guest users
    if (!isGuest || !analysisData) return;

    const newData: GuestAnalysisData = {
      ...analysisData,
      count: analysisData.count + 1,
      firstAnalysisTime: analysisData.firstAnalysisTime || Date.now()
    };

    setAnalysisData(newData);
    saveAnalysisData(newData);

    // Show modal when reaching the limit
    if (newData.count >= MAX_GUEST_ANALYSES) {
      setShowRateLimitModal(true);
    }
  }, [isGuest, analysisData, saveAnalysisData]);

  // Reset the rate limit
  const resetLimit = useCallback(() => {
    const newData: GuestAnalysisData = {
      count: 0,
      fingerprint: generateClientFingerprint(),
      firstAnalysisTime: 0
    };
    setAnalysisData(newData);
    saveAnalysisData(newData);
    setShowRateLimitModal(false);
  }, [saveAnalysisData]);

  // Modal controls
  const openRateLimitModal = useCallback(() => {
    setShowRateLimitModal(true);
  }, []);

  const closeRateLimitModal = useCallback(() => {
    setShowRateLimitModal(false);
  }, []);

  return {
    canAnalyze: initialized ? canAnalyze : true, // Allow while loading
    remainingAnalyses,
    isLimitReached,
    isGuest,
    analysisCount,
    maxAnalyses: MAX_GUEST_ANALYSES,
    recordAnalysis,
    resetLimit,
    showRateLimitModal,
    openRateLimitModal,
    closeRateLimitModal
  };
}
