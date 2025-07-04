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
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">
        Welcome to <span className="text-primary">{studio.name}</span>
      </h1>
      <p className="text-stone-400">
        Here you can manage your products, view sales, and update your studio settings.
      </p>
    </div>
  );
}
