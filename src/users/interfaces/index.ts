export interface User {
  userId: string;
  name: string;
  email: string;
  password: string;
  createdAt?: Date;
  roles?: ('admin' | 'user' | 'superadmin')[];
}
