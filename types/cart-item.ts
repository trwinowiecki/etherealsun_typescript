import { CatalogObject } from 'square';

import { getImages } from '../utils/square-utils';

interface CartImage {
  id: string;
  name: string;
  url: string;
}

export class CartItem {
  static fromCartItem(cartItem: CartItem) {
    const catalogObject: CatalogObject =
      this.constructCatalogObjectFromCartItem(cartItem);

    const relatedObjects: CatalogObject[] =
      this.constructRelatedObjectsFromCartItem(cartItem);

    return new CartItem({
      catalogObject,
      variationId: cartItem.variationId,
      relatedObjects,
      quantity: cartItem.quantity
    });
  }

  private static constructCatalogObjectFromCartItem(
    cartItem: CartItem
  ): CatalogObject {
    return {
      id: cartItem.catalogObjectId,
      type: 'ITEM',
      itemData: {
        name: cartItem.name,
        variations: [
          {
            id: cartItem.variationId,
            type: 'ITEM_VARIATION',
            itemVariationData: {
              name: cartItem.name,
              priceMoney: { amount: BigInt(cartItem.price) }
            }
          }
        ],
        imageIds: cartItem.images.map(image => image.id)
      }
    };
  }

  private static constructRelatedObjectsFromCartItem(
    cartItem: CartItem
  ): CatalogObject[] {
    return cartItem.images.map(image => ({
      id: image.id,
      type: 'IMAGE',
      imageData: {
        name: image.name,
        url: image.url
      }
    }));
  }

  catalogObjectId: string;
  name: string;
  variationId: string;
  variationName: string;
  quantity: number;
  price: number;
  images: CartImage[];

  constructor(data: {
    catalogObject: CatalogObject;
    variationId: string;
    relatedObjects?: CatalogObject[];
    quantity?: number;
  }) {
    const {
      catalogObject,
      variationId,
      relatedObjects = [],
      quantity = 1
    } = data;
    const variation = this.getVariationData(catalogObject, variationId);

    if (!variation) {
      throw new Error('Invalid item variation selected');
    }

    this.catalogObjectId = catalogObject.id;
    this.name = catalogObject.itemData?.name ?? '';
    this.variationId = variationId;
    this.variationName = variation.itemVariationData?.name ?? '';
    this.quantity = quantity;
    this.price = Number(variation.itemVariationData?.priceMoney?.amount) ?? 0;
    this.images = this.getCartImages(catalogObject, relatedObjects);
  }

  private getVariationData(
    catalogObject: CatalogObject,
    variationId: string
  ): CatalogObject | null {
    return (
      catalogObject.itemData?.variations?.find(
        variation => variation.id === variationId
      ) ?? null
    );
  }

  private getCartImages(
    catalogObject: CatalogObject,
    relatedObjects: CatalogObject[] = []
  ): CartImage[] {
    const validImages = getImages(catalogObject, relatedObjects);
    return validImages
      .filter(image => image.url)
      .map(image => ({ ...image }) as CartImage);
  }
}
