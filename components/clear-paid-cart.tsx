'use client';

import { useEffect } from 'react';

export function ClearPaidCart() {
  useEffect(() => {
    localStorage.removeItem('natura-uy-cart');
  }, []);

  return null;
}
