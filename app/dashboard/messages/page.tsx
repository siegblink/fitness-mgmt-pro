import { createServerClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search, Plus } from "lucide-react";
import Link from "next/link";

export default async function MessagesPage() {
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

  // Get recent conversations
  const { data: conversations } = await supabase
    .from("messages")
    .select(
      `
      *,
      sender:profiles!messages_sender_id_fkey(id, full_name, avatar_url),
      receiver:profiles!messages_receiver_id_fkey(id, full_name, avatar_url)
    `,
    )
    .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
    .order("created_at", { ascending: false })
    .limit(50);

  // Group conversations by the other participant
  const conversationMap = new Map();
  conversations?.forEach((message) => {
    const otherParticipant =
      message.sender_id === user.id ? message.receiver : message.sender;
    const key = otherParticipant.id;

    if (!conversationMap.has(key)) {
      conversationMap.set(key, {
        participant: otherParticipant,
        lastMessage: message,
        unreadCount: 0,
      });
    }
  });

  const conversationList = Array.from(conversationMap.values());

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Messages</h1>
          <p className="text-muted-foreground">Communicate with your members</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          New Message
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Conversations List */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Conversations</CardTitle>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search conversations..." className="pl-10" />
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="space-y-1">
              {conversationList.map((conversation) => (
                <Link
                  key={conversation.participant.id}
                  href={`/dashboard/messages/${conversation.participant.id}`}
                  className="flex items-center space-x-3 p-4 hover:bg-muted/50 cursor-pointer border-b border-border/50 block"
                >
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-sm font-medium">
                      {conversation.participant.full_name?.charAt(0) || "M"}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {conversation.participant.full_name || "Member"}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {conversation.lastMessage.content}
                    </p>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {new Date(
                      conversation.lastMessage.created_at,
                    ).toLocaleDateString()}
                  </div>
                </Link>
              ))}

              {conversationList.length === 0 && (
                <div className="p-8 text-center text-muted-foreground">
                  <p>No conversations yet</p>
                  <p className="text-sm">Start messaging your members!</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Message Area */}
        <Card className="lg:col-span-2">
          <CardContent className="p-6">
            <div className="flex items-center justify-center h-96 text-muted-foreground">
              <div className="text-center">
                <p className="text-lg font-medium">Select a conversation</p>
                <p className="text-sm">Choose a member to start messaging</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center">
                <span className="text-blue-500 text-sm">📝</span>
              </div>
              <div>
                <p className="font-medium">Send Workout Updates</p>
                <p className="text-sm text-muted-foreground">
                  Notify members about plan changes
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-full bg-green-500/10 flex items-center justify-center">
                <span className="text-green-500 text-sm">💪</span>
              </div>
              <div>
                <p className="font-medium">Progress Check-ins</p>
                <p className="text-sm text-muted-foreground">
                  Ask about member progress
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-full bg-purple-500/10 flex items-center justify-center">
                <span className="text-purple-500 text-sm">🎯</span>
              </div>
              <div>
                <p className="font-medium">Motivation Messages</p>
                <p className="text-sm text-muted-foreground">
                  Send encouragement to members
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
