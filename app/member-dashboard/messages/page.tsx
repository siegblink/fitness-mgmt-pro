import { createServerClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { MessageCircle, User, Clock } from "lucide-react";
import { MessageForm } from "@/components/message-form";

export default async function MemberMessagesPage() {
  const supabase = await createServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role !== "member") {
    redirect("/dashboard");
  }

  // Get trainer info
  const { data: trainer } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", profile.trainer_id)
    .single();

  // Get conversation with trainer
  const { data: messages } = await supabase
    .from("messages")
    .select(
      `
      *,
      sender:profiles!messages_sender_id_fkey(id, full_name, avatar_url)
    `,
    )
    .or(
      `and(sender_id.eq.${user.id},receiver_id.eq.${profile.trainer_id}),and(sender_id.eq.${profile.trainer_id},receiver_id.eq.${user.id})`,
    )
    .order("created_at", { ascending: true });

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      {/* Header */}
      <div className="flex-shrink-0 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex items-center justify-between p-6 pb-4">
          <div className="flex items-center space-x-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
              <User className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-lg font-semibold">
                {trainer?.full_name || "Your Trainer"}
              </h1>
              <p className="text-sm text-muted-foreground">Personal Trainer</p>
            </div>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-hidden">
        <div className="h-full flex flex-col">
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages && messages.length > 0 ? (
              messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.sender_id === user.id ? "justify-end" : "justify-start"}`}
                >
                  <div className="flex flex-col max-w-[70%] space-y-1">
                    <div
                      className={`rounded-2xl px-4 py-2 ${
                        message.sender_id === user.id
                          ? "bg-primary text-primary-foreground rounded-br-sm"
                          : "bg-muted rounded-bl-sm"
                      }`}
                    >
                      <p className="text-sm leading-relaxed">
                        {message.content}
                      </p>
                    </div>
                    <div
                      className={`flex items-center space-x-1 px-2 ${message.sender_id === user.id ? "justify-end" : "justify-start"}`}
                    >
                      <Clock className="h-3 w-3 text-muted-foreground" />
                      <p className="text-xs text-muted-foreground">
                        {new Date(message.created_at).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 mx-auto rounded-full bg-muted flex items-center justify-center">
                    <MessageCircle className="h-8 w-8" />
                  </div>
                  <div className="space-y-2">
                    <p className="text-lg font-medium">No messages yet</p>
                    <p className="text-sm">
                      Start a conversation with your trainer!
                    </p>
                  </div>
                  {/* Quick Starters */}
                  <div className="mt-6 space-y-2 max-w-sm">
                    <p className="text-xs font-medium text-muted-foreground">
                      Quick starters:
                    </p>
                    <div className="grid grid-cols-1 gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="justify-start text-left h-auto py-2"
                      >
                        &quot;How should I modify this exercise?&quot;
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="justify-start text-left h-auto py-2"
                      >
                        &quot;I completed today&apos;s workout!&quot;
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="justify-start text-left h-auto py-2"
                      >
                        &quot;Can we reschedule my session?&quot;
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Message Input */}
          {trainer && (
            <div className="flex-shrink-0 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
              <div className="p-6">
                <MessageForm receiverId={trainer.id} />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
