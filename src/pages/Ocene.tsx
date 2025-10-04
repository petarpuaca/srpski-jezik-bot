import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { apiClient } from "@/lib/api";
import { Student, Ispit } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { Award, FileText } from "lucide-react";

export default function Ocene() {
  const [student, setStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPredmet, setSelectedPredmet] = useState<{ id: string; naziv: string } | null>(null);
  const [prijave, setPrijave] = useState<Ispit[]>([]);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchStudentData();
  }, []);

  const fetchStudentData = async () => {
    try {
      const studentIndex = sessionStorage.getItem("studentIndex");
      if (!studentIndex) {
        toast({
          title: "Greška",
          description: "Index studenta nije pronađen",
          variant: "destructive",
        });
        return;
      }

      const data = await apiClient.get(`/Students/${encodeURIComponent(studentIndex)}`);
      setStudent(data);
    } catch (error: any) {
      toast({
        title: "Greška",
        description: "Nije moguće učitati podatke o studentu",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchPredmetDetails = async (predmetId: string) => {
    try {
      const studentId = sessionStorage.getItem("studentId");
      if (!studentId) return;

      const data = await apiClient.get(`/Prijava/student/${studentId}/predmet/${predmetId}`);
      setPrijave(data);
    } catch (error: any) {
      toast({
        title: "Greška",
        description: "Nije moguće učitati detalje prijava",
        variant: "destructive",
      });
    }
  };

  const handleOpenDetails = async (predmetId: string, predmetNaziv: string) => {
    setSelectedPredmet({ id: predmetId, naziv: predmetNaziv });
    setDetailsOpen(true);
    await fetchPredmetDetails(predmetId);
  };

  const getOcenaColor = (ocena: number) => {
    if (ocena === 5) return "text-yellow-500";
    if (ocena > 5) return "text-green-500";
    return "text-muted-foreground";
  };

  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <p className="text-center">Učitavanje...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Moje Ocene</h1>
        <p className="text-muted-foreground">
          Pregled svih ocena i prijavljenih ispita
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {student?.predmeti?.map((predmet) => (
          <Card key={predmet.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="w-5 h-5" />
                {predmet.naziv}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Ocena:</span>
                  <span className={`text-2xl font-bold ${getOcenaColor(predmet.ocena)}`}>
                    {predmet.ocena}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">ESPB:</span>
                  <Badge variant="secondary">{predmet.espb}</Badge>
                </div>
                <Button
                  onClick={() => handleOpenDetails(predmet.id, predmet.naziv)}
                  className="w-full"
                  variant="outline"
                >
                  <FileText className="w-4 h-4 mr-2" />
                  Detalji
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detalji prijava - {selectedPredmet?.naziv}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {prijave.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                Nema prijavljenih ispita za ovaj predmet
              </p>
            ) : (
              prijave.map((prijava) => (
                <Card key={prijava.id}>
                  <CardContent className="pt-6">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Rok</p>
                        <p className="font-medium">{prijava.rokTip}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Deo</p>
                        <p className="font-medium">{prijava.stavke[0]?.deoNaziv || "N/A"}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Poeni</p>
                        <p className="font-medium">{prijava.stavke[0]?.poeni || 0}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Ocena</p>
                        <p className={`font-bold text-lg ${prijava.stavke[0]?.ocena ? getOcenaColor(prijava.stavke[0].ocena) : "text-muted-foreground"}`}>
                          {prijava.stavke[0]?.ocena || "Nije ocenjeno"}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
