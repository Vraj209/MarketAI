import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

type PageHeaderProps = {
  title: string;
  description: string;
};

export function PageHeader({ title, description }: PageHeaderProps) {
  return (
    <header className="mb-8 flex flex-col justify-between gap-4 border-b border-[var(--border)] pb-6 md:flex-row md:items-center">
      <div className="space-y-2">
        <Badge>Marketing Agent MVP</Badge>
        <h1 className="text-2xl font-semibold tracking-tight text-[var(--foreground)]">{title}</h1>
        <p className="max-w-3xl text-sm text-[var(--muted-foreground)]">{description}</p>
      </div>
      <Button variant="secondary">View Run History</Button>
    </header>
  );
}
