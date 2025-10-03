import { useState, useEffect } from "react";
import { apiClient } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { Ispit, Predmet } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { BookOpen, Plus } from "lucide-react";

const rokOptions = [
  "Januarski",
  "Februarski",
  "Aprilski",
  "Junski",
  "Avgustovski",
  "Septembar 1",
  "Septembar 2",
  "Oktobar",
];

const deoOptions = [
  "Pismeni",
  "Usmeni",
  "Ceo ispit",
  "Kolokvijum 1",
  "Kolokvijum 2",
];

export default function Ispiti() {
  const { toast } = useToast();
  const [predmeti, setPredmeti] = useState<Predmet[]>([]);
  const [ispiti, setIspiti] = useState<Ispit[]>([]);
  const [showPrijavaDialog, setShowPrijavaDialog] = useState(false);
  const [selectedPredmet, setSelectedPredmet] = useState<Predmet | null>(null);
  const [formData, setFormData] = useState({
    rok: "",
    deo: "",
    godina: new Date().getFullYear().toString(),
  });

  const studentId = sessionStorage.getItem("studentId");

  useEffect(() => {
    if (studentId) {
      fetchStudentPredmeti();
      fetchStudentIspiti();
    }
  }, [studentId]);

  const fetchStudentPredmeti = async () => {
    try {
      const studentIndex = sessionStorage.getItem("studentIndex");
      if (!studentIndex) return;
      
      const data = await apiClient.get(`/Students/${studentIndex}`);
      setPredmeti(data.predmeti || []);
    } catch (error) {
      toast({
        title: "Greška",
        description: "Nije moguće učitati predmete.",
        variant: "destructive",
      });
    }
  };

  const fetchStudentIspiti = async () => {
    try {
      if (!studentId) return;
      const data = await apiClient.get(`/Ispit/student/${studentId}`);
      setIspiti(data || []);
    } catch (error) {
      console.error("Error fetching ispiti:", error);
    }
  };

  const openPrijavaDialog = (predmet: Predmet) => {
    setSelectedPredmet(predmet);
    setFormData({
      rok: "",
      deo: "",
      godina: new Date().getFullYear().toString(),
    });
    setShowPrijavaDialog(true);
  };

  const handlePrijavaIspita = async () => {
    if (!selectedPredmet || !studentId || !formData.rok || !formData.deo) {
      toast({
        title: "Greška",
        description: "Molimo popunite sva polja.",
        variant: "destructive",
      });
      return;
    }

    try {
      const payload = {
        studentId: studentId,
        predmetId: selectedPredmet.id,
        rok: formData.rok,
        godina: parseInt(formData.godina),
        stavke: [
          {
            deo: formData.deo,
            stavkaId: crypto.randomUUID(),
          },
        ],
      };

      await apiClient.post("/Ispit", payload);
      
      toast({
        title: "Uspešno",
        description: "Ispit je uspešno prijavljen.",
      });

      setShowPrijavaDialog(false);
      fetchStudentIspiti();
    } catch (error) {
      toast({
        title: "Greška",
        description: "Nije moguće prijaviti ispit.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Moji Ispiti</h1>
        <p className="text-muted-foreground">
          Prijavite ispite i pratite status prijava
        </p>
      </div>

      <div className="grid gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Moji Predmeti</CardTitle>
            <CardDescription>
              Kliknite na dugme "Prijavi" da prijavite ispit
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {predmeti.map((predmet) => (
                <Card key={predmet.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <BookOpen className="h-5 w-5 text-primary" />
                      <span className="text-xs text-muted-foreground">
                        {predmet.espb} ESPB
                      </span>
                    </div>
                    <CardTitle className="text-lg">{predmet.naziv}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Button
                      onClick={() => openPrijavaDialog(predmet)}
                      className="w-full"
                      size="sm"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Prijavi
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
            {predmeti.length === 0 && (
              <p className="text-center text-muted-foreground py-8">
                Nemate dodeljene predmete.
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Prijavljeni Ispiti</CardTitle>
            <CardDescription>
              Pregled svih prijavljivanih ispita
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Predmet</TableHead>
                  <TableHead>Rok</TableHead>
                  <TableHead>Deo</TableHead>
                  <TableHead>Godina</TableHead>
                  <TableHead>Datum Prijave</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {ispiti.map((ispit) => (
                  <TableRow key={ispit.id}>
                    <TableCell className="font-medium">
                      {ispit.predmet?.naziv || "N/A"}
                    </TableCell>
                    <TableCell>{ispit.rok}</TableCell>
                    <TableCell>
                      {ispit.stavke?.map((s) => s.deo).join(", ") || "N/A"}
                    </TableCell>
                    <TableCell>{ispit.godina}</TableCell>
                    <TableCell>
                      {ispit.datumPrijave
                        ? new Date(ispit.datumPrijave).toLocaleDateString("sr-RS")
                        : new Date().toLocaleDateString("sr-RS")}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {ispiti.length === 0 && (
              <p className="text-center text-muted-foreground py-8">
                Nemate prijavljenih ispita.
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog open={showPrijavaDialog} onOpenChange={setShowPrijavaDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Prijavi Ispit</DialogTitle>
            <DialogDescription>
              {selectedPredmet?.naziv} - Popunite podatke za prijavu ispita
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="rok">Rok</Label>
              <Select
                value={formData.rok}
                onValueChange={(value) =>
                  setFormData({ ...formData, rok: value })
                }
              >
                <SelectTrigger id="rok">
                  <SelectValue placeholder="Izaberite rok" />
                </SelectTrigger>
                <SelectContent>
                  {rokOptions.map((rok) => (
                    <SelectItem key={rok} value={rok}>
                      {rok}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="deo">Deo Ispita</Label>
              <Select
                value={formData.deo}
                onValueChange={(value) =>
                  setFormData({ ...formData, deo: value })
                }
              >
                <SelectTrigger id="deo">
                  <SelectValue placeholder="Izaberite deo" />
                </SelectTrigger>
                <SelectContent>
                  {deoOptions.map((deo) => (
                    <SelectItem key={deo} value={deo}>
                      {deo}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="godina">Godina</Label>
              <Input
                id="godina"
                type="number"
                value={formData.godina}
                onChange={(e) =>
                  setFormData({ ...formData, godina: e.target.value })
                }
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPrijavaDialog(false)}>
              Otkaži
            </Button>
            <Button onClick={handlePrijavaIspita}>Prijavi Ispit</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
