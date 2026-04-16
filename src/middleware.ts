import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// In-memory store for rate limiting. 
// Note: In serverless environments, this is reset when the function instances cold start.
// For a production-ready distributed solution, use a KV store or Redis.
const rateLimitMap = new Map<string, { count: number; lastReset: number }>();

const LIMIT = 30; // Max requests
const WINDOW = 15 * 1000; // 15 seconds window

export function middleware(request: NextRequest) {
  const ip = request.ip ?? request.headers.get('x-forwarded-for') ?? 'unknown';
  const now = Date.now();

  const rateData = rateLimitMap.get(ip) ?? { count: 0, lastReset: now };

  if (now - rateData.lastReset > WINDOW) {
    rateData.count = 1;
    rateData.lastReset = now;
  } else {
    rateData.count++;
  }

  rateLimitMap.set(ip, rateData);

  if (rateData.count > LIMIT) {
    return new NextResponse(
      JSON.stringify({
        error: "TOO_MUCH_NOISE",
        message: "Your connection is too loud. Silence is required.",
        code: 429,
        action: "DISCONNECT_INITIATED"
      }),
      {
        status: 429,
        headers: {
          'Content-Type': 'application/json',
          'X-RateLimit-Limit': LIMIT.toString(),
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': (rateData.lastReset + WINDOW).toString(),
        },
      }
    );
  }

  const response = NextResponse.next();
  response.headers.set('X-RateLimit-Limit', LIMIT.toString());
  response.headers.set('X-RateLimit-Remaining', Math.max(0, LIMIT - rateData.count).toString());
  
  return response;
}

// Optionally, specify which paths this middleware should run on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
