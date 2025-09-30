export interface Student {
  id: string;
  ime: string;
  prezime: string;
  index: string;
  smer: string;
  predmeti?: StudentPredmet[];
}

export interface StudentPredmet {
  id: string;
  naziv: string;
  ocena: number;
}

export interface Profesor {
  id: string;
  ime: string;
  prezime: string;
  email: string;
  predmeti?: Predmet[];
}

export interface Predmet {
  id: string;
  naziv: string;
  espb: number;
}

export interface PredmetWithOcene extends Predmet {
  ocene?: Ocena[];
}

export interface Ocena {
  id: string;
  studentId: string;
  predmetId: string;
  ocena: number;
  datumPolaganja: string;
  student?: {
    ime: string;
    prezime: string;
    index: string;
  };
}

export interface PaginatedResponse<T> {
  predmeti: T[];
  totalCount: number;
}
