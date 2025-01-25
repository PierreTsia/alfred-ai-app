"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Globe } from "lucide-react"; // You'll need to install lucide-react if not already installed
import { useTranslations } from "next-intl";

export default function LocaleSwitcher({
  currentLocale,
}: {
  currentLocale: string;
}) {
  const router = useRouter();
  const t = useTranslations("LocaleSwitcher");

  const [isPending, startTransition] = useTransition();

  const switchLocale = (newLocale: string) => {
    // Set the cookie
    document.cookie = `locale=${newLocale};path=/`;

    // Refresh the page to load new locale
    startTransition(() => {
      router.refresh();
    });
  };

  return (
    <Select
      defaultValue={currentLocale}
      onValueChange={switchLocale}
      disabled={isPending}
    >
      <SelectTrigger className="w-[180px] bg-white/50 backdrop-blur-sm">
        <Globe className="mr-2 h-4 w-4" />
        <SelectValue placeholder={t("label")} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="en">{t("languages.en")}</SelectItem>
        <SelectItem value="fr">{t("languages.fr")}</SelectItem>
      </SelectContent>
    </Select>
  );
}
