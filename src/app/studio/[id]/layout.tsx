// app/studio/[id]/layout.tsx
import { ReactNode } from "react";
import { notFound } from "next/navigation";
import { studios } from "@/data/mock-studios";
import StudioClientLayout from "./StudioClientLayout";

interface Props {
  children: ReactNode;
  params: Promise<{ id: string }>;
}

export default async function StudioLayout({ children, params }: Props) {
  const resolvedParams = await params;
  const studioId = Number(resolvedParams.id);
  const studio = studios.find((s) => s.id === studioId);

  if (!studio) notFound();

  return <StudioClientLayout studio={studio}>{children}</StudioClientLayout>;
}
