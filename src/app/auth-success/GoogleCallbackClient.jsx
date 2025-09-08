"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";

export default function GoogleCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const accessToken = searchParams.get("accessToken");
    const refreshToken = searchParams.get("refreshToken");
    const user = searchParams.get("user");

    if (accessToken) {
      localStorage.setItem("accessToken", accessToken);
      if (refreshToken) localStorage.setItem("refreshToken", refreshToken);
      if (user) localStorage.setItem("user", user);
      router.push("/dashboard");
    } else {
      router.push("/login?error=google_failed");
    }
  }, [router, searchParams]);

  return <p>Signing you in with Google...</p>;
}
