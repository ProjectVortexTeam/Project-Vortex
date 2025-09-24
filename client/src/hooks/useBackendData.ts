// client/src/hooks/useBackendData.ts
import { useQuery } from "@tanstack/react-query";

export function useBackendData() {
  return useQuery(["backendData"], async () => {
    const res = await fetch("https://project-vortex.vercel.app/data"); // <- your backend URL
    if (!res.ok) throw new Error("Network error");
    return res.json();
  });
}
