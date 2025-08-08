export interface Address {
  _id?: string;
  id?: string;
  userId?: string;
  type?: string;
  label?: string; // e.g., 'Home', 'Work', 'Other'
  street: string;
  building?: string;
  floor?: string;
  apartment?: string;
  city: string;
  area: string;
  district?: string; // Add district
  landmark?: string;
  phone?: string;
  notes?: string;
  isDefault?: boolean;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
}

