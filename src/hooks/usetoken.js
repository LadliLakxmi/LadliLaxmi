// hooks/useToken.js
import { useSyncExternalStore } from "react";

export function useToken() {
  const subscribe = (callback) => {
    window.addEventListener("storage", callback);
    const interval = setInterval(callback, 500); // fallback
    return () => {
      clearInterval(interval);
      window.removeEventListener("storage", callback);
    };
  };

  const getSnapshot = () => localStorage.getItem("token");

  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}
