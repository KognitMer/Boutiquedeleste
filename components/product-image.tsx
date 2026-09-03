'use client';

import type { ImgHTMLAttributes, SyntheticEvent } from 'react';

export const PRODUCT_IMAGE_FALLBACK = '/catalog/producto-boutique.svg';

type ProductImageProps = Omit<ImgHTMLAttributes<HTMLImageElement>, 'src' | 'alt'> & {
  src: string;
  alt: string;
};

export function ProductImage({ src, alt, onError, ...props }: ProductImageProps) {
  function handleError(event: SyntheticEvent<HTMLImageElement>) {
    const image = event.currentTarget;
    if (image.dataset.fallback !== 'local') {
      image.dataset.fallback = 'local';
      image.src = PRODUCT_IMAGE_FALLBACK;
    }
    onError?.(event);
  }

  // A native image keeps the immediate fallback behavior needed by remote catalog assets.
  // oxlint-disable-next-line next/no-img-element
  return <img key={src} {...props} src={src} alt={alt} onError={handleError} />;
}
