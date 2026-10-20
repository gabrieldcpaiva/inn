"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function ReferenceLookup() {
  const router = useRouter();
  const [value, setValue] = useState("");
  const [error, setError] = useState<string | null>(null);

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        const reference = value.trim().toUpperCase();
        if (!/^LH-[A-Z0-9]{4,8}$/.test(reference)) {
          setError("References look like LH-4K2P9X — check your confirmation email.");
          return;
        }
        setError(null);
        router.push(`/stay/received/${reference}`);
      }}
      className="flex flex-col gap-2 sm:flex-row sm:items-end"
    >
      <label className="block flex-1">
        <span className="field-label">Your reference</span>
        <input
          value={value}
          onChange={(event) => setValue(event.target.value)}
          placeholder="LH-4K2P9X"
          className="field font-mono tracking-widest uppercase"
          aria-describedby={error ? "reference-error" : undefined}
        />
      </label>
      <button type="submit" className="btn btn-outline">
        Look it up
      </button>
      {error ? (
        <p id="reference-error" className="text-[11.5px] text-clay sm:basis-full">
          {error}
        </p>
      ) : null}
    </form>
  );
}
