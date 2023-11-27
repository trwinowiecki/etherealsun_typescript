import { useEffect, useState } from 'react';
import { CatalogItemOptionValueForItemVariation, CatalogObject } from 'square';

export type OptionValue = {
  id: string;
  name: string;
  color?: string;
  ordinal?: number;
  description?: string;
};

export type OptionGroup = {
  id: string;
  name: string;
  values: OptionValue[];
  showColors?: boolean;
  description?: string;
};

export type OptionGroupSingle = Omit<OptionGroup, 'values'> & {
  value: OptionValue;
};

export type VariantGroup = {
  id: string;
  options: OptionGroupSingle[];
  stock?: number;
};

const useSquareProductOptions = (
  product: CatalogObject,
  relatedObjects: CatalogObject[]
) => {
  const [variantOptions, setVariantOptions] = useState<
    Map<string, VariantGroup>
  >(new Map());
  const [productOptions, setProductOptions] = useState<OptionGroup[]>([]);

  useEffect(() => {
    if (product && relatedObjects) {
      const newOptions = getVariantOptionGroups(product, relatedObjects);

      setVariantOptions(newOptions);
      setProductOptions(getFullOptionGroups(Array.from(newOptions.values())));
    }
  }, [product?.id, relatedObjects?.length]);

  const productHasOptions = (productToCheck: CatalogObject) => {
    return (
      productToCheck.itemData &&
      productToCheck.itemData.itemOptions &&
      productToCheck.itemData.itemOptions.length > 0
    );
  };

  const getVariantOptionGroups = (
    objectToCheck: CatalogObject,
    itemsToCheck: CatalogObject[]
  ): Map<string, VariantGroup> => {
    const optionObjects: CatalogObject[] = itemsToCheck.filter(
      obj => obj.type === 'ITEM_OPTION'
    );

    if (optionObjects.length === 0 || !productHasOptions(objectToCheck)) {
      return new Map();
    }

    const variantOptionsMap = new Map<string, VariantGroup>();

    objectToCheck!.itemData!.variations?.forEach(variation => {
      const variationOptions:
        | CatalogItemOptionValueForItemVariation[]
        | undefined = variation.itemVariationData?.itemOptionValues?.filter(
        option => option.itemOptionId && option.itemOptionValueId
      );

      if (!variationOptions || variationOptions.length === 0) {
        return;
      }

      const optionValues: OptionGroupSingle[] = variationOptions.map(option => {
        const optionGroupValue: CatalogObject | undefined = optionObjects.find(
          obj => obj.id === option.itemOptionId
        );
        const optionValueObject: CatalogObject | undefined =
          optionGroupValue?.itemOptionData?.values?.find(
            value => value.id === option.itemOptionValueId
          );

        const optionValue: OptionValue = {
          ...optionValueObject?.itemOptionValueData,
          id: optionValueObject?.id ?? '',
          name: optionValueObject?.itemOptionValueData?.name ?? ''
        };
        const optionGroup: OptionGroupSingle = {
          ...optionGroupValue?.itemOptionData,
          id: optionGroupValue?.id ?? '',
          name:
            optionGroupValue?.itemOptionData?.displayName ??
            optionGroupValue?.itemOptionData?.name ??
            '',
          value: optionValue
        };

        return optionGroup;
      });

      const variationGroup: VariantGroup = {
        id: variation.id,
        options: optionValues
      };

      if (!variantOptionsMap.has(variationGroup.id)) {
        variantOptionsMap.set(variationGroup.id, variationGroup);
        return;
      }

      const existingVariantGroup: VariantGroup = variantOptionsMap.get(
        variationGroup.id
      )!;
      const updatedOptions: Map<string, OptionGroupSingle> = new Map();

      existingVariantGroup.options.forEach(existingOptionGroup => {
        updatedOptions.set(existingOptionGroup.id, existingOptionGroup);
      });
      optionValues.forEach(optionGroup => {
        updatedOptions.set(optionGroup.id, optionGroup);
      });

      const updatedVariantGroup: VariantGroup = {
        ...existingVariantGroup,
        options: Array.from(updatedOptions.values())
      };

      variantOptionsMap.set(updatedVariantGroup.id, updatedVariantGroup);
    });

    return variantOptionsMap;
  };

  const getUniqueOptionValues = (...values: OptionValue[]): OptionValue[] => {
    const uniqueValues: Map<string, OptionValue> = new Map();
    values.forEach(optionValue => {
      uniqueValues.set(optionValue.id, optionValue);
    });
    return Array.from(uniqueValues.values());
  };

  const getFullOptionGroups = (
    variationGroups: VariantGroup[]
  ): OptionGroup[] => {
    const optionGroups: Map<string, OptionGroup> = new Map();
    variationGroups
      .flatMap(variation => variation.options)
      .forEach(optionGroup => {
        if (optionGroups.has(optionGroup.id)) {
          const existingOptionGroup = optionGroups.get(optionGroup.id)!;
          optionGroups.set(optionGroup.id, {
            ...optionGroup,
            values: getUniqueOptionValues(
              optionGroup.value,
              ...existingOptionGroup.values
            )
          });
        } else {
          optionGroups.set(optionGroup.id, {
            ...optionGroup,
            values: [optionGroup.value]
          });
        }
      });

    return Array.from(optionGroups.values());
  };

  const variantsWithOption = (option: OptionGroupSingle): VariantGroup[] => {
    return Array.from(variantOptions.values()).filter(variant =>
      variant.options.find(
        opt => opt.id === option.id && opt.value.id === option.value.id
      )
    );
  };

  const getValidVariantIds = (...options: OptionGroupSingle[]): string[] => {
    if (!variantOptions || variantOptions.size === 0) {
      return [];
    }
    // const variantIds: Set<string> = new Set();
    // options.forEach(optionA => {
    //   const variants: VariantGroup[] = [];
    //   options.forEach(optionB => {
    //     if (optionA.id === optionB.id) {
    //       return;
    //     }
    //     const variantGroup: VariantGroup | undefined = Array.from(
    //       variantOptions.values()
    //     ).find(variant =>
    //       variant.options.find(
    //         option =>
    //           option.id === optionA.id && option.value.id === optionA.value.id
    //       )
    //     );
    //   });
    // });
    return Array.from(variantOptions.values())
      .filter(variantGroup =>
        options.every(option =>
          variantGroup.options.find(
            opt => opt.id === option.id && opt.value.id === option.value.id
          )
        )
      )
      .map(variantGroup => variantGroup.id);
  };

  return {
    productOptions,
    variantOptions,
    getValidVariantIds,
    variantsWithOption
  };
};

export default useSquareProductOptions;
