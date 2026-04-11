export class UserResponseDto {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  city?: string;
  bio?: string;
  phone?: string;
  createdAt: Date;
  updatedAt: Date;
  roleId: string;
  role?: {
    id: string;
    name: string;
  };
}
