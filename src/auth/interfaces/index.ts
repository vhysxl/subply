export interface RequestWithUser extends Request {
  user?: {
    sub: string;
    username: string;
    email: string;
  };
}

export interface AuthInterface {
  email: string;
  name: string;
  password: string;
}
