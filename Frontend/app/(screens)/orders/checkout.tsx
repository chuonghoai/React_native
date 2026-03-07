import { authController } from "@/src/controllers/auth.controller";
import { cartController } from "@/src/controllers/cart.controller";
import { couponController } from "@/src/controllers/coupon.controller";
import { orderController } from "@/src/controllers/order.controller";
import { Cart } from "@/src/models/cart.model";
import { Coupon } from "@/src/models/coupon.model";
import { UserData } from "@/src/models/user.model";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function CheckoutScreen() {
  const insets = useSafeAreaInsets();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [cart, setCart] = useState<Cart | null>(null);
  const [user, setUser] = useState<UserData | null>(null);

  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("COD");

  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [selectedCoupons, setSelectedCoupons] = useState<Coupon[]>([]);
  const [pointsInput, setPointsInput] = useState("");
  const [isCouponModalVisible, setCouponModalVisible] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const [cartRes, meRes, couponRes] = await Promise.all([
      cartController.getMyCart(),
      authController.getMe(),
      couponController.getList(),
    ]);

    if (cartRes.ok && cartRes.data) setCart(cartRes.data);
    if (meRes.ok && meRes.data) {
      setUser(meRes.data);
      setPhone(meRes.data.phone || "");
    }
    if (couponRes.ok && couponRes.data) setCoupons(couponRes.data);

    setLoading(false);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  let cartTotal = 0;
  if (cart) {
    cart.cartItems.forEach((item) => {
      cartTotal += item.product.price * item.quantity;
    });
  }

  let totalCouponDiscount = 0;
  selectedCoupons.forEach((c) => {
    if (c.discountType === "FIXED_AMOUNT") {
      totalCouponDiscount += c.discountValue;
    } else {
      let discount = cartTotal * (c.discountValue / 100);
      if (c.maxDiscountAmount && discount > c.maxDiscountAmount)
        discount = c.maxDiscountAmount;
      totalCouponDiscount += discount;
    }
  });

  if (totalCouponDiscount > cartTotal) totalCouponDiscount = cartTotal;

  const remainingForPoints = cartTotal - totalCouponDiscount;

  const pointsUsed = parseInt(pointsInput) || 0;
  let pointDiscountValue = pointsUsed / 10.0;

  if (pointDiscountValue > remainingForPoints)
    pointDiscountValue = remainingForPoints;

  const finalTotal = cartTotal - totalCouponDiscount - pointDiscountValue;

  const handlePointsChange = (text: string) => {
    const numericValue = parseInt(text.replace(/[^0-9]/g, "")) || 0;
    const maxAllowed = user?.rewardPoints || 0;
    if (numericValue > maxAllowed) {
      setPointsInput(maxAllowed.toString());
    } else {
      setPointsInput(text === "" ? "" : numericValue.toString());
    }
  };

  const toggleCoupon = (coupon: Coupon) => {
    if (cartTotal < coupon.minOrderValue) {
      Alert.alert(
        "Chưa đủ điều kiện",
        `Đơn hàng tối thiểu ${formatCurrency(coupon.minOrderValue)} để áp dụng mã này.`,
      );
      return;
    }
    const exists = selectedCoupons.find((c) => c.id === coupon.id);
    if (exists) {
      setSelectedCoupons(selectedCoupons.filter((c) => c.id !== coupon.id));
    } else {
      setSelectedCoupons([...selectedCoupons, coupon]);
    }
  };

  const handleCheckout = async () => {
    if (!address.trim() || !phone.trim()) {
      Alert.alert("Lỗi", "Vui lòng nhập đầy đủ địa chỉ và số điện thoại.");
      return;
    }

    setSubmitting(true);
    const couponCodes = selectedCoupons.map((c) => c.code);

    const res = await orderController.create({
      address,
      phone,
      paymentMethod,
      couponCodes,
      rewardPointsUsed: pointsUsed,
    });

    setSubmitting(false);

    if (res.ok) {
      Alert.alert("Thành công", "Đơn hàng đã được đặt!", [
        {
          text: "Xem đơn hàng",
          onPress: () => router.replace("/orders/orders"),
        },
      ]);
    } else {
      Alert.alert("Lỗi", res.message);
    }
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="#2563EB" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-white px-4 pt-4 pb-4 border-b border-gray-100 flex-row items-center">
        <TouchableOpacity onPress={() => router.back()} className="mr-3">
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-gray-800">Thanh toán</Text>
      </View>

      <ScrollView className="flex-1" contentContainerStyle={{ padding: 16 }}>
        {/* Order info */}
        <View className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-4">
          <Text className="text-lg font-bold text-gray-800 mb-3">
            Thông tin nhận hàng
          </Text>
          <TextInput
            placeholder="Số điện thoại"
            keyboardType="phone-pad"
            value={phone}
            onChangeText={setPhone}
            className="bg-gray-50 px-4 py-3 rounded-lg border border-gray-200 mb-3"
          />
          <TextInput
            placeholder="Địa chỉ giao hàng chi tiết"
            multiline
            value={address}
            onChangeText={setAddress}
            className="bg-gray-50 px-4 py-3 rounded-lg border border-gray-200 h-20"
            textAlignVertical="top"
          />
        </View>

        {/* List product */}
        <View className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-4">
          <Text className="text-lg font-bold text-gray-800 mb-3 border-b border-gray-50 pb-2">
            Sản phẩm trong đơn ({cart?.cartItems.length || 0})
          </Text>

          {cart?.cartItems.map((item) => (
            <View
              key={item.id}
              className="flex-row items-center mb-3 pb-3 border-b border-gray-50"
            >
              <Image
                source={{
                  uri:
                    item.product.imageUrl || "https://via.placeholder.com/150",
                }}
                className="w-16 h-16 rounded-lg bg-gray-200"
                resizeMode="cover"
              />
              <View className="flex-1 ml-3 justify-center">
                <Text
                  className="font-bold text-gray-800 text-sm"
                  numberOfLines={2}
                >
                  {item.product.name}
                </Text>
                <View className="flex-row justify-between items-center mt-1">
                  <Text className="text-red-600 font-bold text-sm">
                    {formatCurrency(item.product.price)}
                  </Text>
                  <Text className="text-gray-500 font-medium text-xs">
                    x {item.quantity}
                  </Text>
                </View>
              </View>
            </View>
          ))}
        </View>

        {/* Khuyến mãi (Coupons) */}
        <View className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-4">
          <View className="flex-row justify-between items-center mb-2">
            <Text className="text-lg font-bold text-gray-800">
              Phiếu giảm giá
            </Text>
            <TouchableOpacity onPress={() => setCouponModalVisible(true)}>
              <Text className="text-blue-600 font-medium">Chọn mã</Text>
            </TouchableOpacity>
          </View>

          {selectedCoupons.length > 0 ? (
            selectedCoupons.map((c) => (
              <View
                key={c.id}
                className="flex-row items-center bg-blue-50 px-3 py-2 rounded-lg mt-2 border border-blue-100"
              >
                <Ionicons name="ticket" size={18} color="#2563EB" />
                <Text className="ml-2 flex-1 text-blue-700 font-medium">
                  Mã: {c.code}
                </Text>
                <TouchableOpacity onPress={() => toggleCoupon(c)}>
                  <Ionicons name="close-circle" size={20} color="#EF4444" />
                </TouchableOpacity>
              </View>
            ))
          ) : (
            <Text className="text-gray-400 italic mt-1">
              Chưa chọn mã giảm giá nào.
            </Text>
          )}
        </View>

        {/* Reward point */}
        <View className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-4">
          <View className="flex-row justify-between items-center mb-3">
            <View>
              <Text className="text-lg font-bold text-gray-800">
                Dùng điểm tích lũy
              </Text>
              <Text className="text-gray-500 text-xs">
                Hiện có: {user?.rewardPoints || 0} điểm (10 điểm = 1đ)
              </Text>
            </View>
            <TouchableOpacity
              onPress={() =>
                handlePointsChange((user?.rewardPoints || 0).toString())
              }
              className="bg-yellow-100 px-3 py-1 rounded-full"
            >
              <Text className="text-yellow-700 font-bold text-xs">
                Dùng tất cả
              </Text>
            </TouchableOpacity>
          </View>

          <TextInput
            placeholder="Nhập số điểm muốn dùng"
            keyboardType="numeric"
            value={pointsInput}
            onChangeText={handlePointsChange}
            className="bg-gray-50 px-4 py-3 rounded-lg border border-gray-200 text-yellow-700 font-bold text-lg"
          />
        </View>

        {/* Payment method */}
        <View className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-4">
          <Text className="text-lg font-bold text-gray-800 mb-3">
            Phương thức thanh toán
          </Text>
          <TouchableOpacity
            className={`flex-row items-center p-3 rounded-lg border ${paymentMethod === "COD" ? "border-blue-500 bg-blue-50" : "border-gray-200"}`}
            onPress={() => setPaymentMethod("COD")}
          >
            <Ionicons
              name={
                paymentMethod === "COD" ? "radio-button-on" : "radio-button-off"
              }
              size={20}
              color={paymentMethod === "COD" ? "#2563EB" : "gray"}
            />
            <Text className="ml-2 font-medium">
              Thanh toán khi nhận hàng (COD)
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Footer */}
      <View
        className="bg-white p-4 border-t border-gray-200 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]"
        style={{ paddingBottom: Math.max(insets.bottom, 16) }}
      >
        <View className="flex-row justify-between mb-1">
          <Text className="text-gray-500">Tạm tính:</Text>
          <Text className="font-medium text-gray-800">
            {formatCurrency(cartTotal)}
          </Text>
        </View>
        <View className="flex-row justify-between mb-1">
          <Text className="text-gray-500">Giảm giá mã:</Text>
          <Text className="font-medium text-green-600">
            - {formatCurrency(totalCouponDiscount)}
          </Text>
        </View>
        <View className="flex-row justify-between mb-3 border-b border-gray-100 pb-2">
          <Text className="text-gray-500">Giảm giá điểm ({pointsUsed}):</Text>
          <Text className="font-medium text-green-600">
            - {formatCurrency(pointDiscountValue)}
          </Text>
        </View>

        <View className="flex-row justify-between items-center mb-4">
          <Text className="text-lg font-bold text-gray-800">Tổng cộng:</Text>
          <Text className="text-2xl font-bold text-red-600">
            {formatCurrency(finalTotal > 0 ? finalTotal : 0)}
          </Text>
        </View>

        <TouchableOpacity
          className={`w-full py-4 rounded-xl items-center flex-row justify-center ${submitting ? "bg-orange-300" : "bg-orange-600"}`}
          onPress={handleCheckout}
          disabled={submitting}
        >
          {submitting ? (
            <>
              <ActivityIndicator color="white" className="mr-2" />
              <Text className="text-white font-bold text-lg">
                Đang xử lý...
              </Text>
            </>
          ) : (
            <Text className="text-white font-bold text-lg">Đặt hàng ngay</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Modal choosing coupon */}
      <Modal visible={isCouponModalVisible} transparent animationType="slide">
        <View className="flex-1 justify-end bg-black/50">
          <View className="bg-white rounded-t-3xl p-5 h-[60%]">
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-xl font-bold text-gray-800">
                Chọn Mã Giảm Giá
              </Text>
              <TouchableOpacity onPress={() => setCouponModalVisible(false)}>
                <Ionicons name="close" size={28} color="gray" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {coupons.length === 0 ? (
                <Text className="text-center text-gray-500 mt-10">
                  Không có mã giảm giá nào khả dụng.
                </Text>
              ) : (
                coupons.map((c) => {
                  const isSelected = !!selectedCoupons.find(
                    (sc) => sc.id === c.id,
                  );
                  const isValid = cartTotal >= c.minOrderValue;

                  return (
                    <TouchableOpacity
                      key={c.id}
                      onPress={() => toggleCoupon(c)}
                      activeOpacity={0.8}
                      className={`flex-row items-center p-4 rounded-xl mb-3 border ${isSelected ? "border-blue-500 bg-blue-50" : "border-gray-200 bg-white"}`}
                    >
                      <View className="bg-blue-100 p-3 rounded-full mr-3">
                        <Ionicons name="ticket" size={24} color="#2563EB" />
                      </View>
                      <View className="flex-1">
                        <Text className="font-bold text-lg text-gray-800">
                          {c.code}
                        </Text>
                        <Text className="text-gray-600 text-sm mt-0.5">
                          {c.description}
                        </Text>
                        <Text
                          className={`text-xs mt-1 ${isValid ? "text-green-600" : "text-red-500"}`}
                        >
                          Đơn tối thiểu: {formatCurrency(c.minOrderValue)}
                        </Text>
                      </View>
                      <Ionicons
                        name={isSelected ? "checkbox" : "square-outline"}
                        size={24}
                        color={isSelected ? "#2563EB" : "#D1D5DB"}
                      />
                    </TouchableOpacity>
                  );
                })
              )}
            </ScrollView>

            <TouchableOpacity
              className="w-full py-3.5 bg-blue-600 rounded-xl items-center mt-3"
              onPress={() => setCouponModalVisible(false)}
            >
              <Text className="text-white font-bold text-lg">Xác nhận</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}
