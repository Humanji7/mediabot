import { cn } from "@/lib/utils";

interface ChatSkeletonProps {
  className?: string;
  variant?: "message" | "typing" | "full-chat";
}

export const ChatSkeleton: React.FC<ChatSkeletonProps> = ({
  className,
  variant = "message",
}) => {
  if (variant === "typing") {
    return (
      <div className={cn("flex items-center gap-2 p-4", className)}>
        <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse" />
        <div className="flex gap-1">
          <div
            className="w-2 h-2 bg-gray-300 rounded-full animate-bounce"
            style={{ animationDelay: "0ms" }}
          />
          <div
            className="w-2 h-2 bg-gray-300 rounded-full animate-bounce"
            style={{ animationDelay: "150ms" }}
          />
          <div
            className="w-2 h-2 bg-gray-300 rounded-full animate-bounce"
            style={{ animationDelay: "300ms" }}
          />
        </div>
      </div>
    );
  }

  if (variant === "full-chat") {
    return (
      <div className={cn("space-y-4 p-4", className)}>
        {/* Chat header skeleton */}
        <div className="flex items-center gap-3 pb-4 border-b">
          <div className="w-10 h-10 bg-gray-200 rounded-full animate-pulse" />
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-gray-200 rounded animate-pulse w-1/3" />
            <div className="h-3 bg-gray-200 rounded animate-pulse w-1/4" />
          </div>
        </div>

        {/* Messages skeleton */}
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className={cn(
              "flex gap-3",
              i % 2 === 0 ? "justify-start" : "justify-end",
            )}
          >
            {i % 2 === 0 && (
              <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse flex-shrink-0" />
            )}
            <div
              className={cn(
                "space-y-2 max-w-xs",
                i % 2 === 0 ? "order-2" : "order-1",
              )}
            >
              <div
                className={cn(
                  "h-4 bg-gray-200 rounded animate-pulse",
                  i % 3 === 0 ? "w-full" : i % 3 === 1 ? "w-3/4" : "w-1/2",
                )}
              />
              {i % 4 === 0 && (
                <div className="h-4 bg-gray-200 rounded animate-pulse w-2/3" />
              )}
            </div>
            {i % 2 === 1 && (
              <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse flex-shrink-0" />
            )}
          </div>
        ))}

        {/* Input skeleton */}
        <div className="flex gap-2 pt-4 border-t">
          <div className="flex-1 h-10 bg-gray-200 rounded-lg animate-pulse" />
          <div className="w-10 h-10 bg-gray-200 rounded-lg animate-pulse" />
        </div>
      </div>
    );
  }

  // Default message skeleton
  return (
    <div className={cn("flex gap-3 p-4", className)}>
      <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4" />
        <div className="h-4 bg-gray-200 rounded animate-pulse w-1/2" />
        <div className="h-4 bg-gray-200 rounded animate-pulse w-5/6" />
      </div>
    </div>
  );
};
