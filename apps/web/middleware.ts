import { NextRequest, NextResponse } from "next/server";

export default function middleware(req: NextRequest) {
  const res = NextResponse.next();

  if (req.method === "GET") {
    // Rewrite routes that match "/[...puckPath]/edit" to "/puck/[...puckPath]"
    if (req.nextUrl.pathname.endsWith("/edit")) {
      const pathWithoutEdit = req.nextUrl.pathname.slice(
        0,
        req.nextUrl.pathname.length - 5
      );
      // search params
      const searchParams = req.nextUrl.searchParams.toString();
      const pathWithEditPrefix = `/dashboard/puck/${pathWithoutEdit}?${searchParams}`;

      return NextResponse.rewrite(new URL(pathWithEditPrefix, req.url));
    }

    // Disable "/dashboard/puck/[...puckPath]"
    if (req.nextUrl.pathname.startsWith("/dashboard/puck")) {
      return NextResponse.redirect(new URL("/", req.url));
    }
  }

  return res;
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|.*\\.png$).*)"],
};
