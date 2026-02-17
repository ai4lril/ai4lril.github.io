"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import OnboardingTour from "./OnboardingTour";
import { API_BASE_URL } from "@/lib/api-config";

export default function OnboardingTourMount() {
  const [showTour, setShowTour] = useState(false);
  const [checked, setChecked] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (!token) {
      setChecked(true);
      return;
    }

    const fetchAndShow = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/gamification/stats/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) {
          setChecked(true);
          return;
        }
        const data = await res.json();
        const completed = data.onboardingCompletedAt != null;
        setShowTour(!completed);
      } catch {
        setShowTour(false);
      } finally {
        setChecked(true);
      }
    };

    fetchAndShow();
  }, []);

  // Don't show on docs or admin pages
  if (pathname?.startsWith("/docs") || pathname?.startsWith("/admin")) {
    return null;
  }

  if (!checked || !showTour) return null;

  return (
    <OnboardingTour
      visible={showTour}
      onComplete={() => setShowTour(false)}
    />
  );
}
