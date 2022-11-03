import Button from '@ui/Button';
import Image from '@ui/Image';
import axios from 'axios';
import { GetServerSideProps } from 'next';
import { useRouter } from 'next/router';
import { useContext, useState } from 'react';
import { CatalogObject, RetrieveCatalogObjectResponse } from 'square';
import Breadcrumbs, { BreadcrumbPage } from '../../components/Breadcrumbs';
import CustomListbox from '../../components/CustomListbox';
import Layout from '../../components/Layout';
import { CartCommands } from '../../enums/CartCommands';
import { SquareCommands } from '../../enums/SquareCommands';
import { DEFAULT_IMAGE, getImages } from '../../utils/images';
import { Store } from '../../utils/Store';
import useWindowBreakpoint, { windowSizes } from '../../utils/windowDimensions';

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

  // eslint-disable-next-line react-hooks/rules-of-hooks
  const [selectedImage, setSelectedImage] = useState<CatalogObject>(
    itemImages[0]
  );

  const addToCartHandler = async (
    product: CatalogObject,
    relatedObjects: CatalogObject[]
  ) => {
    dispatch({
      type: CartCommands.ADD,
      payload: { ...product, quantity, relatedObjects }
    });
    dispatch({
      type: CartCommands.POP_UP,
      payload: true
    });

    // toast.success('Product added to the cart');
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
                        alt={catalogObjects.object?.itemData?.name!}
                      />
                    </div>
                  ))}
                </div>
                <div className="w-full">
                  <Image
                    src={selectedImage.imageData?.url!}
                    alt={catalogObjects.object?.itemData?.name!}
                  />
                </div>
              </div>
            ) : (
              <Image
                src={
                  itemImages.length > 0 ? itemImages[0].imageData?.url! : '/'
                }
                alt={catalogObjects.object?.itemData?.name!}
              />
            )}
          </div>
          <div className="flex flex-col gap-2 items-start">
            <span className="text-2xl font-semibold">
              {catalogObjects.object?.itemData?.name}
            </span>
            <div>{catalogObjects.object?.itemData?.description}</div>
            <div className="flex gap-4 items-center">
              <CustomListbox
                listOfItems={[1, 2, 3, 4, 5]}
                state={quantity}
                setState={setQuantity}
              />
              <Button
                intent={'primary'}
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
    url: `${process.env.BASE_URL}/api/square`,
    data: { type: SquareCommands.GET_ONE_CATALOG, id: id }
  });

  return {
    props: {
      catalogObjects: data
    }
  };
};

export default ProductPage;
