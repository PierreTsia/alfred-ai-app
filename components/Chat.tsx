"use client";

import ReactMarkdown from "react-markdown";
import FinalInputArea from "./FinalInputArea";
import { useEffect, useRef, useState } from "react";
import simpleLogo from "../public/simple-logo.png";
import Image from "next/image";
import { parseTaskProposal } from "@/utils/taskParser";
import { TaskProposalConfirm } from "./TaskProposalConfirm";
import {
  extractJsonFromResponseText,
  formatUserInput,
} from "@/utils/responseParser";
import { processCommandInput } from "@/utils/commands";
import { useTranslations } from "next-intl";
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
  handleChat: () => void;
  topic: string;
}) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollableContainerRef = useRef<HTMLDivElement>(null);
  const [didScrollToBottom, setDidScrollToBottom] = useState(true);
  const t = useTranslations("Chat");
  function scrollToBottom() {
    messagesEndRef.current?.scrollIntoView({ behavior: "instant" });
  }

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
    handleChat();
  };

  return (
    <div className="flex grow flex-col gap-4 overflow-hidden">
      <div className="flex grow flex-col overflow-hidden lg:p-4">
        <div
          ref={scrollableContainerRef}
          className="mt-2 overflow-y-scroll rounded-lg border border-solid border-[#C2C2C2] bg-white px-5 lg:p-7"
        >
          {messages.length > 0 ? (
            <div className="prose-sm max-w-5xl lg:prose lg:max-w-full">
              {messages.map((message, index) =>
                message.role === "assistant" ? (
                  <div className="relative w-full" key={index}>
                    <Image
                      src={simpleLogo}
                      alt={t("Chat.assistantAvatar")}
                      className="absolute left-0 top-0 !my-0 size-7"
                    />
                    <div className="w-full pl-10">
                      <ReactMarkdown>
                        {extractJsonFromResponseText(message.content)}
                      </ReactMarkdown>
                      {(() => {
                        const taskProposal = parseTaskProposal(message.content);
                        if (taskProposal) {
                          return (
                            <TaskProposalConfirm
                              proposal={taskProposal}
                              onConfirm={() => {
                                const updatedMessages = [...messages];
                                updatedMessages[index] = {
                                  ...message,
                                  content:
                                    extractJsonFromResponseText(
                                      message.content,
                                    ) + `\n\n${t("taskCreated")}`,
                                };
                                setMessages(updatedMessages);
                              }}
                            />
                          );
                        }
                        return null;
                      })()}
                    </div>
                  </div>
                ) : (
                  <div
                    className="ml-auto w-fit rounded-xl bg-blue-500 px-3 py-2 font-medium text-white"
                    key={index}
                  >
                    <ReactMarkdown className="[&>p]:m-0 [&>p]:leading-normal [&_strong]:rounded [&_strong]:bg-white/20 [&_strong]:px-1.5 [&_strong]:py-0.5">
                      {formatUserInput(message.content)}
                    </ReactMarkdown>
                  </div>
                ),
              )}
              <div ref={messagesEndRef} />
            </div>
          ) : (
            <div className="flex w-full flex-col gap-2 py-3">
              {Array.from(Array(4).keys()).map((i) => (
                <div
                  key={i}
                  className={`${i < 2 && "hidden sm:block"} bg-gray-300 h-6 animate-pulse rounded-md`}
                  style={{ animationDelay: `${i * 0.05}s` }}
                />
              ))}
            </div>
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
