import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { apiClient, setAuthToken, extractIndexFromEmail } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export const LoginForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast.error("Molimo popunite sva polja");
      return;
    }

    setLoading(true);
    try {
      const response = await apiClient.post("/Auth/Login", {
        username: email,
        password: password,
      });

      if (response.jwtToken) {
        setAuthToken(response.jwtToken);
      }

      const uiRole = response.roles && response.roles[0] === "Writer" ? "Administrator" : "Student";
      
      // If student, fetch their data and store studentId
      if (uiRole === "Student") {
        try {
          const indexFromEmail = extractIndexFromEmail(email);
          if (indexFromEmail) {
            const studentData = await apiClient.get(`/Students/${indexFromEmail}`);
            sessionStorage.setItem("studentId", studentData.id);
            sessionStorage.setItem("studentIndex", indexFromEmail);
          }
        } catch (err) {
          console.error("Failed to fetch student data:", err);
        }
      }
      
      login(email, uiRole);

      if (uiRole === "Student") {
        const studentIndex = extractIndexFromEmail(email);
        toast.success(`Dobrodošli, student ${studentIndex || email}!`);
      } else {
        toast.success("Dobrodošli, administratore!");
      }

      navigate("/dashboard");
    } catch (error: any) {
      toast.error("Neuspešna prijava! " + (error.message || "Proverite kredencijale."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md animate-scale-in">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold">Prijava</CardTitle>
        <CardDescription>
          Unesite vaše kredencijale za pristup sistemu
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="primer@fon.student"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Lozinka</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              required
            />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Prijava u toku...
              </>
            ) : (
              "Prijavi se"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
