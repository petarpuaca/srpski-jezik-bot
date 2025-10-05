import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { apiClient } from "@/lib/api";
import { Rok, PrijavaPoRoku, Ispit } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ClipboardEdit, Save } from "lucide-react";

export default function PrijavePoRoku() {
  const [rokovi, setRokovi] = useState<Rok[]>([]);
  const [selectedRokId, setSelectedRokId] = useState<number | null>(null);
  const [prijave, setPrijave] = useState<PrijavaPoRoku[]>([]);
  const [loading, setLoading] = useState(true);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedPrijava, setSelectedPrijava] = useState<PrijavaPoRoku | null>(null);
  const [studentPrijave, setStudentPrijave] = useState<Ispit[]>([]);
  const [editedData, setEditedData] = useState<{ [key: string]: { poeni: number; ocena: number } }>({});
  const { toast } = useToast();

  useEffect(() => {
    fetchRokovi();
  }, []);

  useEffect(() => {
    if (selectedRokId) {
      fetchPrijavePoRoku(selectedRokId);
    }
  }, [selectedRokId]);

  const fetchRokovi = async () => {
    try {
      const data = await apiClient.get("/Rok");
      setRokovi(data);
    } catch (error: any) {
      toast({
        title: "Greška",
        description: "Nije moguće učitati rokove",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchPrijavePoRoku = async (rokId: number) => {
    try {
      setLoading(true);
      const data = await apiClient.get(`/Prijava/rok/${rokId}`);
      setPrijave(data);
    } catch (error: any) {
      toast({
        title: "Greška",
        description: "Nije moguće učitati prijave za odabrani rok",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDetails = async (prijava: PrijavaPoRoku) => {
    setSelectedPrijava(prijava);
    setDetailsOpen(true);
    try {
      const data = await apiClient.get(
        `/Prijava/student/${prijava.studentId}/predmet/${prijava.predmetId}`
      );
      setStudentPrijave(data);
      
      // Initialize edited data with current values
      const initialData: { [key: string]: { poeni: number; ocena: number } } = {};
      data.forEach((ispit: Ispit) => {
        ispit.stavke.forEach((stavka) => {
          initialData[stavka.id] = {
            poeni: stavka.poeni,
            ocena: stavka.ocena,
          };
        });
      });
      setEditedData(initialData);
    } catch (error: any) {
      toast({
        title: "Greška",
        description: "Nije moguće učitati detalje prijava",
        variant: "destructive",
      });
    }
  };

  const handleSaveStavka = async (stavkaId: string, studentId: string, predmetId: string) => {
    try {
      const data = editedData[stavkaId];
      if (!data) return;

      // Update points (and grade if provided)
      await apiClient.patch(
        `/Prijava/student/${studentId}/predmet/${predmetId}/stavka/${stavkaId}`,
        {
          poeni: data.poeni,
          ...(data.ocena > 0 && { ocena: data.ocena }),
        }
      );

      // If grade is provided, also update the subject grade
      if (data.ocena > 0) {
        await apiClient.put(
          `/StudentPredmet/${studentId}/${predmetId}/ocena`,
          data.ocena
        );
      }

      toast({
        title: "Uspeh",
        description: "Podaci su uspešno sačuvani",
      });

      // Refresh data
      if (selectedPrijava) {
        await handleOpenDetails(selectedPrijava);
      }
      if (selectedRokId) {
        await fetchPrijavePoRoku(selectedRokId);
      }
    } catch (error: any) {
      toast({
        title: "Greška",
        description: "Nije moguće sačuvati podatke",
        variant: "destructive",
      });
    }
  };

  const handleInputChange = (stavkaId: string, field: "poeni" | "ocena", value: string) => {
    const numValue = parseInt(value) || 0;
    setEditedData((prev) => ({
      ...prev,
      [stavkaId]: {
        ...prev[stavkaId],
        [field]: numValue,
      },
    }));
  };

  if (loading && rokovi.length === 0) {
    return (
      <div className="container mx-auto py-8 px-4">
        <p className="text-center">Učitavanje...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Prijave po Rokovima</h1>
        <p className="text-muted-foreground">Unos ocena za prijavljene ispite</p>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Izaberite rok</CardTitle>
        </CardHeader>
        <CardContent>
          <Select
            value={selectedRokId?.toString() || ""}
            onValueChange={(value) => setSelectedRokId(parseInt(value))}
          >
            <SelectTrigger className="w-full md:w-[300px]">
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
        </CardContent>
      </Card>

      {selectedRokId && (
        <Card>
          <CardHeader>
            <CardTitle>Prijave</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-center py-8">Učitavanje...</p>
            ) : prijave.length === 0 ? (
              <p className="text-center py-8 text-muted-foreground">
                Nema prijava za odabrani rok
              </p>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Predmet</TableHead>
                      <TableHead>Ime i Prezime</TableHead>
                      <TableHead>Index</TableHead>
                      <TableHead>Deo</TableHead>
                      <TableHead className="text-right">Akcije</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {prijave.map((prijava) => (
                      <TableRow key={prijava.prijavaId}>
                        <TableCell className="font-medium">{prijava.predmetNaziv}</TableCell>
                        <TableCell>
                          {prijava.studentIme} {prijava.studentPrezime}
                        </TableCell>
                        <TableCell>{prijava.studentIndex}</TableCell>
                        <TableCell>{prijava.stavke[0]?.deoNaziv || "N/A"}</TableCell>
                        <TableCell className="text-right">
                          <Button
                            onClick={() => handleOpenDetails(prijava)}
                            variant="outline"
                            size="sm"
                          >
                            <ClipboardEdit className="w-4 h-4 mr-2" />
                            Unesi
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Prijave - {selectedPrijava?.studentIme} {selectedPrijava?.studentPrezime} ({selectedPrijava?.studentIndex})
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {studentPrijave.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                Nema prijava za ovaj predmet
              </p>
            ) : (
              studentPrijave.map((ispit) => (
                <Card key={ispit.id}>
                  <CardContent className="pt-6">
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div>
                          <p className="text-sm text-muted-foreground">Rok</p>
                          <p className="font-medium">{ispit.rokTip}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Deo</p>
                          <p className="font-medium">{ispit.stavke[0]?.deoNaziv || "N/A"}</p>
                        </div>
                      </div>
                      {ispit.stavke.map((stavka) => (
                        <div key={stavka.id} className="border-t pt-4">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                            <div>
                              <Label htmlFor={`poeni-${stavka.id}`}>Poeni</Label>
                              <Input
                                id={`poeni-${stavka.id}`}
                                type="number"
                                min="0"
                                value={editedData[stavka.id]?.poeni || 0}
                                onChange={(e) =>
                                  handleInputChange(stavka.id, "poeni", e.target.value)
                                }
                              />
                            </div>
                            <div>
                              <Label htmlFor={`ocena-${stavka.id}`}>Ocena</Label>
                              <Input
                                id={`ocena-${stavka.id}`}
                                type="number"
                                min="0"
                                max="10"
                                value={editedData[stavka.id]?.ocena || 0}
                                onChange={(e) =>
                                  handleInputChange(stavka.id, "ocena", e.target.value)
                                }
                              />
                            </div>
                            <div>
                              <Button
                                onClick={() =>
                                  handleSaveStavka(stavka.id, ispit.studentId, ispit.predmetId)
                                }
                                className="w-full"
                              >
                                <Save className="w-4 h-4 mr-2" />
                                Sačuvaj
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
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
