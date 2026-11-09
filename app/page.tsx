'use client';

import { useAuth } from '../context/AuthContext';
import GoalCircle from '../components/GoalCircle';
import DevConsole from '../components/DevConsole';
import DeviceStatus from '../components/DeviceStatus';
import WeeklyChart from '../components/WeeklyChart';

export default function Home() {
  const { user, role, loading } = useAuth();

  if (loading) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-slate-950 text-white">
        <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-slate-400 text-sm animate-pulse">Sistem yükleniyor...</p>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-center p-4 bg-slate-950 text-white relative pb-20">
      
      {/* Üst Bilgi Alanı */}
      <header className="w-full max-w-md flex justify-between items-center py-4 mb-4 border-b border-slate-800/50">
        <div>
          <h1 className="text-xl font-black bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">Akıllı Mama Kabı</h1>
          <p className="text-[10px] font-medium tracking-widest text-slate-500 uppercase mt-1">Canlı Takip Paneli</p>
        </div>
        <div className="text-right flex flex-col items-end">
          <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-1 rounded bg-slate-800 text-slate-300">
            {role === 'admin' || role === 'developer' ? 'Yetkili' : 'Ziyaretçi'}
          </span>
        </div>
      </header>

      {/* Cihaz Durum Kartları (Pil, Anlık Ağırlık, Durum) */}
      <DeviceStatus />

      {/* Merkez Hedef Çemberi */}
      <section className="flex items-center justify-center w-full my-4">
        <GoalCircle />
      </section>

      {/* Haftalık Geçmiş Grafiği */}
      <WeeklyChart />

      {/* Alt Bilgi */}
      <footer className="w-full max-w-md text-center text-[10px] text-slate-600 mt-12 pb-4">
        <p>Endüstri Ürünleri Tasarımı - Teknik Demo v1.0</p>
      </footer>

      {/* Geliştirici Test Paneli */}
      <DevConsole />
      
    </main>
  );
}