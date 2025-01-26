"use client";

import FinalInputArea from "./FinalInputArea";
import { useEffect, useRef, useState } from "react";

import { processCommandInput } from "@/utils/commands";
import { useTranslations } from "next-intl";
import { TaskProposalHandler } from "./TaskProposalHandler";
import { AgentMessage } from "./AgentMessage";
import { UserMessage } from "./UserMessage";
import { ChatEmptyState } from "./ChatEmptyState";

export default function Chat({
  messages,
  disabled,
  promptValue,
  setPromptValue,
  setMessages,
  handleChat,
  topic,
}: {
  messages: { role: string; content: string }[];
  disabled: boolean;
  promptValue: string;
  setPromptValue: React.Dispatch<React.SetStateAction<string>>;
  setMessages: React.Dispatch<
    React.SetStateAction<{ role: string; content: string }[]>
  >;
  handleChat: (input: string) => void;
  topic: string;
}) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollableContainerRef = useRef<HTMLDivElement>(null);
  const [didScrollToBottom, setDidScrollToBottom] = useState(true);
  const t = useTranslations("Chat");

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "instant" });
  };

  useEffect(() => {
    if (didScrollToBottom) {
      scrollToBottom();
    }
  }, [didScrollToBottom, messages]);

  useEffect(() => {
    let el = scrollableContainerRef.current;
    if (!el) {
      return;
    }

    function handleScroll() {
      if (scrollableContainerRef.current) {
        const { scrollTop, scrollHeight, clientHeight } =
          scrollableContainerRef.current;
        setDidScrollToBottom(scrollTop + clientHeight >= scrollHeight);
      }
    }

    el.addEventListener("scroll", handleScroll);

    return () => {
      el.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const handleSubmit = () => {
    const processedInput = processCommandInput(promptValue);
    console.log("Processed input:", processedInput);
    handleChat(processedInput);
  };

  return (
    <div className="flex grow flex-col gap-4 overflow-hidden">
      <div className="flex grow flex-col overflow-hidden lg:p-4">
        <div
          ref={scrollableContainerRef}
          className="mt-2 overflow-y-scroll rounded-lg border border-solid border-[#C2C2C2] bg-white px-5 lg:p-7"
        >
          {messages.length ? (
            <div className="prose-sm max-w-5xl lg:prose lg:max-w-full">
              {messages.map((message, index) =>
                message.role === "assistant" ? (
                  <AgentMessage key={index} content={message.content}>
                    <TaskProposalHandler
                      message={message}
                      index={index}
                      messages={messages}
                      setMessages={setMessages}
                    />
                  </AgentMessage>
                ) : (
                  <UserMessage key={index} content={message.content} />
                ),
              )}
              <div ref={messagesEndRef} />
            </div>
          ) : (
            <ChatEmptyState />
          )}
        </div>
      </div>

      <div className="bg-white lg:p-4">
        <FinalInputArea
          disabled={disabled}
          promptValue={promptValue}
          setPromptValue={setPromptValue}
          handleChat={handleSubmit}
          messages={messages}
          setMessages={setMessages}
        />
      </div>
    </div>
  );
}
