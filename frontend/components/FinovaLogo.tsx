import clsx from "clsx";

type FinovaLogoProps = {
  className?: string;
  variant?: "light" | "dark";
};

export function FinovaLogo({ className, variant = "light" }: FinovaLogoProps) {
  const isLight = variant === "light";

  return (
    <div className={clsx("flex items-center gap-3", className)}>
      <span
        aria-hidden
        className={clsx(
          "flex h-12 w-12 items-center justify-center rounded-2xl text-2xl font-bold shadow-lg shadow-emerald-500/30 transition-transform duration-500",
          "bg-gradient-to-br from-emerald-400 via-emerald-500 to-sky-500 text-slate-900"
        )}
      >
        F
      </span>
      <div className="leading-tight">
        <p
          className={clsx(
            "text-2xl font-semibold tracking-wide",
            isLight ? "text-white" : "text-slate-900"
          )}
        >
          Finova
        </p>
        <p
          className={clsx(
            "text-sm font-medium",
            isLight ? "text-emerald-100" : "text-emerald-600"
          )}
        >
          Finanzas inteligentes
        </p>
      </div>
    </div>
  );
}
