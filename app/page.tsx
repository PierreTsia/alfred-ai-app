"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import AIChatClient from "@/components/AIChatClient";
import { Button } from "@/components/ui/button";
import ChatHeader from "@/components/ChatHeader";
import { User, HardDrive, Settings, ExternalLink, Heart } from "lucide-react";
import Link from "next/link";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { TechnologyBadge } from "@/components/TechnologyBadge";

const TECH_STACK = [
  {
    name: "nextjs",
    displayName: "Next.js 14",
    href: "https://nextjs.org",
    className: "bg-black hover:bg-gray-800",
  },
  {
    name: "clerk",
    displayName: "Clerk Auth",
    href: "https://clerk.com",
    className: "bg-purple-600 hover:bg-purple-700",
  },
  {
    name: "convex",
    displayName: "Convex DB",
    href: "https://convex.dev",
    className: "bg-orange-500 hover:bg-orange-600",
  },
  {
    name: "shadcn",
    displayName: "shadcn/ui",
    href: "https://ui.shadcn.com",
    className: "bg-zinc-800 hover:bg-zinc-700",
  },
  {
    name: "together",
    displayName: "Together AI",
    href: "https://together.ai",
    className: "bg-emerald-600 hover:bg-emerald-700",
  },
] as const;

export default function Home() {
  const t = useTranslations("HomePage");
  const locale = useLocale();
  const { isSignedIn } = useAuth();

  return (
    <main className="container mx-auto min-h-screen px-4 py-8 lg:px-8 lg:py-12">
      <div className="mb-12 text-center">
        <h1 className="group text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <span className="inline-flex items-center">
                  <span className="text-indigo-500 transition-colors duration-200 group-hover:text-indigo-400">
                    N.
                  </span>
                  <span className="text-primary">C3</span>
                </span>
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-sm">yes, it reads "nice" 😉</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <span className="text-3xl text-muted-foreground sm:text-4xl lg:text-5xl">
            {" "}
            {t("title.main")}
          </span>
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">{t("subtitle")}</p>
        <div className="mt-6 flex flex-col items-center gap-4">
          <div className="flex flex-wrap justify-center gap-3">
            {TECH_STACK.map((tech) => (
              <TechnologyBadge
                key={tech.href}
                name={t(`techStack.items.${tech.name}`)}
                href={tech.href}
                className={tech.className}
              />
            ))}
          </div>

          <p className="flex items-center gap-2 text-sm text-muted-foreground">
            {t("techStack.assembledWith")}
            <Heart className="h-4 w-4 fill-red-500 text-red-500" />
            {t("techStack.and")}
            <Link
              href="https://cursor.sh"
              target="_blank"
              className="inline-flex items-center gap-1 rounded-lg bg-blue-100 px-2 py-0.5 text-blue-700 hover:bg-blue-200"
            >
              Cursor AI <ExternalLink className="h-3 w-3" />
            </Link>
          </p>
        </div>
      </div>

      <div className="mb-8">
        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              {t("navigation.profile")}
            </TabsTrigger>
            <TabsTrigger value="storage" className="flex items-center gap-2">
              <HardDrive className="h-4 w-4" />
              {t("navigation.storage")}
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              {t("navigation.settings")}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="space-y-4">
            <div className="to-gray-50/50 flex flex-col items-center gap-4 rounded-xl bg-gradient-to-b from-white p-6 shadow-lg">
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
          </TabsContent>

          <TabsContent value="storage" className="space-y-4">
            <div className="to-gray-50/50 flex flex-col gap-4 rounded-xl bg-gradient-to-b from-white p-6 shadow-lg">
              <SignedIn>
                <TaskList />
              </SignedIn>
              <SignedOut>
                <div className="border-gray-200 text-gray-500 flex h-[350px] items-center justify-center rounded-lg border-2 border-dashed px-6 text-center">
                  {t("storage.signInPrompt")}
                </div>
              </SignedOut>
            </div>
          </TabsContent>

          <TabsContent value="settings" className="space-y-4">
            <div className="to-gray-50/50 flex flex-col items-center gap-4 rounded-xl bg-gradient-to-b from-white p-6 shadow-lg">
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
          </TabsContent>
        </Tabs>
      </div>

      <div className="mt-8">
        <div className="to-gray-50/50 flex flex-col gap-4 rounded-xl bg-gradient-to-b from-white p-6 shadow-lg">
          <ChatHeader />
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
