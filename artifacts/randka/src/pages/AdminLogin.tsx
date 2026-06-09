import { useState, useRef } from "react";
import { useLocation } from "wouter";
import { PageTransition } from "@/components/PageTransition";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAdminLogin } from "@workspace/api-client-react";

export default function AdminLogin() {
  const [, setLocation] = useLocation();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const adminLogin = useAdminLogin();
  const mutateFnRef = useRef(adminLogin.mutate);
  mutateFnRef.current = adminLogin.mutate;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    mutateFnRef.current(
      { data: { password } },
      {
        onSuccess: (result) => {
          if (result.success && result.token) {
            localStorage.setItem("randka_adminToken", result.token);
            setLocation("/admin/dashboard");
          } else {
            setError("Błędne hasło");
          }
        },
        onError: () => {
          setError("Błędne hasło lub błąd serwera");
        }
      }
    );
  };

  return (
    <PageTransition className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md p-8 shadow-xl bg-white border-none rounded-2xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-rose-600 mb-2">Panel Admina ❤️</h1>
          <p className="text-gray-500">Zaloguj się, aby zarządzać linkami</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Input 
              type="password"
              placeholder="Hasło" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="text-lg py-6 rounded-xl border-gray-200 focus:border-rose-500 focus:ring-rose-500"
            />
            {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
          </div>

          <Button 
            type="submit" 
            size="lg" 
            disabled={!password || adminLogin.isPending}
            className="w-full text-lg py-6 rounded-xl bg-rose-500 hover:bg-rose-600"
          >
            {adminLogin.isPending ? "Logowanie..." : "Zaloguj"}
          </Button>
        </form>
      </Card>
    </PageTransition>
  );
}
