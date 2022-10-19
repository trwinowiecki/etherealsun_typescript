import axios from 'axios';
import { GetServerSideProps } from 'next';
import { useRouter } from 'next/router';
import { Fragment, useContext, useState } from 'react';
import Image from 'next/image';
import { CatalogObject, RetrieveCatalogObjectResponse } from 'square';
import Breadcrumbs, { BreadcrumbPage } from '../../components/Breadcrumbs';
import Layout from '../../components/Layout';
import { SquareCommands } from '../../enums/SquareCommands';
import useWindowBreakpoint, { windowSizes } from '../../utils/windowDimensions';
import { Store } from '../../utils/Store';
import { toast } from 'react-toastify';
import Button from '../../components/Button';
import { CartCommands } from '../../enums/CartCommands';
import { Listbox, Transition } from '@headlessui/react';
import {
  CheckIcon,
  ChevronDoubleDownIcon,
  ChevronDownIcon,
} from '@heroicons/react/24/outline';
import React from 'react';
import { act } from '@react-three/fiber';
import { DEFAULT_IMAGE, getImages } from '../../utils/images';

interface ProductPageProps {
  catalogObjects: RetrieveCatalogObjectResponse;
}

function ProductPage(props: ProductPageProps) {
  const { catalogObjects } = props;
  const router = useRouter();
  const windowSize = useWindowBreakpoint();
  const { state, dispatch } = useContext(Store);
  const { cart } = state;
  const [quantity, setQuantity] = useState(1);

  if (catalogObjects.errors) {
    return (
      <Layout title={catalogObjects.errors[0].code}>
        {catalogObjects.errors[0].detail}
      </Layout>
    );
  }

  const breadcrumbs: BreadcrumbPage[] = [
    { href: '/', name: 'Home' },
    { href: '/products', name: 'Products' },
    {
      href: `/product/${catalogObjects.object?.id}`,
      name: `${catalogObjects.object?.itemData?.name}`,
      active: true,
    },
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
      DEFAULT_IMAGE,
    ];
  }

  // eslint-disable-next-line react-hooks/rules-of-hooks
  const [selectedImage, setSelectedImage] = useState<CatalogObject>(
    itemImages[0]
  );

  const addToCartHandler = async (product: CatalogObject) => {
    dispatch({
      type: CartCommands.ADD,
      payload: { ...product, quantity },
    });

    toast.success('Product added to the cart');
  };

  return (
    <Layout title={catalogObjects.object?.itemData?.name}>
      <div className="flex flex-col gap-2">
        {windowSizes[windowSize] >= windowSizes.md && (
          <Breadcrumbs pages={breadcrumbs} />
        )}
        <div className="flex flex-col md:flex-row gap-2">
          <div className="w-full md:w-1/2 shrink-0">
            {itemImages.length > 1 ? (
              <div className="flex flex-col-reverse md:flex-row gap-2">
                <div className="w-full h-12 md:w-12 md:h-full overflow-auto flex md:flex-col gap-2">
                  {itemImages.map((image, i) => (
                    <div
                      key={image.id + i}
                      className={`${
                        selectedImage.id === image.id ? 'border-2' : ''
                      } border-primary-background-darker hover:cursor-pointer w-12 md:w-auto`}
                      onClick={() => setSelectedImage(image)}
                    >
                      <Image
                        src={image.imageData?.url!}
                        width={500}
                        height={500}
                        alt={catalogObjects.object?.itemData?.name}
                        layout="responsive"
                        objectFit="cover"
                        sizes={`(min-width: ${windowSizes.md}px) 33vw, 10vw `}
                      />
                    </div>
                  ))}
                </div>
                <div className="w-full">
                  <Image
                    src={selectedImage.imageData?.url!}
                    width={500}
                    height={500}
                    alt={catalogObjects.object?.itemData?.name}
                    layout="responsive"
                    objectFit="cover"
                    sizes={`(min-width: ${windowSizes.md}px) 50vw, 100vw `}
                  />
                </div>
              </div>
            ) : (
              <Image
                src={
                  itemImages.length > 0 ? itemImages[0].imageData?.url! : '/'
                }
                width={500}
                height={500}
                alt={catalogObjects.object?.itemData?.name}
                layout="responsive"
                objectFit="cover"
                sizes={`(min-width: ${windowSizes.md}px) 50vw, 100vw `}
              />
            )}
          </div>
          <div className="flex flex-col gap-2 items-start">
            <span className="text-2xl font-semibold">
              {catalogObjects.object?.itemData?.name}
            </span>
            <div>{catalogObjects.object?.itemData?.description}</div>
            <div className="flex gap-4 items-center">
              <Listbox as={'div'} value={quantity} onChange={setQuantity}>
                <Listbox.Button className="relative cursor-default rounded-lg bg-white py-2 pl-3 pr-10 text-left shadow-md sm:text-sm">
                  <span>{quantity}</span>
                  <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                    <ChevronDownIcon
                      className="h-5 w-5 text-gray-400"
                      aria-hidden="true"
                    />
                  </span>
                </Listbox.Button>
                <Transition
                  as={React.Fragment}
                  leave="transition ease-in duration-100"
                  leaveFrom="opacity-100"
                  leaveTo="opacity-0"
                >
                  <Listbox.Options className="absolute mt-1 max-h-60 overflow-auto rounded-md bg-white py-1 text-base shadow-lg sm:text-sm">
                    {[...Array(5).keys()].map((num, i) => (
                      <Listbox.Option
                        key={i}
                        value={i}
                        className={({ active }) =>
                          `relative cursor-default select-none py-2 pl-10 pr-4 ${
                            active
                              ? 'bg-amber-100 text-amber-900'
                              : 'text-gray-900'
                          }`
                        }
                      >
                        {({ selected }) => (
                          <>
                            <span
                              className={`block truncate ${
                                selected ? 'font-medium' : 'font-normal'
                              }`}
                            >
                              {i}
                            </span>
                            {selected ? (
                              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-amber-600">
                                <CheckIcon
                                  className="h-5 w-5"
                                  aria-hidden="true"
                                />
                              </span>
                            ) : null}
                          </>
                        )}
                      </Listbox.Option>
                    ))}
                  </Listbox.Options>
                </Transition>
              </Listbox>
              <Button onClick={() => addToCartHandler(catalogObjects.object)}>
                Add to bag
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const id = context.params?.id as string;

  const { data } = await axios({
    method: 'POST',
    url: `${process.env.BASE_URL}/api/square`,
    data: { type: SquareCommands.GET_ONE_CATALOG, id: id },
  });

  return {
    props: {
      catalogObjects: data,
    },
  };
};

export default ProductPage;
