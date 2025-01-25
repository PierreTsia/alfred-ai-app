"use client";

import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";
import LocaleSwitcher from "@/components/LocaleSwitcher";
import { useLocale } from "next-intl";
import TaskList from "@/components/TaskList";
import {
  SignOutButton,
  SignInButton,
  useAuth,
  SignedIn,
  SignedOut,
} from "@clerk/nextjs";
import UserInfoCard from "@/components/UserInfoCard";
import Chat from "@/components/Chat";
import AIChatClient from "@/components/AIChatClient";

export default function Home() {
  const t = useTranslations("HomePage");
  const locale = useLocale();
  const { isSignedIn } = useAuth();

  return (
    <main className="container mx-auto min-h-screen px-4 py-8 lg:px-8 lg:py-12">
      {/* Header Section */}
      <div className="mb-12 text-center">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
          {t("title")}
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">{t("subtitle")}</p>
      </div>

      {/* Features Grid */}
      <div className="grid gap-6 lg:grid-cols-3 lg:gap-8">
        {/* Auth Section */}
        <div className="to-gray-50/50 flex flex-col items-center gap-4 rounded-xl bg-gradient-to-b from-white p-6 shadow-lg">
          <h2 className="text-xl font-semibold">{t("auth.title")}</h2>
          <SignedIn>
            <UserInfoCard />
            <SignOutButton>
              <Button variant="outline" className="w-[180px]">
                {t("auth.signOutButton")}
              </Button>
            </SignOutButton>
          </SignedIn>
          <SignedOut>
            <div className="border-gray-200 text-gray-500 flex h-[350px] items-center justify-center rounded-lg border-2 border-dashed px-6 text-center">
              {t("auth.signInPrompt")}
            </div>
            <SignInButton>
              <Button variant="outline" className="w-[180px]">
                {t("auth.signInButton")}
              </Button>
            </SignInButton>
          </SignedOut>
        </div>

        {/* Localization Section */}
        <div className="to-gray-50/50 flex flex-col items-center gap-4 rounded-xl bg-gradient-to-b from-white p-6 shadow-lg">
          <h2 className="text-xl font-semibold">{t("localization.title")}</h2>
          <div className="flex h-full flex-col items-center justify-center gap-6">
            <div className="text-gray-600 text-center">
              <p className="mb-8">{t("localization.switchPrompt")}</p>
              <LocaleSwitcher currentLocale={locale} />
            </div>
            <div className="mt-auto flex items-center gap-2 text-sm text-muted-foreground">
              <span className="rounded-full bg-green-100 px-2 py-1 text-green-700">
                {locale.toUpperCase()}
              </span>
              {t("localization.currentLabel")}
            </div>
          </div>
        </div>

        {/* Persistence Section */}
        <div className="to-gray-50/50 flex flex-col gap-4 rounded-xl bg-gradient-to-b from-white p-6 shadow-lg">
          <h2 className="text-center text-xl font-semibold">
            {t("persistence.title")}
          </h2>
          <div className="flex-1 overflow-hidden">
            <SignedIn>
              <TaskList />
            </SignedIn>
            <SignedOut>
              <div className="border-gray-200 text-gray-500 flex h-[350px] items-center justify-center rounded-lg border-2 border-dashed px-6 text-center">
                {t("persistence.signInPrompt")}
              </div>
            </SignedOut>
          </div>
        </div>
      </div>

      {/* Chat Section */}
      <div className="mt-8">
        <div className="to-gray-50/50 flex flex-col gap-4 rounded-xl bg-gradient-to-b from-white p-6 shadow-lg">
          <div className="text-center">
            <h2 className="flex items-center justify-center gap-2 text-xl font-semibold">
              <span role="img" aria-label="robot">
                🤖
              </span>
              {t("chat.title")}
            </h2>
            <p className="text-sm text-muted-foreground">
              {t("chat.subtitle")}
            </p>
            <div className="mt-4 border-t pt-3 text-xs text-muted-foreground">
              <p className="font-medium">{t("chat.commands.title")}</p>
              <div className="mt-2 flex justify-center gap-6">
                <span>
                  <code className="rounded bg-slate-100 px-1.5 py-0.5 font-semibold">
                    /task
                  </code>{" "}
                  {t("chat.commands.task")}
                </span>
                <span>
                  <code className="rounded bg-slate-100 px-1.5 py-0.5 font-semibold">
                    /list
                  </code>{" "}
                  {t("chat.commands.list")}
                </span>
              </div>
            </div>
          </div>
          <SignedIn>
            <div className="flex-1 overflow-hidden">
              <AIChatClient />
            </div>
          </SignedIn>
          <SignedOut>
            <div className="flex flex-col items-center gap-4 py-8">
              <p className="text-center text-muted-foreground">
                {t("chat.signInPrompt")}
              </p>
              <SignInButton>
                <Button>{t("auth.signInButton")}</Button>
              </SignInButton>
            </div>
          </SignedOut>
        </div>
      </div>
    </main>
  );
}
