import { Skeleton } from "@/components/ui/skeleton";

export default function MessagesLoading() {
  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      {/* Header */}
      <div className="flex-shrink-0 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex items-center justify-between p-6 pb-4">
          <div className="flex items-center space-x-3">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-4 w-24" />
            </div>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-hidden">
        <div className="h-full flex flex-col">
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {[...Array(6)].map((_, i) => (
              <div
                // biome-ignore lint/suspicious/noArrayIndexKey: Static skeleton loader
                key={i}
                className={`flex ${i % 3 === 0 ? "justify-end" : "justify-start"}`}
              >
                <div className="flex flex-col max-w-[70%] space-y-1">
                  <Skeleton
                    className={`h-12 rounded-2xl ${
                      i % 3 === 0 ? "w-48 rounded-br-sm" : "w-56 rounded-bl-sm"
                    }`}
                  />
                  <div
                    className={`flex items-center space-x-1 px-2 ${i % 3 === 0 ? "justify-end" : "justify-start"}`}
                  >
                    <Skeleton className="h-3 w-3 rounded-full" />
                    <Skeleton className="h-3 w-12" />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Message Input */}
          <div className="flex-shrink-0 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="p-6">
              <div className="flex items-end space-x-3">
                <div className="flex-1 relative">
                  <Skeleton className="h-[50px] w-full rounded-2xl" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
