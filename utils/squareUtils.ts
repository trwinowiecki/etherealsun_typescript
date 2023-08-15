/* eslint-disable id-length */
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

export interface VariationGroup {
  id: string;
  options: OptionGroup[];
}

export const getValidOptions = (
  objectToCheck: CatalogObject,
  itemsToCheck: CatalogObject[]
): VariationGroup[] => {
  const newOptions = new Map<string, VariationGroup>();
  const itemObjects = itemsToCheck.filter(obj => obj.type === 'ITEM_OPTION');
  // console.log('objectToCheck', objectToCheck);
  // console.log('itemObjects', itemObjects);

  if (
    itemObjects.length > 0 &&
    objectToCheck.itemData?.itemOptions &&
    objectToCheck.itemData?.itemOptions?.length > 0
  ) {
    objectToCheck.itemData.variations?.forEach(variation => {
      // console.log('variation', variation.id);
      const test = variation.itemVariationData?.itemOptionValues?.filter(
        option => option.itemOptionId && option.itemOptionValueId
      );
      const optionValues: OptionGroup[] = test
        ? test.map(option => {
            const optionItem = itemObjects.find(
              obj => obj.id === option.itemOptionId
            );
            const optionItemValue = optionItem?.itemOptionData?.values?.find(
              obj => obj.id === option.itemOptionValueId
            );
            const namedGroup = {
              id: option.itemOptionId ?? '',
              name:
                optionItem?.itemOptionData?.displayName ??
                optionItem?.itemOptionData?.name ??
                '',
              values: [
                {
                  id: option.itemOptionValueId ?? '',
                  name: optionItemValue?.itemOptionValueData?.name ?? ''
                }
              ]
            };
            // if (variation.id === 'ALIN7UCNWORH2VBQRSWMI2B3') {
            //   console.log('option: ', namedGroup.name, option);
            //   console.log('optionItem', namedGroup.name, optionItem);
            //   console.log('optionItemValue', namedGroup.name, optionItemValue);
            //   console.log('namedGroup', namedGroup.name, namedGroup);
            // }
            return namedGroup;
          })
        : [];
      // console.log('optionValues', optionValues);

      if (optionValues?.length > 0) {
        // console.log('variation.id', variation.id);
        // if (variation.id === 'ALIN7UCNWORH2VBQRSWMI2B3') {
        //   console.log('test', test);
        //   console.log('optionValues', optionValues);
        // }
        updateMap(newOptions, variation.id, optionValues);
      }
    });
  }
  console.log('newOptions', Array.from(newOptions.values()));
  return Array.from(newOptions.values());
};

const updateMap = (
  newOptions: Map<string, VariationGroup>,
  variationId: string,
  options: OptionGroup[]
) => {
  const existingVariantGroup = newOptions.get(variationId);
  if (existingVariantGroup) {
    const newVariantGroup: VariationGroup = {
      ...existingVariantGroup,
      options: []
    };
    existingVariantGroup.options.forEach(optionGroup => {
      const newOptionGroup = options.find(
        optGroup => optGroup.id === optionGroup.id
      );

      if (newOptionGroup) {
        newVariantGroup.options.push({
          ...optionGroup,
          values: [
            ...new Set([...optionGroup.values, ...newOptionGroup.values])
          ]
        });
      } else {
        newVariantGroup.options.push(optionGroup);
      }
    });
    newOptions.set(variationId, newVariantGroup);
  } else {
    newOptions.set(variationId, {
      id: variationId,
      options
    });
  }
  // console.log('newOptions update map', newOptions);
};

export const getProperOptionGroups = (
  options: VariationGroup[]
): OptionGroup[] => {
  const optionGroups: OptionGroup[] = [];
  options
    .flatMap(option => option.options)
    .forEach(optionGroup => {
      const existingOption = optionGroups.find(
        obj => obj.name === optionGroup.name && obj.id === optionGroup.id
      );
      if (existingOption) {
        const optionIndex = optionGroups.indexOf(existingOption);
        optionGroups[optionIndex].values.push(...optionGroup.values);
      } else {
        optionGroups.push(optionGroup);
      }
    });

  const optionGroupsWithUniqueValues = optionGroups.map(optionGroup => ({
    ...optionGroup,
    values: [...new Set(optionGroup.values.map(v => v.id))]
      .map(id => optionGroup.values.find(value => value.id === id))
      .filter((value): value is OptionValue => Boolean(value))
      .sort((a, b) => a.name.localeCompare(b.name))
  }));
  return optionGroupsWithUniqueValues;
};
