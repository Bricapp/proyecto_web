"use client";

import clsx from "clsx";
import { useEffect, useRef, useState } from "react";

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string;
            callback: (response: { credential?: string }) => void;
            ux_mode?: "popup" | "redirect";
            locale?: string;
          }) => void;
          renderButton: (element: HTMLElement, options: Record<string, unknown>) => void;
          cancel: () => void;
          disableAutoSelect?: () => void;
        };
      };
    };
  }
}

type GoogleAuthButtonProps = {
  onCredential: (token: string) => Promise<void>;
  buttonType?: "signin_with" | "signup_with" | "continue_with";
  className?: string;
  clientId?: string | null;
  isLoading?: boolean;
};

export function GoogleAuthButton({
  onCredential,
  buttonType = "signin_with",
  className,
  clientId,
  isLoading = false
}: GoogleAuthButtonProps) {
  const googleClientId = clientId?.trim();
  const buttonRef = useRef<HTMLDivElement | null>(null);
  const scriptRef = useRef<HTMLScriptElement | null>(null);
  const buttonRenderedRef = useRef(false);
  const scriptInjectedRef = useRef(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!googleClientId || typeof window === "undefined" || !buttonRef.current) {
      return undefined;
    }

    const handleCredential = async (response: { credential?: string }) => {
      const credential = response.credential;
      if (!credential) {
        setError("No pudimos obtener la respuesta de Google. Intenta nuevamente.");
        return;
      }

      setError(null);

      try {
        await onCredential(credential);
      } catch (error) {
        const message =
          error instanceof Error && error.message.trim().length > 0
            ? error.message
            : "No pudimos completar la autenticación con Google. Intenta más tarde.";
        setError(message);
      }
    };

    const renderButton = () => {
      if (!window.google || !buttonRef.current || buttonRenderedRef.current) {
        return;
      }
      window.google.accounts.id.initialize({
        client_id: googleClientId,
        callback: handleCredential,
        ux_mode: "popup",
        locale: "es-419"
      });
      window.google.accounts.id.renderButton(buttonRef.current, {
        theme: "outline",
        size: "large",
        width: "100%",
        text: buttonType,
        shape: "pill"
      });
      buttonRenderedRef.current = true;
    };

    if (window.google) {
      renderButton();
      return () => {
        window.google?.accounts.id.cancel();
        window.google?.accounts.id.disableAutoSelect?.();
        buttonRenderedRef.current = false;
      };
    }

    if (scriptInjectedRef.current) {
      return undefined;
    }

    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = () => {
      renderButton();
    };
    script.onerror = () => {
      setError("No se pudo cargar el acceso con Google.");
      scriptInjectedRef.current = false;
    };
    document.body.appendChild(script);
    scriptRef.current = script;
    scriptInjectedRef.current = true;

    return () => {
      if (scriptRef.current) {
        document.body.removeChild(scriptRef.current);
        scriptRef.current = null;
      }
      window.google?.accounts.id.cancel();
      window.google?.accounts.id.disableAutoSelect?.();
      buttonRenderedRef.current = false;
      scriptInjectedRef.current = false;
    };
  }, [googleClientId, onCredential, buttonType]);

  if (isLoading) {
    return (
      <div
        className={clsx(
          "h-12 w-full animate-pulse rounded-full bg-slate-200/80",
          className
        )}
      />
    );
  }

  if (!googleClientId) {
    return (
      <p className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-700">
        Configura la clave de Google OAuth para habilitar esta opción.
      </p>
    );
  }

  return (
    <div className={clsx("space-y-3", className)}>
      <div ref={buttonRef} className="flex justify-center" />
      {error && (
        <p className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-700">
          {error}
        </p>
      )}
    </div>
  );
}
