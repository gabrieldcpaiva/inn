"use server";

import { redirect } from "next/navigation";
import { endSession, startSession, verifyCredentials } from "@/lib/auth";
import { signInSchema, text, zodErrors, type ActionState } from "@/lib/validation";

export async function signIn(
  _previous: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const nextParam = text(formData.get("next"), 200);
  const next = nextParam.startsWith("/desk") ? nextParam : "/desk";

  const parsed = signInSchema.safeParse({
    email: text(formData.get("email"), 160),
    password: text(formData.get("password"), 200),
  });

  if (!parsed.success) {
    return { status: "error", message: "Please fill in both fields.", errors: zodErrors(parsed.error) };
  }

  const innkeeper = await verifyCredentials(parsed.data.email, parsed.data.password);
  if (!innkeeper) {
    return {
      status: "error",
      message: "Those details don’t match. The email is case-insensitive; the password is not.",
    };
  }

  await startSession(innkeeper);
  redirect(next);
}

export async function signOut(): Promise<void> {
  await endSession();
  redirect("/");
}
