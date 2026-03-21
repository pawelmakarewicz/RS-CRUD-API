export const API_ROUTES = {
  PRODUCTS: "/api/products",
  productsId: (id: string) => `/api/products/${id}`,
} as const;
