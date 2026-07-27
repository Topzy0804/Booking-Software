export type Service = {
  id: string;
  name: string;
  durationMinutes: number;
  priceCents: number;
};

export type MergedSlot = {
  startISO: string;
  resourceId: string;
  resourceName: string;
  resources: {
    resourceId: string;
    resourceName: string;
  }[];
};

export type Step = 1 | 2 | 3 | 4;

export type Client = {
  fullName: string;
  email: string;
  phone: string;
};

export type StaffOption = {
  id: string;
  name: string;
};