// src/common/enums.ts
export enum RequestStatus {
  OPEN = 'OPEN', // оголошення опубліковано
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED_SUCCESS = 'COMPLETED_SUCCESS',
  COMPLETED_FAILED = 'COMPLETED_FAILED',
  CANCELLED = 'CANCELLED',
}

export enum Importance {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
}

export enum HelpCategory {
  FOOD = 'FOOD',
  MEDICAL = 'MEDICAL',
  TRANSPORT = 'TRANSPORT',
  MATERIAL = 'MATERIAL',
  OTHER = 'OTHER',
}
