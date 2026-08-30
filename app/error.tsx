'use client';

import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('App Error:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-6 text-center">
      <h2 className="text-2xl font-bold mb-3 text-rose-400">Bir Hata Oluştu</h2>
      <p className="text-slate-400 mb-6 text-sm">Sayfa yüklenirken beklenmeyen bir durum meydana geldi.</p>
      <button
        onClick={() => reset()}
        className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-sm transition-all"
      >
        Tekrar Dene
      </button>
    </div>
  );
}
