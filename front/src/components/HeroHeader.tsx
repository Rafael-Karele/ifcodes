import type React from "react";

interface HeroHeaderProps {
  icon: React.ElementType;
  title: React.ReactNode;
  description?: React.ReactNode;
  className?: string;
}

export function HeroHeader({ icon: Icon, title, description, className = "" }: HeroHeaderProps) {
  return (
    <div
      className={`relative rounded-2xl px-5 py-8 sm:px-8 sm:py-10 mb-8 overflow-hidden bg-gradient-to-br from-teal-600 to-emerald-800 ${className}`}
    >
      <div className="pointer-events-none absolute -top-6 -right-6 h-32 w-32 rounded-full bg-white opacity-10" />
      <div className="pointer-events-none absolute bottom-4 left-1/3 h-20 w-20 rounded-full bg-white opacity-[0.07]" />

      <div className="relative z-10">
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white flex items-center gap-3">
          <Icon className="w-6 h-6 sm:w-8 sm:h-8" />
          {title}
        </h1>
        {description && (
          <p className="mt-2 text-teal-100 text-sm leading-relaxed">
            {description}
          </p>
        )}
      </div>
    </div>
  );
}
