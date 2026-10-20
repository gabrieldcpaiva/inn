export function Honeypot() {
  return (
    <div aria-hidden="true" className="absolute left-[-9999px] top-auto h-px w-px overflow-hidden">
      <label>
        Company (leave this empty)
        <input name="company" tabIndex={-1} autoComplete="off" defaultValue="" />
      </label>
    </div>
  );
}
