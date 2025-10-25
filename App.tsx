
import React, { useState, useCallback, useEffect, useRef } from 'react';
import { DataPoint } from './types';
import { PLANCK_CONSTANT, SPEED_OF_LIGHT, ELEMENTARY_CHARGE, NACL_LATTICE_SPACING_PM } from './constants';

import ControlPanel from './components/ControlPanel';
import ExperimentView from './components/ExperimentView';
import ResultsDisplay from './components/ResultsDisplay';

const VOLTAGE = 30000; // 30kV
const CURRENT = 0.001; // 1mA
const SCAN_START_ANGLE = 1;
const SCAN_END_ANGLE = 20;
const SCAN_STEP = 0.1; // degrees
const SCAN_DELAY_MS = 20;

function App() {
  const [crystalAngle, setCrystalAngle] = useState<number>(SCAN_START_ANGLE);
  const [dataPoints, setDataPoints] = useState<DataPoint[]>([]);
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [scanProgress, setScanProgress] = useState<number>(0);
  // FIX: Use a ref to hold the interval ID for proper cleanup. This fixes a logic bug
  // and the type error caused by an incorrect attempt to clear timers.
  const scanIntervalRef = useRef<number | null>(null);

  const calculateCountRate = useCallback((angleDegrees: number, voltage: number): { wavelength: number; countRate: number } => {
    const theta_rad = angleDegrees * (Math.PI / 180);
    const lambda_pm = 2 * NACL_LATTICE_SPACING_PM * Math.sin(theta_rad);

    const lambda_min_m = (PLANCK_CONSTANT * SPEED_OF_LIGHT) / (ELEMENTARY_CHARGE * voltage);
    const lambda_min_pm = lambda_min_m * 1e12;

    let intensity = 0;
    if (lambda_pm >= lambda_min_pm) {
      // 1. Bremsstrahlung continuous spectrum model (empirical approximation)
      const x = lambda_pm - lambda_min_pm;
      const peak_pos = lambda_min_pm * 0.8; // Peak intensity is roughly at 1.5-2x lambda_min
      const base_intensity = 2000 * (x / peak_pos) * Math.exp(-x / peak_pos);
      intensity += base_intensity > 0 ? base_intensity : 0;

      // 2. Add characteristic peaks for a Copper (Cu) target (common material)
      // Cu Kα ≈ 154 pm, Cu Kβ ≈ 139 pm
      const ka_lambda_pm = 154;
      const kb_lambda_pm = 139;

      const addGaussianPeak = (center: number, height: number, width: number) => {
        return height * Math.exp(-Math.pow(lambda_pm - center, 2) / (2 * Math.pow(width, 2)));
      };
      
      // K-shell binding energy for Cu is ~8.9 keV. Our 30kV is enough to excite these.
      if (voltage > 8900) {
        intensity += addGaussianPeak(ka_lambda_pm, 4000, 1.5);
        intensity += addGaussianPeak(kb_lambda_pm, 900, 1.5);
      }
    }

    const noise = Math.random() * (intensity * 0.05); // 5% noise
    const finalCountRate = Math.max(0, intensity + noise);
    
    return { wavelength: lambda_pm, countRate: finalCountRate };
  }, []);


  const handleStartScan = useCallback(() => {
    if (isScanning) return;
    setIsScanning(true);
    setDataPoints([]);
    
    let currentAngle = SCAN_START_ANGLE;

    const scanInterval = window.setInterval(() => {
      if (currentAngle > SCAN_END_ANGLE) {
        window.clearInterval(scanInterval);
        scanIntervalRef.current = null;
        setIsScanning(false);
        setScanProgress(100);
        return;
      }
      
      setCrystalAngle(currentAngle);
      const { wavelength, countRate } = calculateCountRate(currentAngle, VOLTAGE);
      
      const newDataPoint: DataPoint = {
        crystalAngle: currentAngle,
        sensorAngle: currentAngle * 2,
        wavelength,
        countRate
      };
      
      setDataPoints(prev => [...prev, newDataPoint]);
      
      const progress = ((currentAngle - SCAN_START_ANGLE) / (SCAN_END_ANGLE - SCAN_START_ANGLE)) * 100;
      setScanProgress(progress);
      
      currentAngle = parseFloat((currentAngle + SCAN_STEP).toFixed(1));
    }, SCAN_DELAY_MS);

    scanIntervalRef.current = scanInterval;

  }, [isScanning, calculateCountRate]);

  // FIX: The original handleReset had a type error and did not correctly clear the
  // running interval. This version uses the ref to safely clear the timer.
  const handleReset = useCallback(() => {
    if (scanIntervalRef.current) {
      window.clearInterval(scanIntervalRef.current);
      scanIntervalRef.current = null;
    }
    setIsScanning(false);
    setDataPoints([]);
    setCrystalAngle(SCAN_START_ANGLE);
    setScanProgress(0);
  }, []);

  // FIX: Properly clean up the interval on component unmount to prevent memory leaks.
  useEffect(() => {
    return () => handleReset(); // Cleanup on unmount
  }, [handleReset]);

  return (
    <div className="min-h-screen bg-gray-900 text-gray-200 p-4 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl md:text-6xl">
            Interactive <span className="text-cyan-400">X-Ray Spectroscopy</span> Lab
          </h1>
          <p className="mt-3 max-w-md mx-auto text-base text-gray-400 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
            Simulating Bremsstrahlung to calculate Planck's Constant from the X-ray cutoff wavelength.
          </p>
        </header>

        <main className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <ControlPanel
              voltage={VOLTAGE}
              current={CURRENT}
              crystalAngle={crystalAngle}
              setCrystalAngle={angle => !isScanning && setCrystalAngle(angle)}
              isScanning={isScanning}
              onStartScan={handleStartScan}
              onReset={handleReset}
              scanProgress={scanProgress}
            />
          </div>
          
          <div className="lg:col-span-2 space-y-8">
            <ExperimentView crystalAngle={crystalAngle} />
            <ResultsDisplay dataPoints={dataPoints} voltage={VOLTAGE} />
          </div>
        </main>
      </div>
    </div>
  );
}

export default App;
