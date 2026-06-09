import { useState } from "react";
import { useLocation } from "wouter";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { PageTransition } from "@/components/PageTransition";
import { FloatingHearts } from "@/components/FloatingHearts";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function ChooseDate() {
  const [, setLocation] = useLocation();
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [time, setTime] = useState<string>("");

  const handleNext = () => {
    if (!date || !time) return;
    localStorage.setItem("randka_date", format(date, "yyyy-MM-dd"));
    localStorage.setItem("randka_time", time);
    setLocation("/summary");
  };

  return (
    <PageTransition className="min-h-screen flex flex-col items-center justify-center relative bg-gradient-to-b from-rose-50 to-pink-100 p-6">
      <FloatingHearts />
      
      <div className="z-10 w-full max-w-md">
        <h2 className="text-4xl md:text-5xl font-bold text-rose-600 mb-8 text-center drop-shadow-sm">
          Kiedy? ⏰
        </h2>
        
        <Card className="p-6 md:p-8 border-none shadow-2xl bg-white/90 backdrop-blur-sm rounded-3xl mb-8">
          <div className="flex justify-center mb-8">
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              className="rounded-2xl border border-rose-100 bg-white p-4 shadow-sm"
              disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
            />
          </div>

          <div className="space-y-4">
            <label className="block text-center text-rose-800 font-medium text-lg">Wybierz godzinę</label>
            <Select value={time} onValueChange={setTime}>
              <SelectTrigger className="w-full text-lg py-6 rounded-2xl border-rose-200 bg-white">
                <SelectValue placeholder="Wybierz godzinę" />
              </SelectTrigger>
              <SelectContent className="max-h-60 rounded-xl">
                {Array.from({ length: 24 * 2 }).map((_, i) => {
                  const hour = Math.floor(i / 2);
                  const minute = i % 2 === 0 ? "00" : "30";
                  const timeStr = `${hour.toString().padStart(2, "0")}:${minute}`;
                  return (
                    <SelectItem key={timeStr} value={timeStr} className="text-lg py-3 cursor-pointer">
                      {timeStr}
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>
        </Card>

        <div className="flex justify-center gap-4">
          <Button 
            variant="outline"
            size="lg" 
            onClick={() => setLocation("/choose-type")}
            className="text-lg px-8 py-6 rounded-full border-rose-200 text-rose-600 hover:bg-rose-50"
          >
            Wstecz
          </Button>
          <Button 
            size="lg" 
            disabled={!date || !time}
            onClick={handleNext}
            className="text-lg px-10 py-6 rounded-full shadow-lg bg-rose-500 hover:bg-rose-600 transition-all duration-300 disabled:opacity-50 hover:scale-105"
          >
            Dalej ❤️
          </Button>
        </div>
      </div>
    </PageTransition>
  );
}
