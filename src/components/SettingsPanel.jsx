import { Settings, X, Info } from "lucide-react";
import { useState } from "react";

export default function SettingsPanel({ isMockMode, onToggleMockMode }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="absolute right-5 top-5 z-[1100] rounded-2xl border border-white/10 bg-white/8 p-2.5 text-gray-100 shadow-[0_10px_30px_rgba(0,0,0,0.2)] backdrop-blur-2xl transition-all hover:scale-105 hover:bg-white/12 active:scale-95 sm:right-6 sm:top-6"
        aria-label="Ustawienia"
      >
        <Settings className="h-5 w-5" />
      </button>

      {isOpen && (
        <div className="absolute inset-0 z-[1200] flex items-center justify-center p-4 sm:p-6">
          <div
            className="absolute inset-0 bg-black/45 backdrop-blur-md"
            onClick={() => setIsOpen(false)}
          />

          <div className="relative w-full max-w-lg overflow-hidden rounded-[34px] border border-white/12 bg-[linear-gradient(180deg,rgba(14,20,31,0.88),rgba(14,20,31,0.96))] shadow-[0_30px_80px_rgba(0,0,0,0.5)] backdrop-blur-2xl">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.12),transparent_34%)]" />

            <div className="relative max-h-[calc(100vh-2rem)] overflow-y-auto px-6 pb-6 pt-6 text-center sm:px-7 sm:pb-7 sm:pt-7">
              <div className="mb-6 flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1 text-center">
                  <h2 className="text-2xl font-semibold tracking-tight text-white">
                    Ustawienia
                  </h2>
                  <p className="mt-1 text-sm leading-relaxed text-gray-400">
                    Delikatne ustawienia aplikacji i tryb testowy.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="shrink-0 rounded-2xl border border-white/10 bg-white/8 p-2 text-gray-300 transition-colors hover:bg-white/12 hover:text-white"
                  aria-label="Zamknij"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="rounded-[28px] border border-white/10 bg-white/7 p-5 text-center shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur-md">
                  <div className="flex flex-col items-center gap-4">
                    <div className="min-w-0">
                      <div className="text-base font-medium text-white">
                        Tryb symulacji
                      </div>
                      <div className="mt-1 text-sm leading-relaxed text-gray-400">
                        Symuluj dane drona i GPS, żeby wygodnie testować aplikację bez sprzętu.
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={onToggleMockMode}
                      className={`relative h-9 w-16 shrink-0 rounded-full border transition-colors ${
                        isMockMode
                          ? "border-emerald-400/30 bg-emerald-500"
                          : "border-white/10 bg-slate-600"
                      }`}
                      aria-label={
                        isMockMode ? "Wyłącz symulację" : "Włącz symulację"
                      }
                    >
                      <div
                        className={`absolute top-1 h-7 w-7 rounded-full bg-white shadow-[0_8px_18px_rgba(0,0,0,0.25)] transition-transform ${
                          isMockMode
                            ? "translate-x-7 bg-emerald-100"
                            : "translate-x-1 bg-gray-200"
                        }`}
                      />
                    </button>
                  </div>
                </div>

                <div className="rounded-[28px] border border-white/10 bg-white/7 p-5 text-center shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur-md">
                  <div className="mb-3 flex items-center justify-center gap-2">
                    <Info className="h-4 w-4 text-blue-400" />
                    <h3 className="text-sm font-medium uppercase tracking-[0.22em] text-gray-300">
                      Informacje techniczne
                    </h3>
                  </div>

                  <ul className="space-y-2 text-sm leading-relaxed text-gray-400">
                    <li className="flex items-start justify-center gap-2">
                      <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-gray-500" />
                      <span className="break-words">Adres: 192.168.4.1</span>
                    </li>
                    <li className="flex items-start justify-center gap-2">
                      <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-gray-500" />
                      <span className="break-words">
                        WebSocket: ws://192.168.4.1/ws
                      </span>
                    </li>
                    <li className="flex items-start justify-center gap-2">
                      <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-gray-500" />
                      <span className="break-words">
                        HTTP: http://192.168.4.1/api/telemetry
                      </span>
                    </li>
                    <li className="flex items-start justify-center gap-2">
                      <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-gray-500" />
                      <span>Aktualizacja: 1-5 Hz</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
