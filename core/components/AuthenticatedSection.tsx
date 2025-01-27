"use client";

import { useUser } from "@clerk/nextjs";
import { ReactNode } from "react";

type Props = {
  children: ReactNode;
  fallback?: ReactNode;
  title?: string;
  className?: string;
};

export default function AuthenticatedSection({ children, fallback }: Props) {
  const { isSignedIn } = useUser();

  if (!isSignedIn) {
    return fallback || null;
  }

  return <>{children}</>;
}
