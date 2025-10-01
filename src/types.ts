export interface Service {
  id: number;
  name: string;
  logo: string;
}

export enum ServiceState {
  Configuration = 'configuration',
  InProgress = 'in_progress',
  Failed = 'failed',
  Success = 'success'
}

export interface Action {
  id: number;
  serviceId: number;
  name: string;
  description: string;
  fields?: Record<string, any>;
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

export interface ServiceCardProps {
  logo: string;
  serviceName: string;
  cardName: string;
  event: string;
  state: ServiceState;
  onRemove?: () => void;
  onConfigure?: () => void;
}

export interface AccountCardProps {
  logo: string;
  accountName: string;
  email?: string;
  isLoggedIn: boolean;
  onView?: () => void;
  onChange?: () => void;
  onDelete?: () => void;
  onConnect?: () => void;
}

export interface ServiceData {
  id: string;
  logo: string;
  serviceName: string;
  event: string;
  cardName: string;
  state: ServiceState;
  actionId: number;
  serviceId: number;
  fields?: Record<string, any>;
}

export interface SetupStepProps {
  service: ServiceData;
  onRemove: () => void;
  onServiceChange?: (newService: ServiceData) => void;
}

export interface ConfigureStepProps {
  service: ServiceData;
  onFieldsChange?: (fields: Record<string, any>) => void;
}

export interface FinishStepProps {
  service: ServiceData;
}

export interface InfoServiceCardProps {
  service: ServiceData;
  onServiceChange?: (newService: ServiceData) => void;
}

export interface ModalServicesSelectionProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (service: Service) => void;
}

export interface FieldData {
  name: string;
  mandatory: boolean;
  type: 'text' | 'number' | 'dropdown' | 'date';
  placeholder?: string;
  options?: string[];
}
