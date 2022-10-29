import NextImage from 'next/image';
import { windowSizes } from '../../utils/windowDimensions';

export interface ImageProps {
  alt: string;
  src: string;
  sizes?: string;
}

export default function Image({
  alt,
  src,
  sizes = `(max-width: ${windowSizes.sm}px) 100vw, (max-width: ${windowSizes.lg}) 50vw, 33vw `
}: ImageProps) {
  return (
    <NextImage
      alt={alt}
      src={src}
      width={1000}
      height={1000}
      layout="responsive"
      objectFit="cover"
      sizes={sizes}
    />
  );
}
