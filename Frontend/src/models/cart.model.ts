export type CartRequest = {
  productId: number;
  quantity: number;
};

export type CartItem = {
  id: number;
  quantity: number;
  product: {
    id: number;
    name: string;
    price: number;
    imageUrl: string;
  };
};

export type Cart = {
  id: number;
  cartItems: CartItem[];
};