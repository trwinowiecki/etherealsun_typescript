import Filter, { FilterField } from '@ui/Filter';
import Modal from '@ui/Modal';
import Paginator from '@ui/Paginator';
import { GetStaticProps } from 'next';
import { useEffect, useState } from 'react';
import { Client, Environment, SearchCatalogObjectsResponse } from 'square';
import Breadcrumbs, { BreadcrumbPage } from '../components/Breadcrumbs';
import Layout from '../components/Layout';
import ProductList from '../components/ProductList';
import useWindowBreakpoint, { windowSizes } from '../utils/windowDimensions';
import { convertToJSON } from './api/square';

interface ProductsPageProps {
  catalog: SearchCatalogObjectsResponse;
}

const products = ({ catalog }: ProductsPageProps) => {
  const [filter, setFilter] = useState({});
  const [page, setPage] = useState(1);
  const [filteredItems, setFilteredItems] = useState(catalog.objects || []);
  const [numItems, setNumItems] = useState(filteredItems!.length);
  // const [filterFields, setFilterFields] = useState([]);

  const paginatorLengthOpts = [12, 24, 48, 96];
  const [pageLength, setPageLength] = useState(paginatorLengthOpts[0]);

  const windowSize = useWindowBreakpoint();

  const handleFilter = (event: any, field: FilterField<any>) => {
    setFilter(prev => ({ ...prev, [field.name]: { value: event } }));
  };

  const categoryField: FilterField<string> = {
    name: 'Category',
    values: [
      'All',
      ...catalog
        .objects!.filter(obj => obj.type === 'CATEGORY')
        .map(cat => cat.id)
    ],
    displayValues: [
      'All',
      ...catalog
        .objects!.filter(obj => obj.type === 'CATEGORY')
        .map(cat => cat.categoryData!.name!)
    ],
    defaultValue: 'All',
    selected: filter['Category']?.value,
    type: 'radio'
  };

  let filterFields: FilterField<string>[] = [
    {
      name: 'test',
      values: ['testone', 'test2'],
      selected: filter['test']?.value,
      type: 'radio'
    },
    {
      name: 'test2',
      values: ['testone', 'test2'],
      description: 'TEst description',
      selected: filter['test2']?.value,
      type: 'radio'
    },
    // {
    //   name: 'test2',
    //   values: ['testone', 'test2'],
    //   description: 'TEst description',
    //   selected: filter['test2']?.value,
    //   type: 'radio'
    // },
    // {
    //   name: 'test2',
    //   values: ['testone', 'test2'],
    //   description: 'TEst description',
    //   selected: filter['test2']?.value,
    //   type: 'radio'
    // },
    // {
    //   name: 'test2',
    //   values: ['testone', 'test2'],
    //   description: 'TEst description',
    //   selected: filter['test2']?.value,
    //   type: 'radio'
    // },
    // {
    //   name: 'test2',
    //   values: ['testone', 'test2'],
    //   description: 'TEst description',
    //   selected: filter['test2']?.value,
    //   type: 'radio'
    // },
    // {
    //   name: 'test2',
    //   values: ['testone', 'test2'],
    //   description: 'TEst description',
    //   selected: filter['test2']?.value,
    //   type: 'radio'
    // },
    // {
    //   name: 'test2',
    //   values: ['testone', 'test2'],
    //   description: 'TEst description',
    //   selected: filter['test2']?.value,
    //   type: 'radio'
    // },
    categoryField
  ];

  catalog.objects
    ?.filter(
      obj =>
        obj.type === 'CUSTOM_ATTRIBUTE_DEFINITION' &&
        obj.customAttributeDefinitionData?.type === 'SELECTION'
    )
    .forEach(attr => {
      filterFields.push({
        name: attr.customAttributeDefinitionData!.name,
        values:
          attr.customAttributeDefinitionData!.selectionConfig!.allowedSelections!.map(
            sel => sel.name
          ),
        selected: filter[attr.customAttributeDefinitionData!.name]?.value,
        type: 'radio'
      });
    });

  useEffect(() => {
    const customAttrNames = catalog.objects
      ?.filter(obj => obj.type === 'CUSTOM_ATTRIBUTE_DEFINITION')
      .map(attr => attr.customAttributeDefinitionData?.name);
    let tempItems = catalog.objects!.filter(obj => obj.type === 'ITEM');

    Object.keys(filter).forEach(fil => {
      if (fil.toLowerCase() === 'category') {
        if (filter[fil]!.value === 'All') {
          return;
        }
        tempItems = tempItems.filter(
          item => item.itemData?.categoryId === filter[fil]!.value
        );
      }
      // todo: Finish implementing custom attribute filter
      // else if (customAttrNames?.includes( fil)) {
      //   tempItems = tempItems.filter(
      //     item => item === filter[fil]!.value
      //   );
      // }
    });

    setFilteredItems(tempItems);
    setNumItems(tempItems.length);
    setPage(1);
  }, [filter]);

  const breadcrumbs: BreadcrumbPage[] = [
    { href: '/', name: 'Home' },
    { href: '/products', name: 'Products', active: true }
  ];

  return (
    <Layout title="Products">
      {windowSizes[windowSize] >= windowSizes.md && (
        <Breadcrumbs pages={breadcrumbs} />
      )}
      <div className="relative flex flex-col gap-2 items-center md:flex-row md:items-start">
        <div className="sticky top-16 z-10 w-full bg-white shadow-md rounded-lg mb-4 md:w-[250px] md:max-w-[300px] md:max-h-[90vh]">
          {windowSizes[windowSize] >= windowSizes.md ? (
            <div className="p-4">
              <div className="mb-4">Filters</div>
              <div className="max-h-[80vh] overflow-y-auto">
                <Filter
                  fields={filterFields}
                  setSelected={(val, field) => handleFilter(val, field)}
                />
              </div>
            </div>
          ) : (
            <Modal name="Filters">
              <Filter
                fields={filterFields}
                setSelected={(val, field) => handleFilter(val, field)}
              />
            </Modal>
          )}
        </div>
        <div className="w-full flex flex-col gap-6 items-center">
          <ProductList
            catalog={filteredItems.slice(
              (page - 1) * pageLength,
              page * pageLength
            )}
            relatedObjs={catalog.relatedObjects}
          />
          <Paginator
            pageLengthOpts={paginatorLengthOpts}
            selectedLength={pageLength}
            currentPage={page}
            numItems={numItems}
            onPageChange={val => setPage(val)}
            onLengthChange={val => setPageLength(val)}
          />
        </div>
      </div>
    </Layout>
  );
};

export const getStaticProps: GetStaticProps = async () => {
  const client = new Client({
    accessToken: process.env.SQUARE_ACCESS_TOKEN_PROD,
    environment: Environment.Production
  });

  const res = await client.catalogApi.searchCatalogObjects({
    includeRelatedObjects: true
  });

  const data: SearchCatalogObjectsResponse = convertToJSON(res);

  if (!data) {
    return {
      notFound: true
    };
  }

  return {
    props: { catalog: data },
    revalidate: 60
  };
};

export default products;
