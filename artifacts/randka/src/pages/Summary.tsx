import { useState, useRef } from "react";
import { useLocation } from "wouter";
import { PageTransition } from "@/components/PageTransition";
import { FloatingHearts } from "@/components/FloatingHearts";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useConfirmDate } from "@workspace/api-client-react";

export default function Summary() {
  const [, setLocation] = useLocation();
  const [isConfirming, setIsConfirming] = useState(false);
  const confirmDate = useConfirmDate();
  
  const linkId = localStorage.getItem("randka_linkId") || "default";
  const dateType = localStorage.getItem("randka_dateType") || "";
  const customDateType = localStorage.getItem("randka_customDateType") || "";
  const date = localStorage.getItem("randka_date") || "";
  const time = localStorage.getItem("randka_time") || "";

  const mutateFnRef = useRef(confirmDate.mutate);
  mutateFnRef.current = confirmDate.mutate;

  const handleConfirm = () => {
    setIsConfirming(true);
    mutateFnRef.current(
      { 
        linkId, 
        data: { 
          dateType, 
          customDateType: customDateType || undefined, 
          date, 
          time 
        } 
      },
      {
        onSuccess: () => {
          setLocation("/thank-you");
        },
        onError: (err) => {
          console.error("Error confirming date", err);
          setIsConfirming(false);
          // If we fail, let's still show thank you page to not ruin the mood if API is missing
          setLocation("/thank-you");
        }
      }
    );
  };

  const getTypeLabel = () => {
    if (dateType === "Inna") return customDateType;
    return dateType;
  };

  const getEmoji = () => {
    const emojis: Record<string, string> = {
      Kolacja: "🍕",
      Kino: "🎬",
      Spacer: "🌳",
      Kręgle: "🎳",
      Inna: "✨",
    };
    return emojis[dateType] || "❤️";
  };

  return (
    <PageTransition className="min-h-screen flex flex-col items-center justify-center relative bg-gradient-to-b from-rose-50 to-pink-100 p-6">
      <FloatingHearts />
      
      <div className="z-10 w-full max-w-lg text-center">
        <h2 className="text-4xl md:text-5xl font-bold text-rose-600 mb-8 drop-shadow-sm">
          Podsumowanie 💌
        </h2>
        
        <Card className="p-8 md:p-10 border-none shadow-2xl bg-white/95 backdrop-blur-sm rounded-3xl mb-10 overflow-hidden relative">
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-rose-400 to-pink-500"></div>
          
          <div className="space-y-8">
            <div className="flex flex-col items-center">
              <span className="text-sm text-rose-400 uppercase tracking-widest font-semibold mb-2">Co będziemy robić</span>
              <div className="flex items-center gap-3 text-3xl font-bold text-rose-800">
                <span>{getEmoji()}</span>
                <span>{getTypeLabel()}</span>
              </div>
            </div>
            
            <div className="w-16 h-px bg-rose-200 mx-auto"></div>

            <div className="flex flex-col items-center">
              <span className="text-sm text-rose-400 uppercase tracking-widest font-semibold mb-2">Kiedy</span>
              <div className="text-3xl font-bold text-rose-800">
                {date}
              </div>
            </div>

            <div className="w-16 h-px bg-rose-200 mx-auto"></div>

            <div className="flex flex-col items-center">
              <span className="text-sm text-rose-400 uppercase tracking-widest font-semibold mb-2">O której</span>
              <div className="text-3xl font-bold text-rose-800">
                {time}
              </div>
            </div>
          </div>
        </Card>

        <Button 
          size="lg" 
          onClick={handleConfirm}
          disabled={isConfirming}
          className="text-2xl px-16 py-10 rounded-full shadow-xl bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 transition-all duration-500 hover:scale-110 hover:shadow-2xl animate-pulse-slow w-full md:w-auto text-white border-none"
        >
          {isConfirming ? "Potwierdzanie..." : "Potwierdź ❤️"}
        </Button>
      </div>
    </PageTransition>
  );
}
