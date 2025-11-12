export type UserRole = 'voyager' | 'admin' | 'head-cook' | 'supervisor' | 'manager';

export type UserProfile = {
  uid: string;
  email: string | null;
  name: string | null;
  role: UserRole;
  roomNumber?: string;
  stayStartDate?: string;
  stayEndDate?: string;
};

export type CateringItem = {
  id: string;
  name: string;
  category: 'Snacks' | 'Food' | 'Beverages';
  price: number;
  imageUrl: string;
  description: string;
  inStock?: boolean;
};

export type StationeryItem = {
  id: string;
  name: string;
  category: 'Gift Items' | 'Chocolates' | 'Tale Books';
  price: number;
  imageUrl: string;
  description: string;
  inStock?: boolean;
};

export type Movie = {
  id: string;
  title: string;
  genre: string;
  duration: number; // in minutes
  rating: string;
  showtimes: string[];
  imageUrl: string;
};

export type ResortMovieTicket = {
  id: string;
  originalTicketId?: string;
  voyagerId: string;
  voyagerName?: string;
  movieName: string;
  showtime: string;
  seatNumber: string;
  status: 'Confirmed' | 'Cancelled';
};

export type BeautySalonBooking = {
  id: string;
  originalBookingId?: string;
  voyagerId: string;
  voyagerName?: string;
  serviceType: string;
  appointmentTime: string;
  status: 'Confirmed' | 'Cancelled';
};

export type FitnessCenterBooking = {
  id: string;
  originalBookingId?: string;
  voyagerId: string;
  voyagerName?: string;
  trainingEquipment: string;
  startTime: string;
  endTime: string;
  status: 'Confirmed' | 'Cancelled';
};

export type PartyHallBooking = {
  id: string;
  originalBookingId?: string;
  voyagerId: string;
  voyagerName?: string;
  hallType: string;
  startTime: string;
  endTime: string;
  status: 'Confirmed' | 'Cancelled';
};


export type CateringOrder = {
    id: string;
    originalOrderId?: string; // The ID of the order in the user's subcollection
    voyagerId: string;
    orderDate: string;
    items: { itemId: string; quantity: number; name: string; }[];
    totalAmount: number;
    status: 'Pending' | 'Preparing' | 'Delivered' | 'Cancelled';
};

export type StationeryOrder = {
    id: string;
    originalOrderId?: string; // The ID of the order in the user's subcollection
    voyagerId: string;
    orderDate: string;
    items: { itemId: string; quantity: number; name: string; }[];
    totalAmount: number;
    status: 'Pending' | 'In Progress' | 'Delivered' | 'Cancelled';
};


export type Booking = {
    id: string;
    userId: string;
    serviceId: string;
    serviceType: 'Movie' | 'Beauty Salon' | 'Fitness Center' | 'Party Hall' | 'Resort';
    bookingDetails: any;
    status: 'Confirmed' | 'Cancelled';
    createdAt: Date;
};

export type Message = {
    id:string;
    voyagerId: string;
    voyagerName: string;
    voyagerEmail: string;
    content: string;
    createdAt: string;
    status: 'new' | 'read' | 'archived';
};
