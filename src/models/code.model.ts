export interface Code {
  id?: string;
  code: string;
  name: string;
  description?: string;
  deprecated?: boolean;
}

export interface CodeCreate {
  code: string;
  name: string;
  description?: string;
}

