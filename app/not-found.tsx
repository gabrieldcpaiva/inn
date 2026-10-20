import Link from "next/link";

export default function NotFound() {
  return (
    <main className="relative z-10 mx-auto flex min-h-screen max-w-[900px] flex-col justify-center px-6 py-24">
      <p className="label">Page not found</p>
      <h1 className="display-xl mt-4">You’ve wandered off the lane.</h1>
      <p className="lede mt-5 max-w-lg">
        There is nothing at this address — or nothing there yet.
      </p>
      <div className="mt-8">
        <Link href="/" className="btn btn-primary">
          Back to the inn
        </Link>
      </div>
    </main>
  );
}
