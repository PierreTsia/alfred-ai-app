"use client";

import { useEffect, useRef, useState } from "react";

import { processCommandInput } from "@/core/utils/commands";
import { useTranslations } from "next-intl";
import { TaskProposalHandler } from "@/features/tasks/components/TaskProposalHandler";
import { ChatAgentMessage } from "@/features/chat/components/ChatAgentMessage";
import ChatUserMessage from "@/features/chat/components/ChatUserMessage";
import { ChatEmptyState } from "@/features/chat/components/ChatEmptyState";
import { TaskListHandler } from "@/features/tasks/components/TaskListHandler";
import ChatInput from "@/features/chat/components/ChatInput";

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
                  <ChatAgentMessage key={index} content={message.content}>
                    <TaskProposalHandler
                      message={message}
                      index={index}
                      messages={messages}
                      setMessages={setMessages}
                    />
                    <TaskListHandler message={message} />
                  </ChatAgentMessage>
                ) : (
                  <ChatUserMessage key={index} content={message.content} />
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
        <ChatInput
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
