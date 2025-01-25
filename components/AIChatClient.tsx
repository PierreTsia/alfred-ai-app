"use client";

import { useState } from "react";
import Chat from "./Chat";
import {
  createParser,
  ParsedEvent,
  ReconnectInterval,
} from "eventsource-parser";
import { useUser } from "@clerk/nextjs";

export default function AIChatClient() {
  const { user } = useUser();
  const [messages, setMessages] = useState<{ role: string; content: string }[]>(
    [],
  );
  const [promptValue, setPromptValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleChat = async () => {
    try {
      setIsLoading(true);
      const userMessage = { role: "user", content: promptValue };
      const updatedMessages = [...messages, userMessage];
      setMessages(updatedMessages);

      const response = await fetch("/api/getChat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: updatedMessages,
          userName: user?.firstName || "there",
          userId: user?.id,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch response");
      }

      const data = response.body;
      if (!data) return;

      const onParse = (event: ParsedEvent | ReconnectInterval) => {
        if (event.type === "event") {
          try {
            const data = JSON.parse(event.data);
            const text = data.text ?? "";

            setMessages((prev) => {
              const lastMessage = prev[prev.length - 1];
              if (lastMessage?.role === "assistant") {
                return [
                  ...prev.slice(0, -1),
                  { ...lastMessage, content: lastMessage.content + text },
                ];
              } else {
                return [...prev, { role: "assistant", content: text }];
              }
            });
          } catch (e) {
            console.error("Parse error:", e);
          }
        }
      };

      const reader = data.getReader();
      const decoder = new TextDecoder();
      const parser = createParser(onParse);

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value);
        parser.feed(chunk);
      }
    } catch (error) {
      console.error("Error in chat:", error);
    } finally {
      setIsLoading(false);
      setPromptValue("");
    }
  };

  return (
    <Chat
      messages={messages}
      disabled={isLoading}
      promptValue={promptValue}
      setPromptValue={setPromptValue}
      setMessages={setMessages}
      handleChat={handleChat}
      topic=""
    />
  );
}
