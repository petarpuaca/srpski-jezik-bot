import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { apiClient } from "@/lib/api";
import { Profesor, Predmet } from "@/lib/types";
import { useAuth } from "@/lib/auth-context";
import { toast } from "sonner";
import { UserPlus, Edit, Trash2, Plus, Search, BookOpen, Loader2, X } from "lucide-react";

const Profesori = () => {
  const [profesori, setProfesori] = useState<Profesor[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterOn, setFilterOn] = useState("Ime");
  const [filterQuery, setFilterQuery] = useState("");
  const { role } = useAuth();
  
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showAddPredmetDialog, setShowAddPredmetDialog] = useState(false);
  const [currentProfesor, setCurrentProfesor] = useState<Profesor | null>(null);
  const [allPredmeti, setAllPredmeti] = useState<Predmet[]>([]);
  const [selectedPredmetId, setSelectedPredmetId] = useState("");
  
  const [formData, setFormData] = useState({
    ime: "",
    prezime: "",
    email: "",
  });

  useEffect(() => {
    fetchProfesori();
    fetchAllPredmeti();
  }, []);

  const fetchProfesori = async (filter?: { on: string; query: string }) => {
    setLoading(true);
    try {
      let endpoint = "/Profesor";
      if (filter?.on && filter?.query) {
        endpoint += `?filterOn=${encodeURIComponent(filter.on)}&query=${encodeURIComponent(filter.query)}`;
      }
      const data = await apiClient.get(endpoint);
      setProfesori(data);
    } catch (error: any) {
      toast.error("Greška pri učitavanju profesora: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchAllPredmeti = async () => {
    try {
      const data = await apiClient.get("/Predmet?pageNumber=1&pageSize=1000");
      setAllPredmeti(data.predmeti || []);
    } catch (error: any) {
      toast.error("Greška pri učitavanju predmeta: " + error.message);
    }
  };

  const handleFilter = () => {
    if (filterQuery.trim()) {
      fetchProfesori({ on: filterOn, query: filterQuery });
    } else {
      fetchProfesori();
    }
  };

  const handleAddProfesor = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiClient.post("/Profesor", formData);
      toast.success("Profesor uspešno dodat!");
      setShowAddDialog(false);
      setFormData({ ime: "", prezime: "", email: "" });
      fetchProfesori();
    } catch (error: any) {
      toast.error("Greška: " + error.message);
    }
  };

  const handleEditProfesor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentProfesor) return;
    try {
      await apiClient.put(`/Profesor/${currentProfesor.id}`, formData);
      toast.success("Profesor uspešno izmenjen!");
      setShowEditDialog(false);
      setCurrentProfesor(null);
      fetchProfesori();
    } catch (error: any) {
      toast.error("Greška: " + error.message);
    }
  };

  const handleDeleteProfesor = async (id: string) => {
    if (!confirm("Da li ste sigurni da želite da obrišete profesora?")) return;
    try {
      await apiClient.delete(`/Profesor/${id}`);
      toast.success("Profesor obrisan!");
      fetchProfesori();
    } catch (error: any) {
      toast.error("Greška: " + error.message);
    }
  };

  const openEditDialog = (profesor: Profesor) => {
    setCurrentProfesor(profesor);
    setFormData({
      ime: profesor.ime,
      prezime: profesor.prezime,
      email: profesor.email,
    });
    setShowEditDialog(true);
  };

  const openAddPredmetDialog = (profesor: Profesor) => {
    setCurrentProfesor(profesor);
    setSelectedPredmetId("");
    setShowAddPredmetDialog(true);
  };

  const handleAddPredmetToProfesor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentProfesor || !selectedPredmetId) return;
    try {
      await apiClient.post(`/Profesor/${currentProfesor.id}/predmet/${selectedPredmetId}`);
      toast.success("Predmet uspešno dodat profesoru!");
      setShowAddPredmetDialog(false);
      setSelectedPredmetId("");
      fetchProfesori();
    } catch (error: any) {
      toast.error("Greška: " + error.message);
    }
  };

  const handleRemovePredmetFromProfesor = async (profesorId: string, predmetId: string) => {
    if (!confirm("Da li ste sigurni da želite da uklonite predmet?")) return;
    try {
      await apiClient.delete(`/Profesor/${profesorId}/predmet/${predmetId}`);
      toast.success("Predmet uklonjen!");
      fetchProfesori();
    } catch (error: any) {
      toast.error("Greška: " + error.message);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Profesori</h1>
          {role === "Admin" && (
            <Button onClick={() => setShowAddDialog(true)} className="gap-2">
              <UserPlus className="h-4 w-4" />
              Dodaj profesora
            </Button>
          )}
        </div>

        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex gap-3">
              <Select value={filterOn} onValueChange={setFilterOn}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Ime">Ime</SelectItem>
                  <SelectItem value="Prezime">Prezime</SelectItem>
                  <SelectItem value="Email">Email</SelectItem>
                </SelectContent>
              </Select>
              <Input
                placeholder={`Pretraži po ${filterOn.toLowerCase()}...`}
                value={filterQuery}
                onChange={(e) => setFilterQuery(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleFilter()}
                className="flex-1"
              />
              <Button onClick={handleFilter} className="gap-2">
                <Search className="h-4 w-4" />
                Pretraži
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {profesori.map((profesor) => (
            <Card key={profesor.id} className="hover-lift">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">
                      {profesor.ime} {profesor.prezime}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      {profesor.email}
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="mb-3">
                  <div className="flex items-center gap-2 mb-2">
                    <BookOpen className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Predmeti:</span>
                    {role === "Admin" && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => openAddPredmetDialog(profesor)}
                        className="h-6 w-6 p-0 ml-auto"
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                  {profesor.predmeti && profesor.predmeti.length > 0 ? (
                    <ul className="space-y-1">
                      {profesor.predmeti.map((predmet, idx) => (
                        <li key={idx} className="text-sm py-1 px-2 bg-secondary/50 rounded flex items-center justify-between">
                          <span>{predmet.naziv}</span>
                          {role === "Admin" && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleRemovePredmetFromProfesor(profesor.id, predmet.id)}
                              className="h-5 w-5 p-0 hover:bg-destructive/10"
                            >
                              <X className="h-3 w-3 text-destructive" />
                            </Button>
                          )}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-muted-foreground italic">Nema predmeta</p>
                  )}
                </div>
                {role === "Admin" && (
                  <div className="flex gap-2 mt-4">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => openEditDialog(profesor)}
                      className="flex-1 gap-2"
                    >
                      <Edit className="h-3 w-3" />
                      Izmeni
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDeleteProfesor(profesor.id)}
                      className="gap-2"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {profesori.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Nema profesora za prikaz</p>
          </div>
        )}

        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Dodaj novog profesora</DialogTitle>
              <DialogDescription>Unesite podatke o novom profesoru</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAddProfesor} className="space-y-4">
              <div className="space-y-2">
                <Label>Ime</Label>
                <Input
                  value={formData.ime}
                  onChange={(e) => setFormData({ ...formData, ime: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Prezime</Label>
                <Input
                  value={formData.prezime}
                  onChange={(e) => setFormData({ ...formData, prezime: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>
              <Button type="submit" className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                Dodaj profesora
              </Button>
            </form>
          </DialogContent>
        </Dialog>

        <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Izmeni profesora</DialogTitle>
              <DialogDescription>Izmenite podatke o profesoru</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleEditProfesor} className="space-y-4">
              <div className="space-y-2">
                <Label>Ime</Label>
                <Input
                  value={formData.ime}
                  onChange={(e) => setFormData({ ...formData, ime: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Prezime</Label>
                <Input
                  value={formData.prezime}
                  onChange={(e) => setFormData({ ...formData, prezime: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>
              <Button type="submit" className="w-full">Sačuvaj izmene</Button>
            </form>
          </DialogContent>
        </Dialog>

        <Dialog open={showAddPredmetDialog} onOpenChange={setShowAddPredmetDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Dodaj predmet profesoru</DialogTitle>
              <DialogDescription>
                Dodavanje predmeta za: {currentProfesor?.ime} {currentProfesor?.prezime}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAddPredmetToProfesor} className="space-y-4">
              <div className="space-y-2">
                <Label>Predmet</Label>
                <Select value={selectedPredmetId} onValueChange={setSelectedPredmetId} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Izaberite predmet" />
                  </SelectTrigger>
                  <SelectContent>
                    {allPredmeti
                      .filter(p => !currentProfesor?.predmeti?.some(pp => pp.id === p.id))
                      .map((predmet) => (
                        <SelectItem key={predmet.id} value={predmet.id}>
                          {predmet.naziv} ({predmet.espb} ESPB)
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
              <Button type="submit" className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                Dodaj predmet
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default Profesori;
