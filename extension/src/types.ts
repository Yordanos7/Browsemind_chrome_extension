export type DailyUsage = {
  [date: string]: number;
};

export interface User {
  id: string;
  email: string;
  settings: {
    dailyLimit: number;
    focusDuration: number;
  };
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface UserCredentials {
  email: string;
  password?: string;
}
