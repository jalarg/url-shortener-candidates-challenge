import { redirect } from "react-router";
import type { Route } from "./+types/s.$code";

import { getRedirectTargetUrl } from "../lib/short-url.server";

export async function loader({ params }: Route.LoaderArgs) {
  const { code } = params;

  if (!code) {
    throw new Response("Not Found", { status: 404 });
  }

  const target = await getRedirectTargetUrl(code);

  if (!target) {
    throw new Response("Not Found", { status: 404 });
  }

  return redirect(target);
}
