import { cartController } from "@/src/controllers/cart.controller";
import { productController } from "@/src/controllers/product.controller";
import { ProductDetail } from "@/src/models/product.model";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View
} from "react-native";

export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams();
  const [loading, setLoading] = useState(true);
  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [addingToCart, setAddingToCart] = useState(false);

  useEffect(() => {
    if (id) {
      loadProduct(Number(id));
    }
  }, [id]);

  const loadProduct = async (productId: number) => {
    setLoading(true);
    const res = await productController.get(productId);
    if (res.ok) {
      setProduct(res.data);
    } else {
      console.log(res.message);
    }
    setLoading(false);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#2563EB" />
      </View>
    );
  }

  if (!product) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <Text className="text-gray-500">Không tìm thấy sản phẩm</Text>
        <TouchableOpacity onPress={() => router.back()} className="mt-4">
           <Text className="text-blue-600">Quay lại</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const handleAddToCart = async () => {
    if (!product) return;
    if (addingToCart) return;

    setAddingToCart(true);
    
    const res = await cartController.addToCart(product.id, 1);
    
    setAddingToCart(false);

    if (res.ok) {
        Alert.alert("Thành công", "Sản phẩm đã được thêm vào giỏ hàng");
    } else {
        Alert.alert("Lỗi", res.message);
    }
  };

  return (
    <View className="flex-1 bg-white">

      {/* Back button */}
      <View className="absolute top-4 left-4 z-10">
        <TouchableOpacity
          onPress={() => router.back()}
          className="bg-white/80 p-2 rounded-full shadow-sm"
        >
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
      </View>

      {/* Product infomation */}
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        <Image
          source={{ uri: product.imageUrl || "https://via.placeholder.com/300" }}
          className="w-full h-80 bg-gray-100"
          resizeMode="cover"
        />

        <View className="px-5 py-6 -mt-6 bg-white rounded-t-3xl shadow-sm h-full">
          <Text className="text-blue-600 font-bold uppercase text-xs mb-2">
            {product.category?.name || "Sản phẩm"}
          </Text>

          <Text className="text-2xl font-bold text-gray-900 mb-2">
            {product.name}
          </Text>

          <View className="flex-row justify-between items-start mb-6">
            <View>
              <Text className="text-red-600 text-2xl font-bold">
                {formatCurrency(product.price)}
              </Text>
              
              {product.originalPrice && product.originalPrice > product.price ? (
                <Text className="text-gray-400 text-sm line-through mt-0.5">
                  {formatCurrency(product.originalPrice)}
                </Text>
              ) : null}
            </View>

            <View className="bg-gray-100 px-3 py-1 rounded-lg mt-1">
                <Text className="text-gray-600 text-sm font-medium">Kho: {product.quantity}</Text>
            </View>
          </View>

          <View className="h-[1px] bg-gray-100 w-full mb-6" />

          <Text className="text-lg font-bold text-gray-800 mb-3">Mô tả</Text>
          <Text className="text-gray-600 leading-6 text-base">
            {product.description || "Chưa có mô tả cho sản phẩm này."}
          </Text>
        </View>
      </ScrollView>

      {/* Add to cart button */}
      <View className="p-4 border-t border-gray-100 bg-white safe-bottom">
        <TouchableOpacity 
            className={`w-full py-4 rounded-xl items-center shadow-lg shadow-blue-200 flex-row justify-center ${
                addingToCart ? "bg-blue-400" : "bg-blue-600"
            }`}
            onPress={handleAddToCart}
            disabled={addingToCart}
        >
          {addingToCart ? (
            <>
                <ActivityIndicator size="small" color="white" className="mr-2" />
                <Text className="text-white font-bold text-lg">Đang thêm...</Text>
            </>
          ) : (
             <Text className="text-white font-bold text-lg">Thêm vào giỏ hàng</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}