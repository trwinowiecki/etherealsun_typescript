import { RadioGroup } from '@headlessui/react';
import { useSupabaseClient, useUser } from '@supabase/auth-helpers-react';
import Button from '@ui/Button';
import Listbox from '@ui/CustomListbox';
import FavButton from '@ui/FavButton';
import Image from '@ui/Image';
import { GetStaticPaths, GetStaticProps } from 'next';
import { useRouter } from 'next/router';
import { useContext, useEffect, useState } from 'react';
import {
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
import { Store } from '../../utils/Store';
import { handleError } from '../../utils/supabaseUtils';
import { convertToJSON } from '../api/square';

interface ProductPageProps {
  catalogObjects: RetrieveCatalogObjectResponse;
}

function ProductPage(props: ProductPageProps) {
  const { catalogObjects } = props;

  const router = useRouter();
  const user = useUser();
  const supabase = useSupabaseClient<Database>();
  const { dispatch } = useContext(Store);
  const [quantity, setQuantity] = useState(1);
  const [favorite, setFavorite] = useState(false);
  const [validOptionCombos, setValidOptionCombos] =
    useState<VariationGroup[]>();
  const [options, setOptions] = useState<OptionGroup[]>([]);
  const [selectedOptions, setSelectedOptions] = useState(
    new Map<string, OptionValue>()
  );
  const [cartDisabled, setCartDisabled] = useState(true);

  if (catalogObjects.errors) {
    useEffect(() => {
      router.push('/404');
    }, [router]);
    return;
  }

  useEffect(() => {
    if (catalogObjects.object && catalogObjects.relatedObjects) {
      const newOptions = getValidOptions(
        catalogObjects.object,
        catalogObjects.relatedObjects
      );
      if (newOptions.length === 0) {
        setCartDisabled(false);
      }
      // console.log('newOptions', newOptions);
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
        .abortSignal(signal)
        .single();

      if (res.error) {
        handleError(res.error);
        return;
      }

      if (res.data?.product_id === catalogObjects.object?.id) {
        setFavorite(true);
      }
    };

    const controller = new AbortController();
    if (user?.id) {
      getFavorites(controller.signal);
    }

    return () => controller.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

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

  const handleOptionSelected = (key: string, value: OptionValue) => {
    setSelectedOptions(prev => new Map(prev.set(key, value)));
    if (validOptionCombos?.length === selectedOptions.size) {
      setCartDisabled(false);
    }
  };

  const isOptionDisabled = (
    optionGroupId: string,
    option: OptionValue
  ): boolean => {
    // console.log(`Checking group ${optionGroupId}, option ${option.name}`);
    const selectedOptionKeys = Array.from(selectedOptions.keys()).filter(
      key => key !== optionGroupId
    );
    // console.log(validOptionCombos);
    const validCombos = validOptionCombos?.filter(({ options }) => {
      // const combosWithSelectedOptions = selectedOptionKeys
      //   .map(key => {
      //     const optionGroup = optionGroups.find(
      //       optionGroup => optionGroup.id === key
      //     );
      // console.log('optionGroup', optionGroup);
      //     if (optionGroup?.values.includes(selectedOptions.get(key)!)) {
      //       return optionGroup;
      //     }
      //     return null;
      //   })
      //   .filter(val => val !== null);
      const combosWithSelectedOptions =
        selectedOptionKeys.length > 0
          ? selectedOptionKeys
              .map(key => {
                const optionGroup = options.find(
                  optionGroup => optionGroup.id === key
                );
                if (optionGroup?.values.includes(selectedOptions.get(key)!)) {
                  return options;
                }
                return null;
              })
              .flatMap(val => val ?? [])
          : options;
      // console.log('combosWithSelectedOptions', combosWithSelectedOptions);

      if (combosWithSelectedOptions.length === 0) {
        return false;
      }

      const hasOption = combosWithSelectedOptions.find(validOption =>
        validOption.values.includes(option)
      );

      // console.log('hasOption', hasOption);
      return hasOption;
    });
    // console.log(validCombos);
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
                      className={`${
                        selectedImage.id === image.id ? 'border-2' : ''
                      } border-primary hover:cursor-pointer w-12 md:w-auto`}
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
                      value={selectedOptions.get(option.id)}
                      onChange={value => handleOptionSelected(option.id, value)}
                    >
                      <RadioGroup.Label>
                        {option.name +
                          (selectedOptions.has(option.id)
                            ? ` - ${selectedOptions.get(option.id)!.name}`
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
                                  className={`${
                                    checked ? 'border-2 border-black' : ''
                                  } w-10 h-6 rounded-full bg-blue-400`}
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
                    ''
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
  let res;
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

  const data: ListCatalogResponse = convertToJSON(res);

  if (!data.objects) {
    return {
      paths: [],
      fallback: 'blocking'
    };
  }

  return {
    paths: data.objects
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

  let res;
  try {
    res = await client.catalogApi.retrieveCatalogObject(
      ctx.params!.id! as string,
      true
    );
  } catch (error) {
    res = error;
  }

  const data: RetrieveCatalogObjectResponse = convertToJSON(res);

  let extraInfo;
  try {
    extraInfo = await client.catalogApi.listCatalog(
      undefined,
      'ITEM_OPTION,CUSTOM_ATTRIBUTE_DEFINITION'
    );
  } catch (error) {
    extraInfo = error;
  }

  const extraInfoData: ListCatalogResponse = convertToJSON(extraInfo);

  const relatedObjects = [];
  if (data.relatedObjects) {
    relatedObjects.push(...data.relatedObjects);
  }
  if (extraInfoData.objects) {
    relatedObjects?.push(...extraInfoData.objects);
  }

  return {
    props: {
      catalogObjects: {
        ...data,
        relatedObjects
      }
    },
    revalidate: 60
  };
};

export default ProductPage;
