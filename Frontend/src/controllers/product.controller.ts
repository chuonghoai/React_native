import { Product, ProductDetail } from "@/src/models/product.model";
import { productService } from "@/src/services/product.service";

type ProductResult = 
  | { ok: true; data: Product[] }
  | { ok: false; message: string };

type ProductDetailResult = 
  | { ok: true; data: ProductDetail }
  | { ok: false; message: string };

export const productController = {
  async getList(): Promise<ProductResult> {
    try {
      const res = await productService.getAllProducts();
      
      if (res.success && res.data) {
        return { ok: true, data: res.data };
      }
      
      return { ok: false, message: res.message || "Không tải được danh sách sản phẩm" };
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

  async filter(categories: string[]): Promise<ProductResult> {
    try {
      const res = await productService.filterByCategory(categories);
      if (res.success && res.data) return { ok: true, data: res.data };
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
  }
};