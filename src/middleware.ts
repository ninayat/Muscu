import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Referral codes must be stashed in a cookie so the bonus can be granted once
// the visitor finishes signing in. Server components in Next.js 14 can read
// cookies but can't mutate them, so we do it here.
export function middleware(req: NextRequest) {
  const match = req.nextUrl.pathname.match(/^\/i\/([^/]+)$/);
  if (!match) return NextResponse.next();
  const res = NextResponse.next();
  res.cookies.set("ironfeed_ref", match[1], {
    maxAge: 60 * 60 * 24 * 30,
    path: "/",
    httpOnly: false,
    sameSite: "lax"
  });
  return res;
}

export const config = { matcher: "/i/:code*" };
