"use client";

import { Button } from "@/components/ui/button";

export function PrintButton() {
  return (
    <Button type="button" className="no-print mb-6" onClick={() => window.print()}>
      Print / Save as PDF
    </Button>
  );
}
