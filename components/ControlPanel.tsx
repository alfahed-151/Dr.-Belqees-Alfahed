
import React from 'react';
import { PlayIcon, ResetIcon } from './icons';

interface ControlPanelProps {
  voltage: number;
  current: number;
  crystalAngle: number;
  setCrystalAngle: (angle: number) => void;
  isScanning: boolean;
  onStartScan: () => void;
  onReset: () => void;
  scanProgress: number;
}

const ControlPanel: React.FC<ControlPanelProps> = ({
  voltage,
  current,
  crystalAngle,
  setCrystalAngle,
  isScanning,
  onStartScan,
  onReset,
  scanProgress
}) => {
  return (
    <div className="p-6 bg-gray-800/50 rounded-lg shadow-2xl border border-gray-700 space-y-6 h-full flex flex-col">
      <h2 className="text-2xl font-bold text-cyan-400 border-b-2 border-cyan-500/30 pb-2">Experiment Controls</h2>
      
      {/* Settings */}
      <div className="space-y-4">
        <div>
          <label htmlFor="voltage" className="block text-sm font-medium text-gray-400">Anode Voltage</label>
          <div className="flex items-center justify-between mt-1 text-lg font-mono bg-gray-900 px-3 py-2 rounded-md">
            <span>{voltage / 1000}</span>
            <span className="text-cyan-400">kV</span>
          </div>
          <p className="text-xs text-gray-500 mt-1">Set to 30kV as per the experimental procedure.</p>
        </div>
        
        <div>
          <label htmlFor="current" className="block text-sm font-medium text-gray-400">Filament Current</label>
          <div className="flex items-center justify-between mt-1 text-lg font-mono bg-gray-900 px-3 py-2 rounded-md">
            <span>{current * 1000}</span>
            <span className="text-cyan-400">mA</span>
          </div>
           <p className="text-xs text-gray-500 mt-1">Set to 1mA as per the experimental procedure.</p>
        </div>

        <div>
            <label htmlFor="crystalAngle" className="block text-sm font-medium text-gray-400">Crystal Angle (θ<sub className="text-xs">t</sub>)</label>
            <div className="flex items-center space-x-4 mt-1">
                <input
                    id="crystalAngle"
                    type="range"
                    min="1"
                    max="20"
                    step="0.1"
                    value={crystalAngle}
                    onChange={(e) => setCrystalAngle(Number(e.target.value))}
                    disabled={isScanning}
                    className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-cyan-500 disabled:opacity-50"
                />
                <div className="w-24 text-center text-lg font-mono bg-gray-900 px-3 py-2 rounded-md">
                    {crystalAngle.toFixed(1)}<span className="text-cyan-400">°</span>
                </div>
            </div>
             <p className="text-xs text-gray-500 mt-1">Adjust this to manually explore or press 'Start Full Scan'.</p>
        </div>
      </div>
      
      {/* Actions */}
      <div className="pt-4 mt-auto">
        <div className="w-full bg-gray-700 rounded-full h-2.5 mb-4">
            <div className="bg-cyan-500 h-2.5 rounded-full" style={{ width: `${scanProgress}%` }}></div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={onStartScan}
            disabled={isScanning}
            className="flex items-center justify-center px-4 py-3 bg-cyan-600 text-white font-bold rounded-lg shadow-md hover:bg-cyan-500 disabled:bg-gray-600 disabled:cursor-not-allowed transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-cyan-500"
          >
            <PlayIcon className="w-5 h-5 mr-2" />
            <span>{isScanning ? 'Scanning...' : 'Start Full Scan'}</span>
          </button>
          <button
            onClick={onReset}
            disabled={isScanning}
            className="flex items-center justify-center px-4 py-3 bg-red-600 text-white font-bold rounded-lg shadow-md hover:bg-red-500 disabled:bg-gray-600 disabled:cursor-not-allowed transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-red-500"
          >
            <ResetIcon className="w-5 h-5 mr-2" />
            <span>Reset</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ControlPanel;
