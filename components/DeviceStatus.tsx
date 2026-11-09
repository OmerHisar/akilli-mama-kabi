'use client';

import { useEffect, useState } from 'react';
import { getDatabase, ref, onValue } from 'firebase/database';
import { app } from '../lib/firebase';

export default function DeviceStatus() {
  const [status, setStatus] = useState({
    battery: 100,
    currentWeight: 0,
    fillingMode: false,
    isOnline: true
  });

  useEffect(() => {
    const db = getDatabase(app);
    const statusRef = ref(db, 'deviceState');

    const unsub = onValue(statusRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        setStatus({
          battery: data.battery ?? 100,
          currentWeight: data.currentWeight ?? 0,
          fillingMode: data.fillingMode ?? false,
          isOnline: true
        });
      }
    });

    return () => unsub();
  }, []);

  const getBatteryColor = (level: number) => {
    if (level <= 15) return 'text-red-500';
    if (level <= 40) return 'text-amber-400';
    return 'text-emerald-400';
  };

  return (
    <div className="w-full max-w-md grid grid-cols-3 gap-3 mb-6">
      {/* Pil Durumu */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-3 flex flex-col items-center justify-center">
        <span className="text-[10px] text-slate-400 uppercase tracking-wider mb-1">Batarya</span>
        <span className={`text-lg font-bold ${getBatteryColor(status.battery)}`}>
          %{status.battery}
        </span>
      </div>

      {/* Kasedeki Anlık Mama */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-3 flex flex-col items-center justify-center">
        <span className="text-[10px] text-slate-400 uppercase tracking-wider mb-1">Kasedeki</span>
        <span className="text-lg font-bold text-slate-200">
          {status.currentWeight}g
        </span>
      </div>

      {/* Cihaz Durumu */}
      <div className={`border rounded-xl p-3 flex flex-col items-center justify-center transition-colors duration-500 ${status.fillingMode ? 'bg-indigo-900/40 border-indigo-500' : 'bg-slate-800/50 border-slate-700'}`}>
        <span className="text-[10px] text-slate-400 uppercase tracking-wider mb-1">Durum</span>
        <span className={`text-xs font-bold text-center ${status.fillingMode ? 'text-indigo-400 animate-pulse' : 'text-emerald-500'}`}>
          {status.fillingMode ? 'Dolum Modu' : 'Aktif (Normal)'}
        </span>
      </div>
    </div>
  );
}