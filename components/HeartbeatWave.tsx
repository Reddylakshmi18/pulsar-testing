
import React, { useEffect, useRef, useState } from 'react';

interface HeartbeatWaveProps {
  color?: string;
  height?: number;
  speed?: number;
  active?: boolean;
}

const HeartbeatWave: React.FC<HeartbeatWaveProps> = ({ 
  color = "#10b981", 
  height = 80, 
  speed = 2,
  active = true
}) => {
  const [points, setPoints] = useState<string>("");
  const frameRef = useRef<number>(0);
  const offsetRef = useRef<number>(0);

  useEffect(() => {
    if (!active) return;

    const generateWave = () => {
      offsetRef.current = (offsetRef.current + speed) % 400;
      const width = 400;
      const centerY = height / 2;
      const newPoints: string[] = [];

      for (let x = 0; x <= width; x += 5) {
        let y = centerY;
        // The heartbeat peak logic
        const cycleX = (x + offsetRef.current) % 100;
        if (cycleX > 30 && cycleX < 35) {
          y -= 5; // P wave
        } else if (cycleX >= 35 && cycleX < 40) {
          y += 0;
        } else if (cycleX >= 40 && cycleX < 45) {
          y -= 30; // QRS complex start
        } else if (cycleX >= 45 && cycleX < 50) {
          y += 35; // QRS peak
        } else if (cycleX >= 50 && cycleX < 55) {
          y = centerY;
        } else if (cycleX > 65 && cycleX < 75) {
          y -= 10; // T wave
        }
        newPoints.push(`${x},${y}`);
      }

      setPoints(newPoints.join(" "));
      frameRef.current = requestAnimationFrame(generateWave);
    };

    frameRef.current = requestAnimationFrame(generateWave);
    return () => cancelAnimationFrame(frameRef.current);
  }, [height, speed, active]);

  return (
    <div className="w-full overflow-hidden bg-gray-900/50 rounded-lg border border-gray-800 p-2 relative">
      <svg 
        viewBox={`0 0 400 ${height}`} 
        className="w-full h-full drop-shadow-[0_0_8px_rgba(16,185,129,0.3)]"
        preserveAspectRatio="none"
      >
        <polyline
          fill="none"
          stroke={color}
          strokeWidth="2"
          strokeLinejoin="round"
          points={points}
        />
      </svg>
      {/* Scanning effect overlay */}
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-r from-transparent via-emerald-500/5 to-transparent animate-pulse" />
    </div>
  );
};

export default HeartbeatWave;
