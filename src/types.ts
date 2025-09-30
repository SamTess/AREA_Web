export interface Service {
  id: number;
  name: string;
  logo: string;
}

export interface Area {
  id: number;
  name: string;
  description: string;
  lastRun: string;
  services: number[];
  status: 'success' | 'failed' | 'in progress' | 'not started';
}

export interface LoginData {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  firstName: string;
  lastName: string;
  password: string;
}

export interface OAuthProvider {
  iconPath: string;
  label: string;
}

export interface UserContent {
  name: string;
  email: string;
  avatarSrc: string;
  profileData: ProfileData;
}

export interface ProfileData {
  email: string;
  firstName: string;
  lastName: string;
  language: string;
  password?: string;
}

export interface NavbarLinkProps {
  icon: typeof import('@tabler/icons-react').IconHome2;
  label: string;
  active?: boolean;
  onClick?: () => void;
}

export interface ServiceFilterProps {
  services: Service[];
  value: number[];
  onChange: (value: number[]) => void;
}

export interface CardProps {
  image: string;
}

export interface FormValues {
  email: string;
  firstName: string;
  lastName: string;
  password: string;
  confirmPassword: string;
}

export interface AreaListCardProps {
  areas: Area[];
  services: Service[];
}