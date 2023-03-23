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
import { Database } from '../../types/SupabaseDbTypes';
import {
  DEFAULT_IMAGE,
  getImages,
  getValidOptions,
  OptionGroup,
  OptionValue
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
  const [options, setOptions] = useState(new Map<string, OptionGroup>());
  const [selectedOptions, setSelectedOptions] = useState(
    new Map<string, OptionValue>()
  );

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
      setOptions(newOptions);
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
    relatedObjects: CatalogObject[]
  ) => {
    dispatch({
      type: CartCommand.ADD,
      payload: { ...product, quantity, relatedObjects }
    });
    dispatch({
      type: CartCommand.POP_UP,
      payload: true
    });
  };

  const handleOptionSelected = (key: string, value: OptionValue) => {
    setSelectedOptions(prev => new Map(prev.set(key, value)));
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
            <div className="flex items-center gap-4">
              <Listbox
                listOfItems={[1, 2, 3, 4, 5]}
                state={quantity}
                setState={setQuantity}
              />
              <Button
                intent="primary"
                onClick={() =>
                  addToCartHandler(
                    catalogObjects.object!,
                    catalogObjects.relatedObjects!
                  )
                }
              >
                Add to bag
              </Button>
              <FavButton
                productId={catalogObjects.object!.id}
                handleFavorite={newValue => setFavorite(newValue)}
                isFavorite={favorite}
              />
            </div>
            {options && (
              <div className="flex flex-col gap-4 mt-4">
                {Array.from(options.keys()).map(key => (
                  <div key={key}>
                    <RadioGroup
                      value={selectedOptions.get(key)}
                      onChange={value => handleOptionSelected(key, value)}
                    >
                      <RadioGroup.Label>
                        {options.get(key)!.name +
                          (selectedOptions.has(key)
                            ? ` - ${selectedOptions.get(key)!.name}`
                            : '')}
                      </RadioGroup.Label>
                      <div className="flex gap-4">
                        {options.get(key)!.values.map(optionValue => (
                          <RadioGroup.Option
                            key={optionValue.id}
                            value={optionValue}
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
    console.error(error);
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
