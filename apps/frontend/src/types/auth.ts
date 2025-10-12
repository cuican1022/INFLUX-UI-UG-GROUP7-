export interface LoginResponse {
  success: boolean;
  token: string;
  message: string;
}

export interface JWTPayload {
  apiToken: string;
  organization: string;
}
