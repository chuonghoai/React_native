import { Order, OrderStatus } from "@/src/models/order.model";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Image,
    ScrollView,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const getStatusBadge = (status: OrderStatus) => {
  switch (status) {
    case 'NEW': return { label: 'Chờ xác nhận', bg: 'bg-blue-100', text: 'text-blue-700' };
    case 'CONFIRMED': return { label: 'Đã xác nhận', bg: 'bg-indigo-100', text: 'text-indigo-700' };
    case 'PREPARING': return { label: 'Đang chuẩn bị', bg: 'bg-orange-100', text: 'text-orange-700' };
    case 'SHIPPING': return { label: 'Đang giao', bg: 'bg-purple-100', text: 'text-purple-700' };
    case 'DELIVERED': return { label: 'Giao thành công', bg: 'bg-green-100', text: 'text-green-700' };
    case 'CANCELLED': return { label: 'Đã hủy ', bg: 'bg-red-100', text: 'text-red-700' };
    case 'REQUEST_CANCEL': return { label: 'Chờ duyệt hủy', bg: 'bg-yellow-100', text: 'text-yellow-700' };
    default: return { label: status, bg: 'bg-gray-100', text: 'text-gray-700' };
  }
};

export default function OrderDetailScreen() {
  const { id, orderData } = useLocalSearchParams();
  const insets = useSafeAreaInsets();
  
  const [order, setOrder] = useState<Order | null>(null);

  useEffect(() => {
    if (orderData) {
      try {
        const parsedOrder = JSON.parse(orderData as string);
        setOrder(parsedOrder);
      } catch (error) {
        console.error("Lỗi dữ liệu", error);
      }
    }
  }, [orderData]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(amount);
  };

  const formatDate = (dateString: string) => {
    const d = new Date(dateString);
    return `${d.getHours()}:${d.getMinutes().toString().padStart(2, '0')} ${d.getDate()}/${d.getMonth()+1}/${d.getFullYear()}`;
  };

  if (!order) {
    return (
    <View className="flex-1 justify-center items-center bg-gray-50">
        <ActivityIndicator size="large" color="#2563EB" />
    </View>
    );
  }

  const badge = getStatusBadge(order.status);

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-white px-4 pt-4 pb-4 border-b border-gray-100 flex-row items-center shadow-sm z-10">
        <TouchableOpacity onPress={() => router.back()} className="mr-3">
             <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-gray-800">Chi tiết đơn hàng</Text>
      </View>

      <ScrollView className="flex-1" contentContainerStyle={{ padding: 16, paddingBottom: insets.bottom + 40 }}>
        
        {/* Thông tin chung */}
        <View className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-4">
            <View className="flex-row justify-between items-center mb-3 pb-3 border-b border-gray-50">
                <Text className="text-gray-500 font-medium">Mã đơn hàng</Text>
                <Text className="font-bold text-gray-800">#{order.id}</Text>
            </View>
            <View className="flex-row justify-between items-center mb-3 pb-3 border-b border-gray-50">
                <Text className="text-gray-500 font-medium">Ngày đặt</Text>
                <Text className="font-bold text-gray-800">{formatDate(order.orderDate)}</Text>
            </View>
            <View className="flex-row justify-between items-center">
                <Text className="text-gray-500 font-medium">Trạng thái</Text>
                <View className={`px-3 py-1 rounded-full ${badge.bg}`}>
                    <Text className={`text-xs font-bold ${badge.text}`}>{badge.label}</Text>
                </View>
            </View>
        </View>

        {/* Thông tin giao hàng */}
        <View className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-4">
            <View className="flex-row items-center mb-3">
                <Ionicons name="location" size={20} color="#2563EB" />
                <Text className="text-lg font-bold ml-2 text-gray-800">Địa chỉ nhận hàng</Text>
            </View>
            <Text className="font-bold text-gray-800 mb-1">{order.shippingPhone}</Text>
            <Text className="text-gray-600 leading-5">{order.shippingAddress}</Text>
        </View>

        {/* Danh sách sản phẩm */}
        <View className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-4">
            <Text className="text-lg font-bold text-gray-800 mb-4 border-b border-gray-50 pb-2">
                Sản phẩm ({order.orderItems.length})
            </Text>
            
            {order.orderItems.map((item) => (
                <View key={item.id} className="flex-row items-center mb-4 pb-4 border-b border-gray-50">
                    <Image source={{ uri: item.product.imageUrl }} className="w-20 h-20 rounded-lg bg-gray-200" />
                    <View className="flex-1 ml-3 justify-between h-20">
                        <Text className="font-bold text-gray-800 text-base" numberOfLines={2}>
                            {item.product.name}
                        </Text>
                        <View className="flex-row justify-between items-center mt-1">
                            <Text className="text-red-600 font-bold text-base">{formatCurrency(item.price)}</Text>
                            <Text className="text-gray-500 font-medium">x {item.quantity}</Text>
                        </View>
                    </View>
                </View>
            ))}

            {/* Tổng kết tiền */}
            <View className="mt-2 space-y-2">
                <View className="flex-row justify-between items-center mb-2">
                    <Text className="text-gray-500">Phương thức thanh toán</Text>
                    <Text className="font-medium text-gray-800">
                        {order.paymentMethod === 'COD' ? 'Thanh toán khi nhận hàng' : order.paymentMethod}
                    </Text>
                </View>
                <View className="flex-row justify-between items-center pt-3 border-t border-gray-100 mt-2">
                    <Text className="text-gray-800 font-bold text-lg">Tổng thanh toán</Text>
                    <Text className="text-2xl font-bold text-red-600">{formatCurrency(order.totalPrice)}</Text>
                </View>
            </View>
        </View>
      </ScrollView>
    </View>
  );
}