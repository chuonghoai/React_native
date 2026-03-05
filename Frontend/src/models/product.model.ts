export type Category = {
  id: number;
  name: string;
};

export type Product = {
  id: number;
  name: string;
  price: number;
  imageUrl: string;
  category: Category;
};

export type ProductDetail = {
  id: number;
  name: string;
  price: number;
  originalPrice?: number;
  description: string;
  imageUrl: string;
  quantity: number;
  category: Category;
  soldCount?: number;
  reviewCount?: number;
  isFavorite?: boolean;
};