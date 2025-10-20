"use client";

import { Send } from "lucide-react";
import { useRouter } from "next/navigation";
import type React from "react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface MessageFormProps {
  receiverId: string;
  onMessageSent?: () => void;
}

export function MessageForm({ receiverId, onMessageSent }: MessageFormProps) {
  const [content, setContent] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    setIsLoading(true);
    try {
      const response = await fetch("/api/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: content.trim(),
          receiver_id: receiverId,
        }),
      });

      if (response.ok) {
        setContent("");
        onMessageSent?.();
        router.refresh();
      } else {
        console.error("Failed to send message");
      }
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      const syntheticEvent = {
        preventDefault: () => {},
      } as React.FormEvent;
      handleSubmit(syntheticEvent);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-end space-x-3">
      <div className="flex-1 relative">
        <Textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type your message... (Enter to send, Shift+Enter for new line)"
          className="min-h-[50px] max-h-32 resize-none border-2 rounded-2xl px-4 py-3 pr-12"
          rows={1}
          disabled={isLoading}
        />
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
          <Button
            type="submit"
            size="sm"
            variant="ghost"
            className="h-8 w-8 p-0 rounded-full hover:bg-primary hover:text-primary-foreground"
            disabled={isLoading || !content.trim()}
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </form>
  );
}
