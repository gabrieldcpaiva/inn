"use client";

import { useActionState } from "react";
import { signIn } from "@/lib/actions/auth";
import { idleState } from "@/lib/validation";
import { FormMessage, TextField } from "@/components/booking/fields";

type SignInFormProps = {
  next: string;
  demo: { email: string; password: string; visible: boolean } | null;
};

export function SignInForm({ next, demo }: SignInFormProps) {
  const [state, action, pending] = useActionState(signIn, idleState);

  return (
    <form action={action} className="mt-8 space-y-4">
      <input type="hidden" name="next" value={next} />
      <TextField
        label="Email"
        name="email"
        type="email"
        required
        autoComplete="username"
        defaultValue={demo?.email}
        error={state.errors?.email}
      />
      <TextField
        label="Password"
        name="password"
        type="password"
        required
        autoComplete="current-password"
        defaultValue={demo?.password}
        error={state.errors?.password}
      />
      <FormMessage status={state.status} message={state.message} />
      <button type="submit" disabled={pending} className="btn btn-primary w-full">
        {pending ? "Opening the desk…" : "Sign in to the desk"}
      </button>

      {demo?.visible ? (
        <div className="border border-line bg-paper-deep/40 px-3.5 py-3 text-[11.5px] leading-relaxed text-ink-soft">
          <p className="text-[9.5px] uppercase tracking-[0.18em] text-muted">For the preview</p>
          <p className="mt-1">
            Email <span className="font-mono text-[11px]">{demo.email}</span>
            <br />
            Password <span className="font-mono text-[11px]">{demo.password}</span>
          </p>
          <p className="mt-1.5 text-[10.5px] text-muted">
            Seeded by <span className="font-mono">npm run db:seed</span>. Change it with the
            INNKEEPER_* environment variables, and hide this box with SHOW_DEMO_LOGIN=false.
          </p>
        </div>
      ) : null}
    </form>
  );
}
