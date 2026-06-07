import { NextRequest, NextResponse } from "next/server";
import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs";

// Rule R-SAAS-01: EVERY request MUST have org_id resolved before routes execute
// Rule: Tenant middleware runs on every request via Next.js Edge Middleware
// Spec: saas/multi_tenancy_architecture.md Section 6

const PUBLIC_ROUTES = new Set([
  "/",
  "/about",
  "/how-it-works",
  "/impact",
  "/pricing",
  "/privacy",
  "/terms",
  "/signin",
  "/signup",
  "/tokenomics",
  "/leaderboard",
  "/redeem",
]);

// /join/[token] is public — the page handles its own auth
const isJoinRoute = (p: string) => p.startsWith("/join/");

const AUTH_ROUTES = new Set(["/signin", "/signup"]);

// Next.js 16: export as `proxy` (renamed from `middleware`)
export async function proxy(req: NextRequest) {
  const res = NextResponse.next();
  const { pathname } = req.nextUrl;

  // ── 1. Resolve org slug from subdomain ────────────────────────────
  const host = req.headers.get("host") ?? "";
  const appDomain = process.env.NEXT_PUBLIC_APP_DOMAIN ?? "localhost:3000";

  // Extract subdomain: capetown.greentoken.app → "capetown"
  // On localhost this will be empty
  const subdomain = host !== appDomain && host.endsWith(`.${appDomain}`)
    ? host.replace(`.${appDomain}`, "")
    : null;

  if (subdomain) {
    res.headers.set("x-org-slug", subdomain);
  }

  // ── 2. Refresh Supabase session ────────────────────────────────────
  const supabase = createMiddlewareClient({ req, res });
  const { data: { session } } = await supabase.auth.getSession();

  // ── 3. Protect authenticated routes ───────────────────────────────
  const isPublicRoute = PUBLIC_ROUTES.has(pathname) || pathname.startsWith("/api/") || isJoinRoute(pathname);
  const isAuthRoute   = AUTH_ROUTES.has(pathname);

  if (!session && !isPublicRoute) {
    // Not authenticated + trying to access protected route → redirect to signin
    const signinUrl = req.nextUrl.clone();
    signinUrl.pathname = "/signin";
    signinUrl.searchParams.set("redirectTo", pathname);
    return NextResponse.redirect(signinUrl);
  }

  if (session && isAuthRoute) {
    // Already authenticated + visiting signin/signup → redirect to dashboard
    const dashUrl = req.nextUrl.clone();
    dashUrl.pathname = "/dashboard";
    return NextResponse.redirect(dashUrl);
  }

  // ── 4. Admin route protection ──────────────────────────────────────
  // Rule R-SAAS-04: Super admin routes validated server-side
  if (pathname.startsWith("/admin") && session) {
    const jwt = session.user?.user_metadata;
    const role = (session as any)?.access_token
      ? JSON.parse(atob((session.access_token as string).split(".")[1]))?.role
      : null;

    if (role !== "superadmin") {
      const forbiddenUrl = req.nextUrl.clone();
      forbiddenUrl.pathname = "/dashboard";
      return NextResponse.redirect(forbiddenUrl);
    }
  }

  return res;
}

export const config = {
  matcher: [
    // Match all routes except static files, images, favicon
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
