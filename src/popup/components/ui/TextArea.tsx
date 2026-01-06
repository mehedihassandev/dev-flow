import React from "react";

interface TextAreaProps
    extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
    label?: string;
    error?: string;
}

export function TextArea({
    label,
    error,
    className = "",
    ...props
}: TextAreaProps) {
    return (
        <div className="w-full">
            {label && (
                <label className="block text-xs font-medium text-text-secondary mb-1.5">
                    {label}
                </label>
            )}
            <textarea
                className={`
                    w-full bg-bg-subtle border border-border-subtle rounded-md px-3 py-2.5
                    text-text-primary placeholder-text-muted text-xs font-mono
                    focus:outline-none focus:ring-1 focus:ring-border-active focus:border-border-active
                    transition-all duration-200 resize-none
                    ${error ? "border-red-500/50 focus:ring-red-500/50" : ""}
                    ${className}
                `}
                {...props}
            />
            {error && (
                <p className="mt-1.5 text-[10px] text-red-500">{error}</p>
            )}
        </div>
    );
}
