import React, { useMemo, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { DataPoint } from '../types';
import { PLANCK_CONSTANT, SPEED_OF_LIGHT, ELEMENTARY_CHARGE, NACL_LATTICE_SPACING_PM } from '../constants';
import { ChartIcon, TableIcon, CalculatorIcon } from './icons';

interface ResultsDisplayProps {
  dataPoints: DataPoint[];
  voltage: number;
}

type Tab = 'chart' | 'table' | 'calculation';

const ResultsDisplay: React.FC<ResultsDisplayProps> = ({ dataPoints, voltage }) => {
  const [activeTab, setActiveTab] = useState<Tab>('chart');

  const calculationResults = useMemo(() => {
    if (dataPoints.length < 2) return null;

    // Find the cutoff angle. We look for the point where the intensity starts rising.
    // Let's find the first angle with a count rate > 5% of the max rate to avoid noise.
    const maxCount = Math.max(...dataPoints.map(p => p.countRate));
    const firstSignificantPoint = dataPoints.find(p => p.countRate > maxCount * 0.05);

    if (!firstSignificantPoint) return null;

    const thetaMinRad = firstSignificantPoint.crystalAngle * (Math.PI / 180);
    const lambdaMin_pm = 2 * NACL_LATTICE_SPACING_PM * Math.sin(thetaMinRad);
    const lambdaMin_m = lambdaMin_pm * 1e-12;
    
    const calculatedPlanck = (ELEMENTARY_CHARGE * voltage * lambdaMin_m) / SPEED_OF_LIGHT;
    const errorPercentage = Math.abs((calculatedPlanck - PLANCK_CONSTANT) / PLANCK_CONSTANT) * 100;

    return {
      cutoffAngle: firstSignificantPoint.crystalAngle,
      lambdaMin_pm,
      calculatedPlanck,
      errorPercentage
    };
  }, [dataPoints, voltage]);

  const renderContent = () => {
    switch (activeTab) {
      case 'chart':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={dataPoints} margin={{ top: 5, right: 30, left: 20, bottom: 25 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#4b5563" />
              <XAxis 
                dataKey="sensorAngle" 
                label={{ value: 'Sensor Angle (θs) in degrees', position: 'insideBottom', offset: -15, fill: '#9ca3af' }}
                stroke="#9ca3af" 
                unit="°"
                interval={49} // Show a tick every 50 data points (5 degrees of crystal angle)
                tickFormatter={(tick) => `${Math.round(tick)}`} // Round to nearest whole number
              />
              <YAxis 
                label={{ value: 'Count Rate (R)', angle: -90, position: 'insideLeft', fill: '#9ca3af' }}
                stroke="#9ca3af"
              />
              <Tooltip
                contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151' }}
                labelStyle={{ color: '#06b6d4' }}
                formatter={(value: number, name: string) => [`${value.toFixed(2)} counts/s`, 'Count Rate']}
                labelFormatter={(label: number) => `Sensor Angle: ${label.toFixed(1)}°`}
              />
              <Line type="monotone" dataKey="countRate" name="Count Rate" stroke="#22d3ee" strokeWidth={2} dot={false} activeDot={{ r: 8 }} />
            </LineChart>
          </ResponsiveContainer>
        );
      case 'table':
        return (
          <div className="h-[300px] overflow-y-auto">
            <table className="w-full text-sm text-left text-gray-400">
              <thead className="text-xs text-gray-300 uppercase bg-gray-700/50 sticky top-0">
                <tr>
                  <th scope="col" className="px-6 py-3">Crystal Angle (θt)</th>
                  <th scope="col" className="px-6 py-3">Sensor Angle (θs)</th>
                  <th scope="col" className="px-6 py-3">Wavelength (pm)</th>
                  <th scope="col" className="px-6 py-3">Count Rate (R)</th>
                </tr>
              </thead>
              <tbody>
                {dataPoints.map((p, i) => (
                  <tr key={i} className="border-b border-gray-700 hover:bg-gray-800/50">
                    <td className="px-6 py-4">{p.crystalAngle.toFixed(1)}°</td>
                    <td className="px-6 py-4">{p.sensorAngle.toFixed(1)}°</td>
                    <td className="px-6 py-4">{p.wavelength.toFixed(2)}</td>
                    <td className="px-6 py-4 font-semibold text-cyan-400">{p.countRate.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      case 'calculation':
        if (!calculationResults) {
            return <div className="h-[300px] flex items-center justify-center text-gray-500">Complete the scan to see calculations.</div>;
        }
        return (
             <div className="h-[300px] p-6 space-y-4 text-gray-300">
                <h3 className="text-lg font-bold text-cyan-400">Calculation of Planck's Constant (h)</h3>
                <p className="text-sm">We use the cutoff wavelength (λ<sub className="text-xs">min</sub>) from the spectrum, where kinetic energy of the electron is fully converted to a photon's energy: <strong className="font-mono">eV = hc / λ<sub className="text-xs">min</sub></strong></p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 font-mono">
                    <div className="bg-gray-800 p-3 rounded-md">
                        <p className="text-xs text-gray-400">1. Cutoff Angle (θ<sub className="text-xs">min</sub>)</p>
                        <p className="text-lg text-cyan-300">{calculationResults.cutoffAngle.toFixed(2)}°</p>
                    </div>
                    <div className="bg-gray-800 p-3 rounded-md">
                        <p className="text-xs text-gray-400">2. λ<sub className="text-xs">min</sub> = 2d sin(θ<sub className="text-xs">min</sub>)</p>
                        <p className="text-lg text-cyan-300">{calculationResults.lambdaMin_pm.toFixed(2)} pm</p>
                    </div>
                    <div className="bg-gray-800 p-3 rounded-md col-span-1 md:col-span-2">
                        <p className="text-xs text-gray-400">3. Calculated Planck's Constant (h = eVλ<sub className="text-xs">min</sub> / c)</p>
                        <p className="text-xl text-green-400">{calculationResults.calculatedPlanck.toExponential(4)} J·s</p>
                    </div>
                    <div className="bg-gray-800 p-3 rounded-md">
                         <p className="text-xs text-gray-400">Accepted Value</p>
                        <p className="text-lg text-gray-400">{PLANCK_CONSTANT.toExponential(4)} J·s</p>
                    </div>
                     <div className="bg-gray-800 p-3 rounded-md">
                         <p className="text-xs text-gray-400">Percentage Error</p>
                        <p className="text-lg text-yellow-400">{calculationResults.errorPercentage.toFixed(2)}%</p>
                    </div>
                </div>
            </div>
        );
    }
  };
  
  const TabButton = ({ tab, label, icon }: { tab: Tab, label: string, icon: React.ReactNode }) => (
    <button
        onClick={() => setActiveTab(tab)}
        className={`flex items-center space-x-2 px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${
            activeTab === tab 
            ? 'bg-gray-800 text-cyan-400 border-b-2 border-cyan-400' 
            : 'text-gray-400 hover:bg-gray-700/50 hover:text-white'
        }`}
    >
        {icon}
        <span>{label}</span>
    </button>
  );

  return (
    <div className="bg-gray-800/50 rounded-lg shadow-2xl border border-gray-700">
      <div className="flex border-b border-gray-700 px-4">
        <TabButton tab="chart" label="Chart" icon={<ChartIcon className="w-5 h-5"/>} />
        <TabButton tab="table" label="Data Table" icon={<TableIcon className="w-5 h-5"/>} />
        <TabButton tab="calculation" label="Calculation" icon={<CalculatorIcon className="w-5 h-5"/>} />
      </div>
      <div className="p-4">
        {renderContent()}
      </div>
    </div>
  );
};

export default ResultsDisplay;