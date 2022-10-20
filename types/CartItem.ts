import { CatalogObject } from 'square';

export interface CartItem extends CatalogObject {
  quantity: number;
  relatedObjects: CatalogObject[];
}
