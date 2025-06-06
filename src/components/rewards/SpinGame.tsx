'use client';

import type React from 'react';
import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { FaPlay, FaVolumeUp, FaVolumeMute } from 'react-icons/fa';
import { useRewards } from '../../lib/context/RewardsContext';

interface SpinGameProps {
  onComplete: (points: number) => void;
  customSegments?: number[];
  customColors?: string[];
  wheelSize?: number;
  animationDuration?: number;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
  size: number;
}

const SpinGame: React.FC<SpinGameProps> = ({
  onComplete,
  customSegments,
  customColors,
  wheelSize = 300,
  animationDuration = 4000,
}) => {
  const { addPoints } = useRewards();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particleCanvasRef = useRef<HTMLCanvasElement>(null);
  const _audioRef = useRef<HTMLAudioElement>(null);
  const [isSpinning, setIsSpinning] = useState(false);
  const [result, setResult] = useState<number | null>(null);
  const [canSpin, setCanSpin] = useState(true);
  const [spinAngle, setSpinAngle] = useState(0);
  const [finalPoints, setFinalPoints] = useState(0);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [spinVelocity, setSpinVelocity] = useState(0);
  const [isHovering, setIsHovering] = useState(false);
  const [currentReward, setCurrentReward] = useState<number>(0);
  const [_highlightedSegment, setHighlightedSegment] = useState<number>(-1);

  // Dynamic wheel segments with better distribution
  const segments = useMemo(() => {
    if (customSegments) {return customSegments;}
    return [
      50, 100, 75, 150, 25, 200, 125, 300, 175, 500, 250, 1000,
    ];
  }, [customSegments]);

  // Dynamic colors with gradients
  const colors = useMemo(() => {
    if (customColors) {return customColors;}
    return [
      '#FFD700', // Gold
      '#FF6B6B', // Coral Red
      '#4ECDC4', // Turquoise
      '#45B7D1', // Sky Blue
      '#96CEB4', // Mint Green
      '#FFEAA7', // Light Yellow
      '#DDA0DD', // Plum
      '#98D8C8', // Mint
      '#F7DC6F', // Light Gold
      '#BB8FCE', // Light Purple
      '#85C1E9', // Light Blue
      '#F8C471',  // Peach
    ];
  }, [customColors]);

  // Calculate which segment the pointer is currently on
  const getCurrentSegment = useCallback((angle: number) => {
    const normalizedAngle = ((360 - (angle % 360)) + 360) % 360;
    const segmentAngle = 360 / segments.length;
    const segmentIndex = Math.floor(normalizedAngle / segmentAngle);
    return segmentIndex % segments.length;
  }, [segments.length]);

  // Enhanced wheel drawing with gradients and effects - completely dynamic
  const drawWheel = useCallback(
    (
      ctx: CanvasRenderingContext2D,
      width: number,
      height: number,
      angle: number,
    ) => {
      // Force complete canvas reset
      ctx.save();
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, width, height);
      ctx.restore();
      const centerX = width / 2;
      const centerY = height / 2;
      const radius = Math.min(centerX, centerY) - 20;
      const segmentAngle = (2 * Math.PI) / segments.length;

      // Calculate current segment for highlighting
      const currentSegmentIndex = getCurrentSegment(angle);
      setCurrentReward(segments[currentSegmentIndex] || 0);
      setHighlightedSegment(currentSegmentIndex);

      // Draw outer glow
      ctx.shadowColor = '#FFD700';
      ctx.shadowBlur = 20;
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius + 10, 0, 2 * Math.PI);
      ctx.strokeStyle = '#FFD700';
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.shadowBlur = 0;

      // Draw segments with gradients and highlighting
      for (let i = 0; i < segments.length; i++) {
        const startAngle = i * segmentAngle + (angle * Math.PI) / 180;
        const endAngle = (i + 1) * segmentAngle + (angle * Math.PI) / 180;
        const isHighlighted = i === currentSegmentIndex && isSpinning;

        // Create gradient for each segment
        const gradient = ctx.createRadialGradient(
          centerX, centerY, 0,
          centerX, centerY, radius,
        );
        let baseColor = colors[i] || '#FFD700';

        // Brighten highlighted segment
        if (isHighlighted) {
          baseColor = adjustBrightness(baseColor, 40);
        }

        gradient.addColorStop(0, baseColor);
        gradient.addColorStop(1, adjustBrightness(baseColor, -30));

        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.arc(centerX, centerY, radius, startAngle, endAngle);
        ctx.closePath();

        ctx.fillStyle = gradient;
        ctx.fill();

        // Enhanced stroke for highlighted segment
        ctx.strokeStyle = isHighlighted ? '#FFD700' : '#333';
        ctx.lineWidth = isHighlighted ? 4 : 2;
        ctx.stroke();

        // Add pulsing glow effect for highlighted segment
        if (isHighlighted) {
          ctx.shadowColor = '#FFD700';
          ctx.shadowBlur = 15;
          ctx.strokeStyle = '#FFD700';
          ctx.lineWidth = 2;
          ctx.stroke();
          ctx.shadowBlur = 0;
        }

        // Draw text with better styling
        ctx.save();
        ctx.translate(centerX, centerY);
        ctx.rotate(startAngle + segmentAngle / 2);
        ctx.textAlign = 'center';

        // Enhanced text for highlighted segment
        if (isHighlighted) {
          ctx.fillStyle = '#000';
          ctx.font = 'bold 16px Arial';
          ctx.strokeStyle = '#FFD700';
          ctx.lineWidth = 4;
        } else {
          ctx.fillStyle = '#000';
          ctx.font = 'bold 14px Arial';
          ctx.strokeStyle = '#fff';
          ctx.lineWidth = 3;
        }

        ctx.strokeText((segments[i] || 0).toString(), radius - 30, 5);
        ctx.fillText((segments[i] || 0).toString(), radius - 30, 5);
        ctx.restore();
      }

      // Draw center hub with gradient
      const centerGradient = ctx.createRadialGradient(
        centerX, centerY, 0,
        centerX, centerY, 25,
      );
      centerGradient.addColorStop(0, '#FFD700');
      centerGradient.addColorStop(1, '#B8860B');

      ctx.beginPath();
      ctx.arc(centerX, centerY, 25, 0, 2 * Math.PI);
      ctx.fillStyle = centerGradient;
      ctx.fill();
      ctx.strokeStyle = '#8B4513';
      ctx.lineWidth = 3;
      ctx.stroke();

      // Draw animated pointer
      const pointerGlow = isSpinning ? 10 : 5;
      ctx.shadowColor = '#FF0000';
      ctx.shadowBlur = pointerGlow;
      ctx.beginPath();
      ctx.moveTo(centerX, centerY - radius - 15);
      ctx.lineTo(centerX - 15, centerY - radius + 15);
      ctx.lineTo(centerX + 15, centerY - radius + 15);
      ctx.closePath();
      ctx.fillStyle = isSpinning ? '#FF4444' : '#FF0000';
      ctx.fill();
      ctx.strokeStyle = '#8B0000';
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.shadowBlur = 0;
    },
    [segments, colors, isSpinning, getCurrentSegment],
  );

  // Utility function to adjust color brightness
  const adjustBrightness = (color: string, amount: number): string => {
    const num = parseInt(color.replace('#', ''), 16);
    const amt = Math.round(2.55 * amount);
    const R = (num >> 16) + amt;
    const G = (num >> 8 & 0x00FF) + amt;
    const B = (num & 0x0000FF) + amt;
    return '#' + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
      (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
      (B < 255 ? B < 1 ? 0 : B : 255)).toString(16).slice(1);
  };

  // Create celebration particles
  const createParticles = (centerX: number, centerY: number) => {
    const newParticles: Particle[] = [];
    for (let i = 0; i < 50; i++) {
      newParticles.push({
        x: centerX + (Math.random() - 0.5) * 100,
        y: centerY + (Math.random() - 0.5) * 100,
        vx: (Math.random() - 0.5) * 10,
        vy: (Math.random() - 0.5) * 10,
        life: 60,
        maxLife: 60,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: Math.random() * 5 + 2,
      });
    }
    setParticles(newParticles);
  };

  // Animate particles
  const updateParticles = useCallback(() => {
    setParticles(prev =>
      prev.map(particle => ({
        ...particle,
        x: particle.x + particle.vx,
        y: particle.y + particle.vy,
        vy: particle.vy + 0.2, // gravity
        life: particle.life - 1,
      })).filter(particle => particle.life > 0),
    );
  }, []);

  // Draw particles
  const drawParticles = useCallback(() => {
    const canvas = particleCanvasRef.current;
    if (!canvas) {return;}

    const ctx = canvas.getContext('2d');
    if (!ctx) {return;}

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    particles.forEach(particle => {
      const alpha = particle.life / particle.maxLife;
      ctx.globalAlpha = alpha;
      ctx.fillStyle = particle.color;
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, particle.size, 0, 2 * Math.PI);
      ctx.fill();
    });

    ctx.globalAlpha = 1;
  }, [particles]);

  // Play sound effect
  const playSound = (type: 'spin' | 'win') => {
    if (!soundEnabled) {return;}

    // Create audio context for sound effects
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    if (type === 'spin') {
      oscillator.frequency.setValueAtTime(200, audioContext.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(100, audioContext.currentTime + 0.5);
      gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
      oscillator.start();
      oscillator.stop(audioContext.currentTime + 0.5);
    } else if (type === 'win') {
      oscillator.frequency.setValueAtTime(523, audioContext.currentTime);
      oscillator.frequency.setValueAtTime(659, audioContext.currentTime + 0.1);
      oscillator.frequency.setValueAtTime(784, audioContext.currentTime + 0.2);
      gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
      oscillator.start();
      oscillator.stop(audioContext.currentTime + 0.3);
    }
  };

  // Enhanced spinning animation with dynamic effects
  const spinTheWheel = () => {
    if (!canSpin || isSpinning) {return;}

    setIsSpinning(true);
    setResult(null);
    playSound('spin');

    // Weighted random selection (higher values are rarer)
    const weights = segments.map(segment => {
      if (segment >= 500) {return 0.5;}  // Very rare
      if (segment >= 200) {return 1;}    // Rare
      if (segment >= 100) {return 3;}    // Uncommon
      return 5;                        // Common
    });

    const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);
    let random = Math.random() * totalWeight;
    let randomSegmentIndex = 0;

    for (let i = 0; i < weights.length; i++) {
      random -= weights[i];
      if (random <= 0) {
        randomSegmentIndex = i;
        break;
      }
    }

    const points = segments[randomSegmentIndex] || 50;
    setFinalPoints(points);

    // Calculate target rotation with more randomness
    const segmentAngle = 360 / segments.length;
    const extraSpins = 5 + Math.random() * 3; // 5-8 full rotations
    const segmentOffset = (Math.random() - 0.5) * (segmentAngle * 0.8); // Random position within segment
    const targetRotation = 360 * extraSpins - (randomSegmentIndex * segmentAngle + segmentAngle / 2 + segmentOffset);

    // Dynamic animation with variable speed
    let start = 0;
    const startAngle = spinAngle;
    let currentVelocity = 0;
    const _maxVelocity = 20;

    // Enhanced easing with bounce effect
    const easeOutElastic = (t: number): number => {
      const c4 = (2 * Math.PI) / 3;
      return t === 0 ? 0 : t === 1 ? 1 :
        Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * c4) + 1;
    };

    const animate = (timestamp: number) => {
      if (!start) {start = timestamp;}
      const progress = timestamp - start;
      const time = Math.min(progress / animationDuration, 1);

      // Use different easing for different phases
      let easedTime;
      if (time < 0.7) {
        // Acceleration phase
        easedTime = time / 0.7;
        easedTime = 1 - Math.pow(1 - easedTime, 3); // ease-out-cubic
      } else {
        // Deceleration phase with elastic effect
        const decelerationTime = (time - 0.7) / 0.3;
        easedTime = 0.7 + 0.3 * easeOutElastic(decelerationTime);
      }

      const newAngle = startAngle + (targetRotation - startAngle) * easedTime;
      setSpinAngle(newAngle);

      // Calculate velocity for visual effects
      currentVelocity = Math.abs(newAngle - spinAngle) * 0.1;
      setSpinVelocity(currentVelocity);

      // Force complete wheel redraw from scratch
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          // Clear all cached state and force fresh render
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          ctx.save();
          ctx.setTransform(1, 0, 0, 1, 0, 0);
          drawWheel(ctx, canvas.width, canvas.height, newAngle);
          ctx.restore();
        }
      }

      if (time < 1) {
        requestAnimationFrame(animate);
      } else {
        setIsSpinning(false);
        setResult(points);
        setCanSpin(false);
        setSpinVelocity(0);
        playSound('win');

        // Create celebration particles
        const canvas = canvasRef.current;
        if (canvas) {
          createParticles(canvas.width / 2, canvas.height / 2);
        }
      }
    };

    requestAnimationFrame(animate);
  };

  // Initialize wheel and particle system - force fresh render every time
  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        // Clear any cached rendering state
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        // Force complete redraw from scratch
        drawWheel(ctx, canvas.width, canvas.height, spinAngle);
      }
    }
  }, [spinAngle, drawWheel, segments, colors]);

  // Particle animation loop
  useEffect(() => {
    if (particles.length > 0) {
      const interval = setInterval(() => {
        updateParticles();
        drawParticles();
      }, 16); // ~60fps

      return () => clearInterval(interval);
    }
  }, [particles, updateParticles, drawParticles]);

  // Idle animation when not spinning - force dynamic updates
  useEffect(() => {
    if (!isSpinning && canSpin) {
      const interval = setInterval(() => {
        setSpinAngle(prev => {
          const newAngle = prev + 0.5; // Slow idle rotation
          // Force canvas refresh on each update
          const canvas = canvasRef.current;
          if (canvas) {
            const ctx = canvas.getContext('2d');
            if (ctx) {
              ctx.clearRect(0, 0, canvas.width, canvas.height);
              drawWheel(ctx, canvas.width, canvas.height, newAngle);
            }
          }
          return newAngle;
        });
      }, 100);

      return () => clearInterval(interval);
    }
  }, [isSpinning, canSpin, drawWheel]);

  // Handle claiming points
  const handleClaim = () => {
    if (result !== null) {
      addPoints(finalPoints);
      onComplete(finalPoints);
    }
  };

  return (
    <div className="text-center relative">
      {/* Sound toggle */}
      <button
        onClick={() => setSoundEnabled(!soundEnabled)}
        className="absolute top-0 right-0 p-2 text-gray-400 hover:text-white transition-colors"
        title={soundEnabled ? 'Mute sounds' : 'Enable sounds'}
      >
        {soundEnabled ? <FaVolumeUp size={20} /> : <FaVolumeMute size={20} />}
      </button>

      <div className="relative mb-6">
        {/* Main wheel canvas - dynamically rendered */}
        <canvas
          ref={canvasRef}
          width={wheelSize}
          height={wheelSize}
          className={`mx-auto transition-all duration-300 ${
            isHovering && !isSpinning ? 'scale-105' : ''
          } ${
            isSpinning ? 'drop-shadow-2xl' : 'drop-shadow-lg'
          }`}
          onMouseEnter={() => {
            setIsHovering(true);
            // Force redraw on hover for dynamic effects
            const canvas = canvasRef.current;
            if (canvas) {
              const ctx = canvas.getContext('2d');
              if (ctx) {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                drawWheel(ctx, canvas.width, canvas.height, spinAngle);
              }
            }
          }}
          onMouseLeave={() => {
            setIsHovering(false);
            // Force redraw when leaving hover
            const canvas = canvasRef.current;
            if (canvas) {
              const ctx = canvas.getContext('2d');
              if (ctx) {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                drawWheel(ctx, canvas.width, canvas.height, spinAngle);
              }
            }
          }}
        />

        {/* Particle canvas overlay */}
        <canvas
          ref={particleCanvasRef}
          width={wheelSize}
          height={wheelSize}
          className="absolute top-0 left-1/2 transform -translate-x-1/2 pointer-events-none"
        />

        {/* Dynamic spin button */}
        {!isSpinning && !result && (
          <button
            className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 
              bg-gradient-to-r from-yellow-400 to-yellow-600 text-black 
              w-20 h-20 rounded-full flex items-center justify-center 
              hover:from-yellow-300 hover:to-yellow-500 
              transition-all duration-300 shadow-lg hover:shadow-xl
              ${isHovering ? 'scale-110' : 'scale-100'}
              ${canSpin ? 'animate-pulse' : 'opacity-50 cursor-not-allowed'}`}
            onClick={spinTheWheel}
            disabled={!canSpin}
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
          >
            <FaPlay size={24} className={isHovering ? 'ml-1' : ''} />
          </button>
        )}

        {/* Dynamic reward display */}
        {isSpinning && (
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <div className="bg-black/80 text-white px-4 py-2 rounded-lg border-2 border-yellow-400 animate-pulse">
              <div className="text-center">
                <div className="text-xs text-yellow-400 font-semibold">CURRENT REWARD</div>
                <div className="text-2xl font-bold text-yellow-300">{currentReward}</div>
                <div className="text-xs text-gray-300">POINTS</div>
              </div>
            </div>
          </div>
        )}

        {/* Spinning indicator ring */}
        {isSpinning && (
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <div className="w-32 h-32 border-4 border-yellow-400/30 border-t-yellow-400 rounded-full animate-spin"></div>
          </div>
        )}
      </div>

      {/* Results section with enhanced animations */}
      {result !== null ? (
        <div className="animate-bounce-in">
          <div className="bg-gradient-to-r from-green-400 to-blue-500 text-white p-6 rounded-lg shadow-xl mb-4">
            <h3 className="text-2xl font-bold mb-2 animate-pulse">🎉 Congratulations! 🎉</h3>
            <p className="text-lg mb-4">
              You won{' '}
              <span className="text-yellow-300 font-bold text-3xl animate-bounce inline-block">
                {finalPoints}
              </span>
              {' '}points!
            </p>
            {finalPoints >= 500 && (
              <p className="text-yellow-200 text-sm animate-pulse">🌟 MEGA WIN! 🌟</p>
            )}
          </div>
          <button
            className="btn-primary w-full transform hover:scale-105 transition-transform duration-200 shadow-lg"
            onClick={handleClaim}
          >
            🎁 Claim Your Points 🎁
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {isSpinning ? (
            <div className="bg-blue-500/20 p-4 rounded-lg">
              <p className="text-blue-300 animate-pulse text-lg">🎰 Spinning the wheel of fortune... 🎰</p>
              <div className="mt-3 grid grid-cols-2 gap-4 text-sm">
                <div className="bg-gray-800/50 p-2 rounded">
                  <div className="text-gray-400">Current Reward</div>
                  <div className="text-yellow-300 font-bold text-lg">{currentReward} pts</div>
                </div>
                <div className="bg-gray-800/50 p-2 rounded">
                  <div className="text-gray-400">Spin Speed</div>
                  <div className="text-blue-300 font-bold text-lg">{Math.round(spinVelocity * 10)}/10</div>
                </div>
              </div>
              <div className="mt-2 text-xs text-gray-400 text-center">
                🎯 Watch the highlighted segment for your potential reward!
              </div>
            </div>
          ) : (
            <div className="bg-gray-800/50 p-4 rounded-lg">
              <p className="text-gray-300 text-lg">
                {canSpin
                  ? '🎯 Ready to test your luck? Click the wheel to spin! 🎯'
                  : "⏰ You&apos;ve used your daily spin. Come back tomorrow for another chance! ⏰"}
              </p>
              {canSpin && (
                <div className="mt-3 space-y-2">
                  <div className="text-sm text-gray-400">
                    <p>🎁 Possible rewards: {Math.min(...segments)} - {Math.max(...segments)} points</p>
                    <p>🍀 Higher values are rarer - good luck!</p>
                  </div>
                  <div className="bg-gray-700/50 p-3 rounded-lg">
                    <div className="text-xs text-gray-400 mb-2">REWARD BREAKDOWN:</div>
                    <div className="grid grid-cols-4 gap-1 text-xs">
                      {segments.map((segment, index) => (
                        <div
                          key={index}
                          className={`p-1 rounded text-center ${
                            segment >= 500 ? 'bg-purple-600/30 text-purple-300' :
                            segment >= 200 ? 'bg-red-600/30 text-red-300' :
                            segment >= 100 ? 'bg-orange-600/30 text-orange-300' :
                            'bg-green-600/30 text-green-300'
                          }`}
                        >
                          {segment}
                        </div>
                      ))}
                    </div>
                    <div className="mt-2 text-xs text-gray-500">
                      <span className="text-purple-300">●</span> Legendary (500+)
                      <span className="text-red-300 ml-2">●</span> Rare (200+)
                      <span className="text-orange-300 ml-2">●</span> Uncommon (100+)
                      <span className="text-green-300 ml-2">●</span> Common
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Custom CSS for animations */}
      <style>{`
        @keyframes bounce-in {
          0% {
            transform: scale(0.3);
            opacity: 0;
          }
          50% {
            transform: scale(1.05);
          }
          70% {
            transform: scale(0.9);
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }
        
        .animate-bounce-in {
          animation: bounce-in 0.6s ease-out;
        }
      `}</style>
    </div>
  );
};

export default SpinGame;
