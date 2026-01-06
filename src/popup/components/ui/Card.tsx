import React from "react";

interface CardProps {
    children: React.ReactNode;
    className?: string;
    hover?: boolean;
    onClick?: () => void;
}

export function Card({
    children,
    className = "",
    hover = false,
    onClick,
}: CardProps) {
    return (
        <div
            className={`
                bg-bg-subtle border border-border-subtle rounded-lg
                ${
                    hover
                        ? "hover:border-border-active hover:bg-bg-surface cursor-pointer transition-all duration-200"
                        : ""
                }
                ${className}
            `}
            onClick={onClick}
        >
            {children}
        </div>
    );
}

interface CardHeaderProps {
    children: React.ReactNode;
    className?: string;
}

export function CardHeader({ children, className = "" }: CardHeaderProps) {
    return (
        <div className={`px-4 py-3 border-b border-border-subtle ${className}`}>
            {children}
        </div>
    );
}

interface CardContentProps {
    children: React.ReactNode;
    className?: string;
}

export function CardContent({ children, className = "" }: CardContentProps) {
    return <div className={`p-4 ${className}`}>{children}</div>;
}
