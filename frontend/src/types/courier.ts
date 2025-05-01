// Define the Courier interface
export interface Courier {
  courierId: number;
  name: string;
  email: string;
  phoneNumber: string;
  vehicleType: string;
  isAvailable?: boolean;
  profileImageUrl?: string;
} 