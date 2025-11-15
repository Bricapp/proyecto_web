"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import clsx from "clsx";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { RegisterPayload } from "@/lib/api";
import { useAuth } from "@/components/auth/auth-context";
import { GoogleRecaptchaWidget } from "@/components/forms/google-recaptcha-widget";

type RegisterFormProps = {
  siteKey?: string | null;
  isLoading?: boolean;
};

const schema = z
  .object({
    first_name: z.string().max(150, "El nombre es muy largo").optional(),
    last_name: z.string().max(150, "El apellido es muy largo").optional(),
    phone: z.string().max(30, "El teléfono es muy largo").optional(),
    email: z.string().min(1, "El correo es obligatorio").email("Ingresa un correo válido"),
    password: z
      .string()
      .min(8, "La contraseña debe tener al menos 8 caracteres"),
    password_confirm: z.string().min(1, "Debes confirmar tu contraseña"),
    recaptcha_token: z.string().min(1, "Debes completar el captcha"),
  })
  .superRefine((data, ctx) => {
    if (data.password !== data.password_confirm) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["password_confirm"],
        message: "Las contraseñas no coinciden",
      });
    }
  });

type FormValues = z.infer<typeof schema>;

function buildPayload(values: FormValues): RegisterPayload {
  const payload: RegisterPayload = {
    email: values.email.trim(),
    password: values.password,
    recaptcha_token: values.recaptcha_token,
  };

  const firstName = values.first_name?.trim();
  if (firstName) {
    payload.first_name = firstName;
  }

  const lastName = values.last_name?.trim();
  if (lastName) {
    payload.last_name = lastName;
  }

  const phone = values.phone?.trim();
  if (phone) {
    payload.phone = phone;
  }

  return payload;
}

export function RegisterForm({ siteKey, isLoading = false }: RegisterFormProps) {
  const { register: registerAccount } = useAuth();
  const [formError, setFormError] = useState<string | null>(null);
  const [captchaMessage, setCaptchaMessage] = useState<string | null>(null);
  const effectiveSiteKey = siteKey?.trim() ?? "";
  const {
    register: registerField,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      first_name: "",
      last_name: "",
      phone: "",
      email: "",
      password: "",
      password_confirm: "",
      recaptcha_token: "",
    },
  });

  const mutation = useMutation({
    mutationFn: async (values: FormValues) => {
      try {
        await registerAccount(buildPayload(values));
      } catch (error) {
        if (error instanceof TypeError) {
          throw new Error(
            "No se pudo establecer conexión con el servidor. Intenta nuevamente en unos segundos."
          );
        }
        throw error;
      }
    },
    onError: (error: unknown) => {
      if (error instanceof Error) {
        setFormError(
          error.message.trim().length > 0
            ? error.message
            : "Algo no salió como esperábamos. Intenta nuevamente."
        );
      } else {
        setFormError("Error inesperado");
      }
    },
  });

  const onSubmit = (values: FormValues) => {
    setFormError(null);
    setCaptchaMessage(null);
    mutation.mutate(values);
  };

  const fieldStyles = useMemo(
    () =>
      clsx(
        "block w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 transition placeholder:text-slate-400 focus:border-slate-900/60 focus:outline-none focus:ring-2 focus:ring-slate-900/20"
      ),
    []
  );

  const labelStyles = useMemo(
    () => clsx("mb-1 block text-sm font-medium text-slate-700"),
    []
  );

  const errorTextStyles = useMemo(
    () => clsx("mt-1 text-sm text-red-600"),
    []
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center rounded-2xl border border-slate-200 bg-white/90 p-6">
        <div className="flex items-center gap-3 text-sm text-slate-500">
          <svg
            aria-hidden
            className="h-5 w-5 animate-spin text-emerald-500"
            viewBox="0 0 24 24"
            fill="none"
          >
            <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="4" opacity="0.3" />
            <path d="M21 12a9 9 0 00-9-9" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
          </svg>
          <span>Cargando configuración de seguridad…</span>
        </div>
      </div>
    );
  }

  if (!effectiveSiteKey) {
    return (
      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
        La verificación reCAPTCHA no está configurada. Contacta al equipo de soporte para completar tu
        registro.
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <input type="hidden" {...registerField("recaptcha_token")} />
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <label className={labelStyles} htmlFor="first_name">
            Nombre
          </label>
          <input
            id="first_name"
            type="text"
            autoComplete="given-name"
            className={fieldStyles}
            {...registerField("first_name", { onChange: () => setFormError(null) })}
          />
          {errors.first_name && (
            <p className={errorTextStyles} role="alert">
              {errors.first_name.message}
            </p>
          )}
        </div>
        <div className="space-y-2">
          <label className={labelStyles} htmlFor="last_name">
            Apellido
          </label>
          <input
            id="last_name"
            type="text"
            autoComplete="family-name"
            className={fieldStyles}
            {...registerField("last_name", { onChange: () => setFormError(null) })}
          />
          {errors.last_name && (
            <p className={errorTextStyles} role="alert">
              {errors.last_name.message}
            </p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <label className={labelStyles} htmlFor="phone">
          Teléfono (opcional)
        </label>
        <input
          id="phone"
          type="tel"
          autoComplete="tel"
          className={fieldStyles}
          {...registerField("phone", { onChange: () => setFormError(null) })}
        />
        {errors.phone && (
          <p className={errorTextStyles} role="alert">
            {errors.phone.message}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <label className={labelStyles} htmlFor="email">
          Correo electrónico
        </label>
        <input
          id="email"
          type="email"
          autoComplete="email"
          className={fieldStyles}
          aria-invalid={Boolean(errors.email)}
          aria-describedby={errors.email ? "email-error" : undefined}
          {...registerField("email", { onChange: () => setFormError(null) })}
        />
        {errors.email && (
          <p id="email-error" className={errorTextStyles} role="alert">
            {errors.email.message}
          </p>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <label className={labelStyles} htmlFor="password">
            Contraseña
          </label>
          <input
            id="password"
            type="password"
            autoComplete="new-password"
            className={fieldStyles}
            aria-invalid={Boolean(errors.password)}
            aria-describedby={errors.password ? "password-error" : undefined}
            {...registerField("password", { onChange: () => setFormError(null) })}
          />
          {errors.password && (
            <p id="password-error" className={errorTextStyles} role="alert">
              {errors.password.message}
            </p>
          )}
        </div>
        <div className="space-y-2">
          <label className={labelStyles} htmlFor="password_confirm">
            Confirmar contraseña
          </label>
          <input
            id="password_confirm"
            type="password"
            autoComplete="new-password"
            className={fieldStyles}
            aria-invalid={Boolean(errors.password_confirm)}
            aria-describedby={
              errors.password_confirm ? "password-confirm-error" : undefined
            }
            {...registerField("password_confirm", { onChange: () => setFormError(null) })}
          />
          {errors.password_confirm && (
            <p id="password-confirm-error" className={errorTextStyles} role="alert">
              {errors.password_confirm.message}
            </p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <GoogleRecaptchaWidget
          siteKey={effectiveSiteKey}
          onVerify={(token) => {
            setFormError(null);
            setCaptchaMessage(null);
            setValue("recaptcha_token", token, { shouldValidate: true });
          }}
          onExpire={() => {
            setCaptchaMessage("El captcha expiró, por favor verifica nuevamente.");
            setValue("recaptcha_token", "", { shouldValidate: true });
          }}
          onError={() => {
            setCaptchaMessage(
              "No se pudo cargar el captcha. Recarga la página e inténtalo nuevamente."
            );
            setValue("recaptcha_token", "", { shouldValidate: true });
          }}
        />
        {(errors.recaptcha_token || captchaMessage) && (
          <p className={errorTextStyles} role="alert">
            {errors.recaptcha_token?.message ?? captchaMessage}
          </p>
        )}
      </div>

      {formError && (
        <div
          className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-3 py-3 text-sm text-red-700 shadow-sm"
          role="alert"
          aria-live="assertive"
        >
          <svg
            aria-hidden
            className="mt-0.5 h-5 w-5 flex-shrink-0"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 10-2 0v4a1 1 0 002 0V6zm-2 8a1 1 0 102 0 1 1 0 00-2 0z"
              clipRule="evenodd"
            />
          </svg>
          <span>{formError}</span>
        </div>
      )}

      <button
        type="submit"
        className="group relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400/80 focus-visible:ring-offset-2 focus-visible:ring-offset-white disabled:bg-slate-400"
        disabled={mutation.isPending}
      >
        {mutation.isPending && (
          <svg
            aria-hidden
            className="h-4 w-4 animate-spin"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle className="stroke-white/60" cx="12" cy="12" r="9" strokeWidth="4" />
            <path
              className="stroke-white"
              d="M21 12a9 9 0 00-9-9"
              strokeWidth="4"
              strokeLinecap="round"
            />
          </svg>
        )}
        <span>{mutation.isPending ? "Creando cuenta..." : "Crear cuenta"}</span>
      </button>

      <p className="text-center text-xs text-slate-500">
        Al crear tu cuenta aceptas nuestras políticas de privacidad y uso responsable de la
        plataforma.
      </p>
    </form>
  );
}

