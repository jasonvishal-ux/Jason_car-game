
import React, { useState, useEffect, useCallback } from 'react';
import { GameState, CarStats } from './types';
import { CARS, GAME_DURATION } from './constants';
import GameScene from './components/GameScene';
import { getRaceCommentary, getCarLore } from './services/geminiService';
import { Trophy, Zap, Target, Gauge, ArrowRight, RotateCcw, Play, ChevronLeft, ChevronRight, ShieldAlert } from 'lucide-react';

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>(GameState.START_SCREEN);
  const [selectedCar, setSelectedCar] = useState<CarStats>(CARS[0]);
  const [carLore, setCarLore] = useState<string>("");
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION);
  const [isNitro, setIsNitro] = useState(false);
  const [isFiring, setIsFiring] = useState(false);
  const [hudStats, setHudStats] = useState({ speed: 0, ammo: 100, nitro: 100, score: 0 });
  const [commentary, setCommentary] = useState<string>("");

  useEffect(() => {
    if (gameState === GameState.CAR_SELECTION) {
      setCarLore("Retrieving technical dossier...");
      getCarLore(selectedCar.name).then(setCarLore);
    }
  }, [selectedCar, gameState]);

  useEffect(() => {
    let timer: number;
    if (gameState === GameState.PLAYING && timeLeft > 0) {
      timer = window.setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft <= 0 && gameState === GameState.PLAYING) {
      setGameState(GameState.GAME_OVER);
    }
    return () => clearInterval(timer);
  }, [gameState, timeLeft]);

  useEffect(() => {
    if (gameState === GameState.GAME_OVER) {
      const performance = hudStats.score > 2000 ? "Masterful" : hudStats.score > 1000 ? "Veteran" : "Amateur";
      getRaceCommentary(selectedCar.name, performance).then(setCommentary);
    }
  }, [gameState, selectedCar.name, hudStats.score]);

  const startGameplay = () => {
    setTimeLeft(GAME_DURATION);
    setHudStats({ speed: 0, ammo: 100, nitro: 100, score: 0 });
    setGameState(GameState.PLAYING);
  };

  const handleUpdateHUD = useCallback((stats: { speed: number; ammo: number; nitro: number; score: number }) => {
    setHudStats(stats);
  }, []);

  // Keyboard controls for Nitro and Guns
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'ArrowUp' || e.code === 'Space') setIsNitro(true);
      if (e.code === 'KeyF' || e.code === 'KeyX') setIsFiring(true);
    };
    const onKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'ArrowUp' || e.code === 'Space') setIsNitro(false);
      if (e.code === 'KeyF' || e.code === 'KeyX') setIsFiring(false);
    };
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
    };
  }, []);

  return (
    <div className="relative w-screen h-screen font-sans bg-[#020205] overflow-hidden text-white">
      {/* Global Vignette */}
      <div className="absolute inset-0 z-0 pointer-events-none shadow-[inset_0_0_150px_rgba(0,0,0,0.8)]"></div>

      {gameState === GameState.START_SCREEN && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center text-center p-6 bg-[radial-gradient(circle_at_center,rgba(20,40,100,0.2)_0%,transparent_70%)]">
          <div className="mb-2 px-3 py-1 bg-cyan-500/20 text-cyan-400 text-xs font-black tracking-widest rounded border border-cyan-500/30 uppercase">
            Gemini Enhanced Racing Engine
          </div>
          <h1 className="text-7xl md:text-9xl font-black italic tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white via-cyan-200 to-blue-600 mb-6 drop-shadow-2xl">
            NITRO BLAZE
          </h1>
          <p className="text-xl text-slate-400 mb-10 max-w-lg leading-relaxed font-light tracking-wide">
            Ultimate 3D racing simulator. Deploy weapons, ignite nitro, and survive the digital track.
          </p>
          <button 
            onClick={() => setGameState(GameState.CAR_SELECTION)}
            className="group relative flex items-center gap-4 bg-white hover:bg-cyan-50 text-black text-2xl px-14 py-5 rounded-sm font-black transition-all transform hover:scale-105 active:scale-95 skew-x-[-10deg]"
          >
            <span className="skew-x-[10deg] flex items-center gap-3 uppercase tracking-tighter">
              Initiate Grid <ArrowRight className="w-6 h-6" />
            </span>
          </button>
        </div>
      )}

      {gameState === GameState.CAR_SELECTION && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black/90 backdrop-blur-xl p-8 overflow-y-auto">
          <h2 className="text-5xl font-black mb-12 text-white uppercase italic tracking-tighter border-b-8 border-cyan-500 pb-2">Hangar: Select Machine</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl w-full mb-12">
            {CARS.map(car => (
              <div 
                key={car.id}
                onClick={() => setSelectedCar(car)}
                className={`group cursor-pointer relative bg-slate-900/40 border-t border-slate-700/50 rounded-lg p-8 transition-all duration-300 transform ${selectedCar.id === car.id ? 'bg-cyan-900/20 border-cyan-500/50 shadow-[0_0_40px_rgba(0,255,255,0.1)] scale-105' : 'hover:bg-slate-800/50 grayscale hover:grayscale-0'}`}
              >
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-100 transition-opacity">
                    <ShieldAlert className="w-6 h-6 text-cyan-400" />
                </div>
                
                <div className="mb-8 h-20 flex items-end">
                    <div className="w-full h-4 rounded-full blur-[2px]" style={{ backgroundColor: car.color, boxShadow: `0 0 30px ${car.color}` }}></div>
                </div>
                
                <h3 className="text-3xl font-black text-white italic tracking-tighter leading-none mb-1">{car.name}</h3>
                <p className="text-xs text-cyan-400 font-bold mb-6 tracking-widest uppercase opacity-80">{car.brand}</p>
                
                <div className="space-y-4">
                  {[
                    { label: 'VELOCITY', val: (car.topSpeed / 300) * 100, color: 'bg-white' },
                    { label: 'ACCEL', val: car.acceleration * 100, color: 'bg-cyan-400' },
                    { label: 'FORCE', val: car.firepower, color: 'bg-red-500' }
                  ].map(stat => (
                    <div key={stat.label} className="space-y-1">
                      <div className="flex justify-between text-[9px] font-black tracking-widest text-slate-500">
                        <span>{stat.label}</span>
                        <span className="text-white">{Math.round(stat.val)}</span>
                      </div>
                      <div className="h-[2px] bg-slate-800 rounded-full overflow-hidden">
                        <div className={`h-full ${stat.color} transition-all duration-700`} style={{ width: `${stat.val}%` }}></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="w-full max-w-2xl bg-slate-900/80 border border-slate-800 p-8 rounded-lg mb-10 flex flex-col items-center">
             <p className="text-cyan-400 font-black text-[10px] tracking-[0.3em] uppercase mb-4">Intel Log</p>
             <p className="text-xl text-slate-200 italic leading-relaxed text-center font-light">
                "{carLore}"
             </p>
          </div>

          <button 
            onClick={startGameplay}
            className="bg-cyan-500 hover:bg-cyan-400 text-black px-16 py-5 rounded-sm text-2xl font-black uppercase tracking-tighter transition-all hover:scale-110 shadow-[0_0_30px_rgba(34,211,238,0.4)]"
          >
            Engage System
          </button>
        </div>
      )}

      {gameState === GameState.PLAYING && (
        <>
          <GameScene 
            selectedCar={selectedCar} 
            isNitro={isNitro} 
            isFiring={isFiring}
            onUpdateHUD={handleUpdateHUD} 
          />
          
          <div className="absolute inset-0 pointer-events-none p-10 flex flex-col justify-between">
            {/* Top Bar HUD */}
            <div className="flex justify-between items-start">
              <div className="flex gap-6">
                <div className="bg-black/60 border border-white/10 backdrop-blur-md px-8 py-4 rounded-sm flex flex-col items-center min-w-[120px]">
                  <p className="text-[10px] text-cyan-400 font-black uppercase tracking-[0.2em] mb-1">Time</p>
                  <p className={`text-4xl font-black tracking-tighter italic ${timeLeft < 10 ? 'text-red-500 animate-pulse' : 'text-white'}`}>
                    {timeLeft < 10 ? `0${timeLeft}` : timeLeft}
                  </p>
                </div>
                <div className="bg-black/60 border border-white/10 backdrop-blur-md px-8 py-4 rounded-sm flex flex-col items-center min-w-[150px]">
                  <p className="text-[10px] text-yellow-400 font-black uppercase tracking-[0.2em] mb-1">Score</p>
                  <p className="text-4xl font-black tracking-tighter text-white tabular-nums italic">
                    {hudStats.score.toLocaleString()}
                  </p>
                </div>
              </div>

              {/* Status Bars */}
              <div className="w-64 space-y-4">
                 <div className="bg-black/60 p-4 border border-white/10 backdrop-blur-md rounded-sm">
                    <div className="flex justify-between items-end mb-2">
                        <span className="text-[10px] font-black text-cyan-400 tracking-[0.2em] flex items-center gap-2 uppercase">
                            <Zap className="w-3 h-3" /> Nitro
                        </span>
                        <span className="text-xs font-black italic">{hudStats.nitro}%</span>
                    </div>
                    <div className="h-1 bg-slate-900 overflow-hidden">
                        <div className="h-full bg-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.8)]" style={{ width: `${hudStats.nitro}%` }}></div>
                    </div>
                 </div>

                 <div className="bg-black/60 p-4 border border-white/10 backdrop-blur-md rounded-sm">
                    <div className="flex justify-between items-end mb-2">
                        <span className="text-[10px] font-black text-red-500 tracking-[0.2em] flex items-center gap-2 uppercase">
                            <Target className="w-3 h-3" /> Weapon System
                        </span>
                        <span className="text-xs font-black italic">{hudStats.ammo}%</span>
                    </div>
                    <div className="h-1 bg-slate-900 overflow-hidden">
                        <div className="h-full bg-red-600 shadow-[0_0_10px_rgba(255,0,0,0.8)]" style={{ width: `${hudStats.ammo}%` }}></div>
                    </div>
                 </div>
              </div>
            </div>

            {/* Bottom Bar HUD */}
            <div className="flex justify-between items-end">
                {/* Speedometer */}
                <div className="relative">
                    <div className="absolute inset-0 bg-cyan-500/10 blur-3xl rounded-full"></div>
                    <div className="bg-black/80 backdrop-blur-xl rounded-full w-48 h-48 flex flex-col items-center justify-center border-2 border-white/5 shadow-[0_0_40px_rgba(0,0,0,0.5)]">
                        <span className="text-7xl font-black text-white italic tracking-tighter leading-none">{hudStats.speed}</span>
                        <span className="text-[10px] text-slate-400 font-black tracking-widest mt-1 uppercase">Kilometers / Hour</span>
                        <div className="absolute bottom-6 w-24 h-1 bg-slate-900 rounded-full overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-cyan-400 to-blue-600" style={{ width: `${Math.min(100, (hudStats.speed/300)*100)}%` }}></div>
                        </div>
                    </div>
                </div>

                {/* Mobile/Touch Controls Visuals */}
                <div className="flex gap-4 pointer-events-auto sm:hidden">
                    <div className="flex flex-col gap-2">
                        <button className="w-20 h-20 bg-black/60 rounded-full flex items-center justify-center border border-white/20 active:bg-cyan-500 active:scale-90 transition-all">
                            <ChevronLeft className="w-8 h-8" />
                        </button>
                    </div>
                    <div className="flex flex-col gap-2">
                        <button className="w-20 h-20 bg-black/60 rounded-full flex items-center justify-center border border-white/20 active:bg-cyan-500 active:scale-90 transition-all">
                            <ChevronRight className="w-8 h-8" />
                        </button>
                    </div>
                </div>

                {/* Control Tooltips */}
                <div className="hidden sm:flex flex-col items-end gap-2 text-slate-500 font-black italic tracking-tighter uppercase">
                    <div className="flex items-center gap-3">
                        <span className="bg-white/10 px-2 py-1 rounded text-[10px] text-white">ARROWS</span>
                        <span className="text-xs">Precision Steering</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <span className="bg-white/10 px-2 py-1 rounded text-[10px] text-white">UP / SPACE</span>
                        <span className="text-xs text-cyan-400">Plasma Nitro</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <span className="bg-white/10 px-2 py-1 rounded text-[10px] text-white">F / X</span>
                        <span className="text-xs text-red-500">Auto Cannons</span>
                    </div>
                </div>
            </div>
          </div>
        </>
      )}

      {gameState === GameState.GAME_OVER && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-[#020205] p-6 text-center animate-in fade-in duration-1000">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(34,211,238,0.1),transparent_70%)]"></div>
          
          <Trophy className="w-32 h-32 text-yellow-400 mb-8 drop-shadow-[0_0_50px_rgba(250,204,21,0.4)]" />
          <h2 className="text-8xl font-black text-white italic tracking-tighter mb-4 leading-none">OPERATION COMPLETE</h2>
          <div className="text-4xl font-black text-cyan-400 mb-12 italic border-y border-cyan-500/30 py-4 px-10">
            TOTAL SCORE: {hudStats.score.toLocaleString()}
          </div>
          
          <div className="max-w-2xl bg-white/5 backdrop-blur-md border border-white/10 p-10 rounded-lg mb-16 relative">
             <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-cyan-600 px-6 py-1 text-[10px] font-black rounded-sm text-black uppercase tracking-widest">
                AI Debriefing
             </div>
             <p className="text-2xl text-slate-100 italic leading-relaxed font-light">
                "{commentary || "Synthesizing race results and pilot performance..."}"
             </p>
          </div>

          <div className="flex gap-6">
            <button 
                onClick={() => setGameState(GameState.CAR_SELECTION)}
                className="flex items-center gap-3 bg-white/5 hover:bg-white/10 text-white px-10 py-4 rounded-sm font-black italic tracking-tighter uppercase transition-all"
            >
                <RotateCcw className="w-5 h-5" /> Re-Select Machine
            </button>
            <button 
                onClick={startGameplay}
                className="flex items-center gap-3 bg-cyan-500 hover:bg-cyan-400 text-black px-14 py-4 rounded-sm font-black italic tracking-tighter uppercase transition-all shadow-xl"
            >
                <Play className="w-5 h-5 fill-current" /> Initialize Reboot
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
