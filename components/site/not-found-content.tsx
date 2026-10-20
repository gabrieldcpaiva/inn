import Link from "next/link";

export function NotFoundContent() {
  return (
    <div className="mx-auto flex max-w-[900px] flex-col justify-center px-5 py-24 md:px-8">
      <p className="label">Page not found</p>
      <h1 className="display-xl mt-4">You’ve wandered off the lane.</h1>
      <p className="lede mt-5 max-w-lg">
        There is nothing at this address — or nothing there yet. The inn is still where it was,
        at the end of the drive.
      </p>
      <div className="mt-8 flex flex-wrap gap-3">
        <Link href="/" className="btn btn-primary">
          Back to the inn
        </Link>
        <Link href="/rooms" className="btn btn-outline">
          The six rooms
        </Link>
      </div>
      <div className="mt-14 grid gap-6 border-t border-line pt-6 sm:grid-cols-3">
        <Link href="/stay" className="group">
          <p className="label">The book</p>
          <p className="mt-1 font-display text-xl group-hover:text-clay">Request a stay</p>
        </Link>
        <Link href="/menu" className="group">
          <p className="label">The kitchen</p>
          <p className="mt-1 font-display text-xl group-hover:text-clay">This season’s menu</p>
        </Link>
        <Link href="/find-us" className="group">
          <p className="label">The lane</p>
          <p className="mt-1 font-display text-xl group-hover:text-clay">Finding us</p>
        </Link>
      </div>
    </div>
  );
}
