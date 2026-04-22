import { Link } from "react-router";

import { Button } from "~/components/ui/button";
import { Card, CardContent, CardFooter } from "~/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";

type ShortUrlListItem = {
  id: string;
  code: string;
  originalUrl: string;
  shortUrl: string;
  clickCount: number;
  createdAt: string;
  lastVisitedAt: string | null;
};

type UrlStatsTableProps = {
  shortUrls: ShortUrlListItem[];
  page: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
  previousPageHref: string | null;
  nextPageHref: string | null;
};

function formatDate(value: string | null) {
  if (!value) {
    return "Never";
  }

  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export function UrlStatsTable({
  shortUrls,
  page,
  totalPages,
  hasPreviousPage,
  hasNextPage,
  previousPageHref,
  nextPageHref,
}: UrlStatsTableProps) {
  if (shortUrls.length === 0) {
    return (
      <Card className="border-dashed border-slate-300 bg-white/80 py-8 text-center text-slate-600 shadow-lg shadow-slate-900/5 ring-0">
        <p className="text-lg font-semibold text-slate-900">No shortened URLs yet</p>
        <p className="mt-2 text-sm">Create your first short link to start collecting clicks and stats.</p>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden border-slate-200 shadow-lg shadow-slate-900/5 ring-0">
      <CardContent className="p-0">
        <Table>
          <TableHeader className="bg-slate-50 text-xs uppercase tracking-[0.24em] text-slate-500">
            <TableRow className="border-slate-200 hover:bg-transparent">
              <TableHead className="px-4 py-4 font-medium">Short URL</TableHead>
              <TableHead className="px-4 py-4 font-medium">Destination</TableHead>
              <TableHead className="px-4 py-4 font-medium">Clicks</TableHead>
              <TableHead className="px-4 py-4 font-medium">Created</TableHead>
              <TableHead className="px-4 py-4 font-medium">Last visit</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="text-sm text-slate-700">
            {shortUrls.map((item) => (
              <TableRow key={item.id} className="align-top border-slate-100 hover:bg-slate-50/70">
                <TableCell className="px-4 py-4 align-top">
                  <a
                    href={item.shortUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="font-semibold text-amber-700 underline decoration-amber-200 underline-offset-4"
                  >
                    {item.code}
                  </a>
                  <p className="mt-1 break-all text-xs text-slate-500">{item.shortUrl}</p>
                </TableCell>
                <TableCell className="px-4 py-4 align-top whitespace-normal">
                  <a
                    href={item.originalUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="line-clamp-2 break-all text-slate-700 underline decoration-slate-200 underline-offset-4"
                  >
                    {item.originalUrl}
                  </a>
                </TableCell>
                <TableCell className="px-4 py-4 text-lg font-semibold text-slate-950">{item.clickCount}</TableCell>
                <TableCell className="px-4 py-4 text-slate-500">{formatDate(item.createdAt)}</TableCell>
                <TableCell className="px-4 py-4 text-slate-500">{formatDate(item.lastVisitedAt)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>

      <CardFooter className="justify-end gap-3 border-t border-slate-200 bg-slate-50 px-4 py-4 text-sm text-slate-600">
        <span>
          Page {page} of {totalPages}
        </span>
        <Button
          asChild
          variant="outline"
          className={hasPreviousPage ? "rounded-xl" : "pointer-events-none rounded-xl opacity-50"}
        >
          <Link to={previousPageHref ?? "."} aria-disabled={!hasPreviousPage}>
            Previous
          </Link>
        </Button>
        <Button
          asChild
          variant="outline"
          className={hasNextPage ? "rounded-xl" : "pointer-events-none rounded-xl opacity-50"}
        >
          <Link to={nextPageHref ?? "."} aria-disabled={!hasNextPage}>
            Next
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
