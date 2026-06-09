import { useEffect } from "react";
import { PageTransition } from "@/components/PageTransition";
import { FloatingHearts } from "@/components/FloatingHearts";
import { Confetti } from "@/components/Confetti";

export default function ThankYou() {
  useEffect(() => {
    // Clear the stored local data once completed
    localStorage.removeItem("randka_dateType");
    localStorage.removeItem("randka_customDateType");
    localStorage.removeItem("randka_date");
    localStorage.removeItem("randka_time");
  }, []);

  return (
    <PageTransition className="min-h-screen flex flex-col items-center justify-center relative bg-gradient-to-b from-rose-50 to-pink-100 p-6 overflow-hidden">
      <Confetti />
      <FloatingHearts />
      
      <div className="z-10 w-full max-w-2xl text-center">
        <div className="inline-block animate-bounce mb-8">
          <div className="text-8xl md:text-9xl">💖</div>
        </div>
        
        <h1 className="text-5xl md:text-7xl font-bold text-rose-600 mb-6 drop-shadow-md">
          Dziękuję za zgodę na randkę! ❤️
        </h1>
        
        <p className="text-xl md:text-3xl text-rose-500 font-medium">
          Do zobaczenia wkrótce!
        </p>
      </div>
    </PageTransition>
  );
}
