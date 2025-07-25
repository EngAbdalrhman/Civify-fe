import { LoaderCircle } from 'lucide-react';

interface LoaderProps {
  message: string;
}

export function Loader({ message }: LoaderProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 text-center p-8">
      <LoaderCircle className="h-12 w-12 animate-spin text-primary" />
      <p className="text-lg font-medium text-muted-foreground">{message}</p>
    </div>
  );
}
