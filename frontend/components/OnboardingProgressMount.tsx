"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import OnboardingProgress from "./OnboardingProgress";
import { API_BASE_URL } from "@/lib/api-config";

export default function OnboardingProgressMount() {
  const [showProgress, setShowProgress] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (!token) {
      setShowProgress(false);
      return;
    }

    fetch(`${API_BASE_URL}/gamification/stats/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data) {
          const totalContributions = data.totalContributions ?? 0;
          const onboardingStep = data.onboardingStep ?? 1;
          setShowProgress(totalContributions < 5 || onboardingStep < 5);
        } else {
          setShowProgress(false);
        }
      })
      .catch(() => setShowProgress(false));
  }, []);

  if (pathname?.startsWith("/docs") || pathname?.startsWith("/admin")) {
    return null;
  }

  if (!showProgress) return null;

  return (
    <div className="sticky top-[72px] z-40 -mb-2">
      <div className="container mx-auto px-4 flex justify-center">
        <OnboardingProgress visible={true} />
      </div>
    </div>
  );
}
