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
  espb: number;
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

export interface Rok {
  idRok: number;
  tip: string;
  datumPocetka: string;
  datumZavrsetka: string;
}

export interface PredmetDeo {
  deoId: number;
  naziv: string;
}

export interface Ispit {
  id: string;
  studentId: string;
  predmetId: string;
  idRok: number;
  rokTip: string;
  rokDatumPocetka: string;
  rokDatumZavrsetka: string;
  predmetNaziv: string;
  godina: number;
  stavke: {
    id: string;
    deoId: number;
    poeni: number;
    deoNaziv: string;
    ocena: number;
  }[];
  datumPrijave?: string;
}

export interface PrijavaPoRoku {
  prijavaId: string;
  studentId: string;
  studentIme: string;
  studentPrezime: string;
  studentIndex: string;
  predmetId: string;
  predmetNaziv: string;
  idRok: number;
  rokTip: string;
  rokDatumPocetka: string;
  rokDatumZavrsetka: string;
  godina: number;
  stavke: {
    id: string;
    deoId: number;
    poeni: number;
    deoNaziv: string;
    ocena: number;
  }[];
}
