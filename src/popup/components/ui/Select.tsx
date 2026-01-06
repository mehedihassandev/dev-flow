import React from "react";

interface SelectOption {
    value: string;
    label: string;
}

interface SelectProps
    extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, "onChange"> {
    label?: string;
    options: SelectOption[];
    error?: string;
    onChange?: (value: string) => void;
}

export function Select({
    label,
    options,
    error,
    onChange,
    className = "",
    value,
    ...props
}: SelectProps) {
    const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        onChange?.(e.target.value);
    };

    return (
        <div className="w-full">
            {label && (
                <label className="block text-xs font-medium text-text-secondary mb-1.5">
                    {label}
                </label>
            )}
            <div className="relative">
                <select
                    className={`
                        w-full bg-bg-subtle border border-border-subtle rounded-md px-3 py-2
                        text-text-primary text-xs appearance-none cursor-pointer
                        focus:outline-none focus:ring-1 focus:ring-border-active focus:border-border-active
                        transition-all duration-200
                        ${
                            error
                                ? "border-red-500/50 focus:ring-red-500/50"
                                : ""
                        }
                        ${className}
                    `}
                    value={value}
                    onChange={handleChange}
                    style={{
                        backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%23a1a1aa' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                        backgroundPosition: "right 0.5rem center",
                        backgroundRepeat: "no-repeat",
                        backgroundSize: "1.2em 1.2em",
                        paddingRight: "2rem",
                    }}
                    {...props}
                >
                    {options.map((option) => (
                        <option key={option.value} value={option.value}>
                            {option.label}
                        </option>
                    ))}
                </select>
            </div>
            {error && (
                <p className="mt-1.5 text-[10px] text-red-500">{error}</p>
            )}
        </div>
    );
}
