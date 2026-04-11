export enum Role {
  USER = 'user',
}

export interface UserPayload {
  id: string;
  email: string;
  role: string;
}

export interface JwtPayload {
  sub: string;
  email: string;
  role: string;
  iat?: number;
  exp?: number;
}
