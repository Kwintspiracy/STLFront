'use client';

import { ReactNode, useEffect, useState } from "react";
import { notFound } from "next/navigation";
import { useStudio } from "@/context/StudioContext";
import { useAuth } from "@/context/AuthContext";
import StudioClientLayout from "./StudioClientLayout";
import type { Studio } from "@/types/studio";

interface Props {
  children: ReactNode;
  params: Promise<{ id: string }>;
}

export default function StudioLayout({ children, params }: Props) {
  const [studioId, setStudioId] = useState<number | null>(null);
  const [studio, setStudio] = useState<Studio | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const { getStudio } = useStudio();

  // Resolve params
  useEffect(() => {
    params.then(resolvedParams => {
      const id = Number(resolvedParams.id);
      setStudioId(id);
    });
  }, [params]);

  // Load studio data
  useEffect(() => {
    if (!studioId) return;

    const loadStudio = async () => {
      try {
        setLoading(true);
        setError(null);
        const studioData = await getStudio(studioId);
        setStudio(studioData);
      } catch (err: unknown) {
        console.error('Error loading studio in layout:', err);
        const errorMessage = err instanceof Error ? err.message : 'Failed to load studio';
        setError(errorMessage);
        if (errorMessage.includes('404') || errorMessage.includes('not found')) {
          notFound();
        }
      } finally {
        setLoading(false);
      }
    };

    loadStudio();
  }, [studioId, getStudio]);

  if (loading) {
    return (
      <div className="min-h-screen bg-primarybackground flex items-center justify-center">
        <div className="text-white text-lg">Loading studio...</div>
      </div>
    );
  }

  if (error || !studio) {
    notFound();
  }

  return <StudioClientLayout studio={studio}>{children}</StudioClientLayout>;
}
