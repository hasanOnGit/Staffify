import { useState, useEffect } from "react";
import { WifiOff, Wifi, RefreshCw } from "lucide-react";

function NetworkStatusBanner() {
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== "undefined" ? navigator.onLine : true
  );
  const [wasOffline, setWasOffline] = useState(false);
  const [showReconnected, setShowReconnected] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      if (wasOffline) {
        setShowReconnected(true);
        const timer = setTimeout(() => {
          setShowReconnected(false);
          setWasOffline(false);
        }, 3500);
        return () => clearTimeout(timer);
      }
    };

    const handleOffline = () => {
      setIsOnline(false);
      setWasOffline(true);
      setShowReconnected(false);
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [wasOffline]);

  if (isOnline && !showReconnected) return null;

  if (!isOnline) {
    return (
      <div className="bg-[#DE350B] text-white px-4 py-1.5 text-xs font-semibold flex items-center justify-between gap-2 shadow-sm animate-fadeIn">
        <div className="flex items-center gap-2 mx-auto">
          <WifiOff size={14} className="animate-pulse" />
          <span>Offline Mode: Network connection lost. Inputs are cached and will sync once reconnected.</span>
        </div>
        <button
          onClick={() => window.location.reload()}
          className="text-white/80 hover:text-white flex items-center gap-1 text-[11px] underline cursor-pointer"
        >
          <RefreshCw size={12} />
          <span>Retry</span>
        </button>
      </div>
    );
  }

  if (showReconnected) {
    return (
      <div className="bg-[#00875A] text-white px-4 py-1.5 text-xs font-semibold flex items-center justify-center gap-2 shadow-sm animate-fadeIn">
        <Wifi size={14} />
        <span>Reconnected: Secure connection to Staffify Cloud restored.</span>
      </div>
    );
  }

  return null;
}

export default NetworkStatusBanner;
