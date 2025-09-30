import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { apiClient } from "@/lib/api";
import { Predmet, PaginatedResponse } from "@/lib/types";
import { useAuth } from "@/lib/auth-context";
import { toast } from "sonner";
import { BookPlus, Edit, Trash2, Plus, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Loader2 } from "lucide-react";

const Predmeti = () => {
  const [predmeti, setPredmeti] = useState<Predmet[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const { role } = useAuth();
  
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [currentPredmet, setCurrentPredmet] = useState<Predmet | null>(null);
  
  const [formData, setFormData] = useState({
    naziv: "",
    espb: 6,
  });

  useEffect(() => {
    fetchPredmeti(currentPage);
  }, [currentPage, pageSize]);

  const fetchPredmeti = async (page: number) => {
    setLoading(true);
    try {
      const data: PaginatedResponse<Predmet> = await apiClient.get(`/Predmet?page=${page}&pageSize=${pageSize}`);
      setPredmeti(data.predmeti);
      setTotalPages(Math.ceil(data.totalCount / pageSize));
    } catch (error: any) {
      toast.error("Greška pri učitavanju predmeta: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddPredmet = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiClient.post("/Predmet", formData);
      toast.success("Predmet uspešno dodat!");
      setShowAddDialog(false);
      setFormData({ naziv: "", espb: 6 });
      fetchPredmeti(currentPage);
    } catch (error: any) {
      toast.error("Greška: " + error.message);
    }
  };

  const handleEditPredmet = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPredmet) return;
    try {
      await apiClient.put(`/Predmet/${currentPredmet.id}`, formData);
      toast.success("Predmet uspešno izmenjen!");
      setShowEditDialog(false);
      setCurrentPredmet(null);
      fetchPredmeti(currentPage);
    } catch (error: any) {
      toast.error("Greška: " + error.message);
    }
  };

  const handleDeletePredmet = async (id: string) => {
    if (!confirm("Da li ste sigurni da želite da obrišete predmet?")) return;
    try {
      await apiClient.delete(`/Predmet/${id}`);
      toast.success("Predmet obrisan!");
      fetchPredmeti(currentPage);
    } catch (error: any) {
      toast.error("Greška: " + error.message);
    }
  };

  const openEditDialog = (predmet: Predmet) => {
    setCurrentPredmet(predmet);
    setFormData({
      naziv: predmet.naziv,
      espb: predmet.espb,
    });
    setShowEditDialog(true);
  };

  const handlePageSizeChange = (newSize: string) => {
    setPageSize(parseInt(newSize));
    setCurrentPage(1);
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
          <h1 className="text-3xl font-bold">Predmeti</h1>
          {role === "Admin" && (
            <Button onClick={() => setShowAddDialog(true)} className="gap-2">
              <BookPlus className="h-4 w-4" />
              Dodaj predmet
            </Button>
          )}
        </div>

        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2">
                <Label className="text-sm">Prikaži po strani:</Label>
                <Select value={pageSize.toString()} onValueChange={handlePageSizeChange}>
                  <SelectTrigger className="w-[80px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">5</SelectItem>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="20">20</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[50px]">#</TableHead>
                    <TableHead>Naziv predmeta</TableHead>
                    <TableHead className="w-[100px]">ESPB</TableHead>
                    {role === "Admin" && (
                      <TableHead className="w-[150px] text-right">Akcije</TableHead>
                    )}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {predmeti.map((predmet, idx) => (
                    <TableRow key={predmet.id}>
                      <TableCell className="font-medium">
                        {(currentPage - 1) * pageSize + idx + 1}
                      </TableCell>
                      <TableCell>{predmet.naziv}</TableCell>
                      <TableCell>{predmet.espb}</TableCell>
                      {role === "Admin" && (
                        <TableCell className="text-right">
                          <div className="flex gap-2 justify-end">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => openEditDialog(predmet)}
                            >
                              <Edit className="h-3 w-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleDeletePredmet(predmet.id)}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-4">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setCurrentPage(1)}
                  disabled={currentPage === 1}
                >
                  <ChevronsLeft className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-sm px-4">
                  Stranica {currentPage} od {totalPages}
                </span>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setCurrentPage(totalPages)}
                  disabled={currentPage === totalPages}
                >
                  <ChevronsRight className="h-4 w-4" />
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {predmeti.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Nema predmeta za prikaz</p>
          </div>
        )}

        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Dodaj novi predmet</DialogTitle>
              <DialogDescription>Unesite podatke o novom predmetu</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAddPredmet} className="space-y-4">
              <div className="space-y-2">
                <Label>Naziv predmeta</Label>
                <Input
                  value={formData.naziv}
                  onChange={(e) => setFormData({ ...formData, naziv: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>ESPB</Label>
                <Input
                  type="number"
                  min={1}
                  max={60}
                  value={formData.espb}
                  onChange={(e) => setFormData({ ...formData, espb: parseInt(e.target.value) })}
                  required
                />
              </div>
              <Button type="submit" className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                Dodaj predmet
              </Button>
            </form>
          </DialogContent>
        </Dialog>

        <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Izmeni predmet</DialogTitle>
              <DialogDescription>Izmenite podatke o predmetu</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleEditPredmet} className="space-y-4">
              <div className="space-y-2">
                <Label>Naziv predmeta</Label>
                <Input
                  value={formData.naziv}
                  onChange={(e) => setFormData({ ...formData, naziv: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>ESPB</Label>
                <Input
                  type="number"
                  min={1}
                  max={60}
                  value={formData.espb}
                  onChange={(e) => setFormData({ ...formData, espb: parseInt(e.target.value) })}
                  required
                />
              </div>
              <Button type="submit" className="w-full">Sačuvaj izmene</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default Predmeti;
