import { Bot } from 'lucide-react';
import type { SVGProps } from 'react';

export function Logo(props: SVGProps<SVGSVGElement>) {
  return (
    <div className="flex items-center gap-2">
      <Bot className="h-6 w-6 text-primary" />
      <span className="text-lg font-bold font-headline text-foreground">
        AI Interview Ace
      </span>
    </div>
  );
}
