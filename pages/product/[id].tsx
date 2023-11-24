import { RadioGroup } from '@headlessui/react';
import Button from '@ui/button';
import Listbox from '@ui/CustomListbox';
import FavButton from '@ui/favorite-button';
import Image from '@ui/image';
import { GetStaticPaths, GetStaticProps } from 'next';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import {
  ApiResponse,
  CatalogObject,
  Client,
  Environment,
  ListCatalogResponse,
  RetrieveCatalogObjectResponse
} from 'square';

import Breadcrumbs, { BreadcrumbPage } from '../../components/bread-crumbs';
import Layout from '../../components/layout';
import { CartCommand } from '../../enums/cart-commands';
import { CartItem } from '../../types/cart-item';
import {
  DEFAULT_IMAGE,
  getImages,
  getProperOptionGroups,
  getValidOptions,
  OptionGroup,
  OptionValue,
  VariationGroup
} from '../../utils/square-utils';
import { useStoreContext } from '../../utils/store';
import { cn } from '../../utils/tw-utils';
import { convertToJSON } from '../api/square';

interface ProductPageProps {
  catalogObjects: RetrieveCatalogObjectResponse;
}

function ProductPage({ catalogObjects }: ProductPageProps) {
  const catalogObject = catalogObjects.object;
  const relatedObjects = catalogObjects.relatedObjects;

  const router = useRouter();
  const { state, dispatch } = useStoreContext();
  const [queryParams, setQueryParams] = useState<URLSearchParams | null>(null);
  const [cartDisabled, setCartDisabled] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [favorite, setFavorite] = useState(false);
  const [optionCombos, setOptionCombos] = useState<VariationGroup[]>();
  const [options, setOptions] = useState<OptionGroup[]>([]);
  const [selectedVariant, setSelectedVariant] = useState<CatalogObject>(
    {} as CatalogObject
  );

  useEffect(() => {
    if (catalogObjects.errors) {
      router.push('/404');
      return;
    }

    if (router.isReady) {
      setQueryParams(new URLSearchParams(router.asPath.split(/\?/)[1]));
    }
  }, [router, router.isReady, router.asPath, catalogObjects.errors]);

  useEffect(() => {
    if (catalogObject && relatedObjects) {
      const newOptions = getValidOptions(catalogObject, relatedObjects);
      console.log('newOptions', newOptions);

      if (newOptions.length <= 1) {
        setSelectedVariant(catalogObject.itemData!.variations![0]);
        setCartDisabled(false);
      }

      setOptionCombos(newOptions);
      setOptions(getProperOptionGroups(newOptions));
    }
  }, [catalogObject?.id, relatedObjects?.length]);

  useEffect(() => {
    setFavorite(state.user.favorites?.includes(catalogObject!.id));
  }, [state.user.favorites]);

  const breadcrumbs: BreadcrumbPage[] = [
    { href: '/', name: 'Home' },
    { href: '/products', name: 'Products' },
    {
      href: `/product/${catalogObject!.id}`,
      name: `${catalogObject!.itemData!.name!}`,
      active: true
    }
  ];

  let itemImages = getImages(catalogObject!, relatedObjects!);
  if (itemImages.length === 0) {
    itemImages = [
      DEFAULT_IMAGE,
      DEFAULT_IMAGE,
      DEFAULT_IMAGE,
      DEFAULT_IMAGE,
      DEFAULT_IMAGE,
      DEFAULT_IMAGE,
      DEFAULT_IMAGE,
      DEFAULT_IMAGE
    ];
  }

  const [selectedImage, setSelectedImage] = useState<CatalogObject>(
    itemImages[0]
  );

  const addToCartHandler = async (
    product: CatalogObject,
    relatedObjects: CatalogObject[],
    variationId: string
  ) => {
    dispatch({
      type: CartCommand.ADD,
      payload: new CartItem({
        catalogObject: product,
        variationId,
        quantity,
        relatedObjects
      })
    });
    dispatch({
      type: CartCommand.POP_UP,
      payload: true
    });
  };

  const getOptionsFromQueryParams = () => {
    const queryOptions = new Map<string, OptionValue>();
    if (!queryParams || queryParams.size === 0) {
      return queryOptions;
    }

    const allQueryOptions = options.filter(option =>
      Array.from(queryParams.keys()).includes(option.name)
    );

    allQueryOptions.forEach(optionGroup => {
      const optionValueName = queryParams.get(optionGroup.name);
      if (!optionValueName) {
        return;
      }

      const optionValue = optionGroup.values.find(
        value => value.name === optionValueName
      );

      if (optionValue) {
        queryOptions.set(optionGroup.id, optionValue);
      }
    });
    return queryOptions;
  };

  const handleOptionSelected = (optionId: string, optionValue: OptionValue) => {
    const queryOptions = getOptionsFromQueryParams();
    console.log('queryOptions', queryOptions);
    console.log('optionCombos', optionCombos);
    if (optionCombos?.length === queryOptions.size) {
      setCartDisabled(false);
    }

    const newOption = options.find(option => option.id === optionId);
    const newOptionName = newOption?.name;
    const newOptionValueName = newOption?.values.find(
      value => value.id === optionValue.id
    )?.name;

    router.replace(
      {
        pathname: router.pathname,
        query: {
          ...router.query,
          [newOptionName!]: newOptionValueName!
        }
      },
      undefined,
      { shallow: true, scroll: false }
    );
  };

  const isOptionDisabled = (
    optionGroupId: string,
    option: OptionValue
  ): boolean => {
    if (queryParams === null) {
      return false;
    }

    const selectedOptionGroupIds = Object.keys(
      getOptionsFromQueryParams()
    ).filter(optGroupId => optGroupId !== optionGroupId);
    const validCombos = optionCombos?.filter(({ options: validGroups }) => {
      const combosWithSelectedOptions =
        selectedOptionGroupIds.length > 0
          ? selectedOptionGroupIds
              .map(selectedGroupId => {
                const optionGroup = validGroups.find(
                  optionGroup => optionGroup.id === selectedGroupId
                );
                return optionGroup?.values.find(
                  optValue =>
                    optValue.name === queryParams?.get(selectedGroupId)!
                )
                  ? validGroups
                  : null;
              })
              .flatMap(val => val ?? [])
          : validGroups;

      if (combosWithSelectedOptions.length === 0) {
        return false;
      }

      const hasOption = combosWithSelectedOptions.find(validOption =>
        validOption.values.includes(option)
      );

      return hasOption;
    });
    return validCombos?.length === 0;
  };

  return (
    <Layout title={catalogObject?.itemData?.name}>
      <div className="flex flex-col gap-4">
        <Breadcrumbs pages={breadcrumbs} />
        <div className="flex flex-col gap-4 md:flex-row">
          <section className="w-full md:flex-1 shrink-0">
            {itemImages.length > 1 ? (
              <div className="flex flex-col-reverse gap-2 md:flex-row">
                <div className="flex w-full h-12 gap-2 overflow-auto md:w-12 md:h-full md:flex-1 md:flex-col">
                  {itemImages.map((image, i) => (
                    <button
                      key={image.id}
                      className={cn(
                        'border-primary hover:cursor-pointer w-12 md:w-auto',
                        { 'border-2': selectedImage.id === image.id }
                      )}
                      type="button"
                      onClick={() => setSelectedImage(image)}
                    >
                      <Image
                        src={image.imageData!.url!}
                        alt={catalogObject!.itemData!.name!}
                      />
                    </button>
                  ))}
                </div>
                <div className="w-full flex-[6]">
                  <Image
                    src={selectedImage.imageData!.url!}
                    alt={catalogObject!.itemData!.name!}
                  />
                </div>
              </div>
            ) : (
              <Image
                src={
                  itemImages.length > 0 ? itemImages[0].imageData!.url! : '/'
                }
                alt={catalogObject!.itemData!.name!}
              />
            )}
          </section>
          <section className="flex flex-col items-start gap-2 md:flex-1">
            <span className="text-2xl font-semibold">
              {catalogObject?.itemData?.name}
            </span>
            <div className="">
              {catalogObject?.itemData?.description ??
                catalogObject?.itemData?.descriptionPlaintext ??
                catalogObject?.itemData?.descriptionHtml}
            </div>
            {optionCombos && (
              <div className="flex flex-col gap-4 my-4">
                {options.map(option => (
                  <section key={option.id}>
                    <RadioGroup
                      value={option.values.find(
                        opt => queryParams?.get(option.name) === opt.name
                      )}
                      onChange={value => handleOptionSelected(option.id, value)}
                    >
                      <RadioGroup.Label>
                        {[
                          option.name,
                          queryParams?.has(option.name)
                            ? queryParams.get(option.name)
                            : ''
                        ].join(': ')}
                      </RadioGroup.Label>
                      <section className="flex gap-4">
                        {option.values.map(optionValue => (
                          <RadioGroup.Option
                            key={optionValue.id}
                            value={optionValue}
                            disabled={isOptionDisabled(option.id, optionValue)}
                          >
                            {({ checked }) => (
                              <div className="mt-2 cursor-pointer">
                                <div
                                  className={cn(
                                    'w-10 h-6 rounded-full bg-blue-400',
                                    { 'border-2 border-black': checked }
                                  )}
                                  title={optionValue.name}
                                />
                              </div>
                            )}
                          </RadioGroup.Option>
                        ))}
                      </section>
                    </RadioGroup>
                  </section>
                ))}
              </div>
            )}
            <div className="flex items-center gap-4">
              <Listbox
                listOfItems={[1, 2, 3, 4, 5]}
                state={quantity}
                setState={setQuantity}
                disabled={cartDisabled}
              />
              <Button
                intent="primary"
                onClick={() =>
                  addToCartHandler(
                    catalogObject!,
                    relatedObjects ?? [],
                    selectedVariant.id
                  )
                }
                disabled={cartDisabled}
              >
                Add to bag
              </Button>
              <FavButton
                productId={catalogObject!.id}
                handleFavorite={newValue => setFavorite(newValue)}
                isFavorite={favorite}
              />
            </div>
          </section>
        </div>
      </div>
    </Layout>
  );
}

export const getStaticPaths: GetStaticPaths = async ctx => {
  let res: ApiResponse<ListCatalogResponse>;
  const client = new Client({
    accessToken: process.env.SQUARE_ACCESS_TOKEN,
    environment: Environment.Sandbox
  });

  try {
    res = await client.catalogApi.listCatalog('', 'ITEM');
  } catch (error) {
    return {
      paths: [],
      fallback: 'blocking'
    };
  }

  const data: ApiResponse<ListCatalogResponse> = convertToJSON(res);

  if (!data.result.objects) {
    return {
      paths: [],
      fallback: 'blocking'
    };
  }

  return {
    paths: data.result.objects
      .filter(obj => obj.type === 'ITEM')
      .map(obj => ({ params: { id: obj.id } })),
    fallback: 'blocking'
  };
};

export const getStaticProps: GetStaticProps = async ctx => {
  const client = new Client({
    accessToken: process.env.SQUARE_ACCESS_TOKEN,
    environment: Environment.Sandbox
  });

  let res: ApiResponse<RetrieveCatalogObjectResponse>;
  try {
    res = await client.catalogApi.retrieveCatalogObject(
      ctx.params!.id! as string,
      true
    );
  } catch (error) {
    res = { result: error, statusCode: 500 } as ApiResponse<any>;
  }

  const data: ApiResponse<RetrieveCatalogObjectResponse> = convertToJSON(res);

  let extraInfo: ApiResponse<ListCatalogResponse>;
  try {
    extraInfo = await client.catalogApi.listCatalog(
      undefined,
      'ITEM_OPTION,CUSTOM_ATTRIBUTE_DEFINITION'
    );
  } catch (error) {
    extraInfo = { result: error, statusCode: 500 } as ApiResponse<any>;
  }

  const extraInfoData: ApiResponse<ListCatalogResponse> =
    convertToJSON(extraInfo);

  const relatedObjects = [];
  if (data.result.relatedObjects) {
    relatedObjects.push(...data.result.relatedObjects);
  }
  if (extraInfoData.result.objects) {
    relatedObjects?.push(...extraInfoData.result.objects);
  }

  return {
    props: {
      catalogObjects: {
        ...data.result,
        relatedObjects
      }
    },
    revalidate: 60
  };
};

export default ProductPage;
