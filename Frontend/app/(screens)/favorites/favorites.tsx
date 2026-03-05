import { favoriteController } from "@/src/controllers/favorite.controller";
import { Product } from "@/src/models/product.model";
import { Ionicons } from "@expo/vector-icons";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import {
    ActivityIndicator,
    FlatList,
    Image,
    RefreshControl,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

export default function FavoritesScreen() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useFocusEffect(
    useCallback(() => {
      loadFavorites();
    }, [])
  );

  const loadFavorites = async () => {
    const res = await favoriteController.getList();
    if (res.ok && res.data) {
      setProducts(res.data);
    }
    setLoading(false);
    setRefreshing(false);
  };

  const handleRemoveFavorite = async (productId: number) => {
    setProducts((prev) => prev.filter((p) => p.id !== productId));
    await favoriteController.toggle(productId);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const renderItem = ({ item }: { item: Product }) => (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={() =>
        router.push({
          pathname: "/product/[id]",
          params: { id: item.id.toString() },
        })
      }
      className="bg-white p-3 rounded-xl mb-3 flex-row items-center border border-gray-100 shadow-sm"
    >
      <Image
        source={{ uri: item.imageUrl || "https://via.placeholder.com/150" }}
        className="w-20 h-20 rounded-lg bg-gray-200"
        resizeMode="cover"
      />
      <View className="flex-1 ml-3 justify-center h-20">
        <Text className="font-bold text-gray-800 text-base" numberOfLines={2}>
          {item.name}
        </Text>
        <Text className="text-red-600 font-bold mt-1">
          {formatCurrency(item.price)}
        </Text>
      </View>
      <TouchableOpacity
        onPress={() => handleRemoveFavorite(item.id)}
        className="p-2"
      >
        <Ionicons name="heart" size={24} color="#EF4444" />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-white px-4 pt-4 pb-4 border-b border-gray-100 flex-row items-center">
        <TouchableOpacity onPress={() => router.back()} className="mr-3">
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-gray-800">
          Sản phẩm yêu thích
        </Text>
      </View>

      {/* List product */}
      {loading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#EC4899" />
        </View>
      ) : (
        <FlatList
          data={products}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => {
                setRefreshing(true);
                loadFavorites();
              }}
            />
          }
          ListEmptyComponent={
            <View className="items-center justify-center mt-20">
              <Ionicons name="heart-dislike-outline" size={80} color="#D1D5DB" />
              <Text className="text-gray-500 text-lg mt-4 font-medium">
                Chưa có sản phẩm yêu thích
              </Text>
            </View>
          }
        />
      )}
    </View>
  );
}