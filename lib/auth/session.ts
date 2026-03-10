import { cookies } from "next/headers";

export const SESSION_COOKIE_NAME = "marketing_mvp_session";
export const DEFAULT_WORKSPACE_ID = "default-workspace";

export type AuthSession = {
  user: {
    id: string;
    email: string;
    role: "admin" | "business_owner" | "team_member";
  };
  workspaceId: string;
};

export async function getSession(): Promise<AuthSession | null> {
  const cookieStore = await cookies();
  const sessionValue = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (!sessionValue) {
    return null;
  }

  return {
    user: {
      id: "demo-owner",
      email: sessionValue,
      role: "business_owner",
    },
    workspaceId: DEFAULT_WORKSPACE_ID,
  };
}
