import { cn } from "@/lib/utils";
import { useChat } from "ai/react";
import { Bot, Dot, Trash, XCircle } from "lucide-react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Message } from "ai";
import { useUser } from "@clerk/nextjs";
import Image from "next/image";
import { useEffect, useRef } from "react";

interface AiChatBoxProps {
  open: boolean;
  onClose: () => void;
}
const AiChatBox = ({ open, onClose }: AiChatBoxProps) => {
  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    setMessages,
    isLoading,
    error,
  } = useChat(); //   /api/chat

  const inputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    if (open) {
      inputRef.current?.focus();
    }
  }, [open]);

  const lastMessageIsUser = messages[messages.length - 1]?.role === "user";

  return (
    <div
      className={cn(
        "bottom-0 right-0 z-10 w-full max-w-[500px] p-1 xl:right-36",
        open ? "fixed" : "hidden",
      )}
    >
      <button onClick={onClose} className="mb-1 ms-auto block">
        <XCircle size={30} />
      </button>
      <div className="flex h-[480px] flex-col rounded border bg-background shadow-xl">
        <div className="mt-2 h-full overflow-y-auto px-3" ref={scrollRef}>
          {messages.map((message) => (
            <ChatMessage message={message} key={message.id} />
          ))}
          {isLoading && lastMessageIsUser && (
            <ChatMessage
              message={{
                role: "assistant",
                content: "Thinking...",
              }}
            />
          )}
          {error && (
            <ChatMessage
              message={{
                role: "assistant",
                content: "Something went wrong. Please try again.",
              }}
            />
          )}

          {!error && messages.length === 0 && (
            <div className=" flex h-full items-center justify-center gap-3">
              <Bot />
              Ask PANAS about your notes
            </div>
          )}
        </div>
        <form onSubmit={handleSubmit} className="m-3 flex gap-1">
          <Button
            title="clear chat"
            value="outlined"
            size="icon"
            className="mr-1 shrink-0"
            type="button"
            onClick={() => setMessages([])}
          >
            <Trash />
          </Button>
          <Input
            value={input}
            onChange={handleInputChange}
            className="mr-1"
            placeholder="Say something..."
            ref={inputRef}
          />
          <Button type="submit">Send</Button>
        </form>
      </div>
    </div>
  );
  function ChatMessage({
    message: { role, content },
  }: {
    message: Pick<Message, "role" | "content">;
  }) {
    const { user } = useUser();
    const isAiMessage = role === "assistant";
    return (
      <div
        className={cn(
          "mb-3 flex items-center",
          isAiMessage ? "me-5 justify-start" : "ms-5 justify-end",
        )}
      >
        {/* <div>{role}</div>
        <div>{content}</div> */}
        {isAiMessage && <Dot className="mr-2 shrink-0" />}
        <p
          className={cn(
            "whitespace-pre-line rounded-md border px-3 py-2",
            isAiMessage
              ? "bg-background"
              : "bg-primary text-primary-foreground",
          )}
        >
          {content}
        </p>
        {!isAiMessage && user?.imageUrl && (
          <Image
            src={user.imageUrl}
            alt="User image"
            width={100}
            height={100}
            className="ml-2 h-10 w-10 rounded-full object-cover"
          />
        )}
      </div>
    );
  }
};

export default AiChatBox;
