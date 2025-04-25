export interface RequestWithUser extends Request {
  user?: {
    sub: string;
    username: string;
    email: string;
  };
}
