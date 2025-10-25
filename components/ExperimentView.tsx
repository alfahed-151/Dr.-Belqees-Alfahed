
import React from 'react';

interface ExperimentViewProps {
  crystalAngle: number;
}

const ExperimentView: React.FC<ExperimentViewProps> = ({ crystalAngle }) => {
  const sensorAngle = crystalAngle * 2;

  return (
    <div className="relative w-full h-full min-h-[300px] bg-gray-900 rounded-lg p-4 flex items-center justify-center overflow-hidden border border-gray-700">
      <svg width="100%" height="100%" viewBox="0 0 400 300" preserveAspectRatio="xMidYMid meet">
        {/* X-ray Tube */}
        <g transform="translate(30, 130)">
          <rect x="0" y="0" width="80" height="40" rx="5" ry="5" fill="#374151" />
          <text x="40" y="25" fill="#9ca3af" textAnchor="middle" fontSize="10">X-Ray Tube</text>
          <line x1="80" y1="20" x2="150" y2="20" stroke="#06b6d4" strokeWidth="2" strokeDasharray="4 2">
             <animate attributeName="stroke-dashoffset" from="100" to="0" dur="2s" repeatCount="indefinite" />
          </line>
          <text x="115" y="15" fill="#06b6d4" textAnchor="middle" fontSize="8">X-Rays</text>
        </g>
        
        {/* Crystal Target */}
        <g transform="translate(180, 150)" id="crystal-group">
           <circle cx="0" cy="0" r="40" fill="none" stroke="#4b5563" strokeDasharray="2 2" />
          <g transform={`rotate(${crystalAngle})`}>
            <rect x="-20" y="-2.5" width="40" height="5" rx="2" ry="2" fill="#60a5fa" />
            <text x="0" y="-8" fill="#a5b4fc" textAnchor="middle" fontSize="8">Crystal (NaCl)</text>
          </g>
           <line x1="0" y1="0" x2="0" y2="-40" stroke="#4b5563" strokeWidth="1" />
           <text x="5" y="-30" fill="#9ca3af" textAnchor="start" fontSize="8">0°</text>
        </g>
        
        {/* Sensor Arm */}
        <g transform={`translate(180, 150) rotate(${sensorAngle})`}>
          <path d="M 40 0 L 120 -20 L 120 20 Z" fill="#374151" />
          <circle cx="130" cy="0" r="10" fill="#f87171" />
          <text x="80" y="5" fill="#9ca3af" textAnchor="middle" fontSize="8">Detector</text>
           <line x1="40" y1="0" x2="120" y2="0" stroke="#f87171" strokeWidth="1" strokeDasharray="2 2" />
        </g>

         {/* Angles */}
        <g transform="translate(180, 150)">
          {/* Crystal Angle Arc */}
          <path d={`M 25 0 A 25 25 0 0 1 ${25 * Math.cos(crystalAngle * Math.PI / 180)} ${25 * Math.sin(crystalAngle * Math.PI / 180)}`} fill="none" stroke="#a5b4fc" strokeWidth="1" />
          <text x="30" y="15" fill="#a5b4fc" fontSize="8">θt</text>
          
          {/* Sensor Angle Arc */}
          <path d={`M 35 0 A 35 35 0 ${sensorAngle > 180 ? 1 : 0} 1 ${35 * Math.cos(sensorAngle * Math.PI / 180)} ${35 * Math.sin(sensorAngle * Math.PI / 180)}`} fill="none" stroke="#fca5a5" strokeWidth="1" />
           <text x="45" y="25" fill="#fca5a5" fontSize="8">θs</text>
        </g>
      </svg>
      <div className="absolute bottom-2 right-4 bg-gray-900/70 p-2 rounded-md font-mono text-sm">
        <div>Crystal (θ<sub className="text-xs">t</sub>): <span className="text-cyan-400">{crystalAngle.toFixed(1)}°</span></div>
        <div>Sensor (θ<sub className="text-xs">s</sub>): <span className="text-red-400">{sensorAngle.toFixed(1)}°</span></div>
      </div>
    </div>
  );
};

export default ExperimentView;
