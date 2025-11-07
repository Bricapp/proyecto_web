import { LoginForm } from "@/components/forms/login-form";

export default function LoginPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-4 py-12">
      <section className="rounded-lg bg-white p-8 shadow">
        <h1 className="mb-6 text-2xl font-semibold text-slate-900">Iniciar sesión</h1>
        <LoginForm />
      </section>
    </main>
  );
}
