export type Coupon = {
  id: number;
  code: string;
  description: string;
  discountType: "FIXED_AMOUNT" | "PERCENTAGE";
  discountValue: number;
  minOrderValue: number;
  maxDiscountAmount?: number;
  startDate: string;
  endDate: string;
  usageLimitPerUser: number;
};
