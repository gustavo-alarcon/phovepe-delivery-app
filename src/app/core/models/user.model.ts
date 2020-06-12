export interface User {
  uid: string;
  email: string;
  phone?: string;
  photoURL?: string;
  displayName?: string;
  token?: string;
  lastLogin?: Date;
  admin?: boolean;
  driver?: boolean;
  contact?: {
    address: string;
    coord: {
      lat: number;
      long: number;
    };
    reference: string;
    number: number;
  },
  salesCount?: number
}
