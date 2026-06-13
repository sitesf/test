import { withAuth } from "next-auth/middleware";

/**
 * Protects every /admin page (except the login screen) — unauthenticated
 * visitors are redirected to /admin/login. The /api/admin/* routes verify
 * the session themselves and return 401 instead of redirecting.
 */
export default withAuth({
  pages: { signIn: "/admin/login" },
});

export const config = {
  matcher: ["/admin", "/admin/((?!login).*)"],
};
