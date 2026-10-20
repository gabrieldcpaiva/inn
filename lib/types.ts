import type { ISODate } from "@/lib/dates";

export type RoomPhoto = {
  id: number;
  key: string;
  alt: string;
  sortOrder: number;
};

export type Room = {
  id: number;
  slug: string;
  name: string;
  tagline: string;
  description: string;
  capacity: number;
  beds: string;
  sizeSqm: number | null;
  nightlyRate: number;
  amenities: string[];
  isListed: boolean;
  sortOrder: number;
  photos: RoomPhoto[];
};

export type RequestStatus = "pending" | "confirmed" | "declined";

export type StayRequest = {
  id: number;
  reference: string;
  roomId: number;
  roomName: string;
  roomSlug: string;
  nightlyRate: number;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  checkIn: ISODate;
  checkOut: ISODate;
  adults: number;
  children: number;
  message: string;
  status: RequestStatus;
  note: string | null;
  decidedAt: string | null;
  createdAt: string;
};

export type BlockedRange = {
  id: number;
  roomId: number;
  roomName: string;
  startDate: ISODate;
  endDate: ISODate;
  reason: string;
  createdAt: string;
};

export type OccupancyKind = "confirmed" | "blocked" | "pending";

export type Occupancy = {
  roomId: number;
  from: ISODate;
  to: ISODate;
  kind: OccupancyKind;
  label: string;
  detail: string;
  requestId?: number;
  blockId?: number;
};

export type MenuItem = {
  id: number;
  section: string;
  name: string;
  description: string;
  dietary: string[];
  sortOrder: number;
};

export type Menu = {
  id: number;
  season: "spring" | "summer" | "autumn" | "winter";
  title: string;
  intro: string;
  isPublished: boolean;
  updatedAt: string;
  items: MenuItem[];
};

export type GuestbookStatus = "pending" | "approved" | "hidden" | "rejected";

export type GuestbookEntry = {
  id: number;
  guestName: string;
  location: string;
  stayMonth: string;
  message: string;
  status: GuestbookStatus;
  createdAt: string;
  approvedAt: string | null;
};

export type GroundsPhoto = {
  id: number;
  key: string;
  alt: string;
  caption: string;
  sortOrder: number;
};
