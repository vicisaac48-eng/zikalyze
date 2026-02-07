// ═══════════════════════════════════════════════════════════════════════════════
// 📅 MACRO CATALYST ENGINE — Real Calendar-Based Event Tracking
// ═══════════════════════════════════════════════════════════════════════════════
// 🎯 ACCURACY & FACT-CHECKING MODE — Precision date verification
// ═══════════════════════════════════════════════════════════════════════════════

import { MacroCatalyst } from './types';

// Helper: calculate accurate days until a date
const getDaysUntil = (now: Date, targetDate: Date): number => {
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const targetStart = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate());
  return Math.round((targetStart.getTime() - todayStart.getTime()) / (1000 * 60 * 60 * 24));
};

// 🎯 ACCURACY ENHANCEMENT: Format date as "Weekday, Month Day" (e.g., "Friday, Feb 13")
const formatDateReadable = (date: Date): string => {
  const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  
  const weekday = weekdays[date.getDay()];
  const month = months[date.getMonth()];
  const day = date.getDate();
  
  return `${weekday}, ${month} ${day}`;
};

// Helper: format days for display
const formatDays = (days: number): string => {
  if (days === 0) return 'TODAY';
  if (days === 1) return 'Tomorrow';
  return `In ${days} days`;
};

// 🎯 ACCURACY ENHANCEMENT: Create explicit date calculation display
// Shows: "Current: Friday, Feb 7 | Event: Tuesday, Feb 18 | Days: 11"
const formatDateCalculation = (now: Date, eventDate: Date, daysUntil: number): string => {
  const currentFormatted = formatDateReadable(now);
  const eventFormatted = formatDateReadable(eventDate);
  return `Current: ${currentFormatted} | Event: ${eventFormatted} | Days: ${daysUntil}`;
};

// Get 3rd Friday of a month (options expiry)
const getThirdFriday = (y: number, m: number): Date => {
  const firstDay = new Date(y, m, 1);
  const firstFriday = new Date(y, m, 1 + ((5 - firstDay.getDay() + 7) % 7));
  return new Date(y, m, firstFriday.getDate() + 14);
};

export function getUpcomingMacroCatalysts(): MacroCatalyst[] {
  const now = new Date();
  const catalysts: MacroCatalyst[] = [];
  const year = now.getFullYear();
  const month = now.getMonth();
  const dayOfWeek = now.getDay();

  // FOMC MEETINGS 2025-2026 (Official Fed schedule - announcement on 2nd day)
  const fomcDates = [
    new Date(2025, 0, 29), new Date(2025, 2, 19), new Date(2025, 4, 7),
    new Date(2025, 5, 18), new Date(2025, 6, 30), new Date(2025, 8, 17),
    new Date(2025, 9, 29), new Date(2025, 11, 10),  // Oct 29, Dec 10 (UPDATED)
    new Date(2026, 0, 28), new Date(2026, 2, 18), new Date(2026, 3, 29),  // Apr 29 (UPDATED)
    new Date(2026, 5, 17), new Date(2026, 6, 29), new Date(2026, 8, 16),
    new Date(2026, 9, 28), new Date(2026, 11, 9),  // Oct 28, Dec 9 (UPDATED)
  ];

  const nextFOMC = fomcDates.find(d => getDaysUntil(now, d) >= 0);
  if (nextFOMC) {
    const daysToFOMC = getDaysUntil(now, nextFOMC);
    if (daysToFOMC <= 14) {
      // 🎯 ACCURACY ENHANCEMENT: Show explicit date calculation
      const dateCalc = formatDateCalculation(now, nextFOMC, daysToFOMC);
      // Add CME FedWatch context
      const fedWatchNote = 'CME FedWatch: ~90% hold expected. Surprise cut = ultra bullish, hike = crash risk';
      // 📅 EVENT VERIFICATION: Note that dates should be verified against official Fed calendar
      const verificationNote = '⚠️ Verify against official Federal Reserve calendar for schedule changes';
      catalysts.push({
        event: 'FOMC Interest Rate Decision',
        date: formatDateReadable(nextFOMC), // Use readable format
        impact: 'HIGH',
        expectedEffect: 'VOLATILE',
        description: `${dateCalc}. ${fedWatchNote}. ${verificationNote}`
      });
    }
  }

  // CPI RELEASE DATES 2025-2026 (Official BLS schedule)
  const cpiDates = [
    // 2025
    new Date(2025, 1, 12), new Date(2025, 2, 12), new Date(2025, 3, 10),
    new Date(2025, 4, 13), new Date(2025, 5, 11), new Date(2025, 6, 15),  // Jul 15 UPDATED
    new Date(2025, 7, 12), new Date(2025, 8, 11), new Date(2025, 9, 24),  // Oct 24 UPDATED  
    new Date(2025, 10, 13), new Date(2025, 11, 10),
    // 2026
    new Date(2026, 0, 13), new Date(2026, 1, 11), new Date(2026, 2, 11),
    new Date(2026, 3, 10), new Date(2026, 4, 12), new Date(2026, 5, 10),  // Apr 10 UPDATED
    new Date(2026, 6, 14), new Date(2026, 7, 12), new Date(2026, 8, 11),
    new Date(2026, 9, 14), new Date(2026, 10, 10), new Date(2026, 11, 10),  // Nov 10, Dec 10 UPDATED
  ];

  const nextCPI = cpiDates.find(d => getDaysUntil(now, d) >= 0);
  if (nextCPI) {
    const daysToCPI = getDaysUntil(now, nextCPI);
    if (daysToCPI <= 10) {
      // 🎯 ACCURACY ENHANCEMENT: Show explicit date calculation
      const dateCalc = formatDateCalculation(now, nextCPI, daysToCPI);
      // Add market consensus context
      const consensusNote = 'Consensus: ~2.8% YoY. Below = bullish surprise (rate cut hopes), Above = hawkish reaction';
      // 📅 EVENT VERIFICATION: CPI releases can be delayed due to holidays/government shutdowns
      const verificationNote = '⚠️ Check bls.gov for delays (holidays, shutdowns can reschedule release)';
      catalysts.push({
        event: 'US CPI Inflation Data',
        date: formatDateReadable(nextCPI), // Use readable format
        impact: 'HIGH',
        expectedEffect: 'VOLATILE',
        description: `${dateCalc}. ${consensusNote}. ${verificationNote}`,
        // Example: Mark as rescheduled if needed (would be set dynamically in production)
        // rescheduled: false
      });
    }
  }

  // Weekly Jobless Claims (Every Thursday)
  const daysToThursday = (4 - dayOfWeek + 7) % 7;
  if (daysToThursday <= 3) {
    const nextThursday = new Date(now);
    nextThursday.setDate(now.getDate() + daysToThursday);
    // 🎯 ACCURACY ENHANCEMENT: Show explicit date calculation
    const dateCalc = formatDateCalculation(now, nextThursday, daysToThursday);
    catalysts.push({
      event: 'Weekly Jobless Claims',
      date: formatDateReadable(nextThursday), // Use readable format
      impact: 'MEDIUM',
      expectedEffect: 'VOLATILE',
      description: `${dateCalc}${daysToThursday === 0 ? ' — Watch for market reaction' : ''}`
    });
  }

  // Options Expiry (3rd Friday)
  let optionsDate = getThirdFriday(year, month);
  if (getDaysUntil(now, optionsDate) < 0) {
    optionsDate = getThirdFriday(month === 11 ? year + 1 : year, (month + 1) % 12);
  }

  const daysToExpiry = getDaysUntil(now, optionsDate);
  if (daysToExpiry <= 7 && daysToExpiry >= 0) {
    const expiryMonth = optionsDate.getMonth();
    const isQuarterly = [2, 5, 8, 11].includes(expiryMonth);
    // 🎯 ACCURACY ENHANCEMENT: Show explicit date calculation
    const dateCalc = formatDateCalculation(now, optionsDate, daysToExpiry);
    catalysts.push({
      event: isQuarterly ? 'Quarterly Options Expiry (Major)' : 'Monthly Options Expiry',
      date: formatDateReadable(optionsDate), // Use readable format
      impact: isQuarterly ? 'HIGH' : 'MEDIUM',
      expectedEffect: 'VOLATILE',
      description: `${dateCalc}. ${isQuarterly ? '$B+ in options expire — expect max pain volatility' : 'Large positions rolling'}`
    });
  }

  // Ongoing macro theme
  catalysts.push({
    event: 'Tariff/Trade Policy + Geopolitics',
    date: 'Ongoing',
    impact: 'MEDIUM',
    expectedEffect: 'UNCERTAIN',
    description: 'Trade tensions, regulatory news can trigger sudden moves'
  });

  return catalysts.sort((a, b) => {
    if (a.date === 'Ongoing') return 1;
    if (b.date === 'Ongoing') return -1;
    return new Date(a.date).getTime() - new Date(b.date).getTime();
  }).slice(0, 3);
}

export function getQuickMacroFlag(): string {
  const catalysts = getUpcomingMacroCatalysts();
  const now = new Date();

  // 🎯 ACCURACY ENHANCEMENT: Parse readable date format back to Date for calculation
  const parseReadableDate = (dateStr: string): Date | null => {
    // Handle "Ongoing" case
    if (dateStr === 'Ongoing') return null;
    
    // Parse format "Weekday, Month Day" back to full date
    const weekdays: Record<string, number> = {
      'Sunday': 0, 'Monday': 1, 'Tuesday': 2, 'Wednesday': 3, 
      'Thursday': 4, 'Friday': 5, 'Saturday': 6
    };
    const months: Record<string, number> = {
      'Jan': 0, 'Feb': 1, 'Mar': 2, 'Apr': 3, 'May': 4, 'Jun': 5,
      'Jul': 6, 'Aug': 7, 'Sep': 8, 'Oct': 9, 'Nov': 10, 'Dec': 11
    };
    
    const parts = dateStr.split(', ');
    if (parts.length !== 2) return null;
    
    const weekdayStr = parts[0];
    const [monthStr, dayStr] = parts[1].split(' ');
    const month = months[monthStr];
    const day = parseInt(dayStr);
    
    if (month === undefined || isNaN(day)) return null;
    
    // Use current year, or next year if month has passed, or day has passed in current month
    let year = now.getFullYear();
    if (month < now.getMonth() || (month === now.getMonth() && day < now.getDate())) {
      year++;
    }
    
    const parsedDate = new Date(year, month, day);
    
    // 🎯 ACCURACY VALIDATION: Verify weekday matches to catch data inconsistencies
    const expectedWeekday = weekdays[weekdayStr];
    if (expectedWeekday !== undefined && parsedDate.getDay() !== expectedWeekday) {
      console.warn(`⚠️ Date validation warning: ${dateStr} - weekday mismatch`);
    }
    
    return parsedDate;
  };

  const getDaysUntilDate = (dateStr: string): number => {
    const targetDate = parseReadableDate(dateStr);
    if (!targetDate) return 999; // Return large number for ongoing events
    
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const targetStart = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate());
    return Math.round((targetStart.getTime() - todayStart.getTime()) / (1000 * 60 * 60 * 24));
  };

  const imminent = catalysts.filter(c => {
    if (c.date === 'Ongoing') return false;
    const days = getDaysUntilDate(c.date);
    return days <= 3 && days >= 0;
  });

  if (imminent.length === 0) return '';

  const primary = imminent[0];
  const days = getDaysUntilDate(primary.date);
  const timing = days === 0 ? 'TODAY' : days === 1 ? 'Tomorrow' : `In ${days} days`;

  // 🎯 ACCURACY ENHANCEMENT: Highlight rescheduled events
  const rescheduledPrefix = primary.rescheduled ? '**RESCHEDULED** ' : '';
  
  let flagText = `⚡ MACRO ALERT: ${rescheduledPrefix}${primary.event} ${timing}`;
  if (imminent.length > 1) {
    flagText += ` + ${imminent.length - 1} more event(s)`;
  }
  flagText += ' — expect volatility';

  return flagText;
}
