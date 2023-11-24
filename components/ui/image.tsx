import NextImage from 'next/image';

import { WindowSize } from '../../hooks/window-dimensions';

export interface ImageProps {
  alt: string;
  src: string;
  sizes?: string;
  width?: number;
  height?: number;
  className?: string;
}

export default function Image({
  alt,
  src,
  sizes = `(max-width: ${WindowSize.sm}px) 100vw, (max-width: ${WindowSize.lg}) 50vw, 33vw `,
  width = 1000,
  height = 1000,
  className = ''
}: ImageProps) {
  return (
    <NextImage
      alt={alt}
      src={src}
      width={width}
      height={height}
      layout="responsive"
      objectFit="cover"
      sizes={sizes}
      className={className}
    />
  );
}
