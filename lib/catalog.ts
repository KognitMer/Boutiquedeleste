export type Product = {
  id: number;
  slug: string;
  brand: string;
  name: string;
  category: string;
  categorySlug: string;
  price: number;
  oldPrice: number;
  discount: number;
  image: string;
  tag?: string;
  description: string;
  benefits: string[];
  usage: string;
};

export const categories = [
  { name: 'Perfumería', slug: 'perfumeria', icon: '✦', tone: 'peach', description: 'Fragancias que acompañan cada momento y expresan tu manera de estar en el mundo.' },
  { name: 'Cuidados corporales', slug: 'cuidados-corporales', icon: '◌', tone: 'rose', description: 'Texturas, aromas e hidratación para transformar tu rutina diaria en un ritual.' },
  { name: 'Rostro', slug: 'rostro', icon: '☼', tone: 'sand', description: 'Cuidado facial para proteger, hidratar y acompañar las necesidades de tu piel.' },
  { name: 'Cabello', slug: 'cabello', icon: '〰', tone: 'green', description: 'Cuidado consciente para un cabello saludable, suave y lleno de movimiento.' },
  { name: 'Maquillaje', slug: 'maquillaje', icon: '◐', tone: 'berry', description: 'Color, tratamiento y expresión en fórmulas que cuidan tu piel.' },
  { name: 'Regalos', slug: 'regalos', icon: '⌑', tone: 'orange', description: 'Selecciones especiales para regalar bienestar en cualquier ocasión.' },
] as const;

export const products: Product[] = [
  {
    id: 1,
    slug: 'body-splash-frambuesa-pimienta-roja',
    brand: 'Tododia',
    name: 'Body splash Frambuesa y Pimienta Roja 200 ml',
    category: 'Cuidados corporales',
    categorySlug: 'cuidados-corporales',
    price: 790,
    oldPrice: 1190,
    discount: 34,
    tag: 'más vendido',
    image: 'https://production.na01.natura.com/dw/image/v2/BFKR_PRD/on/demandware.static/-/Sites-natura-ar-storefront-catalog/default/dw764b0c3e/18237_1.jpg',
    description: 'Una fragancia alegre y vibrante que combina el dulzor de la frambuesa con el toque especiado de la pimienta roja.',
    benefits: ['Perfuma suavemente la piel', 'Fragancia fresca para usar todos los días', 'Envase práctico de 200 ml'],
    usage: 'Vaporizá sobre el cuerpo cuando quieras renovar la sensación de frescura. Evitá el rostro y las zonas irritadas.',
  },
  {
    id: 2,
    slug: 'pulpa-hidratante-castana',
    brand: 'Ekos',
    name: 'Pulpa hidratante corporal Castaña 400 ml',
    category: 'Cuidados corporales',
    categorySlug: 'cuidados-corporales',
    price: 990,
    oldPrice: 1490,
    discount: 34,
    image: 'https://production.na01.natura.com/dw/image/v2/BFKR_PRD/on/demandware.static/-/Sites-natura-ar-storefront-catalog/default/dwce8320c7/ProdutoJoia/desktop/80936.jpg',
    description: 'Hidratación intensa con aceite de castaña para una piel nutrida, suave y perfumada.',
    benefits: ['Nutrición prolongada', 'Textura cremosa de rápida absorción', 'Activo de la biodiversidad amazónica'],
    usage: 'Aplicá diariamente sobre todo el cuerpo con movimientos suaves, especialmente en las zonas más secas.',
  },
  {
    id: 3,
    slug: 'protector-aclarador-fps-50',
    brand: 'Chronos Derma',
    name: 'Protector aclarador FPS 50+ 50 ml',
    category: 'Rostro',
    categorySlug: 'rostro',
    price: 1290,
    oldPrice: 1790,
    discount: 28,
    tag: 'nuevo',
    image: 'https://production.na01.natura.com/dw/image/v2/BFKR_PRD/on/demandware.static/-/Sites-natura-ar-storefront-catalog/default/dw4df526ef/ProdutoJoia/desktop/80059.jpg',
    description: 'Protección solar facial alta con acabado confortable para acompañar el cuidado diario de la piel.',
    benefits: ['FPS 50+', 'Ayuda a prevenir manchas solares', 'Uso facial diario'],
    usage: 'Aplicá abundantemente antes de la exposición al sol y reaplicá durante el día, especialmente después de transpirar o mojarte.',
  },
  {
    id: 4,
    slug: 'crema-nutritiva-mora-flor-durazno',
    brand: 'Tododia',
    name: 'Crema nutritiva Mora y Flor de Durazno 400 ml',
    category: 'Cuidados corporales',
    categorySlug: 'cuidados-corporales',
    price: 690,
    oldPrice: 990,
    discount: 30,
    image: 'https://production.na01.natura.com/dw/image/v2/BFKR_PRD/on/demandware.static/-/Sites-natura-ar-storefront-catalog/default/dw3d96a449/ProdutoJoia/desktop/181896.jpg',
    description: 'Crema corporal nutritiva con una combinación frutal y floral envolvente.',
    benefits: ['Piel suave y nutrida', 'Perfume delicado', 'Ideal para el uso cotidiano'],
    usage: 'Distribuí sobre la piel limpia y masajeá hasta que se absorba por completo.',
  },
  {
    id: 5,
    slug: 'homem-essence-25-ml',
    brand: 'Homem',
    name: 'Eau de Parfum Homem Essence 25 ml',
    category: 'Perfumería',
    categorySlug: 'perfumeria',
    price: 1190,
    oldPrice: 1690,
    discount: 30,
    image: 'https://production.na01.natura.com/dw/image/v2/BFKR_PRD/on/demandware.static/-/Sites-natura-ar-storefront-catalog/default/dwfc05921e/ProdutoJoia/desktop/89185.jpg',
    description: 'Una fragancia masculina intensa y elegante en un formato ideal para llevar.',
    benefits: ['Alta concentración', 'Perfil amaderado', 'Formato compacto de 25 ml'],
    usage: 'Aplicá en puntos de pulso como muñecas, cuello y detrás de las orejas. No frotes la fragancia después de aplicarla.',
  },
  {
    id: 6,
    slug: 'kaiak-urbe-100-ml',
    brand: 'Kaiak',
    name: 'Eau de Toilette Masculino Urbe 100 ml',
    category: 'Perfumería',
    categorySlug: 'perfumeria',
    price: 1890,
    oldPrice: 2690,
    discount: 30,
    tag: 'favorito',
    image: 'https://production.na01.natura.com/dw/image/v2/BFKR_PRD/on/demandware.static/-/Sites-natura-ar-storefront-catalog/default/dw3b022f77/ProdutoJoia/desktop/111172.jpg',
    description: 'Frescura urbana y energía acuática para acompañar días activos.',
    benefits: ['Fragancia fresca y versátil', 'Contenido de 100 ml', 'Ideal para uso diario'],
    usage: 'Rociá a unos centímetros de la piel, priorizando cuello y muñecas.',
  },
  {
    id: 7,
    slug: 'homem-coragio-100-ml',
    brand: 'Homem',
    name: 'Eau de Parfum Cor.Agio 100 ml',
    category: 'Perfumería',
    categorySlug: 'perfumeria',
    price: 2890,
    oldPrice: 3690,
    discount: 22,
    image: 'https://production.na01.natura.com/dw/image/v2/BFKR_PRD/on/demandware.static/-/Sites-natura-ar-storefront-catalog/default/dwe26eb8ef/ProdutoJoia/desktop/186.jpg',
    description: 'Una composición potente y sofisticada que combina contrastes aromáticos.',
    benefits: ['Eau de parfum', 'Estela intensa', 'Presentación de 100 ml'],
    usage: 'Aplicá sobre la piel seca en los puntos de pulso. Reservá dos o tres atomizaciones para una presencia equilibrada.',
  },
  {
    id: 8,
    slug: 'kriska-shock-100-ml',
    brand: 'Kriska',
    name: 'Eau de Toilette Shock Femenino 100 ml',
    category: 'Perfumería',
    categorySlug: 'perfumeria',
    price: 1590,
    oldPrice: 2190,
    discount: 27,
    image: 'https://production.na01.natura.com/dw/image/v2/BFKR_PRD/on/demandware.static/-/Sites-natura-ar-storefront-catalog/default/dw6ac8b0d7/ProdutoJoia/desktop/83323.jpg',
    description: 'Una fragancia femenina envolvente con una salida vibrante y un fondo dulce.',
    benefits: ['Aroma expresivo', 'Presentación de 100 ml', 'Para ocasiones especiales o uso diario'],
    usage: 'Aplicá en cuello, muñecas y detrás de las orejas para prolongar la percepción de la fragancia.',
  },
];

export const currency = new Intl.NumberFormat('es-UY', {
  style: 'currency',
  currency: 'UYU',
  maximumFractionDigits: 0,
});

export function getProduct(slug: string) {
  return products.find((product) => product.slug === slug);
}

export function getCategory(slug: string) {
  return categories.find((category) => category.slug === slug);
}
