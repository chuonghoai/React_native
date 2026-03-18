import { Product } from "./product.model";

export type OrderRequest = {
  address: string;
  phone: string;
  paymentMethod: string;
  couponCodes?: string[];
  rewardPointsUsed?: number;
};

export type OrderStatus =
  | "NEW"
  | "CONFIRMED"
  | "PREPARING"
  | "SHIPPING"
  | "DELIVERED"
  | "CANCELLED"
  | "REQUEST_CANCEL";

export type OrderItem = {
  id: number;
  quantity: number;
  price: number;
  product: Product;
  review?: {
    rating: number;
    comment: string;
  } | null;
};

export type Order = {
  id: number;
  orderDate: string;
  totalPrice: number;
  status: OrderStatus;
  paymentMethod: string;
  shippingAddress: string;
  shippingPhone: string;
  orderItems: OrderItem[];
};

export type CashFlowStat = {
  status: string;
  totalAmount: number;
  orderCount: number;
};
