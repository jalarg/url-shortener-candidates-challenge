import { data, Form, useActionData } from "react-router";
import type { Route } from "./+types/_index";
import { AppError, ValidationError } from "@url-shortener/engine";

import { createShortUrl, loadShortUrlDashboard } from "~/lib/short-url.server";

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

  const linkPrefix = baseUrl ? `${baseUrl}/s/` : "-";

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-lime-400 via-pink-500 to-cyan-300">
      <div className="bg-yellow-300 p-12 rounded-none border-8 border-dashed border-purple-600 w-full max-w-3xl rotate-1 shadow-2xl shadow-red-500">
        <h1 className="text-4xl font-mono italic text-center mb-8 text-fuchsia-600 underline decoration-wavy decoration-green-500 tracking-widest">
          ~*~ URL Shortener ~*~
        </h1>

        <Form method="post" className="flex flex-col gap-6">
          <input
            type="text"
            name="url"
            placeholder="Enter your URL here..."
            defaultValue={actionData && "formValue" in actionData ? actionData.formValue : ""}
            className="w-full px-4 py-3 text-base bg-orange-200 border-4 border-blue-600 text-purple-800 placeholder-red-400 rounded focus:outline-none"
          />

          <div>
            <button
              type="submit"
              className="w-full px-4 py-3 text-base bg-red-500 hover:bg-lime-500 text-yellow-200 border-4 border-teal-400 rounded-full skew-x-3 cursor-pointer"
            >
              ★ SHORTEN IT ★
            </button>
            <p className="text-sm text-indigo-800 mt-3 text-center font-bold bg-cyan-200 p-2 border-2 border-dotted border-orange-500">
              Your shortened URL will start with {linkPrefix}
            </p>
          </div>
        </Form>

        {createdShortUrl && (
          <div className="mt-8 p-4 bg-violet-400 rounded-3xl border-4 border-double border-yellow-500 -rotate-1">
            <p className="text-lg text-lime-300 mb-2 font-black uppercase">Your shortened URL:</p>
            <a
              href={createdShortUrl.shortUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-red-200 break-all font-mono text-xl hover:text-blue-900 bg-pink-600 p-2 block"
            >
              {createdShortUrl.shortUrl}
            </a>
          </div>
        )}

        {actionError && (
          <div className="mt-8 p-4 bg-lime-500 rounded-none border-8 border-solid border-red-700">
            <p className="text-2xl text-blue-800 font-black">{actionError}</p>
          </div>
        )}

        <div className="mt-10 border-4 border-indigo-500 bg-amber-100 p-4 -rotate-1">
          <h2 className="text-center font-mono text-xl text-indigo-700 mb-3">
            Saved links ({displayedCount} on page, {totalCount} total)
          </h2>
          <p className="text-center text-sm text-slate-700 mb-2">
            Page {page} of {totalPages} · {pageSize} per page
          </p>
          <div className="flex flex-wrap justify-center gap-2 mb-4">
            {hasPreviousPage && previousPageHref ? (
              <a
                className="rounded bg-white px-3 py-1 font-mono text-sm text-indigo-800 underline"
                href={previousPageHref}
              >
                ← Previous
              </a>
            ) : null}
            {hasNextPage && nextPageHref ? (
              <a
                className="rounded bg-white px-3 py-1 font-mono text-sm text-indigo-800 underline"
                href={nextPageHref}
              >
                Next →
              </a>
            ) : null}
          </div>
          <ul className="max-h-64 space-y-2 overflow-y-auto text-left font-mono text-sm">
            {shortUrls.length === 0 ? (
              <li className="text-center text-slate-500">No links yet. Create one above.</li>
            ) : (
              shortUrls.map((row) => (
                <li
                  className="border-b-2 border-dotted border-amber-400 pb-2"
                  key={row.id}
                >
                  <a className="text-blue-800 underline" href={row.shortUrl} target="_blank" rel="noreferrer">
                    {row.code}
                  </a>
                  <span className="text-slate-600"> → </span>
                  <span className="break-all text-purple-800">{row.originalUrl}</span>
                  <span className="ml-2 text-xs text-rose-600">({row.clickCount} clicks)</span>
                </li>
              ))
            )}
          </ul>
        </div>
      </div>
    </main>
  );
}
