import { FilterChangeRequest, FilterField } from '@ui/filter';
import { useEffect, useState } from 'react';
import { CatalogObject } from 'square';

const useSquareFilters = (unfilteredProducts: CatalogObject[]) => {
  const [filteredProducts, setFilteredProducts] = useState(
    unfilteredProducts ?? []
  );
  const [filters, setFilters] = useState<FilterField<string>[]>([]);

  useEffect(() => {
    const categoryField: FilterField<string> = {
      key: 'CATEGORY',
      displayName: 'Category',
      values: [
        ...unfilteredProducts
          .filter(obj => obj.type === 'CATEGORY')
          .map(cat => cat.id)
      ],
      valueKeyExtractor: id => id,
      renderValue: id =>
        unfilteredProducts.find(
          obj => obj.type === 'CATEGORY' && obj.id === id
        )!.categoryData!.name!,
      selected: null,
      type: 'radio'
    };

    const customFields: FilterField<string>[] = unfilteredProducts
      ?.filter(
        obj =>
          obj.type === 'CUSTOM_ATTRIBUTE_DEFINITION' &&
          obj.customAttributeDefinitionData?.type === 'SELECTION'
      )
      .map(attr => ({
        key: attr.id,
        displayName: attr.customAttributeDefinitionData!.name,
        values:
          attr.customAttributeDefinitionData!.selectionConfig!.allowedSelections!.map(
            sel => sel.name
          ),
        valueKeyExtractor: name => name,
        renderValue: name => name,
        selected: null,
        type: 'radio'
      }));

    setFilters([
      categoryField,
      ...customFields.sort(
        (a, b) => a.displayName?.localeCompare(b.displayName)
      )
    ]);
  }, [unfilteredProducts.length]);

  const productHasAttribute = (
    product: CatalogObject,
    attrKey: string,
    attrValue: string
  ): boolean =>
    (!!product.customAttributeValues &&
      !!product.customAttributeValues[attrKey] &&
      product.customAttributeValues[attrKey].selectionUidValues!.includes(
        attrValue
      )) ||
    !!product.itemData?.variations?.some(
      variation =>
        !!variation.customAttributeValues &&
        !!variation.customAttributeValues[attrKey] &&
        variation.customAttributeValues[attrKey].selectionUidValues!.includes(
          attrValue
        )
    );

  const filterProducts = () => {
    let filtered = unfilteredProducts.filter(obj => obj.type === 'ITEM');
    const selectedFilters = new Map<string, string>();
    filters
      .filter(filter => filter.selected)
      .forEach(filter =>
        selectedFilters.set(filter.key, filter.selected as string)
      );

    if (selectedFilters.size === 0) {
      setFilteredProducts(unfilteredProducts);
      return;
    }

    selectedFilters.forEach((value, key) => {
      if (value === null) return;
      if (key === 'CATEGORY') {
        filtered = filtered.filter(obj => obj.itemData?.categoryId === value);
      } else {
        filtered = filtered.filter(obj => productHasAttribute(obj, key, value));
      }
    });

    setFilteredProducts(filtered);
  };

  const updateFilters = (updates: FilterChangeRequest<string>[]) => {
    const filterMap = new Map<string, FilterField<string>>();
    filters.forEach(filter => {
      filterMap.set(filter.key, filter);
    });

    updates.forEach(({ key, value }) => {
      if (filterMap.has(key)) {
        const newFilter = filterMap.get(key);
        newFilter!.selected = value;
        filterMap.set(key, newFilter!);
      }
    });

    // todo fix bug where updates are being applied before filters are initialized
    setFilters(Array.from(filterMap.values()));
    filterProducts();
  };

  return { filteredProducts, filters, updateFilters };
};

export default useSquareFilters;
