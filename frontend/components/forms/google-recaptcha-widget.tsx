"use client";

import { useEffect, useRef, useState } from "react";

declare global {
  interface Window {
    grecaptcha?: {
      render: (
        container: HTMLElement,
        parameters: {
          sitekey: string;
          theme?: "light" | "dark";
          callback: (token: string) => void;
          "expired-callback"?: () => void;
          "error-callback"?: () => void;
        }
      ) => number;
      reset: (opt_widget_id?: number) => void;
      ready?: (cb: () => void) => void;
    };
  }
}

type GoogleRecaptchaWidgetProps = {
  siteKey: string;
  onVerify: (token: string) => void;
  onExpire?: () => void;
  onError?: () => void;
  className?: string;
};

const SCRIPT_SRC = "https://www.google.com/recaptcha/api.js?render=explicit&hl=es-419";

export function GoogleRecaptchaWidget({
  siteKey,
  onVerify,
  onExpire,
  onError,
  className
}: GoogleRecaptchaWidgetProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const widgetIdRef = useRef<number | null>(null);
  const scriptRef = useRef<HTMLScriptElement | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    const renderCaptcha = () => {
      if (!containerRef.current || !window.grecaptcha || widgetIdRef.current !== null) {
        return;
      }

      const widgetId = window.grecaptcha.render(containerRef.current, {
        sitekey: siteKey,
        theme: "light",
        callback: (token: string) => {
          setLoadError(null);
          onVerify(token);
        },
        "expired-callback": () => {
          onExpire?.();
        },
        "error-callback": () => {
          setLoadError(
            "No se pudo cargar el captcha. Recarga la página e inténtalo nuevamente."
          );
          onError?.();
        }
      });
      widgetIdRef.current = widgetId;
    };

    const ensureRender = () => {
      if (!window.grecaptcha) {
        return;
      }
      if (typeof window.grecaptcha.ready === "function") {
        window.grecaptcha.ready(renderCaptcha);
      } else {
        renderCaptcha();
      }
    };

    if (typeof window !== "undefined" && window.grecaptcha?.render) {
      ensureRender();
      return () => {};
    }

    const existingScript = document.querySelector<HTMLScriptElement>(
      `script[src="${SCRIPT_SRC}"]`
    );

    const handleLoad = () => {
      ensureRender();
    };

    const handleError = () => {
      setLoadError("No se pudo cargar el captcha. Recarga la página e inténtalo nuevamente.");
      onError?.();
    };

    if (existingScript) {
      existingScript.addEventListener("load", handleLoad);
      existingScript.addEventListener("error", handleError);

      return () => {
        existingScript.removeEventListener("load", handleLoad);
        existingScript.removeEventListener("error", handleError);
      };
    }

    const script = document.createElement("script");
    script.src = SCRIPT_SRC;
    script.async = true;
    script.defer = true;
    script.onload = handleLoad;
    script.onerror = handleError;
    document.body.appendChild(script);
    scriptRef.current = script;

    return () => {
      script.removeEventListener("load", handleLoad);
      script.removeEventListener("error", handleError);
      if (scriptRef.current) {
        document.body.removeChild(scriptRef.current);
        scriptRef.current = null;
      }
      widgetIdRef.current = null;
    };
  }, [siteKey, onError, onExpire, onVerify]);

  return (
    <div className={className}>
      <div ref={containerRef} />
      {loadError && <p className="mt-2 text-sm text-red-600">{loadError}</p>}
    </div>
  );
}

