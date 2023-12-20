/* eslint-disable id-length */
import { CatalogObject } from 'square';

export type SquareImage = {
  url: string;
  name: string;
  id: string;
};

export const DEFAULT_IMAGE: SquareImage = {
  url: '/defaultProduct.png',
  name: 'default',
  id: 'DEFAULT_IMAGE'
};

export function getImages(
  item: CatalogObject,
  imageObjects: CatalogObject[]
): SquareImage[] {
  const imageIds: string[] | undefined = item.itemData?.imageIds;

  if (!imageIds) {
    return [DEFAULT_IMAGE];
  }

  const itemImages =
    imageObjects && imageObjects.length > 0
      ? imageObjects
          .filter(
            obj =>
              obj.type === 'IMAGE' &&
              imageIds.includes(obj.id) &&
              obj.imageData?.url
          )
          .map(obj => ({
            url: obj.imageData?.url || '',
            name: obj.imageData?.name || '',
            id: obj.id
          }))
      : [];

  return itemImages.length >= 1 ? itemImages : [DEFAULT_IMAGE];
}
