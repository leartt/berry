import { Loader2 } from 'lucide-react';
import React from 'react';

export default function Loading() {
  return (
    <div className="fixed inset-0 z-[1] w-full h-full flex items-center justify-center bg-slate-300/50">
      <Loader2 className="animate-spin h-16 w-16 stroke-primary" />
    </div>
  );
}
