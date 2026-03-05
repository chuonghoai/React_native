import { reviewController } from "@/src/controllers/review.controller";
import { Order, OrderStatus } from "@/src/models/order.model";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
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

const getStatusBadge = (status: OrderStatus) => {
  switch (status) {
    case 'NEW': return { label: 'Chờ xác nhận', bg: 'bg-blue-100', text: 'text-blue-700' };
    case 'CONFIRMED': return { label: 'Đã xác nhận', bg: 'bg-indigo-100', text: 'text-indigo-700' };
    case 'PREPARING': return { label: 'Đang chuẩn bị', bg: 'bg-orange-100', text: 'text-orange-700' };
    case 'SHIPPING': return { label: 'Đang giao', bg: 'bg-purple-100', text: 'text-purple-700' };
    case 'DELIVERED': return { label: 'Giao thành công', bg: 'bg-green-100', text: 'text-green-700' };
    case 'CANCELLED': return { label: 'Đã hủy ', bg: 'bg-red-100', text: 'text-red-700' };
    case 'REQUEST_CANCEL': return { label: 'Chờ duyệt hủy', bg: 'bg-yellow-100', text: 'text-yellow-700' };
    default: return { label: status as string, bg: 'bg-gray-100', text: 'text-gray-700' };
  }
};

export default function OrderDetailScreen() {
  const { id, orderData } = useLocalSearchParams();
  const insets = useSafeAreaInsets();
  
  const [order, setOrder] = useState<Order | null>(null);

  const [reviewModalVisible, setReviewModalVisible] = useState(false);
  const [reviewingProductId, setReviewingProductId] = useState<number | null>(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);

  const [viewReviewModalVisible, setViewReviewModalVisible] = useState(false);
  const [viewReviewData, setViewReviewData] = useState<{rating: number, comment: string} | null>(null);

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

  const openReviewModal = (productId: number) => {
      setReviewingProductId(productId);
      setRating(5); 
      setComment("");
      setReviewModalVisible(true);
  };

  const openViewReview = (review: {rating: number, comment: string}) => {
      setViewReviewData(review);
      setViewReviewModalVisible(true);
  };

  const handleSubmitReview = async () => {
      if (!reviewingProductId) return;
      setSubmittingReview(true);
      
      const res = await reviewController.add(reviewingProductId, rating, comment);
      
      setSubmittingReview(false);
      if (res.ok) {
          Alert.alert("Tuyệt vời!", res.message);
          setReviewModalVisible(false);
          
          if (order) {
              const updatedItems = order.orderItems.map(item => {
                  if (item.product.id === reviewingProductId) {
                      return { ...item, review: { rating, comment } };
                  }
                  return item;
              });
              setOrder({ ...order, orderItems: updatedItems });
          }
      } else {
          Alert.alert("Thông báo", res.message);
      }
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
        
        {/* Order info */}
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

        {/* Shipping info */}
        <View className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-4">
            <View className="flex-row items-center mb-3">
                <Ionicons name="location" size={20} color="#2563EB" />
                <Text className="text-lg font-bold ml-2 text-gray-800">Địa chỉ nhận hàng</Text>
            </View>
            <Text className="font-bold text-gray-800 mb-1">{order.shippingPhone}</Text>
            <Text className="text-gray-600 leading-5">{order.shippingAddress}</Text>
        </View>

        {/* List product */}
        <View className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-4">
            <Text className="text-lg font-bold text-gray-800 mb-4 border-b border-gray-50 pb-2">
                Sản phẩm ({order.orderItems.length})
            </Text>
            
            {order.orderItems.map((item) => (
                <View key={item.id} className="mb-4 pb-4 border-b border-gray-50">
                    <View className="flex-row items-center">
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

                    {order.status === 'DELIVERED' && (
                        <View className="flex-row justify-end mt-3">
                            {item.review ? (
                                <TouchableOpacity 
                                    className="flex-row items-center border border-gray-200 px-4 py-1.5 rounded-full"
                                    onPress={() => openViewReview(item.review!)}
                                >
                                    <Text className="text-orange-500 font-bold mr-1">{item.review.rating}</Text>
                                    <Ionicons name="star" size={16} color="#F59E0B" />
                                    <Text className="text-gray-500 text-xs ml-2">Xem đánh giá</Text>
                                </TouchableOpacity>
                            ) : (
                                <TouchableOpacity 
                                    className="border border-orange-500 px-5 py-1.5 rounded-sm"
                                    onPress={() => openReviewModal(item.product.id)}
                                >
                                    <Text className="text-orange-500 font-medium">Đánh giá</Text>
                                </TouchableOpacity>
                            )}
                        </View>
                    )}
                </View>
            ))}

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

      {/* Review modal */}
      <Modal visible={reviewModalVisible} transparent animationType="fade">
          <View className="flex-1 bg-black/50 justify-center px-4">
              <View className="bg-white rounded-2xl p-5 shadow-lg">
                  <Text className="text-xl font-bold text-center mb-6 text-gray-800">Đánh giá sản phẩm</Text>
                  
                  {/* Rating */}
                  <View className="flex-row justify-center mb-6">
                      {[1, 2, 3, 4, 5].map((star) => (
                          <TouchableOpacity 
                              key={star} 
                              onPress={() => setRating(star)}
                              className="px-1"
                          >
                              <Ionicons 
                                  name={star <= rating ? "star" : "star-outline"} 
                                  size={45} 
                                  color="#F59E0B" 
                              />
                          </TouchableOpacity>
                      ))}
                  </View>
                  <Text className="text-center text-orange-500 font-bold mb-4 -mt-2">
                      { rating === 5 ? "Tuyệt vời" : 
                        rating === 4 ? "Rất tốt" : 
                        rating === 3 ? "Bình thường" : 
                        rating === 2 ? "Không hài lòng" : "Tệ"}
                  </Text>

                  {/* Comment */}
                  <View className="bg-gray-50 rounded-xl border border-gray-200 mb-6 px-3 py-2">
                      <TextInput
                          placeholder="Hãy chia sẻ nhận xét của bạn về sản phẩm này nhé..."
                          multiline
                          numberOfLines={4}
                          value={comment}
                          onChangeText={setComment}
                          className="h-28 text-base text-gray-700"
                          textAlignVertical="top"
                      />
                  </View>

                  <View className="flex-row gap-3">
                      <TouchableOpacity 
                          className="flex-1 py-3.5 rounded-xl bg-gray-100 items-center"
                          onPress={() => setReviewModalVisible(false)}
                      >
                          <Text className="font-bold text-gray-600 text-base">Trở lại</Text>
                      </TouchableOpacity>

                      <TouchableOpacity 
                          className={`flex-1 py-3.5 rounded-xl items-center ${submittingReview ? 'bg-orange-300' : 'bg-orange-500'}`}
                          onPress={handleSubmitReview}
                          disabled={submittingReview}
                      >
                          <Text className="font-bold text-white text-base">
                              {submittingReview ? "Đang gửi..." : "Hoàn thành"}
                          </Text>
                      </TouchableOpacity>
                  </View>
              </View>
          </View>
      </Modal>

      {/* Reviewed */}
      <Modal visible={viewReviewModalVisible} transparent animationType="fade">
          <View className="flex-1 bg-black/50 justify-center px-4">
              <View className="bg-white rounded-2xl p-5 shadow-lg">
                  <Text className="text-xl font-bold text-center mb-6 text-gray-800">Đánh giá của bạn</Text>
                  
                  {/* Rating */}
                  <View className="flex-row justify-center mb-6">
                      {[1, 2, 3, 4, 5].map((star) => (
                          <View key={star} className="px-1">
                              <Ionicons 
                                  name={star <= (viewReviewData?.rating || 0) ? "star" : "star-outline"} 
                                  size={45} 
                                  color="#F59E0B" 
                              />
                          </View>
                      ))}
                  </View>

                  {/* Comment */}
                  <View className="bg-gray-50 rounded-xl border border-gray-200 mb-6 px-4 py-3 min-h-[100px]">
                      <Text className="text-base text-gray-700">
                          {viewReviewData?.comment || "Không có nội dung bình luận."}
                      </Text>
                  </View>

                  <TouchableOpacity 
                      className="w-full py-3.5 rounded-xl bg-gray-200 items-center"
                      onPress={() => setViewReviewModalVisible(false)}
                  >
                      <Text className="font-bold text-gray-700 text-base">Đóng</Text>
                  </TouchableOpacity>
              </View>
          </View>
      </Modal>

    </View>
  );
}