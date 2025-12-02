"use client";

import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../app/lib/utils/index";

const alertVariants = cva(
  "mb-4 border px-4 py-3 rounded-lg relative text-sm whitespace-pre-wrap wrap-break-word",
  {
    variants: {
      variant: {
        error: "bg-red-100 border-red-400 text-red-700",
        success:
          "bg-green-100 border-green-400 text-green-700 animate-in fade-in duration-300",
        warning: "bg-yellow-100 border-yellow-400 text-yellow-700",
        info: "bg-blue-100 border-blue-400 text-blue-700",
      },
    },
    defaultVariants: {
      variant: "info",
    },
  }
);

export interface AlertProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof alertVariants> {
  message: string;
}

export function Alert({ variant, message, className, ...props }: AlertProps) {
  return (
    <div
      className={cn(alertVariants({ variant }), className)}
      role="alert"
      {...props}
    >
      <span className="block sm:inline">{message}</span>
    </div>
  );
}
