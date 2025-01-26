import { useTranslations } from "next-intl";

const ChatHeader = () => {
  const t = useTranslations("HomePage");

  return (
    <div className="text-center">
      <h2 className="flex items-center justify-center gap-2 text-xl font-semibold">
        <span role="img" aria-label="robot">
          🤖
        </span>
        {t("chat.title")}
      </h2>
      <p className="text-sm text-muted-foreground">{t("chat.subtitle")}</p>
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
  );
};

export default ChatHeader;
