import { useState, useEffect } from "react";
import { apiClient } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { Ispit, Predmet, Rok, PredmetDeo } from "@/lib/types";
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
import { BookOpen, Plus, Trash2 } from "lucide-react";


export default function Ispiti() {
  const { toast } = useToast();
  const [predmeti, setPredmeti] = useState<Predmet[]>([]);
  const [ispiti, setIspiti] = useState<Ispit[]>([]);
  const [showPrijavaDialog, setShowPrijavaDialog] = useState(false);
  const [selectedPredmet, setSelectedPredmet] = useState<Predmet | null>(null);
  const [rokovi, setRokovi] = useState<Rok[]>([]);
  const [predmetDelovi, setPredmetDelovi] = useState<PredmetDeo[]>([]);
  const [selectedRok, setSelectedRok] = useState<Rok | null>(null);
  const [formData, setFormData] = useState({
    idRok: 0,
    deoId: 0,
    godina: new Date().getFullYear(),
  });

  const studentId = sessionStorage.getItem("studentId");

  useEffect(() => {
    if (studentId) {
      fetchStudentPredmeti();
      fetchStudentIspiti();
      fetchRokovi();
    }
  }, [studentId]);

  const fetchRokovi = async () => {
    try {
      const data = await apiClient.get("/Rok");
      setRokovi(data || []);
    } catch (error) {
      toast({
        title: "Greška",
        description: "Nije moguće učitati rokove.",
        variant: "destructive",
      });
    }
  };

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
      const data = await apiClient.get(`/Prijava/student/${studentId}`);
      setIspiti(data || []);
    } catch (error) {
      console.error("Error fetching ispiti:", error);
    }
  };

  const handleOdjaviIspit = async (ispitId: string) => {
    try {
      await apiClient.delete(`/Prijava/${ispitId}`);
      toast({
        title: "Uspešno",
        description: "Ispit je uspešno odjavljen.",
      });
      fetchStudentIspiti();
    } catch (error) {
      toast({
        title: "Greška",
        description: "Nije moguće odjaviti ispit.",
        variant: "destructive",
      });
    }
  };

  const openPrijavaDialog = async (predmet: Predmet) => {
    setSelectedPredmet(predmet);
    setFormData({
      idRok: 0,
      deoId: 0,
      godina: new Date().getFullYear(),
    });
    setSelectedRok(null);
    
    // Učitaj delove predmeta
    try {
      const data = await apiClient.get(`/PredmetDelovi/${predmet.id}/delovi`);
      setPredmetDelovi(data || []);
    } catch (error) {
      toast({
        title: "Greška",
        description: "Nije moguće učitati delove predmeta.",
        variant: "destructive",
      });
    }
    
    setShowPrijavaDialog(true);
  };

  const handlePrijavaIspita = async () => {
    if (!selectedPredmet || !studentId || !formData.idRok || !formData.deoId) {
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
        idRok: formData.idRok,
        godina: formData.godina,
        stavke: [
          {
            deoId: formData.deoId,
            poeni: 0,
            ocena: 0,
          },
        ],
      };

      await apiClient.post("/Prijava", payload);
      
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
                  <TableHead>Datum Prijave</TableHead>
                  <TableHead>Datum Početka</TableHead>
                  <TableHead>Datum Završetka</TableHead>
                  <TableHead>Akcije</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {ispiti.map((ispit) => (
                  <TableRow key={ispit.id}>
                    <TableCell className="font-medium">
                      {ispit.predmetNaziv}
                    </TableCell>
                    <TableCell>{ispit.rokTip}</TableCell>
                    <TableCell>
                      {ispit.stavke?.map((s) => s.deoNaziv).join(", ") || "N/A"}
                    </TableCell>
                    <TableCell>
                      {ispit.datumPrijave
                        ? new Date(ispit.datumPrijave).toLocaleDateString("sr-RS")
                        : new Date().toLocaleDateString("sr-RS")}
                    </TableCell>
                    <TableCell>
                      {new Date(ispit.rokDatumPocetka).toLocaleDateString("sr-RS")}
                    </TableCell>
                    <TableCell>
                      {new Date(ispit.rokDatumZavrsetka).toLocaleDateString("sr-RS")}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleOdjaviIspit(ispit.id)}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Odjavi
                      </Button>
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
                value={formData.idRok.toString()}
                onValueChange={(value) => {
                  const idRok = parseInt(value);
                  const rok = rokovi.find((r) => r.idRok === idRok);
                  setSelectedRok(rok || null);
                  setFormData({ ...formData, idRok });
                }}
              >
                <SelectTrigger id="rok">
                  <SelectValue placeholder="Izaberite rok" />
                </SelectTrigger>
                <SelectContent>
                  {rokovi.map((rok) => (
                    <SelectItem key={rok.idRok} value={rok.idRok.toString()}>
                      {rok.tip}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedRok && (
              <>
                <div className="grid gap-2">
                  <Label htmlFor="datumPocetka">Datum Početka</Label>
                  <Input
                    id="datumPocetka"
                    type="text"
                    value={new Date(selectedRok.datumPocetka).toLocaleDateString("sr-RS")}
                    disabled
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="datumZavrsetka">Datum Završetka</Label>
                  <Input
                    id="datumZavrsetka"
                    type="text"
                    value={new Date(selectedRok.datumZavrsetka).toLocaleDateString("sr-RS")}
                    disabled
                  />
                </div>
              </>
            )}

            <div className="grid gap-2">
              <Label htmlFor="deo">Deo Predmeta</Label>
              <Select
                value={formData.deoId.toString()}
                onValueChange={(value) =>
                  setFormData({ ...formData, deoId: parseInt(value) })
                }
              >
                <SelectTrigger id="deo">
                  <SelectValue placeholder="Izaberite deo" />
                </SelectTrigger>
                <SelectContent>
                  {predmetDelovi.map((deo) => (
                    <SelectItem key={deo.deoId} value={deo.deoId.toString()}>
                      {deo.naziv}
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
                  setFormData({ ...formData, godina: parseInt(e.target.value) })
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
