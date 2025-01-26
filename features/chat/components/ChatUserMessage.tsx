import ReactMarkdown from "react-markdown";
import { formatUserInput } from "@/utils/responseParser";

type ChatUserMessageProps = {
  content: string;
};

const ChatUserMessage = ({ content }: ChatUserMessageProps) => {
  return (
    <div className="ml-auto w-fit rounded-xl bg-blue-500 px-3 py-2 font-medium text-white">
      <ReactMarkdown className="[&>p]:m-0 [&>p]:leading-normal [&_strong]:rounded [&_strong]:bg-white/20 [&_strong]:px-1.5 [&_strong]:py-0.5">
        {formatUserInput(content)}
      </ReactMarkdown>
    </div>
  );
};

export default ChatUserMessage;
