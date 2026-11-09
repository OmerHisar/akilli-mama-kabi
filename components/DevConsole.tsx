'use client';

import { useState } from 'react';
import { getDatabase, ref, set, get, update } from 'firebase/database';
import { app } from '../lib/firebase';
import { useAuth } from '../context/AuthContext';

export default function DevConsole() {
  const { role } = useAuth();
  const [open, setOpen] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);

  // NOT: Geliştirme/test aşamasında her oturumda görünmesi için rol kontrolü geçici olarak kaldırıldı.
  // Üretime geçerken: if (role !== 'developer' && role !== 'admin') return null;

  const logAction = (msg: string) => {
    setLogs((prev) => [
      `[${new Date().toLocaleTimeString()}] ${msg}`,
      ...prev.slice(0, 10),
    ]);
  };

  const handleAddFood = async (gram: number) => {
    const db = getDatabase(app);
    const consumedRef = ref(db, 'telemetry/dailyConsumed');
    const snapshot = await get(consumedRef);
    const current = snapshot.exists() ? snapshot.val() : 0;
    const nextVal = current + gram;

    await set(consumedRef, nextVal);
    logAction(`Mama tüketimi güncellendi: ${current}g -> ${nextVal}g (+${gram}g)`);
  };

  const handleResetDay = async () => {
    const db = getDatabase(app);
    await set(ref(db, 'telemetry/dailyConsumed'), 0);
    logAction('Günlük mama tüketimi 0g olarak sıfırlandı.');
  };

  const handleSimulateFill = async () => {
    const db = getDatabase(app);
    await update(ref(db, 'deviceState'), {
      fillingMode: true,
      lastGestureTime: Date.now(),
    });
    logAction('Dolum Modu (Filling Mode) tetiklendi! Neopixel göstergesi aktif.');

    setTimeout(async () => {
      await update(ref(db, 'deviceState'), { fillingMode: false });
      logAction('Dolum Modu otomatik kapandı (5s zamanaşımı).');
    }, 5000);
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {!open ? (
        <button
          onClick={() => setOpen(true)}
          className="bg-amber-600 hover:bg-amber-500 text-white font-bold py-2 px-4 rounded-full shadow-lg text-xs flex items-center gap-2 border border-amber-400"
        >
          🛠️ DevConsole (Test Paneli)
        </button>
      ) : (
        <div className="bg-slate-800 border border-slate-700 text-white p-4 rounded-xl shadow-2xl w-80 text-xs flex flex-col gap-3">
          <div className="flex justify-between items-center border-b border-slate-700 pb-2">
            <span className="font-bold text-amber-400">ESP32 Simülatör & DevConsole</span>
            <button
              onClick={() => setOpen(false)}
              className="text-slate-400 hover:text-white"
            >
              ✖
            </button>
          </div>

          <div className="flex flex-col gap-2">
            <p className="text-slate-400">Veritabanı Test Eylemleri:</p>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => handleAddFood(50)}
                className="bg-slate-700 hover:bg-slate-600 p-2 rounded text-center border border-slate-600"
              >
                +50g Yedi
              </button>
              <button
                onClick={() => handleAddFood(100)}
                className="bg-slate-700 hover:bg-slate-600 p-2 rounded text-center border border-slate-600"
              >
                +100g Yedi
              </button>
              <button
                onClick={handleSimulateFill}
                className="bg-indigo-700 hover:bg-indigo-600 p-2 rounded text-center border border-indigo-500 col-span-2"
              >
                🖐️ El Hareketi (Dolum Modu)
              </button>
              <button
                onClick={handleResetDay}
                className="bg-rose-950/60 hover:bg-rose-900 p-2 rounded text-center text-rose-300 border border-rose-800 col-span-2"
              >
                🔄 Günü Sıfırla (0g)
              </button>
            </div>
          </div>

          <div className="bg-slate-900 p-2 rounded border border-slate-950 max-h-28 overflow-y-auto font-mono text-[10px] text-slate-300">
            {logs.length === 0 ? (
              <p className="text-slate-600 italic">Eylem bekleniyor...</p>
            ) : (
              logs.map((log, index) => <div key={index}>{log}</div>)
            )}
          </div>
        </div>
      )}
    </div>
  );
}