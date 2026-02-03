import { productController } from "@/src/controllers/product.controller";
import { Product } from "@/src/models/product.model";
import { Ionicons } from "@expo/vector-icons";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Dimensions,
  FlatList,
  Image,
  Modal,
  RefreshControl,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";

const { width } = Dimensions.get("window");

const CATEGORY_OPTIONS = [
  { label: "Điện thoại", value: "DIENTHOAI" },
  { label: "Máy tính", value: "MAYTINH" },
  { label: "Tivi", value: "TIVI" },
  { label: "Điện tử", value: "DIENTU" },
  { label: "Đồng hồ", value: "DONGHO" },
];

export default function HomeScreen() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [isSearchActive, setIsSearchActive] = useState(false);
  const [keyword, setKeyword] = useState("");
  const searchWidthAnim = useRef(new Animated.Value(0)).current;

  const [isFilterVisible, setIsFilterVisible] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  useFocusEffect(
    useCallback(() => {
      fetchProducts();
    }, [])
  );

  const fetchProducts = async () => {
    setLoading(true);
    const res = await productController.getList();
    if (res.ok) setProducts(res.data);
    setLoading(false);
    setRefreshing(false);
  };

  // Searching
  const toggleSearchBar = () => {
    if (isSearchActive) {
      Animated.timing(searchWidthAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: false,
      }).start(() => {
        setIsSearchActive(false);
        setKeyword("");
      });
    } else {
      setIsSearchActive(true);
      Animated.timing(searchWidthAnim, {
        toValue: width - 100,
        duration: 300,
        useNativeDriver: false,
      }).start();
    }
  };

  const handleSearchSubmit = async () => {
    if (!keyword.trim()) return;
    setLoading(true);
    const res = await productController.search(keyword);
    if (res.ok) setProducts(res.data);
    setLoading(false);
  };

  // Filter
  const toggleCategory = (value: string) => {
    if (selectedCategories.includes(value)) {
      setSelectedCategories(prev => prev.filter(c => c !== value));
    } else {
      setSelectedCategories(prev => [...prev, value]);
    }
  };

  const applyFilter = async () => {
    setIsFilterVisible(false);
    if (selectedCategories.length === 0) {
      fetchProducts();
      return;
    }
    setLoading(true);
    const res = await productController.filter(selectedCategories);
    if (res.ok) setProducts(res.data);
    setLoading(false);
  };

  // Product card
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  const renderItem = ({ item }: { item: Product }) => (
    <TouchableOpacity 
      activeOpacity={0.9}
      onPress={() => {
        router.push({
        pathname: "/(tabs)/product/[id]",
        params: { id: item.id.toString() }
      });
      }}
    >
      <View className="bg-white rounded-xl shadow-sm mb-4 overflow-hidden border border-gray-100">
        <Image
          source={{ uri: item.imageUrl || "https://via.placeholder.com/150" }}
          className="w-full h-48 bg-gray-200"
          resizeMode="cover"
        />
        <View className="p-4">
          <Text className="text-lg font-bold text-gray-800 mb-1" numberOfLines={2}>
            {item.name}
          </Text>
          <Text className="text-red-600 font-bold text-base">
            {formatCurrency(item.price)}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View className="flex-1 bg-gray-50 pt-4 relative">
      
      <View className="flex-row items-center justify-between px-4 mb-4 z-20">
        
        {!isSearchActive ? (
           <TouchableOpacity onPress={() => setIsFilterVisible(true)}>
             <Ionicons name="filter" size={28} color="#374151" />
           </TouchableOpacity>
        ) : (
          <View />
        )}

        <View className="flex-row items-center justify-end flex-1">
          {isSearchActive && (
            <Animated.View style={{ width: searchWidthAnim, marginRight: 10, overflow: 'hidden' }}>
              <TextInput 
                placeholder="Nhập tên sản phẩm..."
                className="bg-white border border-gray-300 rounded-full px-4 py-2 text-sm"
                autoFocus
                value={keyword}
                onChangeText={setKeyword}
                onSubmitEditing={handleSearchSubmit}
              />
            </Animated.View>
          )}

          <TouchableOpacity onPress={toggleSearchBar}>
            <Ionicons 
              name={isSearchActive ? "close-outline" : "search-outline"} 
              size={28} 
              color="#374151" 
            />
          </TouchableOpacity>
        </View>
      </View>

      {isSearchActive && (
        <TouchableWithoutFeedback onPress={toggleSearchBar}>
          <View className="absolute top-[60px] left-0 right-0 bottom-0 bg-black/50 z-10" />
        </TouchableWithoutFeedback>
      )}

      <View className="flex-1 px-4 z-0">
        {loading ? (
           <ActivityIndicator size="large" color="#2563EB" className="mt-10" />
        ) : (
          <FlatList
            data={products}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderItem}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 20 }}
            refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchProducts(); }} />
            }
            ListEmptyComponent={
                <Text className="text-center text-gray-500 mt-10">Không tìm thấy sản phẩm nào</Text>
            }
          />
        )}
      </View>

      <Modal
        visible={isFilterVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsFilterVisible(false)}
      >
        <View className="flex-1 bg-black/60 justify-center items-center px-6">
          <View className="bg-white w-full rounded-2xl p-6">
            <View className="flex-row justify-between items-center mb-6">
              <Text className="text-xl font-bold text-gray-800">Bộ lọc sản phẩm</Text>
              <TouchableOpacity onPress={() => setIsFilterVisible(false)}>
                 <Ionicons name="close" size={24} color="gray" />
              </TouchableOpacity>
            </View>

            <View className="flex-row flex-wrap gap-3 mb-8">
              {CATEGORY_OPTIONS.map((option) => {
                const isSelected = selectedCategories.includes(option.value);
                return (
                  <TouchableOpacity
                    key={option.value}
                    onPress={() => toggleCategory(option.value)}
                    className={`flex-row items-center px-4 py-2 rounded-full border ${
                      isSelected 
                        ? "bg-blue-600 border-blue-600" 
                        : "bg-white border-gray-300"
                    }`}
                  >
                    <Ionicons 
                      name={isSelected ? "checkbox" : "square-outline"} 
                      size={18} 
                      color={isSelected ? "white" : "gray"} 
                    />
                    <Text className={`ml-2 font-medium ${isSelected ? "text-white" : "text-gray-600"}`}>
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <TouchableOpacity 
              className="bg-blue-600 rounded-xl py-3 items-center"
              onPress={applyFilter}
            >
              <Text className="text-white font-bold text-lg">Tìm kiếm</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

    </View>
  );
}