"use client";

import { useState } from "react";
import Link from "next/link";
import { API_BASE_URL } from "@/lib/api-config";

const STEPS = [
  {
    title: "Welcome!",
    body: "You're helping build open language data for research and AI. Let's get you started.",
  },
  {
    title: "Choose your language",
    body: "Pick a language you're comfortable speaking. You can change it anytime from the language selector.",
  },
  {
    title: "Record your first sentence",
    body: (
      <>
        Go to <Link href="/speak" className="text-indigo-600 underline font-medium">Scripted Speech</Link> and record a sentence. Tips: use a quiet room and speak clearly at a natural pace.
      </>
    ),
  },
  {
    title: "Validate others' recordings",
    body: (
      <>
        Visit <Link href="/listen" className="text-indigo-600 underline font-medium">Listen & Validate</Link> to review recordings from other contributors. Your feedback improves data quality.
      </>
    ),
  },
  {
    title: "You're ready!",
    body: "You've learned the basics. Keep contributing—every recording and validation counts.",
  },
];

interface OnboardingTourProps {
  visible: boolean;
  onComplete: () => void;
}

export default function OnboardingTour({ visible, onComplete }: OnboardingTourProps) {
  const [step, setStep] = useState(0);
  const isLastStep = step === STEPS.length - 1;

  const handleNext = () => {
    if (isLastStep) {
      handleComplete();
    } else {
      setStep((s) => s + 1);
    }
  };

  const handleComplete = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      onComplete();
      return;
    }
    try {
      const res = await fetch(`${API_BASE_URL}/users/me/onboarding-complete`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      if (res.ok) {
        onComplete();
      } else {
        onComplete(); // Still hide on error to avoid blocking user
      }
    } catch {
      onComplete();
    }
  };

  const handleSkip = () => {
    handleComplete();
  };

  if (!visible) return null;

  const current = STEPS[step];
  return (
    <div className="fixed inset-0 z-9999 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        aria-hidden="true"
      />
      <div className="relative z-10 mx-4 w-full max-w-md rounded-xl neu-raised p-6">
        <h2 className="text-xl font-semibold text-gray-900">{current.title}</h2>
        <div className="mt-3 text-gray-600">
          {typeof current.body === "string" ? current.body : current.body}
        </div>
        <div className="mt-6 flex items-center justify-between">
          <div className="flex gap-1">
            {STEPS.map((_, i) => (
              <div
                key={i}
                className={`h-2 w-2 rounded-full ${i === step ? "bg-indigo-600" : i < step ? "bg-indigo-300" : "bg-gray-200"
                  }`}
              />
            ))}
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleSkip}
              className="rounded-lg px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100"
            >
              Skip
            </button>
            <button
              type="button"
              onClick={handleNext}
              className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
            >
              {isLastStep ? "Done" : "Next"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
