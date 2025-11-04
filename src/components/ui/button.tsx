import * as React from "react";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = "", ...props }, ref) => (
    <button
      ref={ref}
      className={
        "inline-flex w-full items-center justify-center rounded-md " +
        "bg-black px-4 py-2 text-sm font-medium text-white " +
        "disabled:cursor-not-allowed disabled:opacity-50 " +
        className
      }
      {...props}
    />
  )
);
Button.displayName = "Button";
