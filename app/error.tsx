"use client";

import Link from "next/link";
import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="relative z-10 mx-auto flex min-h-screen max-w-[900px] flex-col justify-center px-6 py-24">
      <p className="label">Something has come loose</p>
      <h1 className="display-xl mt-4">The book has jammed.</h1>
      <p className="lede mt-5 max-w-xl">
        That is not your fault. Try again; if it keeps happening, the database may not be
        running. The innkeeper can be reached on 015242 72 314.
      </p>
      <div className="mt-8 flex flex-wrap gap-3">
        <button type="button" onClick={reset} className="btn btn-primary">
          Try again
        </button>
        <Link href="/" className="btn btn-outline">
          Back to the inn
        </Link>
      </div>
    </main>
  );
}
