import { orderController } from "@/src/controllers/order.controller";
import { Order, OrderStatus } from "@/src/models/order.model";
import { Ionicons } from "@expo/vector-icons";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const STATUS_TABS = [
  { key: "ALL", label: "Tất cả" },
  { key: "NEW", label: "Chờ xác nhận" },
  { key: "PREPARING", label: "Đang chuẩn bị" },
  { key: "SHIPPING", label: "Đang giao" },
  { key: "DELIVERED", label: "Đã giao" },
  { key: "CANCELLED", label: "Đã hủy" },
];

const getStatusBadge = (status: OrderStatus) => {
  switch (status) {
    case 'NEW': return { label: 'Chờ xác nhận', bg: 'bg-blue-100', text: 'text-blue-700' };
    case 'CONFIRMED': return { label: 'Đã xác nhận', bg: 'bg-indigo-100', text: 'text-indigo-700' };
    case 'PREPARING': return { label: 'Đang chuẩn bị', bg: 'bg-orange-100', text: 'text-orange-700' };
    case 'SHIPPING': return { label: 'Đang giao', bg: 'bg-purple-100', text: 'text-purple-700' };
    case 'DELIVERED': return { label: 'Giao thành công', bg: 'bg-green-100', text: 'text-green-700' };
    case 'CANCELLED': return { label: 'Đã hủy', bg: 'bg-red-100', text: 'text-red-700' };
    case 'REQUEST_CANCEL': return { label: 'Chờ duyệt hủy', bg: 'bg-yellow-100', text: 'text-yellow-700' };
    default: return { label: status, bg: 'bg-gray-100', text: 'text-gray-700' };
  }
};

export default function OrderHistoryScreen() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState("ALL");

  useFocusEffect(
    useCallback(() => {
      loadOrders();
    }, [])
  );

  const loadOrders = async () => {
    const res = await orderController.getHistory();
    if (res.ok) setOrders(res.data);
    setLoading(false);
    setRefreshing(false);
  };

  const handleCancelOrder = (orderId: number) => {
    Alert.alert("Xác nhận hủy", "Bạn có chắc chắn muốn hủy đơn hàng này?", [
        { text: "Không", style: "cancel" },
        { 
            text: "Hủy đơn", 
            style: "destructive",
            onPress: async () => {
                setLoading(true);
                const res = await orderController.cancel(orderId);
                if (res.ok) {
                    Alert.alert("Thông báo", res.message);
                    loadOrders(); // Reload lại list
                } else {
                    Alert.alert("Lỗi", res.message);
                    setLoading(false);
                }
            }
        }
    ]);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(amount);
  };

  const formatDate = (dateString: string) => {
    const d = new Date(dateString);
    return `${d.getHours()}:${d.getMinutes().toString().padStart(2, '0')} ${d.getDate()}/${d.getMonth()+1}/${d.getFullYear()}`;
  };

  const filteredOrders = orders.filter(order => {
      if (activeTab === "ALL") return true;
      if (activeTab === "NEW") return order.status === "NEW" || order.status === "CONFIRMED";
      return order.status === activeTab;
  });

  const renderItem = ({ item }: { item: Order }) => {
    const badge = getStatusBadge(item.status);
    const firstItem = item.orderItems[0];
    const extraItemsCount = item.orderItems.length - 1;

    return (
      <View className="bg-white p-4 mb-3 rounded-xl shadow-sm border border-gray-100">
        <View className="flex-row justify-between items-center mb-3 border-b border-gray-100 pb-2">
            <View>
                <Text className="text-gray-500 text-xs">Mã ĐH: #{item.id}</Text>
                <Text className="text-gray-400 text-xs">{formatDate(item.orderDate)}</Text>
            </View>
            <View className={`px-3 py-1 rounded-full ${badge.bg}`}>
                <Text className={`text-xs font-bold ${badge.text}`}>{badge.label} </Text>
            </View>
        </View>

        <TouchableOpacity 
            activeOpacity={0.7}
            onPress={() => router.push({ 
                pathname: "/orders/[id]", 
                params: { id: item.id.toString(),
                  orderData: JSON.stringify(item)
                 } 
            })}
        >
            {/* Product preview */}
            {firstItem && (
                <View className="flex-row items-center mb-3">
                    <Image source={{ uri: firstItem.product.imageUrl }} className="w-16 h-16 rounded-md bg-gray-200" />
                    <View className="flex-1 ml-3">
                        <Text className="font-bold text-gray-800" numberOfLines={1}>{firstItem.product.name}</Text>
                        <View className="flex-row justify-between mt-1">
                            <Text className="text-gray-500 text-sm">x{firstItem.quantity}</Text>
                            <Text className="text-red-600">{formatCurrency(firstItem.price)}</Text>
                        </View>
                    </View>
                </View>
            )}

            {extraItemsCount > 0 && (
                 <View className="mb-3 border-t border-gray-50 pt-3">
                     <Text className="text-center text-gray-400 text-sm font-medium">
                         Xem thêm {extraItemsCount} sản phẩm khác...
                     </Text>
                 </View>
            )}
        </TouchableOpacity>

        <View className="flex-row justify-between items-center pt-2 border-t border-gray-100">
            <Text className="text-gray-600 font-medium">Tổng tiền:</Text>
            <Text className="text-lg font-bold text-red-600">{formatCurrency(item.totalPrice)}</Text>
        </View>

        {item.status === 'NEW' && (
            <TouchableOpacity 
                onPress={() => handleCancelOrder(item.id)}
                className="mt-3 border border-red-500 py-2 rounded-lg items-center"
            >
                <Text className="text-red-500 font-bold">Hủy đơn hàng</Text>
            </TouchableOpacity>
        )}
      </View>
    );
  };

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-white px-4 pt-4 pb-2 border-b border-gray-100 flex-row items-center shadow-sm">
        <TouchableOpacity onPress={() => router.back()} className="mr-3 p-2">
             <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-gray-800">Lịch sử đơn hàng</Text>
      </View>

      {/* Tabs Filter */}
      <View className="bg-white border-b border-gray-200">
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="py-2 pl-2">
              {STATUS_TABS.map(tab => {
                  const isActive = activeTab === tab.key;
                  return (
                      <TouchableOpacity 
                          key={tab.key}
                          onPress={() => setActiveTab(tab.key)}
                          className={`px-4 py-2 mr-2 rounded-full border ${isActive ? 'bg-blue-600 border-blue-600' : 'bg-white border-gray-300'}`}
                      >
                          <Text className={`font-medium ${isActive ? 'text-white' : 'text-gray-600'}`}>{tab.label}</Text>
                      </TouchableOpacity>
                  )
              })}
          </ScrollView>
      </View>

      {/* Content */}
      {loading ? (
           <ActivityIndicator size="large" color="#2563EB" className="flex-1 justify-center items-center" />
      ) : (
          <FlatList
            data={filteredOrders}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderItem}
            contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
            showsVerticalScrollIndicator={false}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadOrders(); }} />}
            ListEmptyComponent={
                <View className="items-center justify-center mt-20">
                    <Ionicons name="receipt-outline" size={80} color="#D1D5DB" />
                    <Text className="text-gray-500 text-lg mt-4 font-medium">Chưa có đơn hàng nào</Text>
                </View>
            }
          />
      )}
    </View>
  );
}