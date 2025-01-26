import Image from "next/image";
import ReactMarkdown from "react-markdown";
import { useTranslations } from "next-intl";
import simpleLogo from "../../../public/simple-logo.png";
import { extractJsonFromResponseText } from "@/core/utils/parser/response";

interface ChatAgentMessageProps {
  content: string;
  children?: React.ReactNode;
}

export const ChatAgentMessage = ({
  content,
  children,
}: ChatAgentMessageProps) => {
  const t = useTranslations("Chat");

  return (
    <div className="relative w-full">
      <Image
        src={simpleLogo}
        alt={t("assistantAvatar")}
        className="absolute left-0 top-0 !my-0 size-7"
      />
      <div className="w-full pl-10">
        <ReactMarkdown>{extractJsonFromResponseText(content)}</ReactMarkdown>
        {children}
      </div>
    </div>
  );
};
