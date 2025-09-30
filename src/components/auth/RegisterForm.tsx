import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { apiClient } from "@/lib/api";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export const RegisterForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"Student" | "Writer">("Student");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast.error("Molimo popunite sva polja");
      return;
    }

    setLoading(true);
    try {
      await apiClient.post("/Auth/Register", {
        username: email,
        password: password,
        roles: [role],
      });

      toast.success("Uspešna registracija! Sada se možete prijaviti.");
      setEmail("");
      setPassword("");
      setRole("Student");
    } catch (error: any) {
      toast.error("Registracija neuspešna! " + (error.message || ""));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md animate-scale-in">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold">Registracija</CardTitle>
        <CardDescription>
          Kreirajte novi nalog u sistemu
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="reg-email">Email</Label>
            <Input
              id="reg-email"
              type="email"
              placeholder="primer@fon.student"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="reg-password">Lozinka</Label>
            <Input
              id="reg-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              required
            />
          </div>
          <div className="space-y-3">
            <Label>Uloga</Label>
            <RadioGroup
              value={role}
              onValueChange={(value) => setRole(value as "Student" | "Writer")}
              disabled={loading}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="Student" id="student" />
                <Label htmlFor="student" className="font-normal cursor-pointer">
                  Student
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="Writer" id="admin" />
                <Label htmlFor="admin" className="font-normal cursor-pointer">
                  Administrator
                </Label>
              </div>
            </RadioGroup>
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Registracija u toku...
              </>
            ) : (
              "Registruj se"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
