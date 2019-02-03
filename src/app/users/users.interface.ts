export interface User {
  id?: string;
  name?: string;
  email?: string;
  avatarUrl?: string;
  gitlab?: {
    uid?: string;
    personalAccessToken?: string;
  };
  keycloak?: {
    uid: string;
  };
}
