export interface Code {
  id?: string;
  code: string;
  name: string;
  description?: string;
  isActive?: boolean;
}

export interface CodeCreate {
  code: string;
  name: string;
  description?: string;
  isActive?: boolean;
}


export interface CodeUpdate {
  code: string;
  name: string;
  description: string;
  isActive: boolean;
}

export interface PartialCodeUpdate {
  code?: string;
  name?: string;
  description?: string;
  isActive?: boolean;
}
