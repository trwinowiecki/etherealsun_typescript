import { RadioGroup } from '@headlessui/react';
import Button from '@ui/button';
import DropdownMenu from '@ui/dropdown-menu';
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
import { useStoreContext } from '../../contexts/store';
import { CartCommand } from '../../enums/cart-commands';
import useSquareProductOptions, {
  OptionGroup,
  OptionGroupSingle,
  OptionValue
} from '../../hooks/square-product-options';
import { CartItem } from '../../types/cart-item';
import {
  DEFAULT_IMAGE,
  getImages,
  SquareImage
} from '../../utils/square-utils';
import { cn } from '../../utils/tw-utils';
import { convertToJSON } from '../api/square';

interface ProductPageProps {
  catalogObjects: RetrieveCatalogObjectResponse;
}

function ProductPage({ catalogObjects }: ProductPageProps) {
  const { object: product, relatedObjects } = catalogObjects;

  const router = useRouter();
  const { state, dispatch } = useStoreContext();
  const [cartDisabled, setCartDisabled] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [favorite, setFavorite] = useState(false);
  const { productOptions, getValidVariantIds, isOptionAllowed } =
    useSquareProductOptions(product!, relatedObjects!);
  const [selectedOptions, setSelectedOptions] = useState<
    Map<string, OptionGroupSingle>
  >(new Map());

  useEffect(() => {
    if (catalogObjects.errors) {
      router.push('/404');
      return;
    }

    const updateState = (params: URLSearchParams) => {
      const options = getOptionsFromQueryParams(params);
      setSelectedOptions(options);

      if (product?.itemData?.variations?.length === 1) {
        setCartDisabled(false);
      } else {
        const validVariantIds = getValidVariantIds(
          ...Array.from(options.values())
        );
        setCartDisabled(validVariantIds.length !== 1);
      }
    };

    if (router.isReady) {
      const params = new URLSearchParams(router.asPath.split(/\?/)[1]);
      updateState(params);
    }
  }, [router, router.isReady, router.asPath, catalogObjects.errors]);

  useEffect(() => {
    setFavorite(state.user.favorites?.includes(product!.id));
  }, [state.user.favorites]);

  const getOptionsFromQueryParams = (params: URLSearchParams) => {
    const options = new Map<string, OptionGroupSingle>();
    productOptions?.forEach(optionGroup => {
      const optionValue = optionGroup.values.find(
        value => value.name === params.get(optionGroup.name)
      );
      if (optionValue) {
        options.set(optionGroup.id, { ...optionGroup, value: optionValue });
      }
    });
    return options;
  };

  let itemImages = getImages(product!, relatedObjects!);
  for (let i = 0; i < 10; i++) {
    itemImages.push(DEFAULT_IMAGE);
  }
  itemImages = itemImages.map((image, i) => ({
    ...image,
    id: image.id + '_' + i
  }));

  const [selectedImage, setSelectedImage] = useState<SquareImage>(
    itemImages[0]
  );

  const addToCartHandler = async (
    product: CatalogObject,
    relatedObjects: CatalogObject[]
  ) => {
    let variationId;
    if (product.itemData?.variations?.length === 1) {
      variationId = product.itemData.variations[0].id;
    } else {
      variationId = getValidVariantIds(
        ...Array.from(selectedOptions.values())
      )[0];
    }
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

  const handleOptionSelected = (
    optionGroup: OptionGroup,
    optionValueId: string
  ) => {
    const optionValue = optionGroup.values.find(
      value => value.id === optionValueId
    )!;
    const newOption: OptionGroupSingle = { ...optionGroup, value: optionValue };

    router.replace(
      {
        pathname: router.pathname,
        query: {
          ...router.query,
          [newOption.name]: newOption.value.name
        }
      },
      undefined,
      { shallow: true, scroll: false }
    );
  };

  const isOptionDisabled = (
    optionGroup: OptionGroup,
    optionValue: OptionValue
  ): boolean => {
    const option: OptionGroupSingle = { ...optionGroup, value: optionValue };

    return !isOptionAllowed(option, Array.from(selectedOptions.values()));
  };

  const breadcrumbs: BreadcrumbPage[] = [
    { href: '/', name: 'Home' },
    { href: '/products', name: 'Products' },
    {
      href: `/product/${product!.id}`,
      name: `${product!.itemData!.name!}`,
      active: true
    }
  ];

  const renderOptions = () => {
    return !productOptions || productOptions.length === 0 ? null : (
      <div className="flex flex-col gap-4 my-4">
        {productOptions
          .sort((a, b) => a.name.localeCompare(b.name))
          .map(optionGroup => (
            <section key={optionGroup.id}>
              <RadioGroup
                value={
                  selectedOptions.has(optionGroup.id)
                    ? selectedOptions.get(optionGroup.id)!.value.id
                    : null
                }
                onChange={(valueId: string) =>
                  handleOptionSelected(optionGroup, valueId)
                }
              >
                <RadioGroup.Label>
                  {optionGroup.name +
                    (selectedOptions.has(optionGroup.id)
                      ? `: ${selectedOptions.get(optionGroup.id)!.value.name}`
                      : '')}
                </RadioGroup.Label>
                <section className="flex gap-4">
                  {optionGroup.values
                    .sort((a, b) => a.name.localeCompare(b.name))
                    .map(optionValue => (
                      <RadioGroup.Option
                        key={optionValue.id}
                        value={optionValue.id}
                        disabled={isOptionDisabled(optionGroup, optionValue)}
                      >
                        {({ checked, disabled }) => (
                          <div className="mt-2 cursor-pointer">
                            <div
                              className={cn(
                                'w-10 h-6 rounded-full bg-blue-400',
                                {
                                  'border-2 border-black': checked,
                                  'opacity-50 cursor-not-allowed': disabled
                                }
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
    );
  };

  return (
    <Layout title={product?.itemData?.name}>
      <div className="flex flex-col gap-4">
        <Breadcrumbs pages={breadcrumbs} />
        <div className="flex flex-col gap-4 md:flex-row">
          <section className="w-full md:flex-1 shrink-0">
            {itemImages.length > 1 ? (
              <div className="flex flex-col-reverse gap-2 md:flex-row">
                <div
                  className={cn(
                    'flex w-full h-12 gap-2 overflow-auto md:w-12 md:h-full md:max-h-0 md:flex-1 md:flex-col'
                  )}
                >
                  {itemImages.map(image => (
                    <button
                      key={image.id}
                      className={cn(
                        'border-primary hover:cursor-pointer w-12 md:w-auto',
                        { 'border-2': selectedImage.id === image.id }
                      )}
                      type="button"
                      onClick={() => setSelectedImage(image)}
                    >
                      <Image src={image.url} alt={product!.itemData!.name!} />
                    </button>
                  ))}
                </div>
                <div className="w-full flex-[6]">
                  <Image
                    src={selectedImage.url}
                    alt={product!.itemData!.name!}
                  />
                </div>
              </div>
            ) : (
              <Image
                src={itemImages.length > 0 ? itemImages[0].url : '/'}
                alt={product!.itemData!.name!}
              />
            )}
          </section>
          <section className="flex flex-col items-start gap-2 md:flex-1">
            <span className="text-2xl font-semibold">
              {product?.itemData?.name}
            </span>
            <div className="">
              {product?.itemData?.description ??
                product?.itemData?.descriptionPlaintext ??
                product?.itemData?.descriptionHtml}
            </div>
            {renderOptions()}
            <div className="flex items-center gap-4">
              <DropdownMenu
                listOfItems={[1, 2, 3, 4, 5]}
                state={quantity}
                setState={setQuantity}
                disabled={cartDisabled}
              />
              <Button
                intent="primary"
                onClick={() => addToCartHandler(product!, relatedObjects ?? [])}
                disabled={cartDisabled}
              >
                Add to bag
              </Button>
              <FavButton
                productId={product!.id}
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
