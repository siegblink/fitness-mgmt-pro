import { Skeleton } from "@/components/ui/skeleton";

export default function MessagesLoading() {
  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      {/* Header Skeleton */}
      <div className="flex-shrink-0 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex items-center justify-between p-4 sm:p-6 pb-4">
          <div className="flex items-center space-x-3">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div>
              <Skeleton className="h-5 w-24 mb-1" />
              <Skeleton className="h-4 w-36 hidden sm:block" />
            </div>
          </div>
          <Skeleton className="h-8 w-8 sm:w-28 rounded-md shrink-0" />
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
        {/* Sidebar Skeleton */}
        <div className="w-full md:w-80 flex-shrink-0 border-r md:border-r border-b md:border-b-0 bg-background/50 h-1/2 md:h-full">
          <div className="flex flex-col h-full">
            {/* Search Skeleton */}
            <div className="p-3 sm:p-4 border-b">
              <Skeleton className="h-9 w-full rounded-md" />
            </div>

            <div className="flex-1 overflow-y-auto">
              <div className="p-2">
                {/* Conversations Section */}
                <Skeleton className="h-3 w-24 mb-2 mx-2" />
                <div className="space-y-1 mb-6">
                  {[...Array(3)].map((_, i) => (
                    <div
                      // biome-ignore lint/suspicious/noArrayIndexKey: Static skeleton loader
                      key={i}
                      className="flex items-center space-x-3 p-3 rounded-lg"
                    >
                      <Skeleton className="w-8 h-8 rounded-full flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <Skeleton className="h-3.5 w-20 mb-1" />
                        <Skeleton className="h-3 w-32" />
                      </div>
                      <Skeleton className="h-3 w-12" />
                    </div>
                  ))}
                </div>

                {/* All Members Section */}
                <Skeleton className="h-3 w-20 mb-2 mx-2" />
                <div className="space-y-1">
                  {[...Array(4)].map((_, i) => (
                    <div
                      // biome-ignore lint/suspicious/noArrayIndexKey: Static skeleton loader
                      key={i}
                      className="flex items-center space-x-3 p-3 rounded-lg"
                    >
                      <Skeleton className="w-8 h-8 rounded-full flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <Skeleton className="h-3.5 w-24 mb-1" />
                        <Skeleton className="h-3 w-28" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Message Area Skeleton */}
        <div className="flex-1 flex items-center justify-center min-h-0 p-4">
          <div className="text-center max-w-sm w-full">
            <Skeleton className="w-16 h-16 mx-auto rounded-full mb-4" />
            <div className="space-y-2 mb-6">
              <Skeleton className="h-5 w-40 mx-auto" />
              <Skeleton className="h-4 w-52 mx-auto" />
            </div>

            {/* Quick Templates Skeleton */}
            <div className="space-y-2">
              <Skeleton className="h-3 w-32 mx-auto mb-3" />
              <div className="grid grid-cols-1 gap-2 w-full">
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
