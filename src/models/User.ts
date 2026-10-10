import bcrypt from 'bcryptjs';
import { IUser, IUserWithoutPassword, UserRole, UserStatus } from '../types/index.js';

const users: IUser[] = [];

export interface CreateUserInput {
  name: string;
  email: string;
  phone?: string;
  password: string;
  role?: UserRole;
  department_id?: string | null;
  photo_url?: string | null;
}

export class User {
  public static async findByEmail(email: string): Promise<IUser | undefined> {
    return users.find((u) => u.email === email.toLowerCase());
  }

  public static async findById(id: string): Promise<IUser | undefined> {
    return users.find((u) => u.id === id);
  }

  public static async create(input: CreateUserInput): Promise<IUser> {
    const password_hash = await bcrypt.hash(input.password, 10);
    const user: IUser = {
      id: `usr_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      name: input.name,
      email: input.email.toLowerCase(),
      phone: input.phone || '',
      password_hash,
      role: input.role || 'Employee',
      department_id: input.department_id || null,
      photo_url: input.photo_url || null,
      status: 'Active',
      created_at: new Date(),
      updated_at: new Date()
    };
    users.push(user);
    return user;
  }

  public static async updatePassword(id: string, newPassword: string): Promise<IUser | undefined> {
    const user = users.find((u) => u.id === id);
    if (user) {
      user.password_hash = await bcrypt.hash(newPassword, 10);
      user.updated_at = new Date();
    }
    return user;
  }

  public static verifyPassword(password: string, hash: string): boolean {
    return bcrypt.compareSync(password, hash);
  }

  public static toJSON(user: IUser): IUserWithoutPassword {
    const { password_hash, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }
}
