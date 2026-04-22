import { Form, useNavigation } from "react-router";

import { Alert, AlertDescription } from "~/components/ui/alert";
import { Button } from "~/components/ui/button";
import { Card, CardContent } from "~/components/ui/card";
import { Input } from "~/components/ui/input";

type UrlFormProps = {
  defaultValue?: string;
  error?: string;
};

export function UrlForm({ defaultValue = "", error }: UrlFormProps) {
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";

  return (
    <Card className="border-slate-200 py-5 shadow-lg shadow-slate-900/5 ring-0">
      <CardContent className="grid gap-3 px-5">
        <Form method="post" className="grid gap-3">
          <label className="grid gap-2 text-sm font-medium text-slate-700" htmlFor="url">
            Enter a URL to shorten
            <Input
              id="url"
              type="url"
              name="url"
              defaultValue={defaultValue}
              placeholder="https://example.com/articles/great-post"
              required
              aria-invalid={error ? true : undefined}
              aria-describedby={error ? "url-error" : undefined}
              className="h-12 rounded-2xl border-slate-300 bg-slate-50 px-4 text-base text-slate-900 focus-visible:border-amber-500 focus-visible:bg-white focus-visible:ring-4 focus-visible:ring-amber-100"
            />
          </label>

          {error ? (
            <Alert
              id="url-error"
              variant="destructive"
              className="rounded-2xl border-rose-200 bg-rose-50 px-4 py-3 text-rose-700"
            >
              <AlertDescription className="text-sm text-rose-700">{error}</AlertDescription>
            </Alert>
          ) : null}

          <Button
            type="submit"
            disabled={isSubmitting}
            className="h-12 rounded-2xl bg-slate-950 text-white hover:bg-slate-800"
          >
            {isSubmitting ? "Creating short URL…" : "Shorten URL"}
          </Button>
        </Form>
      </CardContent>
    </Card>
  );
}
