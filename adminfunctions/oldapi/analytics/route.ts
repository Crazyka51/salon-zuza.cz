import { type NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-utils";
import { sql, type AnalyticsEvent } from "../../../../lib/database";

// Helper function to get date ranges
function getDateRanges() {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const thisWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
  const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

  return {
    today,
    thisWeek,
    thisMonth,
    lastMonth,
    lastMonthEnd,
  };
}

// Helper function to detect device type from user agent
function getDeviceType(userAgent: string): "desktop" | "mobile" | "tablet" {
  const ua = userAgent.toLowerCase();

  if (ua.includes("tablet") || ua.includes("ipad")) {
    return "tablet";
  }

  if (ua.includes("mobile") || ua.includes("android") || ua.includes("iphone")) {
    return "mobile";
  }

  return "desktop";
}

// Helper function to extract referrer domain
function getReferrerDomain(referrer: string): string {
  if (!referrer) return "Direct";

  try {
    const url = new URL(referrer);
    return url.hostname;
  } catch {
    return "Unknown";
  }
}

// GET - Get analytics data
export const GET = requireAuth(async (request: NextRequest, auth: any) => {

  try {
    const { searchParams } = new URL(request.url);
    const fromParam = searchParams.get("from");
    const toParam = searchParams.get("to");

    let query = sql`SELECT * FROM analytics_events`;
    const whereClauses: string[] = [];
    const queryParams: any[] = [];

    if (fromParam && toParam) {
      whereClauses.push(`timestamp >= $${queryParams.length + 1}`);
      queryParams.push(new Date(fromParam));
      whereClauses.push(`timestamp <= $${queryParams.length + 1}`);
      queryParams.push(new Date(toParam));
    }

    if (whereClauses.length > 0) {
      // Obejdeme problém pomocí typového přetypování - není ideální, ale funguje
      query = sql`${query} WHERE ${whereClauses.join(" AND ")}` as any;
    }

    // @ts-ignore - ignorujeme typové problémy s SQL
    const events = await query as unknown as AnalyticsEvent[];

    const dateRanges = getDateRanges();

    // Filter events by date range if provided
    let filteredEvents = events;
    if (fromParam && toParam) {
      const fromDate = new Date(fromParam);
      const toDate = new Date(toParam);
      filteredEvents = events.filter((event) => {
        const eventDate = new Date(event.timestamp);
        return eventDate >= fromDate && eventDate <= toDate;
      });
    }

    // Calculate page views
    const pageViewEvents = filteredEvents.filter((event) => event.type === "pageview");
    const totalPageViews = pageViewEvents.length;

    const thisMonthViews = pageViewEvents.filter((event) => new Date(event.timestamp) >= dateRanges.thisMonth).length;

    const thisWeekViews = pageViewEvents.filter((event) => new Date(event.timestamp) >= dateRanges.thisWeek).length;

    const todayViews = pageViewEvents.filter((event) => new Date(event.timestamp) >= dateRanges.today).length;

    // Calculate last month views for trend
    const lastMonthViews = pageViewEvents.filter((event) => {
      const eventDate = new Date(event.timestamp);
      return eventDate >= dateRanges.lastMonth && eventDate <= dateRanges.lastMonthEnd;
    }).length;

    const trend = lastMonthViews > 0 ? ((thisMonthViews - lastMonthViews) / lastMonthViews) * 100 : 0;

    // Calculate unique visitors
    const uniqueSessions = new Set(pageViewEvents.map((event) => event.session_id));
    const uniqueVisitors = uniqueSessions.size;

    // Calculate top pages
    const pageStats: Record<string, { views: number; uniqueViews: Set<string>; title?: string }> = {};

    pageViewEvents.forEach((event) => {
      if (!pageStats[event.path]) {
        pageStats[event.path] = {
          views: 0,
          uniqueViews: new Set(),
          title: event.title || undefined,
        };
      }
      pageStats[event.path].views++;
      pageStats[event.path].uniqueViews.add(event.session_id);
    });

    const topPages = Object.entries(pageStats)
      .map(([path, stats]) => ({
        path,
        title: stats.title || path,
        views: stats.views,
        uniqueViews: stats.uniqueViews.size,
      }))
      .sort((a, b) => b.views - a.views)
      .slice(0, 10);

    // Calculate referrers
    const referrerStats: Record<string, number> = {};
    pageViewEvents.forEach((event) => {
      const domain = getReferrerDomain(event.referrer || "");
      referrerStats[domain] = (referrerStats[domain] || 0) + 1;
    });

    const totalReferrerVisits = Object.values(referrerStats).reduce((sum, count) => sum + count, 0);
    const referrers = Object.entries(referrerStats)
      .map(([source, visits]) => ({
        source,
        visits,
        percentage: totalReferrerVisits > 0 ? (visits / totalReferrerVisits) * 100 : 0,
      }))
      .sort((a, b) => b.visits - a.visits)
      .slice(0, 10);

    // Calculate device types
    const deviceStats = { desktop: 0, mobile: 0, tablet: 0 };
    pageViewEvents.forEach((event) => {
      const deviceType = getDeviceType(event.user_agent);
      deviceStats[deviceType]++;
    });

    // Mock location data (would need IP geolocation service in real implementation)
    const locations = [
      { country: "Czech Republic", city: "Prague", visits: Math.floor(uniqueVisitors * 0.6) },
      { country: "Czech Republic", city: "Brno", visits: Math.floor(uniqueVisitors * 0.2) },
      { country: "Slovakia", city: "Bratislava", visits: Math.floor(uniqueVisitors * 0.1) },
      { country: "Germany", city: "Berlin", visits: Math.floor(uniqueVisitors * 0.05) },
      { country: "Austria", city: "Vienna", visits: Math.floor(uniqueVisitors * 0.05) },
    ];

    const analyticsData = {
      pageViews: {
        total: totalPageViews,
        thisMonth: thisMonthViews,
        thisWeek: thisWeekViews,
        today: todayViews,
        trend: Math.round(trend * 100) / 100,
      },
      visitors: {
        total: uniqueVisitors,
        unique: uniqueVisitors,
        returning: Math.floor(uniqueVisitors * 0.3), // Mock data
        newVisitors: Math.floor(uniqueVisitors * 0.7), // Mock data
      },
      topPages,
      referrers,
      devices: deviceStats,
      locations,
      timeRange: {
        from: fromParam || dateRanges.thisMonth.toISOString(),
        to: toParam || new Date().toISOString(),
      },
    };

    return NextResponse.json(analyticsData);
  } catch (error) {
    return NextResponse.json(
      {
        message: "Chyba při načítání analytických dat",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
});

// POST - Track analytics event
export const POST = async (request: NextRequest) => {
  try {
    const eventData = await request.json();
    const { type, path, title, userId, sessionId, referrer, metadata } = eventData;

    if (!type || !path || !sessionId) {
      return NextResponse.json({ message: "Chybí povinné údaje (type, path, sessionId)" }, { status: 400 });
    }

    const userAgent = request.headers.get("user-agent") || "";

    const newEvent: Omit<AnalyticsEvent, "id" | "timestamp"> = {
      type,
      path,
      title: title || null,
      user_id: userId || null,
      session_id: sessionId,
      user_agent: userAgent,
      referrer: referrer || null,
      metadata: metadata || null,
    };

    await sql`
      INSERT INTO analytics_events (type, path, title, user_id, session_id, user_agent, referrer, metadata)
      VALUES (
        ${newEvent.type},
        ${newEvent.path},
        ${newEvent.title},
        ${newEvent.user_id},
        ${newEvent.session_id},
        ${newEvent.user_agent},
        ${newEvent.referrer},
        ${newEvent.metadata ? JSON.stringify(newEvent.metadata) : null}
      )
    `;

    return NextResponse.json({ message: "Událost byla zaznamenána" }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      {
        message: "Chyba při zaznamenávání události",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
};
