import bcrypt from 'bcryptjs';
import { randomUUID } from 'crypto';
import { pool } from '../config/db.js';
import { IUser, IUserPublicResponse } from '../types/index.js';
import { logger } from '../utils/logger.js';

const inMemoryUsers: IUser[] = [];

export interface CreateUserInput {
  first_name: string;
  last_name: string;
  phone: string;
  email?: string;
  password?: string;
  title?: string;
  gender?: string;
  middle_name?: string;
  country_code?: string;
  role_id?: string;
  employee_id?: string;
  status?: string;
  creation_source?: string;
  login_attempts?: number;
  designation?: string;
  joining_date?: string;
  official_email?: string;
  role?: string;
  manager?: any;
  shift?: any[];
  emergency_contact?: any;
  custom_fields?: any[];
  location_department?: any[];
}

export class User {
  public static async findByPhoneOrEmail(identifier: string): Promise<IUser | undefined> {
    const term = identifier.trim();
    try {
      const res = await pool.query(
        'SELECT * FROM users WHERE phone = $1 OR LOWER(email) = LOWER($1) LIMIT 1',
        [term]
      );
      if (res.rows.length > 0) {
        return res.rows[0] as IUser;
      }
    } catch {
      // Fallback
    }
    return inMemoryUsers.find((u) => u.phone === term || u.email.toLowerCase() === term.toLowerCase());
  }

  public static async findById(id: string): Promise<IUser | undefined> {
    try {
      const res = await pool.query('SELECT * FROM users WHERE id = $1 LIMIT 1', [id]);
      if (res.rows.length > 0) {
        return res.rows[0] as IUser;
      }
    } catch {
      // Fallback
    }
    return inMemoryUsers.find((u) => u.id === id);
  }

  public static async create(input: CreateUserInput): Promise<IUser> {
    const userId = randomUUID();
    const password_hash = input.password ? await bcrypt.hash(input.password, 10) : '';
    const email = (input.email || input.official_email || `${input.phone}@company.com`).toLowerCase().trim();
    const status = input.status || 'active';

    try {
      const queryText = `
        INSERT INTO users (
          id, first_name, last_name, middle_name, email, phone, password_hash,
          title, gender, country_code, role_id, employee_id,
          designation, joining_date, official_email, role, status, creation_source,
          login_attempts, manager, shift, emergency_contact, custom_fields, location_department
        )
        VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24
        )
        RETURNING *
      `;
      const values = [
        userId,
        input.first_name,
        input.last_name,
        input.middle_name || '',
        email,
        input.phone,
        password_hash,
        input.title || 'Mr',
        input.gender || 'Male',
        input.country_code || '+91',
        input.role_id || '',
        input.employee_id || '',
        input.designation || '',
        input.joining_date || null,
        input.official_email || '',
        input.role || input.role_id || 'Employee',
        status,
        input.creation_source || 'DIRECT_USER',
        input.login_attempts || 0,
        JSON.stringify(input.manager || null),
        JSON.stringify(input.shift || []),
        JSON.stringify(input.emergency_contact || null),
        JSON.stringify(input.custom_fields || []),
        JSON.stringify(input.location_department || [])
      ];

      const res = await pool.query(queryText, values);
      return res.rows[0] as IUser;
    } catch (err: any) {
      logger.warn(`PostgreSQL insert user fallback: ${err.message}`);

      const fallbackUser: IUser = {
        id: userId,
        first_name: input.first_name,
        last_name: input.last_name,
        middle_name: input.middle_name || '',
        email,
        phone: input.phone,
        password_hash,
        title: input.title || 'Mr',
        gender: input.gender || 'Male',
        country_code: input.country_code || '+91',
        role_id: input.role_id || '',
        employee_id: input.employee_id || '',
        designation: input.designation || '',
        joining_date: input.joining_date,
        official_email: input.official_email || '',
        role: input.role || 'Employee',
        status,
        creation_source: input.creation_source || 'DIRECT_USER',
        login_attempts: input.login_attempts || 0,
        manager: input.manager || null,
        shift: input.shift || [],
        emergency_contact: input.emergency_contact || null,
        custom_fields: input.custom_fields || [],
        location_department: input.location_department || [],
        created_at: new Date(),
        updated_at: new Date()
      };
      inMemoryUsers.push(fallbackUser);
      return fallbackUser;
    }
  }

  public static async updatePassword(id: string, newPassword: string): Promise<IUser | undefined> {
    const password_hash = await bcrypt.hash(newPassword, 10);
    try {
      const res = await pool.query(
        'UPDATE users SET password_hash = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *',
        [password_hash, id]
      );
      if (res.rows.length > 0) {
        return res.rows[0] as IUser;
      }
    } catch {
      // Fallback
    }

    const memUser = inMemoryUsers.find((u) => u.id === id);
    if (memUser) {
      memUser.password_hash = password_hash;
      memUser.updated_at = new Date();
    }
    return memUser;
  }

  public static verifyPassword(password: string, hash: string): boolean {
    if (!hash) return false;
    return bcrypt.compareSync(password, hash);
  }

  public static toPublicResponse(user: IUser): IUserPublicResponse {
    return {
      id: user.id,
      first_name: user.first_name,
      last_name: user.last_name,
      email: user.email,
      phone: user.phone,
      status: user.status || 'active',
      title: user.title,
      gender: user.gender,
      designation: user.designation,
      role: user.role
    };
  }
}
