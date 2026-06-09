import { useEffect, useState } from "react";

export function FloatingHearts() {
  const [hearts, setHearts] = useState<{ id: number; left: string; delay: string; size: string; opacity: number }[]>([]);

  useEffect(() => {
    const generateHeart = () => {
      setHearts((current) => {
        const newHearts = [
          ...current,
          {
            id: Date.now() + Math.random(),
            left: `${Math.random() * 100}%`,
            delay: `${Math.random() * 2}s`,
            size: `${Math.random() * 1.5 + 0.5}rem`,
            opacity: Math.random() * 0.5 + 0.2
          }
        ].slice(-20); // Keep max 20 hearts to avoid performance issues
        return newHearts;
      });
    };

    const interval = setInterval(generateHeart, 800);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {hearts.map((heart) => (
        <div
          key={heart.id}
          className="absolute bottom-0 text-primary animate-float"
          style={{
            left: heart.left,
            animationDelay: heart.delay,
            fontSize: heart.size,
            opacity: heart.opacity,
          }}
        >
          ❤️
        </div>
      ))}
    </div>
  );
}
