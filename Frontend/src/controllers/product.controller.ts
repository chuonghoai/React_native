import { Product, ProductDetail } from "@/src/models/product.model";
import { productService } from "@/src/services/product.service";

type ProductResult = 
  | { ok: true; data: Product[] }
  | { ok: false; message: string };

type ProductDetailResult = 
  | { ok: true; data: ProductDetail }
  | { ok: false; message: string };

export const productController = {
  async getList(page = 0, size = 20, sortBy = 'id', order = 'desc'): Promise<ProductResult> {
    try {
      const res = await productService.getAllProducts(page, size, sortBy, order);
      
      if (res.success && res.data) {
        // console.log(res.data);
        return { ok: true, data: res.data.content }; 
      }
      
      return { ok: false, message: res.message || "Không tải được danh sách" };
    } catch (e: any) {
      return { ok: false, message: e.message || "Lỗi kết nối server" };
    }
  },

  async search(keyword: string): Promise<ProductResult> {
    try {
      const res = await productService.searchProducts(keyword);
      if (res.success && res.data) return { ok: true, data: res.data };
      return { ok: false, message: res.message || "Không tìm thấy sản phẩm" };
    } catch (e: any) {
      return { ok: false, message: e.message || "Lỗi kết nối" };
    }
  },

  async filter(categories: string[], page = 0, size = 20, sortBy = 'id', order = 'desc'): Promise<ProductResult> {
    try {
      const res = await productService.filterByCategory(categories, page, size, sortBy, order);
      
      if (res.success && res.data) {
        const products = res.data.content || res.data; 
        return { ok: true, data: products };
      }
      return { ok: false, message: res.message || "Lỗi lọc sản phẩm" };
    } catch (e: any) {
      return { ok: false, message: e.message || "Lỗi kết nối" };
    }
  },

  async get(id: number): Promise<ProductDetailResult> {
    try {
      const res = await productService.getProductDetail(id);
      
      if (res.success && res.data) {
        return { ok: true, data: res.data };
      }
      
      return { ok: false, message: res.message || "Không tải được thông tin sản phẩm" };
    } catch (e: any) {
      return { ok: false, message: e.message || "Lỗi kết nối server" };
    }
  },

  async getBestSellers(): Promise<ProductResult> {
    try {
      const res = await productService.getBestSellers();
      if (res.success && res.data) {
        return { ok: true, data: res.data }; 
      }
      return { ok: false, message: res.message || "Không tải được sản phẩm bán chạy" };
    } catch (e: any) {
      return { ok: false, message: e.message || "Lỗi kết nối" };
    }
  },

  async getSimilar(id: number): Promise<{ ok: true; data: Product[] } | { ok: false; message: string }> {
    try {
      const res = await productService.getSimilarProducts(id);
      if (res.success && res.data) return { ok: true, data: res.data };
      return { ok: false, message: res.message || "Lỗi tải sản phẩm tương tự" };
    } catch (e: any) {
      return { ok: false, message: e.message || "Lỗi kết nối" };
    }
  },
};