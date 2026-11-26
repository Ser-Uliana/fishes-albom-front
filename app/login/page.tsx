"use client";

import { login, verify2FA } from "@/src/api";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useState } from "react";

type Props = {
  onSuccess?: () => void;
};

const inputClass =
  "h-14 w-full rounded-xl border border-slate-300 bg-slate-50 px-5 text-base text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200";
const labelClass = "mb-2 block text-base text-slate-900";
const primaryBtn =
  "h-14 w-full rounded-xl bg-[#1b2a38] text-lg text-white transition hover:bg-[#243545] disabled:cursor-not-allowed disabled:opacity-60";
const socialBtn =
  "flex h-14 w-full items-center justify-center gap-3 rounded-xl bg-[#f3f8f7] text-base text-slate-700 transition hover:bg-[#e8f1ef]";

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <main className="flex flex-1 items-center justify-center px-6 py-12">
        <div className="w-full max-w-[444px]">{children}</div>
      </main>
      <footer className="py-8 text-center text-base text-slate-400">
        © 2023 ALL RIGHTS RESERVED
      </footer>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="#4285F4" d="M23.49 12.27c0-.79-.07-1.54-.19-2.27H12v4.51h6.47c-.29 1.48-1.14 2.73-2.4 3.58v3h3.86c2.26-2.09 3.56-5.17 3.56-8.82z" />
      <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.86-3c-1.08.72-2.45 1.16-4.07 1.16-3.13 0-5.78-2.11-6.73-4.96H1.29v3.09C3.26 21.3 7.31 24 12 24z" />
      <path fill="#FBBC05" d="M5.27 14.29c-.25-.72-.38-1.49-.38-2.29s.14-1.57.38-2.29V6.62H1.29a11.86 11.86 0 0 0 0 10.76l3.98-3.09z" />
      <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.62l3.98 3.09C6.22 6.86 8.87 4.75 12 4.75z" />
    </svg>
  );
}

function FacebookIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="#1877F2"
        d="M24 12.07C24 5.41 18.63 0 12 0S0 5.4 0 12.07C0 18.1 4.39 23.1 10.13 24v-8.44H7.08v-3.49h3.04V9.41c0-3.02 1.8-4.7 4.54-4.7 1.31 0 2.68.24 2.68.24v2.97h-1.5c-1.5 0-1.96.93-1.96 1.89v2.26h3.34l-.53 3.49h-2.8V24C19.62 23.1 24 18.1 24 12.07"
      />
    </svg>
  );
}

export default function LoginModal({ onSuccess }: Props) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [tempToken, setTempToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSuccess = () => {
    onSuccess?.();
    router.replace("/fishBrowser");
    router.refresh();
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const result = await login(email, password);
      if (result.requires2FA) {
        setTempToken(result.tempToken);
        setPassword("");
      } else {
        handleSuccess();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Помилка входу");
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tempToken) return;
    setError(null);
    setLoading(true);
    try {
      await verify2FA(tempToken, code);
      handleSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Невірний код");
    } finally {
      setLoading(false);
    }
  };

  // крок 2: код з Google Authenticator
  if (tempToken) {
    return (
      <Shell>
        <form onSubmit={handleVerify}>
          <h1 className="text-4xl font-semibold text-slate-900">
            Two-factor authentication
          </h1>
          <p className="mt-6 text-lg leading-8 text-slate-600">
            Enter the 6-digit code from your authenticator app.
          </p>

          <div className="mt-10">
            <label htmlFor="code" className={labelClass}>
              Code
            </label>
            <input
              id="code"
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              placeholder="123456"
              className={inputClass}
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
              autoFocus
            />
          </div>

          {error && (
            <p role="alert" className="mt-4 text-sm text-red-600">
              {error}
            </p>
          )}

          <button
            type="submit"
            className={`${primaryBtn} mt-8`}
            disabled={loading || code.length !== 6}
          >
            {loading ? "Checking..." : "Verify"}
          </button>

          <button
            type="button"
            className={`${socialBtn} mt-4`}
            onClick={() => {
              setTempToken(null);
              setCode("");
              setError(null);
            }}
          >
            Back
          </button>
        </form>
      </Shell>
    );
  }

  // крок 1: email + пароль
  return (
    <Shell>
      <form onSubmit={handleLogin}>
        <h1 className="text-4xl font-semibold text-slate-900">
          Welcome Back <span aria-hidden="true">👋</span>
        </h1>
        <p className="mt-6 text-lg leading-8 text-slate-600">
          Today is a new day. It&apos;s your day. You shape it. Sign in to start
          managing your projects.
        </p>

        <div className="mt-10">
          <label htmlFor="email" className={labelClass}>
            Email
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="Example@email.com"
            className={inputClass}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="mt-6">
          <label htmlFor="password" className={labelClass}>
            Password
          </label>
          <input
            id="password"
            type="password"
            autoComplete="current-password"
            placeholder="At least 8 characters"
            className={inputClass}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>


        {error && (
          <p role="alert" className="mt-4 text-sm text-red-600">
            {error}
          </p>
        )}

        <button type="submit" className={`${primaryBtn} mt-6`} disabled={loading}>
          {loading ? "Signing in..." : "Sign in"}
        </button>

        <div className="my-10 flex items-center gap-5">
          <span className="h-px flex-1 bg-slate-200" />
          <span className="text-base text-slate-600">Or</span>
          <span className="h-px flex-1 bg-slate-200" />
        </div>

        <p className="mt-12 text-center text-lg text-slate-700">
          Don&apos;t you have an account?{" "}
          <Link href="/signup" className="text-blue-600 hover:underline">
            Sign up
          </Link>
        </p>
      </form>
    </Shell>
  );
}