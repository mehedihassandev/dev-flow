import React from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    leftIcon?: React.ReactNode;
    rightIcon?: React.ReactNode;
}

export function Input({
    label,
    error,
    leftIcon,
    rightIcon,
    className = "",
    ...props
}: InputProps) {
    return (
        <div className="w-full">
            {label && (
                <label className="block text-xs font-medium text-text-secondary mb-1.5">
                    {label}
                </label>
            )}
            <div className="relative">
                {leftIcon && (
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-text-muted">
                        {leftIcon}
                    </div>
                )}
                <input
                    className={`
                        w-full bg-bg-subtle border border-border-subtle rounded-md px-3 py-2
                        text-text-primary placeholder-text-muted text-xs
                        focus:outline-none focus:ring-1 focus:ring-border-active focus:border-border-active
                        transition-all duration-200
                        ${leftIcon ? "pl-9" : ""}
                        ${rightIcon ? "pr-9" : ""}
                        ${
                            error
                                ? "border-red-500/50 focus:ring-red-500/50"
                                : ""
                        }
                        ${className}
                    `}
                    {...props}
                />
                {rightIcon && (
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center text-text-muted">
                        {rightIcon}
                    </div>
                )}
            </div>
            {error && (
                <p className="mt-1.5 text-[10px] text-red-500">{error}</p>
            )}
        </div>
    );
}
