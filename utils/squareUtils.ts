import { CatalogObject } from 'square';

import { OldCartItem } from '../types/CartItem';

export const DEFAULT_IMAGE: CatalogObject = {
  imageData: {
    url: '/defaultProduct.png',
    name: 'default'
  },
  id: 'DEFAULT_IMAGE',
  type: 'IMAGE'
};

export function getImages(
  item: CatalogObject | OldCartItem,
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

interface FilterItemsProps {
  items: CatalogObject[] | OldCartItem[];
  filters: {
    type: 'CUSTOM_ATTRIBUTE_DEFINITION' | 'CATEGORY';
    value: string;
  }[];
}

export const filterItems = ({ items, filters }: FilterItemsProps) => {
  let filteredItems = items.filter(item => item.type === 'ITEM');
  filters.forEach(filter => {
    if (filter.type.toUpperCase() === 'CATEGORY') {
      filteredItems = filteredItems.filter(
        item => item.itemData?.categoryId === filter.value
      );
    }
  });
};

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
): Map<string, OptionGroup> => {
  const newOptions = new Map<string, OptionGroup>();

  if (
    itemsToCheck.find(obj => obj.type === 'ITEM_OPTION') &&
    objectToCheck.itemData?.itemOptions &&
    objectToCheck.itemData?.itemOptions?.length > 0
  ) {
    objectToCheck.itemData.itemOptions.forEach(itemOption => {
      const newOption = itemsToCheck.find(
        obj => obj.id === itemOption.itemOptionId
      );

      if (newOption) {
        const newOptionFormatted: OptionGroup = {
          id: newOption.id,
          name: newOption.itemOptionData?.name
            ? newOption.itemOptionData.name
            : '',
          values: newOption.itemOptionData?.values
            ? newOption.itemOptionData.values.map(value => ({
                id: value.id,
                name: value.itemOptionValueData?.name
                  ? value.itemOptionValueData.name
                  : ''
              }))
            : []
        };

        newOptions.set(newOption.id, newOptionFormatted);
      }
    });
  }
  return newOptions;
};
