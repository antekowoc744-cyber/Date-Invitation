import { useState } from "react";
import { useLocation } from "wouter";
import { PageTransition } from "@/components/PageTransition";
import { FloatingHearts } from "@/components/FloatingHearts";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const OPTIONS = [
  { id: "Kolacja", icon: "🍕", label: "Kolacja" },
  { id: "Kino", icon: "🎬", label: "Kino" },
  { id: "Spacer", icon: "🌳", label: "Spacer" },
  { id: "Kręgle", icon: "🎳", label: "Kręgle" },
  { id: "Inna", icon: "✨", label: "Inna opcja" },
];

export default function ChooseType() {
  const [, setLocation] = useLocation();
  const [selected, setSelected] = useState<string | null>(null);
  const [customType, setCustomType] = useState("");

  const handleNext = () => {
    if (!selected) return;
    localStorage.setItem("randka_dateType", selected);
    localStorage.setItem("randka_customDateType", customType);
    setLocation("/choose-date");
  };

  return (
    <PageTransition className="min-h-screen flex flex-col items-center justify-center relative bg-gradient-to-b from-rose-50 to-pink-100 p-6">
      <FloatingHearts />
      
      <div className="z-10 w-full max-w-4xl text-center">
        <h2 className="text-4xl md:text-5xl font-bold text-rose-600 mb-12 drop-shadow-sm">
          Co będziemy robić?
        </h2>
        
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6 mb-12">
          {OPTIONS.map((opt) => (
            <Card 
              key={opt.id}
              className={`p-6 md:p-8 cursor-pointer transition-all duration-300 transform hover:scale-105 hover:shadow-xl border-4 ${
                selected === opt.id 
                  ? "border-rose-500 bg-rose-50 shadow-rose-200" 
                  : "border-transparent bg-white/80 hover:bg-white backdrop-blur-sm"
              }`}
              onClick={() => setSelected(opt.id)}
            >
              <div className="text-5xl md:text-6xl mb-4">{opt.icon}</div>
              <div className="text-xl md:text-2xl font-medium text-rose-900">{opt.label}</div>
            </Card>
          ))}
        </div>

        {selected === "Inna" && (
          <div className="mb-12 max-w-md mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
            <Input 
              placeholder="Napisz swoją propozycję..." 
              value={customType}
              onChange={(e) => setCustomType(e.target.value)}
              className="text-lg py-6 text-center border-rose-200 focus:border-rose-500 rounded-2xl shadow-sm bg-white/90 backdrop-blur-sm"
            />
          </div>
        )}

        <Button 
          size="lg" 
          disabled={!selected || (selected === "Inna" && !customType.trim())}
          onClick={handleNext}
          className="text-xl px-12 py-8 rounded-full shadow-lg bg-rose-500 hover:bg-rose-600 transition-all duration-300 disabled:opacity-50 disabled:scale-100 hover:scale-105"
        >
          Dalej ❤️
        </Button>
      </div>
    </PageTransition>
  );
}
