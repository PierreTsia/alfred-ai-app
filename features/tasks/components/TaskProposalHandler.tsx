import { parseTaskProposal } from "@/core/utils/parser/task";
import { extractJsonFromResponseText } from "@/core/utils/parser/response";
import { TaskProposalConfirm } from "../../chat/components/TaskProposalConfirm";
import { useTranslations } from "next-intl";

interface TaskProposalHandlerProps {
  message: { role: string; content: string };
  index: number;
  messages: { role: string; content: string }[];
  setMessages: React.Dispatch<
    React.SetStateAction<{ role: string; content: string }[]>
  >;
}

export function TaskProposalHandler({
  message,
  index,
  messages,
  setMessages,
}: TaskProposalHandlerProps) {
  const t = useTranslations("Chat");
  const taskProposal = parseTaskProposal(message.content);

  const handleConfirmClick = () => {
    const updatedMessages = [...messages];
    updatedMessages[index] = {
      ...message,
      content: `${extractJsonFromResponseText(message.content)}\n\n${t("taskCreated")}`,
    };
    setMessages(updatedMessages);
  };

  if (!taskProposal) {
    return null;
  }

  return (
    <TaskProposalConfirm
      proposal={taskProposal}
      onConfirm={handleConfirmClick}
    />
  );
}
