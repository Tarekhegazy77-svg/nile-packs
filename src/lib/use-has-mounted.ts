"use client";

import { useEffect, useState } from "react";

/** True only after client mount — avoids Zustand persist hydration mismatches. */
export function useHasMounted(): boolean {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);
  return mounted;
}
