export type RoomStatus = 'available' | 'maintenance' | 'inactive';

export type BlockedSlotReason = 'maintenance' | 'cleaning' | 'event' | 'other';
export type RoomSlotStatus = 'available' | 'blocked' | 'booked' | 'maintenance' | 'closed' | 'inactive' | 'locked';

export interface RoomSlotAvailability {
  is_available: boolean;
  status: RoomSlotStatus;
  blocked_reason?: BlockedSlotReason;
  lock_expires_at?: string;
}

export interface RoomDateSlot {
  date: string;
  is_available: boolean;
  status: RoomSlotStatus;
  blocked_reason?: BlockedSlotReason;
}

export interface RoomSlotRangeResponse {
  room_id: string;
  check_in: string;
  check_out: string;
  all_available: boolean;
  unavailable_dates: string[];
  slots: RoomDateSlot[];
}

export interface RoomSlotMonthResponse {
  room_id: string;
  year: number;
  month: number;
  slots: RoomDateSlot[];
}

export interface RoomType {
  id: string;
  name: string;
  description?: string | null;
  defaultCapacity: number;
  basePricePerNight: number;
  availableRoomCount: number;
  createdAt: string;
}

export interface RoomTypeSnapshot {
  id: string;
  name: string;
  description?: string | null;
  basePricePerNight: number;
  defaultCapacity?: number;
}

export interface Room {
  id: string;
  roomTypeId: string;
  name: string;
  code: string;
  capacity: number;
  floor?: string | null;
  status: RoomStatus;
  amenities?: Record<string, unknown> | null;
  imageUrl?: string | null;
  createdAt: string;
  updatedAt: string;
  roomType?: RoomTypeSnapshot;
}

export interface RoomFilters {
  status?: RoomStatus;
  roomTypeIds?: string[];
  floor?: string;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: 'price' | 'name' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
}

export interface AvailableRoomFilters {
  checkIn: string;  // YYYY-MM-DD
  checkOut: string; // YYYY-MM-DD
}

export interface RoomSchedule {
  day_of_week: number;
  day_name: string;
  is_closed: boolean;
  open_time?: string;
  close_time?: string;
}

export interface CreateRoomRequest {
  roomTypeId: string;
  name: string;
  code: string;
  capacity: number;
  floor?: string;
  amenities?: Record<string, unknown>;
  imageUrl?: string;
}

export interface UpdateRoomRequest {
  roomTypeId?: string;
  name?: string;
  code?: string;
  capacity?: number;
  floor?: string;
  amenities?: Record<string, unknown>;
  imageUrl?: string;
}

export interface UpdateRoomStatusRequest {
  status: RoomStatus;
}

export interface CreateRoomTypeRequest {
  name: string;
  description?: string;
  defaultCapacity?: number;
  basePricePerNight: number;
}

export interface UpdateRoomTypeRequest {
  name?: string;
  description?: string;
  defaultCapacity?: number;
  basePricePerNight?: number;
}
