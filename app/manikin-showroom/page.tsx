"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function ManikinShowroomPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [touched, setTouched] = useState(false);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = name.trim();
    setTouched(true);
    if (!trimmed) return;
    router.push(`/manikin-showroom/${encodeURIComponent(trimmed)}`);
  };

  const showError = touched && name.trim().length === 0;

  return (
    <div className="flex min-h-screen items-center justify-center px-4"
    style={{
      backgroundColor: "rgba(15, 15, 15, 0.92)",
    }}
    >
      <div className="w-full max-w-md space-y-8 rounded-2xl border border-white/10 bg-white/5 p-8 shadow-xl backdrop-blur">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-blue-300">VivusCardio</p>
          <h1 className="mt-2 text-3xl font-semibold text-white">Manikin Showroom</h1>
          <p className="mt-2 text-sm text-gray-300">
            체험을 시작하려면 이름을 입력해 주세요.
          </p>
        </div>

        <form className="space-y-6" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="visitor-name" className="text-sm font-medium text-gray-200">
              이름
            </label>
            <input
              id="visitor-name"
              name="visitor-name"
              type="text"
              className={`mt-2 w-full rounded-xl border bg-black/30 px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                showError ? "border-red-500" : "border-white/10"
              }`}
              placeholder="예) 홍길동"
              value={name}
              onChange={(event) => setName(event.target.value)}
              onBlur={() => setTouched(true)}
              autoComplete="off"
              autoFocus
            />
            {showError && (
              <p className="mt-2 text-sm text-red-400">이름을 입력해 주세요.</p>
            )}
          </div>

          <button
            type="submit"
            className="w-full rounded-xl bg-blue-500 py-3 text-lg font-medium text-white transition hover:bg-blue-400 disabled:cursor-not-allowed disabled:opacity-50"
            disabled={name.trim().length === 0}
          >
            쇼룸 입장
          </button>
        </form>
      </div>
    </div>
  );
}
