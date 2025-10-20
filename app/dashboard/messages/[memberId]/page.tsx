import { ArrowLeft, MessageCircle } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { MessageForm } from "@/components/message-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createServerClient } from "@/lib/supabase/server";

interface MemberChatPageProps {
  params: Promise<{
    memberId: string;
  }>;
}

export default async function MemberChatPage({ params }: MemberChatPageProps) {
  const { memberId } = await params;
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

  if (!profile || profile.role !== "trainer") {
    redirect("/member-dashboard");
  }

  // Get member info
  const { data: member } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", memberId)
    .eq("trainer_id", user.id) // Ensure this member belongs to this trainer
    .single();

  if (!member) {
    redirect("/dashboard/messages");
  }

  // Get conversation with member
  const { data: messages } = await supabase
    .from("messages")
    .select(
      `
      *,
      sender:profiles!messages_sender_id_fkey(id, full_name, avatar_url)
    `,
    )
    .or(
      `and(sender_id.eq.${user.id},receiver_id.eq.${memberId}),and(sender_id.eq.${memberId},receiver_id.eq.${user.id})`,
    )
    .order("created_at", { ascending: true });

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/dashboard/messages">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Messages
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold">
            Chat with {member.full_name || "Member"}
          </h1>
          <p className="text-muted-foreground">
            Direct conversation with your member
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <MessageCircle className="h-5 w-5" />
            <span>Conversation with {member.full_name || "Member"}</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Messages Area */}
          <div className="h-96 overflow-y-auto border rounded-lg p-4 mb-4 space-y-4">
            {messages && messages.length > 0 ? (
              messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.sender_id === user.id ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                      message.sender_id === user.id
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted"
                    }`}
                  >
                    <p className="text-sm">{message.content}</p>
                    <p className="text-xs opacity-70 mt-1">
                      {new Date(message.created_at).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                <div className="text-center">
                  <MessageCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium">No messages yet</p>
                  <p className="text-sm">
                    Start a conversation with {member.full_name}!
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Message Input */}
          <MessageForm receiverId={member.id} />
        </CardContent>
      </Card>
    </div>
  );
}
