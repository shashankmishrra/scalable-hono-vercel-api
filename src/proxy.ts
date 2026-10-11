import { NextResponse, type NextRequest } from "next/server";

const PUBLIC_HOST = "resource.localhost";
const PUBLIC_PATH_PREFIX = "/resource";

/**
 * Hostname routing. Route groups only organise files, so the two hostnames are
 * mapped explicitly here: `resource.localhost/:slug` is rewritten to the
 * internal `/resource/:slug` route group, while `app.localhost` serves the
 * admin route group at `/`. The API and Next.js internals pass through.
 */
export function proxy(request: NextRequest) {
  const host = (request.headers.get("host") ?? "").split(":")[0].toLowerCase();

  if (host === PUBLIC_HOST) {
    const url = request.nextUrl.clone();
    url.pathname =
      url.pathname === "/" ? PUBLIC_PATH_PREFIX : `${PUBLIC_PATH_PREFIX}${url.pathname}`;
    return NextResponse.rewrite(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next|favicon.ico).*)"],
};
