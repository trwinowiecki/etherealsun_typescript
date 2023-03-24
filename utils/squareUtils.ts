import { CatalogObject } from 'square';

export const DEFAULT_IMAGE: CatalogObject = {
  imageData: {
    url: '/defaultProduct.png',
    name: 'default'
  },
  id: 'DEFAULT_IMAGE',
  type: 'IMAGE'
};

export function getImages(
  item: CatalogObject,
  imageObjects: CatalogObject[]
): CatalogObject[] {
  const imageIds = item.itemData?.imageIds;
  const itemImages =
    imageObjects && imageObjects.length > 0
      ? imageObjects.filter(
          obj =>
            obj.type === 'IMAGE' &&
            imageIds?.includes(obj.id) &&
            obj.imageData?.url
        )
      : [];

  return itemImages.length >= 1 ? itemImages : [DEFAULT_IMAGE];
}

export interface OptionValue {
  id: string;
  name: string;
}

export interface OptionGroup {
  id: string;
  name: string;
  values: OptionValue[];
}

export const getValidOptions = (
  objectToCheck: CatalogObject,
  itemsToCheck: CatalogObject[]
): Map<string, OptionGroup[]> => {
  const newOptions = new Map<string, OptionGroup[]>();
  const itemObjects = itemsToCheck.filter(obj => obj.type === 'ITEM_OPTION');

  if (
    itemObjects.length > 0 &&
    objectToCheck.itemData?.itemOptions &&
    objectToCheck.itemData?.itemOptions?.length > 0
  ) {
    objectToCheck.itemData.variations?.forEach(variation => {
      const optionValues: OptionGroup[] = variation.itemVariationData
        ?.itemOptionValues
        ? variation.itemVariationData.itemOptionValues
            .filter(option => option.itemOptionId && option.itemOptionValueId)
            .map(option => ({
              id: option.itemOptionId ?? '',
              name:
                itemObjects.find(obj => obj.id === option.itemOptionId)
                  ?.itemOptionData?.name ?? '',
              values: [
                {
                  id: option.itemOptionValueId ?? '',
                  name:
                    itemObjects
                      .find(obj => obj.id === option.itemOptionId)
                      ?.itemOptionData?.values?.find(
                        obj => obj.id === option.itemOptionValueId
                      )?.itemOptionValueData?.name ?? ''
                }
              ]
            }))
        : [];

      if (optionValues && optionValues.length > 0) {
        newOptions.set(variation.id, optionValues);
      }
    });
  }
  return newOptions;
};
