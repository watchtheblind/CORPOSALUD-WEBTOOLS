export interface ButtonItem {
  id: string;
  label: string;
  icon?: string;
  tooltip?: string;
  disabled?: boolean;
  badge?: string | number;
  variant?: 'default' | 'outline' | 'ghost';
}

export interface ButtonGroupProps {
  buttons: ButtonItem[];
  activeButton?: string;
  onButtonClick?: (id: string) => void;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
}
