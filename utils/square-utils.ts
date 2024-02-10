/* eslint-disable id-length */
import { CatalogObject, RetrieveInventoryCountResponse } from 'square';

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

/**
 * Get the stock of a product from the Square inventory
 * @param inventory - The inventory object from Square
 * @param id - The id of the product
 * @returns The stock of the product
 */
export function getStockFromInventory(
  inventory: RetrieveInventoryCountResponse,
  id?: string
): number {
  return (
    inventory.counts
      ?.filter(
        count => count.state === 'IN_STOCK' && count.catalogObjectId === id
      )
      .reduce(
        (acc, count) => acc + Number.parseInt(count.quantity ?? '0'),
        0
      ) || 0
  );
}
