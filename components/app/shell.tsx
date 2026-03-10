import { ReactNode } from "react";

type AppShellContentProps = {
  children: ReactNode;
};

export function AppShellContent({ children }: AppShellContentProps) {
  return (
    <main className="flex-1 overflow-y-auto">
      <div className="mx-auto w-full max-w-7xl px-6 py-8 lg:px-10">{children}</div>
    </main>
  );
}
