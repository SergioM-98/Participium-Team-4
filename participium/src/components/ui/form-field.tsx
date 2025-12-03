"use client";

import { Input } from "./input";
import { Label } from "./label";

export interface FormFieldProps {
  id: string;
  label: string;
  type?: React.HTMLInputTypeAttribute;
  value: string | boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  error?: string;
  required?: boolean;
  className?: string;
}

export function FormField({
  id,
  label,
  type = "text",
  value,
  onChange,
  placeholder,
  error,
  required = false,
  className,
}: FormFieldProps) {
  const errorId = `${id}-error`;
  const isCheckbox = type === "checkbox";

  if (isCheckbox) {
    return (
      <div className={`flex items-center gap-2 ${className ?? ""}`}>
        <Input
          id={id}
          type="checkbox"
          checked={value as boolean}
          onChange={onChange}
          className="w-4 h-4"
        />
        <Label htmlFor={id} className="mb-0 cursor-pointer">
          {label}
        </Label>
      </div>
    );
  }

  return (
    <div className={`space-y-2 ${className ?? ""}`}>
      <Label htmlFor={id}>
        {label}
        {required && " *"}
      </Label>
      <Input
        id={id}
        type={type}
        value={value as string}
        onChange={onChange}
        placeholder={placeholder}
        aria-invalid={!!error}
        aria-describedby={error ? errorId : undefined}
      />
      {error && (
        <p id={errorId} className="text-xs text-red-500 mt-1">
          {error}
        </p>
      )}
    </div>
  );
}
