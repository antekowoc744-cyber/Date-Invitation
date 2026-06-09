import { useState, useRef, useEffect, MouseEvent as ReactMouseEvent, TouchEvent as ReactTouchEvent } from "react";
import { Link, useLocation } from "wouter";
import { useRecordVisit } from "@workspace/api-client-react";
import { PageTransition } from "@/components/PageTransition";
import { FloatingHearts } from "@/components/FloatingHearts";
import { Button } from "@/components/ui/button";

export default function Landing({ params }: { params?: { linkId?: string } }) {
  const [, setLocation] = useLocation();
  const [noPosition, setNoPosition] = useState({ top: "0px", left: "0px" });
  const noBtnRef = useRef<HTMLButtonElement>(null);
  const [hasMoved, setHasMoved] = useState(false);
  const recordVisit = useRecordVisit();

  useEffect(() => {
    if (params?.linkId) {
      localStorage.setItem("randka_linkId", params.linkId);
      recordVisit.mutate({ linkId: params.linkId, data: { userAgent: navigator.userAgent } });
    }
  }, [params?.linkId]);

  const moveNoButton = (e: MouseEvent | TouchEvent) => {
    if (!noBtnRef.current) return;
    
    let clientX, clientY;
    if ("touches" in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = (e as MouseEvent).clientX;
      clientY = (e as MouseEvent).clientY;
    }

    const btnRect = noBtnRef.current.getBoundingClientRect();
    const btnCenterX = btnRect.left + btnRect.width / 2;
    const btnCenterY = btnRect.top + btnRect.height / 2;

    const distance = Math.sqrt(Math.pow(clientX - btnCenterX, 2) + Math.pow(clientY - btnCenterY, 2));

    if (distance < 100) {
      setHasMoved(true);
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      
      const maxLeft = viewportWidth - btnRect.width - 20;
      const maxTop = viewportHeight - btnRect.height - 20;

      let newLeft = Math.random() * maxLeft;
      let newTop = Math.random() * maxTop;

      // Keep it inside viewport
      newLeft = Math.max(20, Math.min(newLeft, maxLeft));
      newTop = Math.max(20, Math.min(newTop, maxTop));

      setNoPosition({
        top: `${newTop}px`,
        left: `${newLeft}px`,
      });
    }
  };

  useEffect(() => {
    window.addEventListener("mousemove", moveNoButton);
    window.addEventListener("touchmove", moveNoButton, { passive: false });
    
    return () => {
      window.removeEventListener("mousemove", moveNoButton);
      window.removeEventListener("touchmove", moveNoButton);
    };
  }, []);

  return (
    <PageTransition className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden bg-gradient-to-b from-rose-50 to-pink-100 p-4">
      <FloatingHearts />
      
      <div className="z-10 text-center flex flex-col items-center max-w-2xl">
        <h1 className="text-5xl md:text-7xl font-bold text-rose-600 mb-12 drop-shadow-sm animate-pulse-slow">
          Czy pójdziesz ze mną na randkę? ❤️
        </h1>
        
        <div className="flex items-center gap-8 relative h-32 w-full justify-center">
          <Button 
            size="lg" 
            className="text-2xl px-12 py-8 rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-110 bg-rose-500 hover:bg-rose-600"
            onClick={() => setLocation("/choose-type")}
          >
            TAK
          </Button>

          <Button 
            ref={noBtnRef}
            variant="outline" 
            size="lg" 
            className={`text-2xl px-12 py-8 rounded-full shadow-lg bg-white text-gray-700 border-2 border-gray-200 transition-all duration-300 ${hasMoved ? "fixed" : "relative"}`}
            style={hasMoved ? noPosition : {}}
            onMouseEnter={(e) => moveNoButton(e as any)}
            onTouchStart={(e) => moveNoButton(e as any)}
          >
            NIE
          </Button>
        </div>
      </div>
    </PageTransition>
  );
}
