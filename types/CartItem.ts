import { CatalogCustomAttributeValue, CatalogObject } from 'square';

export interface OldCartItem extends CatalogObject {
  quantity: number;
  relatedObjects: CatalogObject[];
}

interface CartImage {
  id: string;
  name: string;
  url: string;
}

export class CartItem {
  catalogObjectId: string;
  name: string;
  variationId: string;
  variationName: string;
  quantity: number;
  price: number;
  images?: CartImage[];
  customAttributeValues?: Map<string, CatalogCustomAttributeValue>;
  category?: string;

  constructor(
    catalogObject: CatalogObject,
    variationId: string,
    relatedObjects: CatalogObject[] = [],
    quantity = 1;
  ) {
    this.catalogObjectId = catalogObject.id;
    this.name = catalogObject.itemData?.name ?? '';
    this.variationId = variationId;

    const variation = this.getVariationData(catalogObject, variationId);

    if (!variation) {
      throw new Error('Invalid item variation selected');
    }

    this.variationName = variation.itemVariationData?.name ?? '';
this.quantity = quantity;
this.price ;
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
}
