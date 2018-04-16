export interface CodeType {
  id?: string;
  code: string;
  name: string;
  description?: string;
}

export interface CodeTypeCreate {
  code: string;
  name: string;
  description?: string;
}
