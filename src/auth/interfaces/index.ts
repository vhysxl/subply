export interface RequestWithUser extends Request {
  user?: {
    sub: string;
    username: string;
    email: string;
  };
}

export interface RegisterInterface {
  email: string;
  name: string;
  password: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface User {
  userId: string;
  name: string;
  email: string;
  password: string;
  createdAt?: Date;
  roles?: string[];
}
