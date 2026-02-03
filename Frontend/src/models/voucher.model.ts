import { Category } from "./product.model";

export type ProductDiscount = {
  id: number;
  name: string;
  price: number;
  imageUrl: string;
  category: Category;
  priceAfterDiscount: number;
  totalDiscountAmount: number;
};