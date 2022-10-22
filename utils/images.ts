import { CatalogObject } from 'square';
import { CartItem } from '../types/CartItem';

export const DEFAULT_IMAGE: CatalogObject = {
  imageData: {
    url: '/defaultProduct.png'
  },
  id: 'DEFAULT_IMAGE',
  type: 'IMAGE'
};

export function getImages(
  item: CatalogObject | CartItem,
  imageObjects: CatalogObject[]
): CatalogObject[] {
  const imageIds = item.itemData?.imageIds;
  const itemImages = imageObjects.filter(
    obj => obj.type === 'IMAGE' && imageIds?.includes(obj.id)
  );

  return itemImages.length >= 1 ? itemImages : [DEFAULT_IMAGE];
}
