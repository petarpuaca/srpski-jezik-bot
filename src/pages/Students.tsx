import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { apiClient } from "@/lib/api";
import { Student, Predmet } from "@/lib/types";
import { useAuth } from "@/lib/auth-context";
import { toast } from "sonner";
import {
  UserPlus,
  Edit,
  Trash2,
  Plus,
  Search,
  BookOpen,
  Loader2,
  X,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

const Students = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterOn, setFilterOn] = useState("Ime");
  const [filterQuery, setFilterQuery] = useState("");
  const { role } = useAuth();

  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showAddPredmetDialog, setShowAddPredmetDialog] = useState(false);
  const [currentStudent, setCurrentStudent] = useState<Student | null>(null);
  const [allPredmeti, setAllPredmeti] = useState<Predmet[]>([]);
  const [selectedPredmetId, setSelectedPredmetId] = useState("");

  const [formData, setFormData] = useState({
    ime: "",
    prezime: "",
    index: "",
    smer: "",
  });

  useEffect(() => {
    fetchStudents();
    fetchAllPredmeti();
  }, []);

  const fetchStudents = async (filter?: { on: string; query: string }) => {
    setLoading(true);
    try {
      let endpoint = "/Students";
      if (filter?.on && filter?.query) {
        endpoint += `?filterOn=${encodeURIComponent(
          filter.on
        )}&query=${encodeURIComponent(filter.query)}`;
      }
      const data = await apiClient.get(endpoint);
      setStudents(data);
    } catch (error: any) {
      toast.error("Greška pri učitavanju studenata: " + error.message);
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
      fetchStudents({ on: filterOn, query: filterQuery });
    } else {
      fetchStudents();
    }
  };

  const handleAddStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiClient.post("/Students", formData);
      toast.success("Student uspešno dodat!");
      setShowAddDialog(false);
      setFormData({ ime: "", prezime: "", index: "", smer: "" });
      fetchStudents();
    } catch (error: any) {
      toast.error("Greška: " + error.message);
    }
  };

  const handleEditStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentStudent) return;
    try {
      await apiClient.put(`/Student/${currentStudent.id}`, formData);
      toast.success("Student uspešno izmenjen!");
      setShowEditDialog(false);
      setCurrentStudent(null);
      fetchStudents();
    } catch (error: any) {
      toast.error("Greška: " + error.message);
    }
  };

  const handleDeleteStudent = async (id: string) => {
    if (!confirm("Da li ste sigurni da želite da obrišete studenta?")) return;
    try {
      await apiClient.delete(`/Students/${id}`);
      toast.success("Student obrisan!");
      fetchStudents();
    } catch (error: any) {
      toast.error("Greška: " + error.message);
    }
  };

  const openEditDialog = (student: Student) => {
    setCurrentStudent(student);
    setFormData({
      ime: student.ime,
      prezime: student.prezime,
      index: student.index,
      smer: student.smer,
    });
    setShowEditDialog(true);
  };

  const openAddPredmetDialog = (student: Student) => {
    setCurrentStudent(student);
    setSelectedPredmetId("");
    setShowAddPredmetDialog(true);
  };

  // const handleAddPredmetToStudent = async (e: React.FormEvent) => {
  //   e.preventDefault();
  //   if (!currentStudent || !selectedPredmetId) return;
  //   try {
  //     await apiClient.post(
  //       `/Students/${currentStudent.id}/predmet/${selectedPredmetId}`
  //     );
  //     toast.success("Predmet uspešno dodat studentu!");
  //     setShowAddPredmetDialog(false);
  //     setSelectedPredmetId("");
  //     fetchStudents();
  //   } catch (error: any) {
  //     toast.error("Greška: " + error.message);
  //   }
  // };

  const handleAddPredmetToStudent = async (
    e: React.FormEvent | React.MouseEvent<HTMLButtonElement>
  ) => {
    // spreči submit/refresh
    if ("preventDefault" in e) e.preventDefault();

    if (!currentStudent?.id) {
      toast.error("Nije izabran student.");
      return;
    }
    if (!selectedPredmetId) {
      toast.error("Izaberi predmet.");
      return;
    }

    try {
      // Backend ruta: POST /api/StudentPredmet/{studentId},{predmetId}
      const path = `/StudentPredmet/${encodeURIComponent(
        currentStudent.id
      )},${encodeURIComponent(selectedPredmetId)}`;

      // Pošto backend čita iz route parametara, telo nije potrebno (pošalji null)
      await apiClient.post(path, null);

      toast.success("Predmet uspešno dodat studentu!");
      setShowAddPredmetDialog(false);
      setSelectedPredmetId("");
      if (typeof fetchStudents === "function") {
        await fetchStudents(); // osveži listu
      }
    } catch (err: any) {
      const msg =
        err?.response?.data?.title ||
        err?.response?.data?.message ||
        (typeof err?.response?.data === "string" ? err.response.data : "") ||
        err?.message ||
        "Došlo je do greške.";
      toast.error("Greška: " + msg);
    }
  };

  // const handleRemovePredmetFromStudent = async (
  //   studentId: string,
  //   predmetId: string
  // ) => {
  //   if (!confirm("Da li ste sigurni da želite da uklonite predmet?")) return;
  //   try {
  //     await apiClient.delete(`/Students/${studentId}/predmet/${predmetId}`);
  //     toast.success("Predmet uklonjen!");
  //     fetchStudents();
  //   } catch (error: any) {
  //     toast.error("Greška: " + error.message);
  //   }
  // };

  const handleRemovePredmetFromStudent = async (
    studentId: string,
    predmetId: string
  ) => {
    if (!window.confirm("Da li ste sigurni da želite da uklonite predmet?"))
      return;

    try {
      const path = `/StudentPredmet/${encodeURIComponent(
        studentId
      )},${encodeURIComponent(predmetId)}`;
      await apiClient.delete(path);

      toast.success("Predmet uklonjen!");
      await fetchStudents(); // osveži listu
    } catch (err: any) {
      const data = err?.response?.data;
      const msg =
        (Array.isArray(data?.errors) && data.errors.join(", ")) ||
        (typeof data === "string" ? data : "") ||
        data?.title ||
        data?.message ||
        err.message;
      toast.error("Greška: " + msg);
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
          <h1 className="text-3xl font-bold">Studenti</h1>
          {role === "Admin" && (
            <Button onClick={() => setShowAddDialog(true)} className="gap-2">
              <UserPlus className="h-4 w-4" />
              Dodaj studenta
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
                  <SelectItem value="Index">Index</SelectItem>
                  <SelectItem value="Smer">Smer</SelectItem>
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
          {students.map((student) => (
            <Card key={student.id} className="hover-lift">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">
                      {student.ime} {student.prezime}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      {student.smer} • {student.index}
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
                        onClick={() => openAddPredmetDialog(student)}
                        className="h-6 w-6 p-0 ml-auto"
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                  {student.predmeti && student.predmeti.length > 0 ? (
                    <div className="space-y-1">
                      {student.predmeti.map((predmet, idx) => (
                        <div
                          key={idx}
                          className="text-sm flex justify-between items-center py-1 px-2 bg-secondary/50 rounded gap-2"
                        >
                          <span className="flex-1">{predmet.naziv}</span>
                          <Badge variant="outline">{predmet.ocena}</Badge>
                          {role === "Admin" && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() =>
                                handleRemovePredmetFromStudent(
                                  student.id,
                                  predmet.id
                                )
                              }
                              className="h-5 w-5 p-0 hover:bg-destructive/10"
                            >
                              <X className="h-3 w-3 text-destructive" />
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground italic">
                      Nema predmeta
                    </p>
                  )}
                </div>
                {role === "Admin" && (
                  <div className="flex gap-2 mt-4">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => openEditDialog(student)}
                      className="flex-1 gap-2"
                    >
                      <Edit className="h-3 w-3" />
                      Izmeni
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDeleteStudent(student.id)}
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

        {students.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Nema studenata za prikaz</p>
          </div>
        )}

        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Dodaj novog studenta</DialogTitle>
              <DialogDescription>
                Unesite podatke o novom studentu
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAddStudent} className="space-y-4">
              <div className="space-y-2">
                <Label>Ime</Label>
                <Input
                  value={formData.ime}
                  onChange={(e) =>
                    setFormData({ ...formData, ime: e.target.value })
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Prezime</Label>
                <Input
                  value={formData.prezime}
                  onChange={(e) =>
                    setFormData({ ...formData, prezime: e.target.value })
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Index</Label>
                <Input
                  value={formData.index}
                  onChange={(e) =>
                    setFormData({ ...formData, index: e.target.value })
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Smer</Label>
                <Input
                  value={formData.smer}
                  onChange={(e) =>
                    setFormData({ ...formData, smer: e.target.value })
                  }
                  required
                />
              </div>
              <Button type="submit" className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                Dodaj studenta
              </Button>
            </form>
          </DialogContent>
        </Dialog>

        <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Izmeni studenta</DialogTitle>
              <DialogDescription>Izmenite podatke o studentu</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleEditStudent} className="space-y-4">
              <div className="space-y-2">
                <Label>Ime</Label>
                <Input
                  value={formData.ime}
                  onChange={(e) =>
                    setFormData({ ...formData, ime: e.target.value })
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Prezime</Label>
                <Input
                  value={formData.prezime}
                  onChange={(e) =>
                    setFormData({ ...formData, prezime: e.target.value })
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Index</Label>
                <Input
                  value={formData.index}
                  onChange={(e) =>
                    setFormData({ ...formData, index: e.target.value })
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Smer</Label>
                <Input
                  value={formData.smer}
                  onChange={(e) =>
                    setFormData({ ...formData, smer: e.target.value })
                  }
                  required
                />
              </div>
              <Button type="submit" className="w-full">
                Sačuvaj izmene
              </Button>
            </form>
          </DialogContent>
        </Dialog>

        <Dialog
          open={showAddPredmetDialog}
          onOpenChange={setShowAddPredmetDialog}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Dodaj predmet studentu</DialogTitle>
              <DialogDescription>
                Dodavanje predmeta za: {currentStudent?.ime}{" "}
                {currentStudent?.prezime}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAddPredmetToStudent} className="space-y-4">
              <div className="space-y-2">
                <Label>Predmet</Label>
                <Select
                  value={selectedPredmetId}
                  onValueChange={setSelectedPredmetId}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Izaberite predmet" />
                  </SelectTrigger>
                  <SelectContent>
                    {allPredmeti
                      .filter(
                        (p) =>
                          !currentStudent?.predmeti?.some(
                            (sp) => sp.id === p.id
                          )
                      )
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

export default Students;
