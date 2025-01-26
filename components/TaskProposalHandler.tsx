import { parseTaskProposal } from "@/utils/taskParser";
import { extractJsonFromResponseText } from "@/utils/responseParser";
import { TaskProposalConfirm } from "./TaskProposalConfirm";
import { useTranslations } from "next-intl";

interface TaskProposalHandlerProps {
  message: { role: string; content: string };
  index: number;
  messages: { role: string; content: string }[];
  setMessages: React.Dispatch<
    React.SetStateAction<{ role: string; content: string }[]>
  >;
}

export const TaskProposalHandler = ({
  message,
  index,
  messages,
  setMessages,
}: TaskProposalHandlerProps) => {
  const t = useTranslations("Chat");
  const taskProposal = parseTaskProposal(message.content);

  if (!taskProposal) {
    return null;
  }

  return (
    <TaskProposalConfirm
      proposal={taskProposal}
      onConfirm={() => {
        const updatedMessages = [...messages];
        updatedMessages[index] = {
          ...message,
          content:
            extractJsonFromResponseText(message.content) +
            `\n\n${t("taskCreated")}`,
        };
        setMessages(updatedMessages);
      }}
    />
  );
};
