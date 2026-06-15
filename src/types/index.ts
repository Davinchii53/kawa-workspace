export type SeatStatus = "available" | "occupied" | "reserved";
export type SeatType = "desk" | "pod";

export interface Seat {
  id: string;
  zone: string;
  type: SeatType;
  status: SeatStatus;
  since?: string | null;
}

export interface Zone {
  id: string;
  label: string;
  seats: Seat[];
}