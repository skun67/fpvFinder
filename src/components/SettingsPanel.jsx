import { Settings, X, Info } from "lucide-react";
import { useState } from "react";

/**
 * Settings Panel component - Apple-style liquid glass design
 */
export default function SettingsPanel({ isMockMode, onToggleMockMode }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Settings Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="absolute top-4 right-4 z-[1100] bg-gray-900/60 hover:bg-gray-900/80 text-gray-300 p-2.5 rounded-2xl backdrop-blur-xl border border-white/10 transition-all hover:scale-105 active:scale-95"
        aria-label="Ustawienia"
      >
        <Settings className="w-5 h-5" />
      </button>

      {/* Settings Modal */}
      {isOpen && (
        <div className="absolute inset-0 z-[1200] flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          />

          {/* Modal Content */}
          <div className="relative bg-gray-900/90 backdrop-blur-xl rounded-3xl border border-white/10 p-6 w-full max-w-sm shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">Ustawienia</h2>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 p-2 rounded-xl transition-colors"
                aria-label="Zamknij"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Mock Mode Toggle */}
            <div className="mb-6">
              <label className="flex items-center justify-between cursor-pointer bg-white/5 rounded-2xl p-4 border border-white/10">
                <div className="flex-1">
                  <div className="text-white font-medium mb-1">
                    Tryb symulacji
                  </div>
                  <div className="text-sm text-gray-400">
                    Symuluj dane drona i GPS
                  </div>
                </div>
                <button
                  onClick={onToggleMockMode}
                  className={`ml-4 relative w-14 h-8 rounded-full transition-colors ${
                    isMockMode ? "bg-green-500" : "bg-gray-600"
                  }`}
                  aria-label={
                    isMockMode ? "Wyłącz symulację" : "Włącz symulację"
                  }
                >
                  <div
                    className={`absolute top-1 w-6 h-6 rounded-full bg-white shadow-lg transition-transform ${
                      isMockMode
                        ? "translate-x-7 bg-green-200"
                        : "translate-x-1 bg-gray-300"
                    }`}
                  />
                </button>
              </label>
            </div>

            {/* Info Card */}
            <div className="bg-white/5 rounded-2xl p-4 border border-white/10 mb-4">
              <div className="flex items-center gap-2 mb-3">
                <Info className="w-4 h-4 text-blue-400" />
                <h3 className="text-sm font-medium text-gray-300">
                  Informacje techniczne
                </h3>
              </div>
              <ul className="text-xs text-gray-400 space-y-1.5">
                <li className="flex items-center gap-2">
                  <span className="w-1 h-1 rounded-full bg-gray-500" />
                  Adres: 192.168.4.1
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1 h-1 rounded-full bg-gray-500" />
                  WebSocket: ws://192.168.4.1/ws
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1 h-1 rounded-full bg-gray-500" />
                  HTTP: http://192.168.4.1/api/telemetry
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1 h-1 rounded-full bg-gray-500" />
                  Aktualizacja: 1-5 Hz
                </li>
              </ul>
            </div>

            {/* Version */}
            <div className="text-center">
              <p className="text-xs text-gray-500">FPV Finder v1.0.0</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
