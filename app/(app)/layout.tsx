import { ReactNode } from "react";
import { redirect } from "next/navigation";

import { AppShellContent } from "@/components/app/shell";
import { AppSidebar } from "@/components/app/sidebar";
import { getSession } from "@/lib/auth/session";

type AppGroupLayoutProps = {
  children: ReactNode;
};

export default async function AppGroupLayout({ children }: AppGroupLayoutProps) {
  const session = await getSession();
  if (!session?.user) {
    redirect("/auth/signin");
  }

  return (
    <div className="flex min-h-screen bg-background">
      <AppSidebar />
      <AppShellContent>{children}</AppShellContent>
    </div>
  );
}
