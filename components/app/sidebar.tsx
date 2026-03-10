"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ComponentType } from "react";
import {
  BarChart3,
  Building2,
  FileText,
  Globe,
  History,
  LayoutDashboard,
  Mail,
  MessageSquare,
  Search,
  Settings,
  Sparkles,
} from "lucide-react";

import { cn } from "@/lib/utils/cn";

const businessItems = [{ label: "My Business", href: "/onboarding", icon: Building2 }];

const mainItems = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Strategist", href: "/strategist", icon: Sparkles },
  { label: "Social Content", href: "/dashboard#social", icon: MessageSquare },
  { label: "Email Marketing", href: "/dashboard#email", icon: Mail },
  { label: "Newsletter", href: "/dashboard#newsletter", icon: FileText },
  { label: "Website Audit", href: "/website-audit", icon: Globe },
  { label: "Market Research", href: "/research", icon: Search },
  { label: "Reports", href: "/reports", icon: BarChart3 },
  { label: "History", href: "/dashboard#history", icon: History },
];

export function AppSidebar() {
  const currentPath = usePathname();

  return (
    <aside className="hidden w-64 shrink-0 border-r border-[var(--border)] bg-[var(--sidebar-bg)] lg:block">
      <div className="flex h-full flex-col px-4 py-5">
        <Link href="/dashboard" className="mb-6 flex items-center gap-2.5 px-2">
          <div className="grid h-6 w-6 place-content-center rounded-full bg-[var(--foreground)] text-[10px] text-[var(--surface)]">
            M
          </div>
          <p className="text-lg font-semibold text-[var(--foreground)]">MarketAI</p>
        </Link>

        <SidebarSection title="Business" items={businessItems} currentPath={currentPath} />
        <SidebarSection title="Main" items={mainItems} currentPath={currentPath} />

        <div className="mt-auto border-t border-[var(--border)] pt-4">
          <Link
            href="/dashboard#settings"
            className="flex items-center gap-3 rounded-md px-3 py-2 text-sm text-[var(--muted-foreground)] transition-colors hover:bg-[var(--accent-soft)]/22 hover:text-[var(--foreground)]"
          >
            <Settings className="h-4 w-4" />
            Settings
          </Link>
        </div>
      </div>
    </aside>
  );
}

type SidebarSectionProps = {
  title: string;
  items: Array<{ label: string; href: string; icon: ComponentType<{ className?: string }> }>;
  currentPath: string;
};

function SidebarSection({ title, items, currentPath }: SidebarSectionProps) {
  return (
    <section className="mb-5">
      <p className="mb-2 px-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--muted-foreground)]/80">
        {title}
      </p>
      <nav className="space-y-1">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = currentPath === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
                isActive
                  ? "bg-[var(--accent-soft)]/45 text-[var(--foreground)]"
                  : "text-[var(--muted-foreground)] hover:bg-[var(--accent-soft)]/22 hover:text-[var(--foreground)]",
              )}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </section>
  );
}
