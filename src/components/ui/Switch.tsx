import * as React from "react";

interface SwitchProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  disabled?: boolean;
  className?: string;
}

export const Switch = React.forwardRef<HTMLButtonElement, SwitchProps>(
  ({ checked, onCheckedChange, disabled = false, className = "" }, ref) => (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      ref={ref}
      disabled={disabled}
      onClick={() => onCheckedChange(!checked)}
      className={`
        relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center 
        rounded-full transition-colors duration-200 ease-in-out
        ${checked ? "bg-blue-600" : "bg-gray-200"}
        ${disabled ? "cursor-not-allowed opacity-50" : ""}
        ${className}
      `}
    >
      <span
        className={`
          pointer-events-none block h-4 w-4 rounded-full bg-white shadow 
          transform transition-transform duration-200 ease-in-out
          ${checked ? "translate-x-4" : "translate-x-0.5"}
        `}
      />
    </button>
  )
);

Switch.displayName = "Switch";
