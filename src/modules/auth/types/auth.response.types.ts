export interface LoginResponse {
  accessJWT: string;
  refreshJWT: string;
  userMetadata: {
    username: string;
    firstName: string;
    lastName: string;
    id: string;
  };
}
