export type BusinessProfile = {
  id: string;
  workspaceId: string;
  name: string;
  category: string;
  websiteUrl: string | null;
  location: string;
  audience: string;
  lifecycle: string;
  goals: string;
  brandVoice: string;
  competitors: string | null;
  challenges: string | null;
  createdAt: Date;
  updatedAt: Date;
};
