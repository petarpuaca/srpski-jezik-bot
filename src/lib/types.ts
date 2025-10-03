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

export interface IspitStavka {
  id: string;
  deo: string;
  stavkaId: string;
  poeni?: number;
  ocena?: number;
}

export interface Ispit {
  id: string;
  rok: string;
  godina: number;
  student?: {
    id: string;
    ime: string;
    prezime: string;
    index: string;
  };
  predmet?: {
    id: string;
    naziv: string;
  };
  stavke: IspitStavka[];
  datumPrijave?: string;
}
