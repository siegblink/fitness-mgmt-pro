import { MessageCircle, Plus, Search, Users } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createServerClient } from "@/lib/supabase/server";

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

  // Get assigned members for this trainer
  const { data: members } = await supabase
    .from("member_assignments")
    .select(
      `
      *,
      member:profiles!member_assignments_member_id_fkey(id, full_name, avatar_url)
    `,
    )
    .eq("trainer_id", user.id);

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
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      {/* Header */}
      <div className="flex-shrink-0 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex items-center justify-between p-4 sm:p-6 pb-4">
          <div className="flex items-center space-x-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
              <MessageCircle className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-lg font-semibold">Messages</h1>
              <p className="text-sm text-muted-foreground hidden sm:block">
                Communicate with your members
              </p>
            </div>
          </div>
          <Button size="sm" className="shrink-0">
            <Plus className="h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline">New Message</span>
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
        {/* Conversations Sidebar */}
        <div className="w-full md:w-80 flex-shrink-0 border-r md:border-r border-b md:border-b-0 bg-background/50 h-1/2 md:h-full">
          <div className="flex flex-col h-full">
            <div className="p-3 sm:p-4 border-b">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search conversations..."
                  className="pl-10 h-9"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto">
              <div className="p-2 sm:p-2">
                <h3 className="text-xs font-medium text-muted-foreground mb-2 px-2">
                  CONVERSATIONS
                </h3>
                <div className="space-y-1">
                  {conversationList.map((conversation) => (
                    <Link
                      key={conversation.participant.id}
                      href={`/dashboard/messages/${conversation.participant.id}`}
                      className="flex items-center space-x-3 p-3 sm:p-3 hover:bg-muted/50 rounded-lg cursor-pointer transition-colors touch-manipulation"
                    >
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <span className="text-xs font-medium">
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
                        ).toLocaleDateString([], {
                          month: "short",
                          day: "numeric",
                        })}
                      </div>
                    </Link>
                  ))}
                </div>

                {/* All Members Section */}
                <h3 className="text-xs font-medium text-muted-foreground mb-2 px-2 mt-6">
                  ALL MEMBERS
                </h3>
                <div className="space-y-1">
                  {members?.map((assignment) => (
                    <Link
                      key={assignment.member.id}
                      href={`/dashboard/messages/${assignment.member.id}`}
                      className="flex items-center space-x-3 p-3 sm:p-3 hover:bg-muted/50 rounded-lg cursor-pointer transition-colors touch-manipulation"
                    >
                      <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                        <span className="text-xs font-medium">
                          {assignment.member.full_name?.charAt(0) || "M"}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {assignment.member.full_name || "Member"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Start conversation
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>

                {conversationList.length === 0 &&
                  (!members || members.length === 0) && (
                    <div className="p-8 text-center text-muted-foreground">
                      <div className="w-12 h-12 mx-auto rounded-full bg-muted flex items-center justify-center mb-4">
                        <Users className="h-6 w-6" />
                      </div>
                      <p className="text-sm font-medium">No members yet</p>
                      <p className="text-xs">
                        Assign members to start messaging
                      </p>
                    </div>
                  )}
              </div>
            </div>
          </div>
        </div>

        {/* Message Area */}
        <div className="flex-1 flex items-center justify-center min-h-0 p-4">
          <div className="text-center text-muted-foreground max-w-sm w-full">
            <div className="w-16 h-16 mx-auto rounded-full bg-muted flex items-center justify-center mb-4">
              <MessageCircle className="h-8 w-8" />
            </div>
            <div className="space-y-2">
              <p className="text-lg font-medium">Select a conversation</p>
              <p className="text-sm">
                Choose a member from the sidebar to start messaging
              </p>
            </div>

            {/* Quick Message Templates */}
            <div className="mt-6 space-y-2">
              <p className="text-xs font-medium text-muted-foreground">
                Quick message templates:
              </p>
              <div className="grid grid-cols-1 gap-2 text-left w-full">
                <Button
                  variant="outline"
                  size="sm"
                  className="justify-start h-auto py-2 px-3 text-xs sm:text-sm whitespace-normal text-left"
                >
                  &quot;How are you progressing with your workout?&quot;
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="justify-start h-auto py-2 px-3 text-xs sm:text-sm whitespace-normal text-left"
                >
                  &quot;I&apos;ve updated your workout plan&quot;
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="justify-start h-auto py-2 px-3 text-xs sm:text-sm whitespace-normal text-left"
                >
                  &quot;Great job on completing your session!&quot;
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
