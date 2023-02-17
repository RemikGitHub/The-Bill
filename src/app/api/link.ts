export interface Link {
  label: string;
  items: LinkItem[];
}

export interface LinkItem {
  label: string;
  icon: string;
  routerLink: string[];
}
