// app/studio/[id]/page.tsx
import { studios } from "@/data/mock-studios";
import { notFound } from "next/navigation";

interface Props {
  params: { id: string };
}

export default function StudioDashboard({ params }: Props) {
  const studioId = parseInt(params.id, 10);
  const studio = studios.find((s) => s.id === studioId);

  if (!studio) {
    notFound();
  }

  return (
    <div className="space-y-6 bg-amber-300">
    </div>
  );
}
