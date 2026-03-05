import { ApiResponse } from "@/src/models/api.model";
import { Product, ProductDetail } from "@/src/models/product.model";
import { ENDPOINTS } from "@/src/services/api/endpoints";
import { http } from "@/src/services/api/http";

export const productService = {
  getAllProducts(page = 0, size = 40, sortBy = 'id', order = 'desc') {
    const url = `${ENDPOINTS.GET_PRODUCTS}?page=${page}&size=${size}&sortBy=${sortBy}&order=${order}`;
    return http.get<ApiResponse<any>>(url);
  },

  searchProducts(keyword: string) {
    const url = `${ENDPOINTS.SEARCH_PRODUCTS}/${encodeURIComponent(keyword)}`;
    return http.get<ApiResponse<Product[]>>(url);
  },

  filterByCategory(categories: string[], page = 0, size = 20, sortBy = 'id', order = 'desc') {
    const categoryString = categories.join(",");
    const url = `${ENDPOINTS.FILTER_PRODUCTS}/${categoryString}?page=${page}&size=${size}&sortBy=${sortBy}&order=${order}`;
    return http.get<ApiResponse<any>>(url);
  },

  getProductDetail(id: number) {
    const url = `${ENDPOINTS.GET_PRODUCTS}/${id}`;
    return http.get<ApiResponse<ProductDetail>>(url);
  },
  
  getBestSellers() {
    return http.get<ApiResponse<any>>(ENDPOINTS.GET_BEST_SELLERS);
  },

  getSimilarProducts(id: number) {
    return http.get<ApiResponse<Product[]>>(`${ENDPOINTS.GET_PRODUCTS}/${id}/similar`);
  },
};