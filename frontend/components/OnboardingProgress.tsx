"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { API_BASE_URL } from "@/lib/api-config";

const STEPS = [
  { id: 1, label: "Account created", check: () => true },
  { id: 2, label: "First recording", check: (s: { totalContributions: number }) => s.totalContributions >= 1 },
  { id: 3, label: "First validation", check: (s: { totalValidations: number }) => s.totalValidations >= 1 },
  { id: 4, label: "Language chosen", check: (s: { languagesContributed?: string[] }) => (s.languagesContributed?.length ?? 0) >= 1 },
  { id: 5, label: "5 contributions", check: (s: { totalContributions: number }) => s.totalContributions >= 5 },
];

interface OnboardingProgressProps {
  visible: boolean;
}

export default function OnboardingProgress({ visible }: OnboardingProgressProps) {
  const [stats, setStats] = useState<{
    totalContributions: number;
    totalValidations: number;
    languagesContributed?: string[];
  } | null>(null);

  useEffect(() => {
    if (!visible) return;
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (!token) return;

    fetch(`${API_BASE_URL}/gamification/stats/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data) {
          setStats({
            totalContributions: data.totalContributions ?? 0,
            totalValidations: data.totalValidations ?? 0,
            languagesContributed: data.languagesContributed ?? [],
          });
        }
      });
  }, [visible]);

  if (!visible || !stats) return null;

  const completed = STEPS.filter((s) => s.check(stats)).length;
  const allDone = completed >= 5;

  if (allDone) return null;

  return (
    <div className="flex items-center gap-2 rounded-lg bg-indigo-50 border border-indigo-200 px-3 py-2 text-sm">
      <span className="font-medium text-indigo-900">
        {completed} of 5 steps
      </span>
      <div className="flex gap-1">
        {STEPS.map((step) => {
          const done = step.check(stats);
          return (
            <span
              key={step.id}
              title={step.label}
              className={`inline-block w-4 h-4 rounded-full ${done ? "bg-indigo-600" : "bg-indigo-200"
                }`}
              aria-label={step.label}
            />
          );
        })}
      </div>
      <Link
        href="/speak"
        className="text-indigo-600 hover:text-indigo-800 font-medium ml-1"
      >
        Continue
      </Link>
    </div>
  );
}
