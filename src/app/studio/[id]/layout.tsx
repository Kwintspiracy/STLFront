// app/studio/[id]/layout.tsx
import { ReactNode } from "react";
import { notFound } from "next/navigation";
import { studios } from "@/data/mock-studios";
import StudioClientLayout from "./StudioNav";

interface Props {
  children: ReactNode;
  params: { id: string };
}

export default function StudioLayout({ children, params }: Props) {
  const studioId = Number(params.id);
  const studio = studios.find((s) => s.id === studioId);

  if (!studio) notFound();

  return <StudioClientLayout studio={studio}>{children}</StudioClientLayout>;
}
