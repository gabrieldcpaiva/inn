import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { SignInForm } from "@/components/desk/sign-in-form";
import { Photo } from "@/components/ui/photo";
import { getInnkeeper } from "@/lib/auth";
import { demoCredentials } from "@/lib/auth";
import { inn } from "@/lib/inn";

export const metadata: Metadata = { title: "Sign in" };

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const already = await getInnkeeper();
  const query = await searchParams;
  const next = query.next?.startsWith("/desk") ? query.next : "/desk";
  if (already) redirect(next);

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="relative hidden min-h-[560px] lg:block">
        <div className="absolute inset-0">
          <Photo
            src="/seed/house/door.jpg"
            alt="The door of Larkspur House, with climbing roses"
            className="h-full w-full"
            sizes="50vw"
            priority
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-ink/70 via-ink/10 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 p-10 text-parchment">
          <p className="text-[10px] uppercase tracking-[0.24em] text-parchment/60">
            {inn.region}
          </p>
          <p className="mt-3 max-w-md font-display text-4xl leading-tight">
            The book is kept by hand, at this desk, most mornings before seven.
          </p>
          <p className="mt-4 text-[11px] uppercase tracking-[0.18em] text-parchment/50">
            {inn.innkeepers}
          </p>
        </div>
      </div>

      <div className="flex flex-col justify-center px-6 py-12 sm:px-12 lg:px-16">
        <div className="mx-auto w-full max-w-sm">
          <Link href="/" className="font-display text-2xl leading-none">
            Larkspur House
          </Link>
          <p className="mt-1.5 text-[9.5px] uppercase tracking-[0.24em] text-muted">
            Innkeeper’s desk
          </p>

          <h1 className="display-md mt-10">Good morning.</h1>
          <p className="mt-2 text-sm leading-relaxed text-ink-soft">
            Sign in to read the post, answer requests and keep the diary. There is no guest
            account — the desk belongs to the people who run the inn.
          </p>

          <SignInForm
            next={next}
            demo={
              demoCredentials.visible
                ? {
                    email: demoCredentials.email,
                    password: demoCredentials.password,
                    visible: true,
                  }
                : null
            }
          />

          <p className="mt-8 border-t border-line pt-4 text-[11px] leading-relaxed text-muted">
            Guests do not need an account. To ask about a stay,{" "}
            <Link href="/stay" className="underline underline-offset-4 hover:text-ink">
              use the reservations book
            </Link>
            . Forgotten your password? Ask Tom — he keeps it on the back of the seed catalogue.
          </p>
        </div>
      </div>
    </div>
  );
}
