import { MessageCircle } from "lucide-react";
import { useTranslations } from "next-intl";

export function ChatEmptyState() {
  const t = useTranslations("Chat");

  return (
    <div className="flex min-h-[300px] w-full flex-col items-center justify-center gap-4 py-8 text-center">
      <div className="bg-gray-100 rounded-full p-4">
        <MessageCircle className="text-gray-500 h-8 w-8" />
      </div>
      <div className="max-w-sm space-y-2">
        <h3 className="text-gray-900 text-lg font-semibold">
          {t("emptyState.title")}
        </h3>
        <p className="text-gray-500 text-sm">{t("emptyState.description")}</p>
      </div>
    </div>
  );
}
