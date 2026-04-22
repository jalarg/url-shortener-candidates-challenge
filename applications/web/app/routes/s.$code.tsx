import { redirect } from "react-router";
import type { Route } from "./+types/s.$code";
import { NotFoundError } from "@url-shortener/engine";

import { resolveShortUrlForRedirect } from "../lib/short-url.server";

export async function loader({ params }: Route.LoaderArgs) {
  const { code } = params;

  if (!code) {
    throw new Response("Not Found", { status: 404 });
  }

  try {
    const shortUrl = await resolveShortUrlForRedirect(code);

    return redirect(shortUrl.originalUrl);
  } catch (error) {
    if (error instanceof NotFoundError) {
      throw new Response("Not Found", { status: 404 });
    }

    throw error;
  }
}
