import { FC, KeyboardEvent } from "react";
import TypeAnimation from "./TypeAnimation";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ArrowUpIcon } from "lucide-react";

type TInputAreaProps = {
  promptValue: string;
  setPromptValue: React.Dispatch<React.SetStateAction<string>>;
  disabled?: boolean;
  messages: { role: string; content: string }[];
  setMessages: React.Dispatch<
    React.SetStateAction<{ role: string; content: string }[]>
  >;
  handleChat: (messages?: { role: string; content: string }[]) => void;
};

const FinalInputArea: FC<TInputAreaProps> = ({
  promptValue,
  setPromptValue,
  disabled,
  messages,
  setMessages,
  handleChat,
}) => {
  function onSubmit() {
    let latestMessages = [...messages, { role: "user", content: promptValue }];
    setPromptValue("");
    setMessages(latestMessages);
    handleChat(latestMessages);
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter") {
      if (e.shiftKey) {
        return;
      } else {
        e.preventDefault();
        onSubmit();
      }
    }
  };

  return (
    <form
      className="mx-auto flex w-full items-end gap-2"
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit();
      }}
    >
      <Textarea
        placeholder="Follow up question"
        className="min-h-[60px] resize-none"
        disabled={disabled}
        value={promptValue}
        onKeyDown={handleKeyDown}
        required
        onChange={(e) => setPromptValue(e.target.value)}
        rows={1}
      />
      <Button
        disabled={disabled}
        type="submit"
        size="icon"
        className="h-[60px] w-[60px] shrink-0 bg-blue-600 hover:bg-blue-700"
      >
        {disabled ? <TypeAnimation /> : <ArrowUpIcon className="h-5 w-5" />}
      </Button>
    </form>
  );
};

export default FinalInputArea;
