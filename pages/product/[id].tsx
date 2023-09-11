import { RadioGroup } from '@headlessui/react';
import { useSupabaseClient, useUser } from '@supabase/auth-helpers-react';
import Button from '@ui/Button';
import Listbox from '@ui/CustomListbox';
import FavButton from '@ui/FavButton';
import Image from '@ui/Image';
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

import Breadcrumbs, { BreadcrumbPage } from '../../components/Breadcrumbs';
import Layout from '../../components/Layout';
import { CartCommand } from '../../enums/CartCommands';
import { CartItem } from '../../types/CartItem';
import { Database } from '../../types/SupabaseDbTypes';
import {
  DEFAULT_IMAGE,
  getImages,
  getProperOptionGroups,
  getValidOptions,
  OptionGroup,
  OptionValue,
  VariationGroup
} from '../../utils/squareUtils';
import { useStoreContext } from '../../utils/Store';
import { handleError } from '../../utils/supabaseUtils';
import { cn } from '../../utils/tw-utils';
import { convertToJSON } from '../api/square';

interface ProductPageProps {
  catalogObjects: RetrieveCatalogObjectResponse;
}

function ProductPage(props: ProductPageProps) {
  const { catalogObjects } = props;

  const router = useRouter();
  const user = useUser();
  const supabase = useSupabaseClient<Database>();
  const { dispatch } = useStoreContext();
  const [quantity, setQuantity] = useState(1);
  const [favorite, setFavorite] = useState(false);
  const [validOptionCombos, setValidOptionCombos] =
    useState<VariationGroup[]>();
  const [options, setOptions] = useState<OptionGroup[]>([]);
  const [selectedVariant, setSelectedVariant] = useState<CatalogObject>(
    {} as CatalogObject
  );
  const [cartDisabled, setCartDisabled] = useState(true);
  const [queryParams, setQueryParams] = useState<URLSearchParams | null>(null);

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
    if (catalogObjects.object && catalogObjects.relatedObjects) {
      const newOptions = getValidOptions(
        catalogObjects.object,
        catalogObjects.relatedObjects
      );
      if (newOptions.length <= 1) {
        setCartDisabled(false);
        const variant = catalogObjects.object.itemData!.variations![0];
        setSelectedVariant(variant);
      }
      setValidOptionCombos(newOptions);
      setOptions(getProperOptionGroups(newOptions));
    }
  }, [catalogObjects.object, catalogObjects.relatedObjects]);

  useEffect(() => {
    const getFavorites = async (signal: AbortSignal) => {
      const res = await supabase
        .from('favorite_products')
        .select()
        .eq('product_id', catalogObjects.object?.id)
        .abortSignal(signal);

      if (res.error) {
        handleError(res.error);
        return;
      }

      if (
        res.data?.length > 0 &&
        res.data[0].product_id === catalogObjects.object?.id
      ) {
        setFavorite(true);
      }
    };

    const controller = new AbortController();
    if (user?.id) {
      getFavorites(controller.signal);
    }

    return () => controller.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const breadcrumbs: BreadcrumbPage[] = [
    { href: '/', name: 'Home' },
    { href: '/products', name: 'Products' },
    {
      href: `/product/${catalogObjects.object!.id}`,
      name: `${catalogObjects.object!.itemData!.name!}`,
      active: true
    }
  ];

  let itemImages = getImages(
    catalogObjects.object!,
    catalogObjects.relatedObjects!
  );
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
    if (!queryParams || queryParams.keys.length === 0) {
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

      const optionValue = Array.from(
        new Set(
          options.flatMap(option =>
            option.values.find(value => value.name === optionValueName)
          )
        ).values()
      )[0];
      if (optionValue) {
        queryOptions.set(optionGroup.id, optionValue);
      }
    });
    return queryOptions;
  };

  const handleOptionSelected = (optionId: string, optionValue: OptionValue) => {
    const queryOptions = getOptionsFromQueryParams();
    if (validOptionCombos?.length === queryOptions.size) {
      setCartDisabled(false);
    }

    const newOptionName = options.find(option => option.id === optionId)?.name;
    const newOptionValueName = Array.from(
      new Set(
        options
          .map(
            option =>
              option.values.find(value => value.id === optionValue.id)?.name
          )
          .filter(option => !!option)
      ).values()
    )[0];
    console.log(optionValue);
    console.log(
      options
        .flatMap(
          option =>
            option.values.find(value => value.id === optionValue.id)?.name
        )
        .filter(option => !!option)
    );

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
    const selectedOptionKeys = Object.keys(queryParams).filter(
      key => key !== optionGroupId
    );
    const validCombos = validOptionCombos?.filter(({ options }) => {
      const combosWithSelectedOptions =
        selectedOptionKeys.length > 0
          ? selectedOptionKeys
              .map(key => {
                const optionGroup = options.find(
                  optionGroup => optionGroup.id === key
                );
                return optionGroup?.values.find(
                  optValue => optValue.name === queryParams?.get(key)!
                )
                  ? options
                  : null;
              })
              .flatMap(val => val ?? [])
          : options;

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
    <Layout title={catalogObjects.object?.itemData?.name}>
      <div className="flex flex-col gap-2">
        <Breadcrumbs pages={breadcrumbs} />
        <div className="flex flex-col gap-2 md:flex-row">
          <div className="w-full md:flex-1 shrink-0">
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
                        alt={catalogObjects.object!.itemData!.name!}
                      />
                    </button>
                  ))}
                </div>
                <div className="w-full flex-[6]">
                  <Image
                    src={selectedImage.imageData!.url!}
                    alt={catalogObjects.object!.itemData!.name!}
                  />
                </div>
              </div>
            ) : (
              <Image
                src={
                  itemImages.length > 0 ? itemImages[0].imageData!.url! : '/'
                }
                alt={catalogObjects.object!.itemData!.name!}
              />
            )}
          </div>
          <div className="flex flex-col items-start gap-2 md:flex-1">
            <span className="text-2xl font-semibold">
              {catalogObjects.object?.itemData?.name}
            </span>
            <div className="">
              {catalogObjects.object?.itemData?.description ??
                catalogObjects.object?.itemData?.descriptionPlaintext ??
                catalogObjects.object?.itemData?.descriptionHtml}
            </div>
            {validOptionCombos && (
              <div className="flex flex-col gap-4 mt-4">
                {options.map(option => (
                  <div key={option.id}>
                    <RadioGroup
                      value={option.values.find(
                        opt => queryParams?.get(option.name) === opt.name
                      )}
                      onChange={value => handleOptionSelected(option.id, value)}
                    >
                      <RadioGroup.Label>
                        {option.name +
                          (queryParams?.has(option.name)
                            ? ` - ${queryParams.get(option.name)}`
                            : '')}
                      </RadioGroup.Label>
                      <div className="flex gap-4">
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
                      </div>
                    </RadioGroup>
                  </div>
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
                    catalogObjects.object!,
                    catalogObjects.relatedObjects ?? [],
                    selectedVariant.id
                  )
                }
                disabled={cartDisabled}
              >
                Add to bag
              </Button>
              <FavButton
                productId={catalogObjects.object!.id}
                handleFavorite={newValue => setFavorite(newValue)}
                isFavorite={favorite}
              />
            </div>
          </div>
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
