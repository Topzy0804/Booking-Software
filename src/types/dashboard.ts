export type Service = {
  id: string;
  name: string;
  durationMinutes: number;
  bufferAfterMinutes: number;
  priceCents: number;
  isActive: boolean;
};

export type Resource = {
  id: string;
  name: string;
  isActive: boolean;
};

export type BookingStatus = "confirmed" | "cancelled" | "attended" | "no_show";

export type Booking = {
  id: string;
  startsAt: Date;
  endsAt: Date;
  status: BookingStatus;
  priceCentsSnapshot: number;
  clientName: string;
  clientEmail: string;
  serviceName: string;
  resourceName: string;
  serviceId: string;
  resourceId: string;
};

export type Client = {
  id: string;
  fullName: string;
  email: string;
  phone: string | null;
  bookingCount: number;
};