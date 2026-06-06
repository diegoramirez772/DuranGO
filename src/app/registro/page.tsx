'use client'

import { RegistroView } from "@/components/ui/RegistroView";
import { useRouter } from "next/navigation";

export default function RegistroPage() {
  const router = useRouter();
  return <RegistroView onGoToExplore={(id) => {
    if (id) {
      router.push(`/mapa?id=${id}`);
    } else {
      router.push("/mapa");
    }
  }} />;
}
