"use client";

import { PDFViewer } from "@/features/files/components/PDFViewer";
import AuthenticatedSection from "@/core/components/AuthenticatedSection";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { SignInButton } from "@clerk/nextjs";

export default function DocumentsPage() {
  const t = useTranslations("HomePage");

  return (
    <main className="container mx-auto min-h-screen px-4 py-8 lg:px-8 lg:py-12">
      <AuthenticatedSection
        title="Document Library"
        className="min-h-0"
        fallback={
          <div className="flex flex-col items-center gap-4 py-8">
            <p className="text-center text-muted-foreground">
              Sign in to access your documents
            </p>
            <SignInButton>
              <Button>Sign In</Button>
            </SignInButton>
          </div>
        }
      >
        <div className="to-gray-50/50 flex flex-col gap-4 rounded-xl bg-gradient-to-b from-white p-6 shadow-lg">
          <PDFViewer />
        </div>
      </AuthenticatedSection>
    </main>
  );
}
