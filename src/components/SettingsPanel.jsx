import { Settings, ToggleLeft, ToggleRight, X } from "lucide-react";
import { useState } from "react";

/**
 * Settings Panel component - allows toggling mock mode for development
 */
export default function SettingsPanel({ isMockMode, onToggleMockMode }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Settings Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="absolute top-4 right-4 z-[1100] bg-gray-900/80 hover:bg-gray-800 text-gray-300 p-2 rounded-lg backdrop-blur-sm border border-gray-700 transition-colors"
        aria-label="Ustawienia"
      >
        <Settings className="w-5 h-5" />
      </button>

      {/* Settings Modal */}
      {isOpen && (
        <div className="absolute inset-0 z-[1200] flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          />

          {/* Modal Content */}
          <div className="relative bg-gray-900 rounded-xl border border-gray-700 p-6 w-full max-w-sm shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">Ustawienia</h2>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-white transition-colors"
                aria-label="Zamknij"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Mock Mode Toggle */}
            <div className="mb-6">
              <label className="flex items-center justify-between cursor-pointer">
                <div className="flex-1">
                  <div className="text-white font-medium mb-1">
                    Tryb symulacji
                  </div>
                  <div className="text-sm text-gray-400">
                    Symuluj dane drona i GPS (do testów)
                  </div>
                </div>
                <button
                  onClick={onToggleMockMode}
                  className={`ml-4 flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                    isMockMode
                      ? "bg-green-600 text-white"
                      : "bg-gray-700 text-gray-300"
                  }`}
                  aria-label={
                    isMockMode ? "Wyłącz symulację" : "Włącz symulację"
                  }
                >
                  {isMockMode ? (
                    <>
                      <ToggleRight className="w-6 h-6" />
                      <span className="text-sm font-medium">WŁ</span>
                    </>
                  ) : (
                    <>
                      <ToggleLeft className="w-6 h-6" />
                      <span className="text-sm font-medium">WYŁ</span>
                    </>
                  )}
                </button>
              </label>
            </div>

            {/* Info */}
            <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
              <h3 className="text-sm font-medium text-gray-300 mb-2">
                Informacje
              </h3>
              <ul className="text-xs text-gray-400 space-y-1">
                <li>• Adres Backpack: 192.168.4.1</li>
                <li>• WebSocket: ws://192.168.4.1/ws</li>
                <li>• HTTP: http://192.168.4.1/api/telemetry</li>
                <li>• Aktualizacja: 1-5 Hz</li>
              </ul>
            </div>

            {/* Version */}
            <div className="mt-4 text-center">
              <p className="text-xs text-gray-500">FPV Finder v1.0.0</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
