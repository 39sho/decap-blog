import { redirect } from "react-router";
import type { Route } from "./+types/api.auth";

export const loader = ({ request, context }: Route.LoaderArgs) => {
  const clientId = context.cloudflare.env.GITHUB_CLIENT_ID;

  const url = new URL(request.url);
  const redirectUrl = new URL("https://github.com/login/oauth/authorize");
  redirectUrl.searchParams.set("client_id", clientId);
  redirectUrl.searchParams.set("redirect_url", `${url.origin}/api/callback`);
  redirectUrl.searchParams.set("scope", "repo user");
  redirectUrl.searchParams.set(
    "state",
    crypto.getRandomValues(new Uint8Array(12)).join(""),
  );

  return redirect(redirectUrl.href);
};
