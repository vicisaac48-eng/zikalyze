import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Calendar,
  Clock,
  RefreshCw,
  Zap,
  AlertTriangle,
  TrendingUp,
  ChevronLeft,
  ChevronRight,
  CalendarDays,
  Timer,
  Bell,
} from "lucide-react";
import {
  format,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameDay,
  isSameMonth,
  addMonths,
  subMonths,
  isToday,
  isTomorrow,
  differenceInDays,
  differenceInHours,
  differenceInMinutes,
  parseISO,
  addDays,
} from "date-fns";
import { useSmartNotifications } from "@/hooks/useSmartNotifications";

interface CalendarEvent {
  id: string;
  event: string;
  date: Date;
  time?: string;
  impact: "high" | "medium" | "low";
  category: string;
  description?: string;
  countdown: string;
}

interface NewsEventsCalendarProps {
  crypto?: string;
}

// Interval for checking imminent events (5 minutes)
const CHECK_IMMINENT_EVENTS_INTERVAL_MS = 5 * 60 * 1000;

// Real scheduled macro economic events with accurate dates for 2025-2026
const getScheduledEvents = (): CalendarEvent[] => {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const events: CalendarEvent[] = [];

  // FOMC Meeting Dates 2025-2026 (Federal Reserve decisions)
  // Official schedule from federalreserve.gov - announcement day (2nd day of meeting)
  // Meetings with Summary of Economic Projections are marked with (SEP)
  const fomcDates = [
    { date: new Date(2025, 0, 29), time: "14:00 EST" },   // Jan 28-29
    { date: new Date(2025, 2, 19), time: "14:00 EST" },   // Mar 18-19 (SEP)
    { date: new Date(2025, 4, 7), time: "14:00 EST" },    // May 6-7
    { date: new Date(2025, 5, 18), time: "14:00 EST" },   // Jun 17-18 (SEP)
    { date: new Date(2025, 6, 30), time: "14:00 EST" },   // Jul 29-30
    { date: new Date(2025, 8, 17), time: "14:00 EST" },   // Sep 16-17 (SEP)
    { date: new Date(2025, 9, 29), time: "14:00 EST" },   // Oct 28-29 (UPDATED)
    { date: new Date(2025, 11, 10), time: "14:00 EST" },  // Dec 9-10 (SEP) (UPDATED)
    { date: new Date(2026, 0, 28), time: "14:00 EST" },   // Jan 27-28
    { date: new Date(2026, 2, 18), time: "14:00 EST" },   // Mar 17-18 (SEP)
    { date: new Date(2026, 3, 29), time: "14:00 EST" },   // Apr 28-29 (UPDATED)
    { date: new Date(2026, 5, 17), time: "14:00 EST" },   // Jun 16-17 (SEP)
    { date: new Date(2026, 6, 29), time: "14:00 EST" },   // Jul 28-29
    { date: new Date(2026, 8, 16), time: "14:00 EST" },   // Sep 15-16 (SEP)
    { date: new Date(2026, 9, 28), time: "14:00 EST" },   // Oct 27-28 (UPDATED)
    { date: new Date(2026, 11, 9), time: "14:00 EST" },   // Dec 8-9 (SEP) (UPDATED)
  ];

  fomcDates.forEach((fomc, i) => {
    if (fomc.date >= now) {
      events.push({
        id: `fomc-${i}`,
        event: "FOMC Interest Rate Decision",
        date: fomc.date,
        time: fomc.time,
        impact: "high",
        category: "Federal Reserve",
        description: "Federal Reserve rate decision - High market impact expected",
        countdown: getCountdown(fomc.date),
      });
    }
  });

  // CPI Release Dates 2025-2026 (Official BLS schedule)
  // CPI data released at 8:30 AM ET, covers previous month's data
  const cpiDates = [
    // 2025 CPI releases
    { date: new Date(2025, 1, 12), time: "08:30 EST" },   // Feb 12 - Jan data
    { date: new Date(2025, 2, 12), time: "08:30 EST" },   // Mar 12 - Feb data
    { date: new Date(2025, 3, 10), time: "08:30 EST" },   // Apr 10 - Mar data
    { date: new Date(2025, 4, 13), time: "08:30 EST" },   // May 13 - Apr data
    { date: new Date(2025, 5, 11), time: "08:30 EST" },   // Jun 11 - May data
    { date: new Date(2025, 6, 15), time: "08:30 EST" },   // Jul 15 - Jun data (UPDATED)
    { date: new Date(2025, 7, 12), time: "08:30 EST" },   // Aug 12 - Jul data
    { date: new Date(2025, 8, 11), time: "08:30 EST" },   // Sep 11 - Aug data (UPDATED)
    { date: new Date(2025, 9, 24), time: "08:30 EST" },   // Oct 24 - Sep data (UPDATED)
    { date: new Date(2025, 10, 13), time: "08:30 EST" },  // Nov 13 - Oct data
    { date: new Date(2025, 11, 10), time: "08:30 EST" },  // Dec 10 - Nov data
    // 2026 CPI releases
    { date: new Date(2026, 0, 13), time: "08:30 EST" },   // Jan 13 - Dec 2025 data
    { date: new Date(2026, 1, 11), time: "08:30 EST" },   // Feb 11 - Jan data
    { date: new Date(2026, 2, 11), time: "08:30 EST" },   // Mar 11 - Feb data
    { date: new Date(2026, 3, 10), time: "08:30 EST" },   // Apr 10 - Mar data (UPDATED)
    { date: new Date(2026, 4, 12), time: "08:30 EST" },   // May 12 - Apr data
    { date: new Date(2026, 5, 10), time: "08:30 EST" },   // Jun 10 - May data
    { date: new Date(2026, 6, 14), time: "08:30 EST" },   // Jul 14 - Jun data
    { date: new Date(2026, 7, 12), time: "08:30 EST" },   // Aug 12 - Jul data
    { date: new Date(2026, 8, 11), time: "08:30 EST" },   // Sep 11 - Aug data (UPDATED)
    { date: new Date(2026, 9, 14), time: "08:30 EST" },   // Oct 14 - Sep data (UPDATED)
    { date: new Date(2026, 10, 10), time: "08:30 EST" },  // Nov 10 - Oct data (UPDATED)
    { date: new Date(2026, 11, 10), time: "08:30 EST" },  // Dec 10 - Nov data (UPDATED)
  ];

  cpiDates.forEach((cpi, i) => {
    if (cpi.date >= now) {
      events.push({
        id: `cpi-${i}`,
        event: "US CPI Inflation Data",
        date: cpi.date,
        time: cpi.time,
        impact: "high",
        category: "Economic Data",
        description: "Consumer Price Index release - Major market mover",
        countdown: getCountdown(cpi.date),
      });
    }
  });

  // NFP (Non-Farm Payrolls) - First Friday of each month
  const getNFPDate = (y: number, m: number): Date => {
    const firstDay = new Date(y, m, 1);
    const dayOfWeek = firstDay.getDay();
    // Calculate days until first Friday (Friday = 5)
    const daysUntilFriday = dayOfWeek <= 5 ? 5 - dayOfWeek : 7 - dayOfWeek + 5;
    return new Date(y, m, 1 + daysUntilFriday);
  };

  for (let i = 0; i < 12; i++) {
    const targetMonth = (month + i) % 12;
    const targetYear = year + Math.floor((month + i) / 12);
    const nfpDate = getNFPDate(targetYear, targetMonth);
    if (nfpDate >= now) {
      events.push({
        id: `nfp-${targetYear}-${targetMonth}`,
        event: "US Non-Farm Payrolls",
        date: nfpDate,
        time: "08:30 EST",
        impact: "high",
        category: "Employment",
        description: "Monthly jobs report - High volatility expected",
        countdown: getCountdown(nfpDate),
      });
    }
  }

  // Weekly Jobless Claims (Every Thursday at 08:30 EST)
  const getNextThursdays = (count: number): Date[] => {
    const thursdays: Date[] = [];
    let daysUntilThursday = (4 - now.getDay() + 7) % 7;
    // If today is Thursday, start from today (the filter will handle if it's past)
    if (daysUntilThursday === 0) {
      daysUntilThursday = 0;
    }
    for (let i = 0; i < count; i++) {
      thursdays.push(addDays(now, daysUntilThursday + i * 7));
    }
    return thursdays;
  };

  getNextThursdays(8).forEach((thursdayDate, i) => {
    if (thursdayDate >= now) {
      events.push({
        id: `jobless-${i}`,
        event: "Weekly Jobless Claims",
        date: thursdayDate,
        time: "08:30 EST",
        impact: "medium",
        category: "Employment",
        description: "Weekly unemployment claims data",
        countdown: getCountdown(thursdayDate),
      });
    }
  });

  // Options Expiry (3rd Friday of each month)
  const getThirdFriday = (y: number, m: number): Date => {
    const firstDay = new Date(y, m, 1);
    const dayOfWeek = firstDay.getDay();
    // Calculate days until first Friday (Friday = 5)
    const daysUntilFriday = dayOfWeek <= 5 ? 5 - dayOfWeek : 7 - dayOfWeek + 5;
    // Third Friday is 14 days after the first Friday
    return new Date(y, m, 1 + daysUntilFriday + 14);
  };

  for (let i = 0; i < 6; i++) {
    const targetMonth = (month + i) % 12;
    const targetYear = year + Math.floor((month + i) / 12);
    const expiryDate = getThirdFriday(targetYear, targetMonth);
    if (expiryDate >= now) {
      const isQuarterly = [2, 5, 8, 11].includes(targetMonth);
      events.push({
        id: `opex-${targetYear}-${targetMonth}`,
        event: isQuarterly ? "Quarterly Options Expiry" : "Monthly Options Expiry",
        date: expiryDate,
        time: "16:00 EST",
        impact: isQuarterly ? "high" : "medium",
        category: "Derivatives",
        description: isQuarterly
          ? "Major quarterly expiry - Billions in contracts expire"
          : "Monthly options expiry - Increased volatility expected",
        countdown: getCountdown(expiryDate),
      });
    }
  }

  // Bitcoin Halving (Approximate - next one around April 2028)
  const btcHalvingDate = new Date(2028, 3, 15);
  if (btcHalvingDate >= now) {
    events.push({
      id: "btc-halving",
      event: "Bitcoin Halving",
      date: btcHalvingDate,
      impact: "high",
      category: "Crypto",
      description: "Bitcoin block reward halves - Historically bullish catalyst",
      countdown: getCountdown(btcHalvingDate),
    });
  }

  // Sort by date
  return events.sort((a, b) => a.date.getTime() - b.date.getTime());
};

// Calculate countdown string
const getCountdown = (targetDate: Date): string => {
  const now = new Date();
  const totalMinutes = differenceInMinutes(targetDate, now);
  
  // If the event has passed
  if (totalMinutes < 0) return "Passed";
  
  // If the event is happening now (within the same minute)
  if (totalMinutes === 0) return "Now";
  
  const days = differenceInDays(targetDate, now);
  const hours = Math.floor((totalMinutes % (24 * 60)) / 60);
  const minutes = totalMinutes % 60;
  
  if (days === 0) return `${hours}h ${minutes}m`;
  if (days === 1) return "Tomorrow";
  if (days <= 7) return `${days} days`;
  return format(targetDate, "MMM d");
};

// Format date for display
const formatEventDate = (date: Date): string => {
  if (isToday(date)) return "Today";
  if (isTomorrow(date)) return "Tomorrow";
  return format(date, "EEE, MMM d");
};

const NewsEventsCalendar = ({ crypto }: NewsEventsCalendarProps) => {
  const { t } = useTranslation();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [loading, setLoading] = useState(false);
  const [events, setEvents] = useState<CalendarEvent[]>(() => getScheduledEvents());
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  
  // Smart notifications for imminent events
  const { sendNewsEventNotification } = useSmartNotifications();
  const notifiedEventsRef = useRef<Set<string>>(new Set());

  // Load events
  const loadEvents = useCallback(() => {
    const scheduledEvents = getScheduledEvents();
    setEvents(scheduledEvents);
    setLastUpdate(new Date());
  }, []);

  useEffect(() => {
    // Auto-refresh every 5 minutes
    const interval = setInterval(loadEvents, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [loadEvents]);

  // Update countdowns every minute
  useEffect(() => {
    const interval = setInterval(() => {
      setEvents((prev) =>
        prev.map((event) => ({
          ...event,
          countdown: getCountdown(event.date),
        }))
      );
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  // Check for imminent high-impact events and send notifications (every 5 minutes)
  useEffect(() => {
    const checkImminentEvents = async () => {
      const now = new Date();
      
      for (const event of events) {
        // Skip if already notified
        if (notifiedEventsRef.current.has(event.id)) continue;
        
        const minutesUntil = differenceInMinutes(event.date, now);
        
        // Send notification for high-impact events within 60 minutes
        if (event.impact === 'high' && minutesUntil > 0 && minutesUntil <= 60) {
          const sent = await sendNewsEventNotification(
            event.event,
            event.impact,
            event.countdown,
            event.category
          );
          if (sent) {
            notifiedEventsRef.current.add(event.id);
          }
        }
        
        // Send notification for medium-impact events within 30 minutes
        if (event.impact === 'medium' && minutesUntil > 0 && minutesUntil <= 30) {
          const sent = await sendNewsEventNotification(
            event.event,
            event.impact,
            event.countdown,
            event.category
          );
          if (sent) {
            notifiedEventsRef.current.add(event.id);
          }
        }
      }
    };

    // Check immediately and then every 5 minutes
    checkImminentEvents();
    const interval = setInterval(checkImminentEvents, CHECK_IMMINENT_EVENTS_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [events, sendNewsEventNotification]);

  // Calendar days for current month view
  const calendarDays = useMemo(() => {
    const start = startOfWeek(startOfMonth(currentMonth));
    const end = endOfWeek(endOfMonth(currentMonth));
    return eachDayOfInterval({ start, end });
  }, [currentMonth]);

  // Events for current month
  const monthEvents = useMemo(() => {
    return events.filter((event) => isSameMonth(event.date, currentMonth));
  }, [events, currentMonth]);

  // Get events for a specific day
  const getEventsForDay = (day: Date): CalendarEvent[] => {
    return events.filter((event) => isSameDay(event.date, day));
  };

  // Upcoming events (next 7 days)
  const upcomingEvents = useMemo(() => {
    const now = new Date();
    const weekFromNow = addDays(now, 7);
    return events.filter(
      (event) => event.date >= now && event.date <= weekFromNow
    );
  }, [events]);

  // Get impact badge styling
  const getImpactBadge = (impact: "high" | "medium" | "low") => {
    switch (impact) {
      case "high":
        return "bg-destructive/20 text-destructive border-destructive/50";
      case "medium":
        return "bg-warning/20 text-warning border-warning/50";
      default:
        return "bg-muted text-muted-foreground border-border";
    }
  };

  // Get dot color for calendar
  const getDotColor = (impact: "high" | "medium" | "low") => {
    switch (impact) {
      case "high":
        return "bg-destructive";
      case "medium":
        return "bg-warning";
      default:
        return "bg-muted-foreground";
    }
  };

  if (loading) {
    return (
      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            News Events Calendar
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-32 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border bg-card">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-primary" />
          News Events Calendar
          {crypto && (
            <Badge variant="outline" className="ml-2 text-xs">
              {crypto}
            </Badge>
          )}
        </CardTitle>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">
            Updated {format(lastUpdate, "HH:mm")}
          </span>
          <Button
            onClick={loadEvents}
            variant="ghost"
            size="sm"
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Imminent Events Alert Banner */}
        {upcomingEvents.filter((e) => e.impact === "high").length > 0 && (
          <div className="rounded-lg border border-warning/50 bg-gradient-to-r from-warning/20 via-warning/10 to-warning/20 p-3">
            <div className="flex items-center gap-2 mb-2">
              <Bell className="h-4 w-4 text-warning animate-pulse" />
              <span className="text-sm font-semibold text-warning">
                Upcoming High-Impact Events
              </span>
              <Badge
                variant="outline"
                className="text-xs border-warning/50 text-warning"
              >
                {upcomingEvents.filter((e) => e.impact === "high").length} this
                week
              </Badge>
            </div>
            <div className="flex flex-wrap gap-2">
              {upcomingEvents
                .filter((e) => e.impact === "high")
                .slice(0, 3)
                .map((event) => (
                  <div
                    key={event.id}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium bg-destructive/20 text-destructive border border-destructive/40"
                  >
                    <Zap className="h-3.5 w-3.5 animate-pulse" />
                    <span>{event.event}</span>
                    <span className="px-1.5 py-0.5 rounded text-[10px] uppercase font-bold bg-destructive/30">
                      {event.countdown}
                    </span>
                  </div>
                ))}
            </div>
          </div>
        )}

        <Tabs defaultValue="calendar" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="calendar" className="flex items-center gap-1">
              <CalendarDays className="h-4 w-4" />
              Calendar
            </TabsTrigger>
            <TabsTrigger value="list" className="flex items-center gap-1">
              <Timer className="h-4 w-4" />
              Upcoming
            </TabsTrigger>
          </TabsList>

          {/* Calendar View */}
          <TabsContent value="calendar" className="mt-4 space-y-4">
            {/* Month Navigation */}
            <div className="flex items-center justify-between">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm font-semibold">
                {format(currentMonth, "MMMM yyyy")}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-1">
              {/* Day Headers */}
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                <div
                  key={day}
                  className="text-center text-xs font-medium text-muted-foreground py-2"
                >
                  {day}
                </div>
              ))}

              {/* Calendar Days */}
              {calendarDays.map((day) => {
                const dayEvents = getEventsForDay(day);
                const isCurrentMonth = isSameMonth(day, currentMonth);
                const isSelected = selectedDate && isSameDay(day, selectedDate);
                const isTodayDate = isToday(day);

                return (
                  <button
                    key={day.toISOString()}
                    onClick={() => setSelectedDate(day)}
                    className={`
                      relative p-2 rounded-lg text-sm transition-all min-h-[48px]
                      ${!isCurrentMonth ? "text-muted-foreground/50" : "text-foreground"}
                      ${isSelected ? "bg-primary text-primary-foreground" : "hover:bg-secondary/50"}
                      ${isTodayDate && !isSelected ? "ring-1 ring-primary" : ""}
                    `}
                  >
                    <span>{format(day, "d")}</span>
                    {/* Event dots */}
                    {dayEvents.length > 0 && (
                      <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 flex gap-0.5">
                        {dayEvents.slice(0, 3).map((event, i) => (
                          <span
                            key={i}
                            className={`w-1.5 h-1.5 rounded-full ${
                              isSelected ? "bg-primary-foreground" : getDotColor(event.impact)
                            }`}
                          />
                        ))}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Selected Date Events */}
            {selectedDate && (
              <div className="border-t border-border pt-4">
                <h4 className="text-sm font-medium mb-3">
                  Events on {format(selectedDate, "MMMM d, yyyy")}
                </h4>
                {getEventsForDay(selectedDate).length > 0 ? (
                  <div className="space-y-2">
                    {getEventsForDay(selectedDate).map((event) => (
                      <div
                        key={event.id}
                        className="rounded-lg border border-border p-3 hover:bg-secondary/30 transition-colors"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            {event.impact === "high" && (
                              <AlertTriangle className="h-4 w-4 text-destructive" />
                            )}
                            <span className="font-medium text-sm">
                              {event.event}
                            </span>
                          </div>
                          <Badge
                            variant="outline"
                            className={`text-xs ${getImpactBadge(event.impact)}`}
                          >
                            {event.impact}
                          </Badge>
                        </div>
                        {event.time && (
                          <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            {event.time}
                          </div>
                        )}
                        {event.description && (
                          <p className="text-xs text-muted-foreground mt-2">
                            {event.description}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    No scheduled events for this date.
                  </p>
                )}
              </div>
            )}
          </TabsContent>

          {/* List View */}
          <TabsContent value="list" className="mt-4">
            <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
              {events.slice(0, 15).map((event) => (
                <div
                  key={event.id}
                  className="rounded-lg border border-border p-3 hover:bg-secondary/30 transition-colors"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        {event.impact === "high" ? (
                          <Zap className="h-4 w-4 text-destructive" />
                        ) : event.impact === "medium" ? (
                          <TrendingUp className="h-4 w-4 text-warning" />
                        ) : (
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                        )}
                        <span className="font-medium text-sm">
                          {event.event}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>{formatEventDate(event.date)}</span>
                        {event.time && (
                          <>
                            <span>•</span>
                            <Clock className="h-3 w-3" />
                            <span>{event.time}</span>
                          </>
                        )}
                      </div>
                      {event.description && (
                        <p className="text-xs text-muted-foreground mt-2">
                          {event.description}
                        </p>
                      )}
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <Badge
                        variant="outline"
                        className={`text-xs ${getImpactBadge(event.impact)}`}
                      >
                        {event.impact}
                      </Badge>
                      <span
                        className={`text-xs font-medium ${
                          event.countdown === "Today" ||
                          event.countdown === "Tomorrow"
                            ? "text-destructive"
                            : "text-muted-foreground"
                        }`}
                      >
                        {event.countdown}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>

        {/* Event Categories Legend */}
        <div className="flex flex-wrap gap-2 pt-2 border-t border-border">
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <span className="w-2 h-2 rounded-full bg-destructive" />
            High Impact
          </div>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <span className="w-2 h-2 rounded-full bg-warning" />
            Medium
          </div>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <span className="w-2 h-2 rounded-full bg-muted-foreground" />
            Low
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default NewsEventsCalendar;
