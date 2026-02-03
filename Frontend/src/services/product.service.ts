import { ApiResponse } from "@/src/models/api.model";
import { Product, ProductDetail } from "@/src/models/product.model";
import { ENDPOINTS } from "@/src/services/api/endpoints";
import { http } from "@/src/services/api/http";

export const productService = {
  getAllProducts() {
    return http.get<ApiResponse<Product[]>>(ENDPOINTS.GET_PRODUCTS);
  },

  searchProducts(keyword: string) {
    const url = `${ENDPOINTS.SEARCH_PRODUCTS}/${encodeURIComponent(keyword)}`;
    return http.get<ApiResponse<Product[]>>(url);
  },

  filterByCategory(categories: string[]) {
    const categoryString = categories.join(",");
    const url = `${ENDPOINTS.FILTER_PRODUCTS}/${categoryString}`;
    return http.get<ApiResponse<Product[]>>(url);
  },

  getProductDetail(id: number) {
    const url = `${ENDPOINTS.GET_PRODUCTS}/${id}`;
    return http.get<ApiResponse<ProductDetail>>(url);
  }
};