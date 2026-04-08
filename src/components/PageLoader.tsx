import { Loader2 } from "lucide-react";

interface PageLoaderProps {
  message?: string;
}

const PageLoader = ({ message = "Loading…" }: PageLoaderProps) => (
  <div className="min-h-screen bg-background flex items-center justify-center">
    <div className="flex flex-col items-center gap-4">
      <div className="relative">
        <div className="w-12 h-12 rounded-full border-2 border-primary/20" />
        <Loader2
          className="absolute inset-0 w-12 h-12 text-primary animate-spin"
          strokeWidth={2}
        />
      </div>
      <p className="text-sm text-muted-foreground animate-pulse">
        {message}
      </p>
    </div>
  </div>
);

export default PageLoader;
