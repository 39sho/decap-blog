import type { Route } from "./+types/blog.$title";

export const loader = async ({
  request,
  params: { title },
}: Route.LoaderArgs) => {
  const content = await (
    await fetch(`${new URL(request.url).origin}/posts/blog/${title}`)
  ).text();
  return { content };
};

export default ({ loaderData }: Route.ComponentProps) => {
  return <div>{loaderData.content}</div>;
};
