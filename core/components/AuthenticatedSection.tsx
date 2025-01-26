"use client";

import { useUser } from "@clerk/nextjs";
import { ReactNode } from "react";

export default function AuthenticatedSection({
  children,
  fallback,
}: {
  children: ReactNode;
  fallback?: ReactNode;
}) {
  const { isSignedIn } = useUser();

  if (!isSignedIn) {
    return fallback || null;
  }

  return <>{children}</>;
}
