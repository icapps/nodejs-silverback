export const statuses = <Statuses>{
  COMPLETE_REGISTRATON: {
    code: 'COMPLETE_REGISTRATON',
  },
  BLOCKED: {
    code: 'BLOCKED',
  },
  REGISTERD: {
    code: 'REGISTERD',
  },
};

// Interfaces
export interface Statuses {
  [key: string]: Status;
}
export interface Status {
  code: string;
}
