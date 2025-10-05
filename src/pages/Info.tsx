import { useState, useEffect } from "react";
import { apiClient } from "@/lib/api";
import { Student } from "@/lib/types";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { User, Award, BookOpen, XCircle } from "lucide-react";

export default function Info() {
  const { toast } = useToast();
  const [student, setStudent] = useState<Student | null>(null);

  useEffect(() => {
    fetchStudentInfo();
  }, []);

  const fetchStudentInfo = async () => {
    try {
      const studentIndex = sessionStorage.getItem("studentIndex");
      if (!studentIndex) return;

      const data = await apiClient.get(`/Students/${studentIndex}`);
      setStudent(data);
    } catch (error) {
      toast({
        title: "Greška",
        description: "Nije moguće učitati podatke o studentu.",
        variant: "destructive",
      });
    }
  };

  if (!student) {
    return (
      <div className="container mx-auto py-8 px-4">
        <p className="text-center text-muted-foreground">Učitavanje...</p>
      </div>
    );
  }

  const polozenIPredmeti = student.predmeti?.filter((p) => p.ocena > 5) || [];
  const nepolozenIPredmeti = student.predmeti?.filter((p) => p.ocena === 5) || [];
  const ukupanESPB = polozenIPredmeti.reduce((sum, p) => sum + p.espb, 0);

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Informacije o Studentu</h1>
        <p className="text-muted-foreground">Pregled ličnih podataka i rezultata</p>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <User className="h-5 w-5 text-primary" />
              <CardTitle>Lični Podaci</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Ime</p>
              <p className="text-lg font-semibold">{student.ime}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Prezime</p>
              <p className="text-lg font-semibold">{student.prezime}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Broj Indeksa</p>
              <p className="text-lg font-semibold">{student.index}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Smer</p>
              <p className="text-lg font-semibold">{student.smer}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Ukupno ESPB</p>
              <p className="text-lg font-semibold text-green-600">{ukupanESPB}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Award className="h-5 w-5 text-green-600" />
              <CardTitle>Položeni Ispiti</CardTitle>
            </div>
            <CardDescription>
              Predmeti sa ocenom većom od 5
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3">
              {polozenIPredmeti.map((predmet) => (
                <div
                  key={predmet.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <BookOpen className="h-4 w-4 text-green-600" />
                    <div>
                      <p className="font-semibold">{predmet.naziv}</p>
                      <p className="text-sm text-muted-foreground">
                        {predmet.espb} ESPB
                      </p>
                    </div>
                  </div>
                  <Badge className="bg-green-600 hover:bg-green-700">
                    Ocena: {predmet.ocena}
                  </Badge>
                </div>
              ))}
              {polozenIPredmeti.length === 0 && (
                <p className="text-center text-muted-foreground py-4">
                  Još nemate položenih ispita.
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <XCircle className="h-5 w-5 text-yellow-600" />
              <CardTitle>Nepoloženi Ispiti</CardTitle>
            </div>
            <CardDescription>
              Predmeti sa ocenom 5
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3">
              {nepolozenIPredmeti.map((predmet) => (
                <div
                  key={predmet.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <BookOpen className="h-4 w-4 text-yellow-600" />
                    <div>
                      <p className="font-semibold">{predmet.naziv}</p>
                      <p className="text-sm text-muted-foreground">
                        {predmet.espb} ESPB
                      </p>
                    </div>
                  </div>
                  <Badge className="bg-yellow-600 hover:bg-yellow-700">
                    Ocena: {predmet.ocena}
                  </Badge>
                </div>
              ))}
              {nepolozenIPredmeti.length === 0 && (
                <p className="text-center text-muted-foreground py-4">
                  Nemate nepoloženih ispita.
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
