import { SignedIn, SignedOut } from "@clerk/nextjs";
import { Card } from "@/components/ui/card";

interface AuthenticatedSectionProps {
  title: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
  className?: string;
}

export default function AuthenticatedSection({
  title,
  children,
  fallback,
  className = "min-h-[400px]",
}: AuthenticatedSectionProps) {
  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-lg font-semibold">{title}</h2>
      <SignedIn>
        <Card className={`p-6 ${className}`}>{children}</Card>
      </SignedIn>
      <SignedOut>
        {fallback || (
          <div className="border-gray-200 text-gray-500 flex h-[350px] items-center justify-center rounded-lg border-2 border-dashed px-6 text-center">
            Please sign in to access this feature
          </div>
        )}
      </SignedOut>
    </div>
  );
}
