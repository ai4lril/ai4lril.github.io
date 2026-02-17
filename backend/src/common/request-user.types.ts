/**
 * User object attached to request by JWT/Passport guards
 */
export interface RequestUser {
  id: string;
  email?: string;
  role?: string;
  sub?: string;
}
