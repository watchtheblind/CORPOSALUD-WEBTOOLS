export interface FilterCategory {
  id: string;
  label: string;
}

export interface ToolCard {
  id: number;
  title: string;
  category: string;
  description: string;
  icon?: string;
  href: string;
}
