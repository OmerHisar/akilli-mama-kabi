'use client';

import React, { useState, useEffect } from "react";
import { ref, onValue, update, push } from "firebase/database";
import { db } from "../lib/firebase";
import { useAuth } from "../context/AuthContext";
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";

export default function Home() {
  const { role, loading } = useAuth();

  // -- Cihaz Durumu State'leri --
  const [deviceState, setDeviceState] = useState({
    currentWeight: 0,
    consumedToday: 0,
    battery: 100,
    status: "Bilinmiyor",
  });
  const [dailyGoal, setDailyGoal] = useState(250);
  const [dailyHistory, setDailyHistory] = useState<any[]>([]);

  // -- Firebase Gerçek Zamanlı Dinleyici --
  useEffect(() => {
    const stateRef = ref(db, "deviceState");
    const settingsRef = ref(db, "settings/dailyGoal");
    const historyRef = ref(db, "history/today");

    const unsubState = onValue(stateRef, (snap) => {
      if (snap.exists()) setDeviceState((prev) => ({ ...prev, ...snap.val() }));
    });

    const unsubSettings = onValue(settingsRef, (snap) => {
      if (snap.exists()) setDailyGoal(snap.val());
    });

    const unsubHistory = onValue(historyRef, (snap) => {
      if (snap.exists()) {
        const data = snap.val();
        const formatted = Object.keys(data).map((key) => ({
          time: data[key].time,
          amount: data[key].amount,
        }));
        setDailyHistory(formatted);
      } else {
        setDailyHistory([]);
      }
    });

    return () => {
      unsubState();
      unsubSettings();
      unsubHistory();
    };
  }, []);

  // -- Çember Matematiği --
  const consumed = deviceState.consumedToday || 0;
  const goal = dailyGoal > 0 ? dailyGoal : 1; // sıfıra bölmeyi engelle
  const primaryPercentage = Math.min(100, (consumed / goal) * 100);
  const isOvereating = consumed > goal;
  const secondaryPercentage = isOvereating
    ? Math.min(100, ((consumed - goal) / goal) * 100)
    : 0;
  const r = 90;
  const outR = 110;
  const circ = 2 * Math.PI * r;
  const outCirc = 2 * Math.PI * outR;

  // -- Renk Fonksiyonları --
  const getBatteryColor = (lvl: number) =>
    lvl <= 15 ? "text-red-500" : lvl <= 40 ? "text-amber-400" : "text-emerald-400";
  const getSecondaryColor = (pct: number) =>
    pct < 30 ? "text-yellow-400" : pct < 70 ? "text-orange-500" : "text-red-600";

  const isAdmin = role === "admin" || role === "developer";

  // -- DevConsole Fonksiyonları (Hızlı Öğün Ekleme & Sıfırlama) --
  const triggerMealSimulation = () => {
    const eaten = Math.floor(Math.random() * 30) + 20; // 20-50g arası sanal tüketim
    const now = new Date();
    const timeStr = now.toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" });

    // Tüketimi ve geçmiş kaydını tek bir atomik güncellemede yaz
    const newKey = push(ref(db, "history/today")).key;
    const updates: Record<string, any> = {};
    updates["deviceState/consumedToday"] = consumed + eaten;
    if (newKey) updates[`history/today/${newKey}`] = { time: timeStr, amount: eaten };
    update(ref(db), updates);
  };

  const resetDay = () => {
    const updates: Record<string, any> = {};
    updates["deviceState/consumedToday"] = 0;
    updates["deviceState/battery"] = 100;
    updates["deviceState/status"] = "Normal";
    updates["history/today"] = null; // Grafiği temizle
    update(ref(db), updates);
  };

  // Yükleme Ekranı
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400 text-sm">
        Sistem yükleniyor...
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 text-slate-200 flex flex-col items-center px-4 pb-40">
      {/* Üst Başlık */}
      <header className="w-full max-w-md flex justify-between items-center py-4 mb-4 border-b border-slate-800/50">
        <div>
          <h1 className="text-xl font-black bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
            Akıllı Mama Kabı
          </h1>
          <p className="text-[10px] font-medium tracking-widest text-slate-500 uppercase mt-1">
            Canlı Takip Paneli
          </p>
        </div>
        <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-1 rounded bg-slate-800 text-slate-300 border border-slate-700">
          {isAdmin ? "Yetkili" : "Ziyaretçi"}
        </span>
      </header>

      {/* Durum Kartları */}
      <div className="w-full max-w-md grid grid-cols-3 gap-3 mb-6">
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-3 flex flex-col items-center justify-center">
          <span className="text-[10px] text-slate-400 uppercase tracking-wider mb-1">Batarya</span>
          <span className={text-lg font-bold ${getBatteryColor(deviceState.battery)}}>
            %{deviceState.battery}
          </span>
        </div>
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-3 flex flex-col items-center justify-center">
          <span className="text-[10px] text-slate-400 uppercase tracking-wider mb-1">Kasedeki</span>
          <span className="text-lg font-bold text-slate-200">{deviceState.currentWeight}g</span>
        </div>
        <div
          className={`border rounded-xl p-3 flex flex-col items-center justify-center transition-colors duration-500 ${
            deviceState.status === "Dolum Yapiliyor"
              ? "bg-indigo-900/40 border-indigo-500"
              : "bg-slate-800/50 border-slate-700"
          }`}
        >
          <span className="text-[10px] text-slate-400 uppercase tracking-wider mb-1">Durum</span>
          <span
            className={`text-xs text-center font-bold ${
              deviceState.status === "Dolum Yapiliyor"
                ? "text-indigo-400 animate-pulse"
                : deviceState.status === "Kap Yok"
                ? "text-rose-500"
                : "text-emerald-500"
            }`}
          >
            {deviceState.status || "Aktif"}
          </span>
        </div>
      </div>

      {/* Hedef Çemberi */}
      <section className="relative flex items-center justify-center w-72 h-72 my-4">
        <svg className="absolute w-full h-full transform -rotate-90" viewBox="0 0 288 288">
          {/* Dış Aşım Çemberi */}
          {isOvereating && (
            <>
              <circle
                cx="144"
                cy="144"
                r={outR}
                stroke="currentColor"
                strokeWidth="8"
                fill="transparent"
                className="text-slate-800"
              />
              <circle
                cx="144"
                cy="144"
                r={outR}
                stroke="currentColor"
                strokeWidth="8"
                fill="transparent"
                strokeDasharray={outCirc}
                strokeDashoffset={outCirc - (secondaryPercentage / 100) * outCirc}
                strokeLinecap="round"
                className={`transition-all duration-1000 ease-out ${getSecondaryColor(
                  secondaryPercentage
                )}`}
              />
            </>
          )}
          {/* İç Hedef Çemberi */}
          <circle
            cx="144"
            cy="144"
            r={r}
            stroke="currentColor"
            strokeWidth="14"
            fill="transparent"
            className="text-slate-800"
          />
          <circle
            cx="144"
            cy="144"
            r={r}
            stroke="currentColor"
            strokeWidth="14"
            fill="transparent"
            strokeDasharray={circ}
            strokeDashoffset={circ - (primaryPercentage / 100) * circ}
            strokeLinecap="round"
            className={`transition-all duration-1000 ease-out ${
              primaryPercentage >= 100 ? "text-emerald-500" : "text-emerald-400"
            }`}
          />
        </svg>
        <div className="absolute flex flex-col items-center justify-center text-center">
          <span className="text-5xl font-black text-white tracking-tighter">
            {consumed}
            <span className="text-2xl text-slate-400">g</span>
          </span>
          <span className="text-xs uppercase tracking-widest font-semibold text-slate-400 mt-1">
            Yenilen
          </span>
          <span className="text-sm font-medium text-slate-300 mt-3 bg-slate-800 border border-slate-700 px-3 py-1 rounded-full">
            Hedef: {dailyGoal}g
          </span>
        </div>
      </section>

      {/* Günlük Öğün Grafiği */}
      <div className="w-full max-w-md bg-slate-800/30 border border-slate-800 rounded-2xl p-4 mt-6">
        <h3 className="text-sm font-bold text-slate-300 mb-4 flex items-center justify-between">
          Günlük Öğün Geçmişi
          {dailyHistory.length === 0 && (
            <span className="text-[9px] bg-slate-800 text-slate-500 px-2 py-1 rounded border border-slate-700">
              Bekleniyor...
            </span>
          )}
        </h3>
        <div className="h-40 w-full">
          {dailyHistory.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dailyHistory} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                <XAxis
                  dataKey="time"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10, fill: "#64748b" }}
                  dy={10}
                />
                <Tooltip
                  cursor={{ fill: "#334155", opacity: 0.4 }}
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-slate-900 border border-slate-700 p-2 rounded shadow-xl text-xs">
                          <p className="text-slate-400 mb-1">{label}</p>
                          <p className="text-emerald-400 font-bold">{Tüketim: ${payload[0].value}g}</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="amount" radius={[4, 4, 0, 0]}>
                  {dailyHistory.map((_, index) => (
                    <Cell key={cell-${index}} fill="#10b981" />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="w-full h-full flex items-center justify-center text-xs text-slate-600 border border-dashed border-slate-700 rounded-lg">
              Henüz öğün kaydedilmedi
            </div>
          )}
        </div>
      </div>

      {/* Admin Test Paneli (DevConsole) */}
      {isAdmin && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 w-[90%] max-w-md bg-slate-900/95 backdrop-blur-md p-4 rounded-2xl shadow-2xl border border-indigo-500/30 z-50">
          <h3 className="text-indigo-400 text-xs font-bold mb-3 uppercase tracking-wider flex items-center gap-2">
            🛠️ Simülasyon Paneli
          </h3>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={triggerMealSimulation}
              className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs py-2 rounded-lg font-medium transition-colors border border-indigo-400/50"
            >
              🍖 Öğün Tetikle
            </button>
            <button
              onClick={resetDay}
              className="bg-rose-950/60 hover:bg-rose-900 text-rose-300 text-xs py-2 rounded-lg font-medium transition-colors border border-rose-800"
            >
              🔄 Geçmişi Sıfırla
            </button>
          </div>
        </div>
      )}
    </main>
  );
}