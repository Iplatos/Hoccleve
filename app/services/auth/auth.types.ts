export type LoginArgs = {
  email: string;
  password: string;
};

interface Role {
  item_name: string;
}

interface User {
  id: number;
  custom_id: string | null;
  email: string;
  phone: string;
  name: string;
  avatar_path: string;
  promo_code: string | null;
  created_at: number;
  updated_at: number;
  reportParents: any[];
  pulses: number;
  balance: number;
  balance_euro: number;
  balance_dollar: number;
  position_rating: number | null;
  status: number;
  roles: Role[];
}

export interface LoginResponse {
  user: User;
  token: string;
  status: string;
}

