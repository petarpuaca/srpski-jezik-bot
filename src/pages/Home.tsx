import { useState } from "react";
import { LoginForm } from "@/components/auth/LoginForm";
import { RegisterForm } from "@/components/auth/RegisterForm";
import { Button } from "@/components/ui/button";
import { GraduationCap } from "lucide-react";

const Home = () => {
  const [showLogin, setShowLogin] = useState(true);

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1 flex flex-col items-center justify-center p-4 bg-gradient-to-br from-background via-accent/5 to-primary/5">
        <div className="text-center mb-8 animate-fade-in">
          <div className="flex items-center justify-center gap-3 mb-4">
            <GraduationCap className="h-12 w-12 text-primary" />
            <h1 className="text-5xl font-bold">E-Student</h1>
          </div>
          <p className="text-lg text-muted-foreground max-w-md">
            Profesionalni sistem za upravljanje studentima, profesorima i predmetima
          </p>
        </div>

        <div className="w-full max-w-md">
          {showLogin ? <LoginForm /> : <RegisterForm />}
          
          <div className="mt-4 text-center">
            <Button
              variant="link"
              onClick={() => setShowLogin(!showLogin)}
              className="text-sm"
            >
              {showLogin
                ? "Nemate nalog? Registrujte se"
                : "Već imate nalog? Prijavite se"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
