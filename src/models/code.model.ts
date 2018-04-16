export interface Code {
  id?: string;
  code: string;
  name: string;
  description?: string;
}

export interface CodeCreate {
  code: string;
  name: string;
  description?: string;
}

