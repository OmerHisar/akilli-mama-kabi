'use client';

import { useEffect, useState } from 'react';
import { getDatabase, ref, onValue } from 'firebase/database';
import { app } from '../lib/firebase';

export default function GoalCircle() {
  const [consumed, setConsumed] = useState(0);
  const [goal, setGoal] = useState(250); // Varsayılan hedef: 250g

  useEffect(() => {
    // Firebase veritabanı bağlantısı
    const db = getDatabase(app);
    const consumedRef = ref(db, 'telemetry/dailyConsumed');
    const goalRef = ref(db, 'settings/dailyGoal');

    // Tüketim verisini canlı dinle
    const unsubConsumed = onValue(consumedRef, (snapshot) => {
      if (snapshot.exists()) setConsumed(snapshot.val());
    });

    // Hedef verisini canlı dinle
    const unsubGoal = onValue(goalRef, (snapshot) => {
      if (snapshot.exists()) setGoal(snapshot.val());
    });

    // Bileşen ekrandan kalktığında dinlemeyi durdur
    return () => {
      unsubConsumed();
      unsubGoal();
    };
  }, []);

  // Yüzdelik hesaplama
  const percentage = goal > 0 ? (consumed / goal) * 100 : 0;
  
  // İç çember (0-100%) renk hesaplama (Griden Yeşile geçiş)
  const getInnerColor = (pct: number) => {
    const p = Math.min(pct, 100) / 100;
    const r = Math.round(148 + (34 - 148) * p);
    const g = Math.round(163 + (197 - 163) * p);
    const b = Math.round(184 + (94 - 184) * p);
    return `rgb(${r}, ${g}, ${b})`;
  };

  // Dış çember (101-200%) renk hesaplama (Sarıdan Kırmızıya geçiş)
  const getOuterColor = (pct: number) => {
    const p = Math.min(Math.max(pct - 100, 0), 100) / 100;
    const r = Math.round(234 + (239 - 234) * p);
    const g = Math.round(179 + (68 - 179) * p);
    const b = Math.round(8 + (68 - 8) * p);
    return `rgb(${r}, ${g}, ${b})`;
  };

  // Çemberlerin matematiksel çevre hesaplamaları
  const innerRadius = 75;
  const outerRadius = 95;
  const innerCircumference = 2 * Math.PI * innerRadius;
  const outerCircumference = 2 * Math.PI * outerRadius;

  // Çizgi boşluk (doluluk) hesaplamaları
  const innerOffset = innerCircumference - (innerCircumference * Math.min(percentage, 100)) / 100;
  const outerOffset = outerCircumference - (outerCircumference * Math.min(Math.max(percentage - 100, 0), 100)) / 100;

  return (
    <div className="relative flex items-center justify-center w-64 h-64">
      <svg className="absolute w-full h-full transform -rotate-90">
        {/* Dış Çember Arkaplan (Sadece %100 aşılırsa belirir) */}
        {percentage > 100 && (
          <circle
            cx="128" cy="128" r={outerRadius}
            fill="transparent"
            stroke="rgba(255,255,255,0.05)"
            strokeWidth="8"
          />
        )}
        
        {/* Dış Çember (Fazla Tüketim Çizgisi) */}
        {percentage > 100 && (
          <circle
            cx="128" cy="128" r={outerRadius}
            fill="transparent"
            stroke={getOuterColor(percentage)}
            strokeWidth="8"
            strokeDasharray={outerCircumference}
            strokeDashoffset={outerOffset}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
          />
        )}
        
        {/* İç Çember Arkaplan */}
        <circle
          cx="128" cy="128" r={innerRadius}
          fill="transparent"
          stroke="rgba(255,255,255,0.1)"
          strokeWidth="12"
        />
        
        {/* İç Çember (Günlük Hedef Çizgisi) */}
        <circle
          cx="128" cy="128" r={innerRadius}
          fill="transparent"
          stroke={getInnerColor(percentage)}
          strokeWidth="12"
          strokeDasharray={innerCircumference}
          strokeDashoffset={innerOffset}
          strokeLinecap="round"
          className="transition-all duration-1000 ease-out"
        />
      </svg>
      
      {/* Merkezdeki Yazılar */}
      <div className="absolute flex flex-col items-center justify-center text-center">
        <span className="text-4xl font-bold">{Math.round(consumed)}<span className="text-xl">g</span></span>
        <span className="text-sm text-slate-400 mt-1">/ {goal}g Hedef</span>
        
        {percentage > 100 && (
          <span className="text-xs text-red-400 font-bold mt-2 px-2 py-1 bg-red-950/30 rounded-full">
            +%{(percentage - 100).toFixed(0)} Fazla
          </span>
        )}
      </div>
    </div>
  );
}