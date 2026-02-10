import { cartController } from "@/src/controllers/cart.controller";
import { Cart, CartItem } from "@/src/models/cart.model";
import { Ionicons } from "@expo/vector-icons";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  RefreshControl,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function CartScreen() {
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState<Cart | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [processingId, setProcessingId] = useState<number | null>(null);

  useFocusEffect(
    useCallback(() => {
      loadCart();
    }, [])
  );

  const loadCart = async () => {
    const res = await cartController.getMyCart();
    if (res.ok) {
      setCart(res.data);
    } else {
      Alert.alert("Lỗi", res.message);
    }
    setLoading(false);
    setRefreshing(false);
  };

  const handleUpdateQuantity = async (productId: number, newQuantity: number) => {
    if (newQuantity < 1) return;
    setProcessingId(productId);
    
    const res = await cartController.updateQuantity(productId, newQuantity);
    
    if (res.ok) {
      if (cart) {
        const updatedItems = cart.cartItems.map((item) =>
          item.product.id === productId ? { ...item, quantity: newQuantity } : item
        );
        setCart({ ...cart, cartItems: updatedItems });
      }
    } else {
      Alert.alert("Lỗi", res.message);
    }
    setProcessingId(null);
  };

  const handleRemove = async (productId: number) => {
    Alert.alert("Xóa sản phẩm", "Bạn có chắc muốn xóa sản phẩm này?", [
      { text: "Hủy", style: "cancel" },
      {
        text: "Xóa",
        style: "destructive",
        onPress: async () => {
            setProcessingId(productId);
            const res = await cartController.remove(productId);
            if (res.ok) {
                 loadCart();
            } else {
                Alert.alert("Lỗi", res.message);
                setProcessingId(null);
            }
        },
      },
    ]);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const totalPrice = cart?.cartItems.reduce(
    (sum, item) => sum + item.quantity * item.product.price,
    0
  ) || 0;

  const renderItem = ({ item }: { item: CartItem }) => (
    <View className="flex-row bg-white p-3 rounded-xl mb-3 shadow-sm border border-gray-100 items-center">
      <Image
        source={{ uri: item.product.imageUrl || "https://via.placeholder.com/150" }}
        className="w-20 h-20 rounded-lg bg-gray-200"
        resizeMode="cover"
      />

      <View className="flex-1 ml-3 justify-between h-20">
        <View>
            <Text className="text-gray-800 font-bold text-base" numberOfLines={1}>
            {item.product.name}
            </Text>
            <Text className="text-red-600 font-bold mt-1">
            {formatCurrency(item.product.price)}
            </Text>
        </View>

        <View className="flex-row justify-between items-center">
          {/* Bộ điều khiển số lượng */}
          <View className="flex-row items-center bg-gray-100 rounded-lg overflow-hidden">
            <TouchableOpacity 
                className="p-2 bg-gray-200"
                onPress={() => handleUpdateQuantity(item.product.id, item.quantity - 1)}
                disabled={item.quantity <= 1 || processingId === item.product.id}
            >
              <Ionicons name="remove" size={16} color="black" />
            </TouchableOpacity>
            
            <View className="w-10 items-center justify-center">
                 {processingId === item.product.id ? (
                     <ActivityIndicator size="small" color="#2563EB" />
                 ) : (
                    <Text className="font-bold">{item.quantity}</Text>
                 )}
            </View>

            <TouchableOpacity 
                className="p-2 bg-gray-200"
                onPress={() => handleUpdateQuantity(item.product.id, item.quantity + 1)}
                disabled={processingId === item.product.id}
            >
              <Ionicons name="add" size={16} color="black" />
            </TouchableOpacity>
          </View>

          {/* Nút xóa */}
          <TouchableOpacity 
            onPress={() => handleRemove(item.product.id)}
            className="p-2"
          >
            <Ionicons name="trash-outline" size={20} color="#EF4444" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50">
        <ActivityIndicator size="large" color="#2563EB" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50 relative">
      
      {/* Header */}
      <View className="bg-white px-4 pt-12 pb-4 border-b border-gray-100 flex-row items-center">
        <TouchableOpacity onPress={() => router.back()} className="mr-3">
             <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-gray-800">Giỏ hàng ({cart?.cartItems.length || 0})</Text>
      </View>

      {/* List Items */}
      {!cart || cart.cartItems.length === 0 ? (
        <View className="flex-1 justify-center items-center p-4">
          <Ionicons name="cart-outline" size={80} color="#D1D5DB" />
          <Text className="text-gray-500 text-lg mt-4 font-medium">Giỏ hàng của bạn đang trống</Text>
          <TouchableOpacity 
            onPress={() => router.replace("/(tabs)/home")}
            className="mt-6 bg-blue-600 px-6 py-3 rounded-full"
          >
            <Text className="text-white font-bold">Mua sắm ngay</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={cart.cartItems}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadCart(); }} />
          }
        />
      )}

      {/* Bottom Payment Bar */}
      {cart && cart.cartItems.length > 0 && (
        <View className="absolute bottom-0 left-0 right-0 bg-white p-4 border-t border-gray-100 shadow-lg pb-8 rounded-t-2xl">
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-gray-500 font-medium">Tổng cộng:</Text>
            <Text className="text-2xl font-bold text-red-600">
                {formatCurrency(totalPrice)}
            </Text>
          </View>
          
          <TouchableOpacity 
            className="bg-blue-600 py-4 rounded-xl items-center shadow-md shadow-blue-200"
            onPress={() => router.push("/orders/checkout")}
          >
            <Text className="text-white font-bold text-lg uppercase tracking-wider">Mua ngay</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}