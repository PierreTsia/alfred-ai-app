"use client";

import { useUser } from "@clerk/nextjs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Image from "next/image";
import { useTranslations } from "next-intl";

export default function UserProfileCard() {
  const { isSignedIn, user } = useUser();
  const t = useTranslations("UserProfile");

  if (!isSignedIn) return null;

  return (
    <Card className="w-full max-w-[280px]">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">{t("title")}</CardTitle>
        <CardDescription className="text-xs">
          {t("description")}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center gap-3">
        {user.imageUrl && (
          <div className="relative h-16 w-16 overflow-hidden rounded-full">
            <Image
              src={user.imageUrl}
              alt={t("welcome", { name: user.fullName || "" })}
              fill
              className="object-cover"
            />
          </div>
        )}
        <div className="space-y-1 text-center">
          <p className="text-base font-semibold">{user.fullName}</p>
          <p className="text-xs text-muted-foreground">
            {user.primaryEmailAddress?.emailAddress}
          </p>
          {user.username && (
            <p className="text-xs text-muted-foreground">@{user.username}</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
