import Button from '@ui/Button';
import Listbox from '@ui/CustomListbox';
import Image from '@ui/Image';
import axios from 'axios';
import { GetServerSideProps } from 'next';
import { useContext, useState } from 'react';
import { CatalogObject, RetrieveCatalogObjectResponse } from 'square';

import Breadcrumbs, { BreadcrumbPage } from '../../components/Breadcrumbs';
import Layout from '../../components/Layout';
import { CartCommand } from '../../enums/CartCommands';
import { SquareCommand } from '../../enums/SquareCommands';
import { DEFAULT_IMAGE, getImages } from '../../utils/squareUtils';
import { Store } from '../../utils/Store';
import useWindowBreakpoint, { WindowSize } from '../../utils/windowDimensions';

interface ProductPageProps {
  catalogObjects: RetrieveCatalogObjectResponse;
}

function ProductPage(props: ProductPageProps) {
  const { catalogObjects } = props;
  const windowSize = useWindowBreakpoint();
  const { dispatch } = useContext(Store);
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

  return (
    <Layout title={catalogObjects.object?.itemData?.name}>
      <div className="flex flex-col gap-2">
        {WindowSize[windowSize] >= WindowSize.md && (
          <Breadcrumbs pages={breadcrumbs} />
        )}
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
            <div>{catalogObjects.object?.itemData?.description}</div>
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
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

export const getServerSideProps: GetServerSideProps = async context => {
  const id = context.params?.id as string;

  const { data } = await axios({
    method: 'POST',
    url: `${process.env.BASE_URL!}/api/square`,
    data: { type: SquareCommand.GET_ONE_CATALOG, id }
  });

  return {
    props: {
      catalogObjects: data
    }
  };
};

export default ProductPage;
