'use client';

import { useEffect, useState } from 'react';
import { getDatabase, ref, onValue } from 'firebase/database';
import { app } from '../lib/firebase';
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface ChartData {
  day: string;
  amount: number;
}

// Firebase'de veri yoksa gösterilecek örnek (silik) veri şablonu
const fallbackData: ChartData[] = [
  { day: 'Pzt', amount: 240 },
  { day: 'Sal', amount: 260 },
  { day: 'Çar', amount: 220 },
  { day: 'Per', amount: 280 },
  { day: 'Cum', amount: 250 },
  { day: 'Cmt', amount: 210 },
  { day: 'Paz', amount: 270 },
];

export default function WeeklyChart() {
  const [data, setData] = useState<ChartData[]>([]);
  const [isRealData, setIsRealData] = useState(false);

  useEffect(() => {
    const db = getDatabase(app);
    const historyRef = ref(db, 'history/weekly');

    const unsub = onValue(historyRef, (snapshot) => {
      if (snapshot.exists()) {
        setData(snapshot.val());
        setIsRealData(true);
      } else {
        setData(fallbackData);
        setIsRealData(false);
      }
    });

    return () => unsub();
  }, []);

  // Tooltip (Fare ile üzerine gelince çıkan kutucuk) özelleştirmesi
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-800 border border-slate-700 p-2 rounded shadow-xl text-xs">
          <p className="text-slate-300 mb-1 font-bold">{label}</p>
          <p className="text-emerald-400">{`Tüketim: ${payload[0].value}g`}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full max-w-md bg-slate-800/30 border border-slate-800 rounded-2xl p-4 mt-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-sm font-bold text-slate-300">Haftalık Tüketim Özeti</h3>
        {!isRealData && <span className="text-[9px] bg-slate-800 text-slate-500 px-2 py-1 rounded">Örnek Veri</span>}
      </div>
      
      <div className="h-48 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
            <XAxis 
              dataKey="day" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fontSize: 10, fill: '#64748b' }} 
              dy={10}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: '#334155', opacity: 0.4 }} />
            <Bar dataKey="amount" radius={[4, 4, 0, 0]}>
              {data.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={isRealData ? '#10b981' : '#334155'} // Gerçek veri yeşil, sahte veri gri
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}