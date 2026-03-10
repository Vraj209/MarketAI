"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
export default function SignInPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-6">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Sign in to Marketing MVP</CardTitle>
          <CardDescription>
            Use your workspace credentials to access onboarding, dashboard, and strategist tools.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            className="space-y-4"
            onSubmit={async (event) => {
              event.preventDefault();
              setError(null);

              const formData = new FormData(event.currentTarget);
              const response = await fetch("/api/auth/signin", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  email: String(formData.get("email") ?? ""),
                  password: String(formData.get("password") ?? ""),
                }),
              });

              if (!response.ok) {
                setError("Invalid credentials. Please try again.");
                return;
              }

              router.push("/dashboard");
              router.refresh();
            }}
          >
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium text-[var(--foreground)]">
                Email
              </label>
              <Input id="email" name="email" type="email" required />
            </div>
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium text-[var(--foreground)]">
                Password
              </label>
              <Input id="password" name="password" type="password" required />
            </div>
            {error ? <p className="text-sm text-[var(--error)]">{error}</p> : null}
            <Button type="submit" className="w-full">
              Sign in
            </Button>
          </form>
          <p className="mt-4 text-xs text-[var(--muted-foreground)]">
            Demo default: owner@example.com / password123
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
