"use client";

import { clsx } from "@/lib/clsx";

type FieldProps = {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  placeholder?: string;
  autoComplete?: string;
  defaultValue?: string;
  error?: string;
  hint?: string;
  className?: string;
};

export function TextField({
  label,
  name,
  type = "text",
  required,
  placeholder,
  autoComplete,
  defaultValue,
  error,
  hint,
  className,
}: FieldProps) {
  return (
    <label className={clsx("block", className)}>
      <span className="field-label">
        {label}
        {required ? <span className="ml-1 text-clay">*</span> : null}
      </span>
      <input
        name={name}
        type={type}
        required={required}
        placeholder={placeholder}
        autoComplete={autoComplete}
        defaultValue={defaultValue}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${name}-error` : undefined}
        className={clsx("field", error && "border-clay")}
      />
      {error ? (
        <span id={`${name}-error`} className="mt-1 block text-[11.5px] text-clay">
          {error}
        </span>
      ) : hint ? (
        <span className="field-hint">{hint}</span>
      ) : null}
    </label>
  );
}

export function NumberSelect({
  label,
  name,
  value,
  onChange,
  min = 1,
  max = 6,
  suffix,
  className,
}: {
  label: string;
  name: string;
  value: number;
  onChange?: (value: number) => void;
  min?: number;
  max?: number;
  suffix?: string;
  className?: string;
}) {
  const options = Array.from({ length: max - min + 1 }, (_, index) => min + index);
  return (
    <label className={clsx("block", className)}>
      <span className="field-label">{label}</span>
      <select
        name={name}
        value={value}
        onChange={onChange ? (event) => onChange(Number(event.target.value)) : undefined}
        className="field cursor-pointer pr-8"
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
            {suffix ? ` ${suffix}` : ""}
          </option>
        ))}
      </select>
    </label>
  );
}

export function FormMessage({
  status,
  message,
}: {
  status: "idle" | "error" | "success";
  message?: string;
}) {
  if (!message || status === "idle") return null;
  return (
    <p
      role={status === "error" ? "alert" : "status"}
      className={clsx(
        "border-l-2 px-3 py-2 text-[12.5px] leading-relaxed",
        status === "error"
          ? "border-clay bg-clay-pale/60 text-[#7c3d24]"
          : "border-moss bg-sage-pale/60 text-moss",
      )}
    >
      {message}
    </p>
  );
}
