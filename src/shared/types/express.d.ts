export interface UserPayload {
  id: string;
  name: string;
  cpf: string;
  email: string;
  roles: string[];
}

declare global {
  namespace Express {
    interface Request {
      user?: UserPayload;
    }
  }
}
