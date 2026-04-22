import { data, useActionData } from "react-router";
import type { Route } from "./+types/_index";
import { AppError, ValidationError } from "@url-shortener/engine";

import { Alert, AlertDescription, AlertTitle } from "~/components/ui/alert";
import { Badge } from "~/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { UrlForm } from "~/components/url-form";
import { UrlStatsTable } from "~/components/url-stats-table";
import { createShortUrl, loadShortUrlDashboard } from "~/lib/short-url.server";

const featureItems = [
  {
    title: "Unique codes",
    description: "Base62 generator with database-level uniqueness.",
  },
  {
    title: "Click analytics",
    description: "Every redirect updates the stored click count.",
  },
  {
    title: "Safer input",
    description: "Only valid `http` and `https` destinations are accepted.",
  },
];

export async function loader({ request }: Route.LoaderArgs) {
  return loadShortUrlDashboard(request.url);
}

export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();
  const url = String(formData.get("url") ?? "");

  try {
    const createdShortUrl = await createShortUrl(url, request.url);

    return data({ formValue: url, createdShortUrl });
  } catch (error) {
    if (error instanceof AppError) {
      const status = error instanceof ValidationError ? 400 : 500;

      return data({ formValue: url, error: error.message }, { status });
    }

    return data(
      {
        formValue: url,
        error: "Something went wrong while creating the short URL. Please try again.",
      },
      { status: 500 },
    );
  }
}

export function meta({}: Route.MetaArgs) {
  return [
    { title: "URL Shortener" },
    { name: "description", content: "Shorten your URLs quickly and easily" },
  ];
}

export default function Index({ loaderData }: Route.ComponentProps) {
  const {
    baseUrl,
    displayedCount,
    hasNextPage,
    hasPreviousPage,
    nextPageHref,
    page,
    pageSize,
    previousPageHref,
    shortUrls,
    totalCount,
    totalPages,
  } = loaderData;

  const actionData = useActionData<typeof action>();
  const actionError = actionData && "error" in actionData ? actionData.error : undefined;
  const createdShortUrl =
    actionData && "createdShortUrl" in actionData ? actionData.createdShortUrl : undefined;

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(251,191,36,0.22),_transparent_32%),linear-gradient(180deg,_#f8fafc_0%,_#fff7ed_100%)] px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto grid w-full max-w-6xl gap-8">
        <Card className="grid gap-6 overflow-hidden rounded-[2rem] border-slate-200 bg-white/90 p-6 shadow-2xl shadow-amber-950/10 backdrop-blur ring-0 sm:p-8 lg:grid-cols-[1.1fr_0.9fr] lg:p-10">
          <div className="grid content-start gap-5">
            <Badge
              variant="outline"
              className="rounded-full border-amber-200 bg-amber-50 px-3 py-1 font-semibold uppercase tracking-[0.3em] text-amber-700"
            >
              Persistent URL shortener
            </Badge>

            <CardHeader className="gap-3">
              <CardTitle className="max-w-xl text-4xl tracking-tight sm:text-5xl">
                Short links with persistence, click stats, and safer defaults.
              </CardTitle>
              <CardDescription className="max-w-2xl text-base leading-7 sm:text-lg">
                Create unique short URLs, keep them across restarts, and review engagement from one clean dashboard.
              </CardDescription>
            </CardHeader>

            <div className="grid gap-3 text-sm text-slate-600 sm:grid-cols-3">
              {featureItems.map((item) => (
                <Card
                  key={item.title}
                  className="rounded-2xl border-slate-200 bg-slate-50 py-3 shadow-none ring-0"
                >
                  <CardContent className="grid gap-1 px-4">
                    <CardTitle className="text-base">{item.title}</CardTitle>
                    <CardDescription className="text-sm">{item.description}</CardDescription>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          <div className="grid content-start gap-4">
            <UrlForm
              defaultValue={actionData && "formValue" in actionData ? actionData.formValue : ""}
              error={actionError}
            />

            <Alert className="rounded-3xl border-slate-200 bg-slate-50 px-5 py-4">
              <AlertTitle className="font-semibold text-slate-950">Short links are served from</AlertTitle>
              <AlertDescription className="mt-1 break-all text-amber-700">
                {baseUrl}/s/&lt;code&gt;
              </AlertDescription>
            </Alert>

            {createdShortUrl ? (
              <Alert className="rounded-3xl border-emerald-200 bg-emerald-50 px-5 py-4 text-emerald-900">
                <AlertTitle className="text-xs font-semibold uppercase tracking-[0.24em] text-emerald-700">
                  Created successfully
                </AlertTitle>
                <a
                  href={createdShortUrl.shortUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-3 block break-all text-lg font-semibold text-emerald-900 underline decoration-emerald-300 underline-offset-4"
                >
                  {createdShortUrl.shortUrl}
                </a>
                <AlertDescription className="mt-2 break-all text-emerald-800">
                  Redirects to {createdShortUrl.originalUrl}
                </AlertDescription>
              </Alert>
            ) : null}
          </div>
        </Card>

        <section className="grid gap-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div className="grid gap-2">
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-500">Statistics</p>
              <h2 className="text-2xl font-semibold text-slate-950">Latest shortened URLs</h2>
            </div>
            <p className="text-sm text-slate-500">
              Showing {displayedCount} of {totalCount} URLs – page {page} of {totalPages}, {pageSize} per page.
            </p>
          </div>

          <UrlStatsTable
            shortUrls={shortUrls}
            page={page}
            totalPages={totalPages}
            hasPreviousPage={hasPreviousPage}
            hasNextPage={hasNextPage}
            previousPageHref={previousPageHref}
            nextPageHref={nextPageHref}
          />
        </section>
      </div>
    </main>
  );
}
