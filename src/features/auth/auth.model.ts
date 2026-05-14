export interface UserProfile {
  uid: string;           
  email: string | null;  
  displayName: string | null; 
  photoURL?: string;     
  createdAt?: number;    
}
export interface AuthState {
  isLoggedIn: boolean;
  user: UserProfile | null;
  isLoading: boolean;
  setLoading: (val: boolean) => void;
  setUser: (user: any) => void; 
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}