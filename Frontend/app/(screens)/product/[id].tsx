import { cartController } from "@/src/controllers/cart.controller";
import { favoriteController } from "@/src/controllers/favorite.controller";
import { productController } from "@/src/controllers/product.controller";
import { reviewController } from "@/src/controllers/review.controller";
import { Product, ProductDetail } from "@/src/models/product.model";
import { Review } from "@/src/models/review.model";
import { websocketService } from "@/src/services/websocket";
import { viewedLocal } from "@/src/storage/viewed.local";
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
  
  const [isFavorite, setIsFavorite] = useState(false);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [similarProducts, setSimilarProducts] = useState<Product[]>([]);
  
  const [addingToCart, setAddingToCart] = useState(false);

  useEffect(() => {
    if (id) {
      loadData(Number(id));
    }
  }, [id]);

  const mergeReviews = (incomingReviews: Review[], currentReviews: Review[] = []) => {
    const reviewMap = new Map<number, Review>();

    [...incomingReviews, ...currentReviews].forEach((review) => {
      reviewMap.set(review.id, review);
    });

    return Array.from(reviewMap.values()).sort(
      (firstReview, secondReview) =>
        new Date(secondReview.createdAt).getTime() - new Date(firstReview.createdAt).getTime()
    );
  };

  useEffect(() => {
    if (!id) {
      return;
    }

    const productId = Number(id);

    return websocketService.subscribe<Review>(
      `/topic/reviews/product/${productId}`,
      (incomingReview) => {
        let shouldIncreaseReviewCount = false;

        setReviews((currentReviews) => {
          if (currentReviews.some((review) => review.id === incomingReview.id)) {
            return currentReviews;
          }

          shouldIncreaseReviewCount = true;
          return [incomingReview, ...currentReviews];
        });

        if (shouldIncreaseReviewCount) {
          setProduct((currentProduct) => {
            if (!currentProduct) {
              return currentProduct;
            }

            return {
              ...currentProduct,
              reviewCount: (currentProduct.reviewCount ?? 0) + 1,
            };
          });
        }
      }
    );
  }, [id]);

  const loadData = async (productId: number) => {
    setLoading(true);
    
    const res = await productController.get(productId);
    if (res.ok && res.data) {
      setProduct((currentProduct) => ({
        ...res.data,
        reviewCount: Math.max(res.data.reviewCount ?? 0, currentProduct?.reviewCount ?? 0),
      }));
      setIsFavorite(res.data.isFavorite || false);
      
      viewedLocal.add({
          id: res.data.id,
          name: res.data.name,
          price: res.data.price,
          imageUrl: res.data.imageUrl,
          category: res.data.category
      });
    }

    const reviewRes = await reviewController.getProductReviews(productId);
    if (reviewRes.ok && reviewRes.data) {
      setReviews((currentReviews) => mergeReviews(reviewRes.data ?? [], currentReviews));
    }

    const similarRes = await productController.getSimilar(productId);
    if (similarRes.ok && similarRes.data) setSimilarProducts(similarRes.data);

    setLoading(false);
  };

  const handleToggleFavorite = async () => {
      if (!product) return;
      setIsFavorite(!isFavorite);
      const res = await favoriteController.toggle(product.id);
      if (!res.ok) {
          setIsFavorite(!isFavorite);
          Alert.alert("Lỗi", "Vui lòng đăng nhập để sử dụng tính năng này");
      }
  };

  const handleAddToCart = async () => {
    if (!product || addingToCart) return;
    setAddingToCart(true);
    const res = await cartController.addToCart(product.id, 1);
    setAddingToCart(false);
    if (res.ok) Alert.alert("Thành công", "Sản phẩm đã được thêm vào giỏ hàng");
    else Alert.alert("Lỗi", res.message);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(amount);
  };

  const formatDate = (dateStr: string) => {
      const d = new Date(dateStr);
      return `${d.getDate()}/${d.getMonth()+1}/${d.getFullYear()}`;
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-white"><ActivityIndicator size="large" color="#2563EB" /></View>
    );
  }

  if (!product) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <Text className="text-gray-500">Không tìm thấy sản phẩm</Text>
        <TouchableOpacity onPress={() => router.back()} className="mt-4"><Text className="text-blue-600">Quay lại</Text></TouchableOpacity>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50">

      {/* HEADER */}
      <View className="absolute top-4 left-4 right-4 z-10 flex-row justify-between">
        <TouchableOpacity onPress={() => router.back()} className="bg-white/80 p-2 rounded-full shadow-sm">
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        
        <TouchableOpacity onPress={handleToggleFavorite} className="bg-white/80 p-2 rounded-full shadow-sm">
          <Ionicons name={isFavorite ? "heart" : "heart-outline"} size={24} color={isFavorite ? "#EF4444" : "black"} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        <Image source={{ uri: product.imageUrl || "https://via.placeholder.com/300" }} className="w-full h-80 bg-gray-100" resizeMode="cover" />

        {/* Product info */}
        <View className="px-5 py-6 -mt-6 bg-white rounded-t-3xl shadow-sm mb-3">
          <Text className="text-blue-600 font-bold uppercase text-xs mb-2">{product.category?.name || "Sản phẩm"}</Text>
          <Text className="text-2xl font-bold text-gray-900 mb-2">{product.name}</Text>

          <View className="flex-row justify-between items-end mb-4">
            <Text className="text-red-600 text-3xl font-bold">{formatCurrency(product.price)}</Text>
            
            <View className="items-end">
                <Text className="text-gray-500 text-xs mb-1">Đã bán: {product.soldCount || 0}</Text>
                <View className="bg-gray-100 px-3 py-1 rounded-lg">
                    <Text className="text-gray-600 text-sm">Kho: {product.quantity}</Text>
                </View>
            </View>
          </View>

          <View className="h-[1px] bg-gray-100 w-full mb-4" />

          <Text className="text-lg font-bold text-gray-800 mb-2">Mô tả sản phẩm</Text>
          <Text className="text-gray-600 leading-6 text-base">{product.description || "Chưa có mô tả cho sản phẩm này."}</Text>
        </View>

        {/* Review */}
        <View className="bg-white p-5 mb-3">
            <View className="flex-row justify-between items-center mb-4">
                <Text className="text-lg font-bold text-gray-800">Đánh giá sản phẩm ({product.reviewCount || 0})</Text>
            </View>
            
            {reviews.length === 0 ? (
                <Text className="text-gray-400 italic">Chưa có đánh giá nào.</Text>
            ) : (
                reviews.map(review => (
                    <View key={review.id} className="mb-4 border-b border-gray-50 pb-4">
                        <View className="flex-row items-center mb-2">
                            <Image source={{ uri: review.avatarUrl || `https://ui-avatars.com/api/?name=${review.fullname}` }} className="w-8 h-8 rounded-full bg-gray-200" />
                            <View className="ml-2">
                                <Text className="font-bold text-gray-800 text-xs">{review.fullname}</Text>
                                <View className="flex-row mt-0.5">
                                    {[1,2,3,4,5].map(s => <Ionicons key={s} name="star" size={12} color={s <= review.rating ? "#F59E0B" : "#D1D5DB"} />)}
                                </View>
                            </View>
                            <Text className="ml-auto text-xs text-gray-400">{formatDate(review.createdAt)}</Text>
                        </View>
                        <Text className="text-gray-700 text-sm leading-5">{review.comment}</Text>
                    </View>
                ))
            )}
        </View>

        {/* Similar product*/}
        {similarProducts.length > 0 && (
            <View className="bg-white p-4">
                <Text className="text-lg font-bold text-gray-800 mb-4">Sản phẩm tương tự</Text>
                
                <View className="flex-row flex-wrap justify-between">
                    {similarProducts.map(item => (
                        <TouchableOpacity 
                            key={item.id}
                            activeOpacity={0.9}
                            onPress={() => router.replace({ pathname: "/product/[id]", params: { id: item.id.toString() } })}
                            className="w-[48%] mb-4 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
                        >
                            <Image source={{ uri: item.imageUrl || "https://via.placeholder.com/150" }} className="w-full h-36 bg-gray-200" resizeMode="cover" />
                            <View className="p-3">
                                <Text className="text-sm font-bold text-gray-800 mb-1" numberOfLines={2}>{item.name}</Text>
                                <Text className="text-red-600 font-bold text-sm">{formatCurrency(item.price)}</Text>
                            </View>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>
        )}

      </ScrollView>

      {/* Action button*/}
      <View className="p-4 border-t border-gray-100 bg-white safe-bottom">
        <TouchableOpacity 
            className={`w-full py-4 rounded-xl items-center shadow-md flex-row justify-center ${addingToCart ? "bg-blue-400" : "bg-blue-600"}`}
            onPress={handleAddToCart} disabled={addingToCart}
        >
          {addingToCart ? (
            <><ActivityIndicator size="small" color="white" className="mr-2" /><Text className="text-white font-bold text-lg">Đang thêm...</Text></>
          ) : (
             <Text className="text-white font-bold text-lg">Thêm vào giỏ hàng</Text>
          )}
        </TouchableOpacity>
      </View>

    </View>
  );
}
