import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function Ocene() {
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Moje Ocene</h1>
        <p className="text-muted-foreground">
          Pregled svih ocena iz položenih ispita
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Ocene</CardTitle>
          <CardDescription>Ova funkcionalnost će biti dostupna uskoro</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground py-8">
            Stranica za pregled ocena je u pripremi.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
