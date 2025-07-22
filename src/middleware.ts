import createMiddleware from "next-intl/middleware";

export default createMiddleware({
  locales: ["et", "ukr"],
  defaultLocale: "et",
});

export const config = {
  matcher: ["/", "/(et|ukr)/:path*"],
};
