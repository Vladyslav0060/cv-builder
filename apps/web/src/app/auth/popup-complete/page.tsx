"use client";

import { useEffect } from "react";

export default function PopupCompletePage() {
  useEffect(() => {
    window.opener?.postMessage({ type: "google-auth-success" }, window.location.origin);
    window.close();
  }, []);

  return (
    <main className="flex min-h-screen items-center justify-center p-6 text-center">
      Authentication complete. You can close this window.
    </main>
  );
}
