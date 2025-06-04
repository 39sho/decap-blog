import { useEffect } from "react";
import type { Route } from "./+types/api.callback";

export const loader = async ({ request, context }: Route.LoaderArgs) => {
  const {
    params, // if filename includes [id] or [[path]]
    waitUntil, // same as ctx.waitUntil in existing Worker API
    next, // used for middleware or to fetch assets
    data, // arbitrary space for passing data between middlewares
  } = context;

  const { env } = context.cloudflare;

  const client_id = env.GITHUB_CLIENT_ID;
  const client_secret = env.GITHUB_CLIENT_SECRET;

  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const response = await fetch("https://github.com/login/oauth/access_token", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "user-agent": "cloudflare-functions-github-oauth-login-demo",
      accept: "application/json",
    },
    body: JSON.stringify({ client_id, client_secret, code }),
  });
  const result = await response.json<{
    error: unknown;
    access_token: string;
  }>();
  if (result.error) {
    return {
      status: "error",
      content: result,
    };
  }
  const token = result.access_token;
  const provider = "github";
  return {
    status: "success",
    content: {
      token,
      provider,
    },
  };
};

export default ({ loaderData }: Route.ComponentProps) => {
  const { status, content } = loaderData;

  useEffect(() => {
    const receiveMessage = (message: { origin: string }) => {
      window.opener.postMessage(
        `authorization:github:${status}:${JSON.stringify(content)}`,
        message.origin,
      );
      window.removeEventListener("message", receiveMessage, false);
    };
    window.addEventListener("message", receiveMessage, false);
    window.opener.postMessage("authorizing:github", "*");
  });

  return <div>hoge</div>;
};
