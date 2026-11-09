import { useState, useEffect } from "react";
import { ref, onValue } from "firebase/database";
import { db } from "../lib/firebase";

export interface DeviceState {
  currentWeight: number;
  consumedToday: number;
  battery: number;
  status: string; // "Normal", "Dolum Yapılıyor", "Kap Yok"
}

export interface Settings {
  dailyGoal: number;
}

export const useDeviceData = () => {
  const [deviceState, setDeviceState] = useState<DeviceState>({
    currentWeight: 0,
    consumedToday: 0,
    battery: 100,
    status: "Bilinmiyor",
  });
  
  const [settings, setSettings] = useState<Settings>({
    dailyGoal: 250, // Varsayılan hedef
  });

  useEffect(() => {
    const stateRef = ref(db, "deviceState");
    const settingsRef = ref(db, "settings");

    // deviceState yolunu sürekli dinle
    const unsubscribeState = onValue(stateRef, (snapshot) => {
      if (snapshot.exists()) {
        setDeviceState(snapshot.val());
      }
    });

    // settings yolunu sürekli dinle
    const unsubscribeSettings = onValue(settingsRef, (snapshot) => {
      if (snapshot.exists()) {
        setSettings(snapshot.val());
      }
    });

    return () => {
      unsubscribeState();
      unsubscribeSettings();
    };
  }, []);

  return { deviceState, settings };
};
