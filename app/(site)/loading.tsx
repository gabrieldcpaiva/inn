export default function Loading() {
  return (
    <div className="mx-auto max-w-[1280px] px-5 py-16 md:px-8">
      <div className="h-3 w-24 animate-pulse bg-line" />
      <div className="mt-6 h-12 w-2/3 animate-pulse bg-line-soft" />
      <div className="mt-3 h-4 w-1/2 animate-pulse bg-line-soft" />
      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }, (_, index) => (
          <div key={index} className="aspect-[4/5] animate-pulse bg-line-soft" />
        ))}
      </div>
    </div>
  );
}
