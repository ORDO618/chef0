import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-6 text-center">
      <h2 className="text-3xl font-bold mb-3 text-emerald-400">404 - Sayfa Bulunamadı</h2>
      <p className="text-slate-400 mb-6 text-sm">Aradığınız sayfa mevcut değil veya taşınmış olabilir.</p>
      <Link
        href="/"
        className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-sm transition-all"
      >
        Ana Sayfaya Dön
      </Link>
    </div>
  );
}
