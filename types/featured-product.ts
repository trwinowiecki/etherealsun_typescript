import { CatalogObject } from 'square';

export interface FeaturedProduct {
  id: number;
  title: string;
  startDate: string;
  endDate: string;
  products: CatalogObject[];
}
