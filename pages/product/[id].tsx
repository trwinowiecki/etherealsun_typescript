import axios from 'axios';
import { GetServerSideProps } from 'next';
import { useRouter } from 'next/router';
import { useState } from 'react';
import Image from 'next/image';
import { CatalogObject, RetrieveCatalogObjectResponse } from 'square';
import Breadcrumbs, { BreadcrumbPage } from '../../components/Breadcrumbs';
import Layout from '../../components/Layout';
import { SquareCommands } from '../../enums/SquareCommands';
import useWindowBreakpoint, { windowSizes } from '../../utils/windowDimensions';

const defaultImage: CatalogObject = {
  imageData: {
    url: '/defaultProduct.png',
  },
  id: 'DEFAULT_IMAGE',
  type: 'IMAGE',
};

interface ProductPageProps {
  catalogObjects: RetrieveCatalogObjectResponse;
}

function ProductPage(props: ProductPageProps) {
  const { catalogObjects } = props;
  const router = useRouter();
  const windowSize = useWindowBreakpoint();

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

  const imageIds = catalogObjects.object?.itemData?.imageIds;
  let itemImages = catalogObjects.relatedObjects?.filter(
    (obj) => obj.type === 'IMAGE' && imageIds?.includes(obj.id)
  ) || [defaultImage];
  if (itemImages.length === 0)
    itemImages = [
      defaultImage,
      defaultImage,
      defaultImage,
      defaultImage,
      defaultImage,
      defaultImage,
      defaultImage,
      defaultImage,
    ];

  // eslint-disable-next-line react-hooks/rules-of-hooks
  const [selectedImage, setSelectedImage] = useState<CatalogObject>(
    itemImages[0]
  );

  return (
    <Layout title={catalogObjects.object?.itemData?.name}>
      <div className="flex flex-col gap-2">
        {windowSizes[windowSize] >= windowSizes.md && (
          <Breadcrumbs pages={breadcrumbs} />
        )}
        <div className="flex flex-col md:flex-row gap-2">
          <div className="w-full md:w-1/2">
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
          <div className="flex flex-col gap-2">
            <span className="text-2xl font-semibold">
              {catalogObjects.object?.itemData?.name}
            </span>
            <div>{catalogObjects.object?.itemData?.description}</div>
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
