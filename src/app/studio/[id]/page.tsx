// app/studio/[id]/page.tsx
import { studios } from "@/data/mock-studios";
import { notFound } from "next/navigation";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function StudioDashboard({ params }: Props) {
  const resolvedParams = await params;
  const studioId = parseInt(resolvedParams.id, 10);
  const studio = studios.find((s) => s.id === studioId);

  if (!studio) {
    notFound();
  }

  return (
    <div className="space-y-6 bg-amber-300">
    </div>
  );
}
