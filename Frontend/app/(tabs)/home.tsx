import { homeController } from "@/src/controllers/home.controller";
import { productController } from "@/src/controllers/product.controller";
import { voucherController } from "@/src/controllers/voucher.controller";
import { Category, Product } from "@/src/models/product.model";
import { ProductDiscount } from "@/src/models/voucher.model";
import { userLocal } from "@/src/storage/user.local";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useEffect, useRef, useState } from "react";
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

const SORT_OPTIONS = [
  { label: "Mới nhất", sortBy: "id", order: "desc" },
  { label: "Giá: Thấp đến Cao", sortBy: "price", order: "asc" },
  { label: "Giá: Cao đến Thấp", sortBy: "price", order: "desc" },
  { label: "Tên: A-Z", sortBy: "name", order: "asc" },
];

export default function HomeScreen() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [bestSellers, setBestSellers] = useState<Product[]>([]);
  const [discountProducts, setDiscountProducts] = useState<ProductDiscount[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [isSearchActive, setIsSearchActive] = useState(false);
  const [keyword, setKeyword] = useState("");
  const searchWidthAnim = useRef(new Animated.Value(0)).current;

  const [isFilterVisible, setIsFilterVisible] = useState(false);
  
  const [selectedSort, setSelectedSort] = useState(SORT_OPTIONS[0]);
  const [selectedCategoryName, setSelectedCategoryName] = useState<string | null>(null);

  useEffect(() => {
    loadInitialData();
  }, [selectedSort, selectedCategoryName]);

  const loadInitialData = async () => {
    if (categories.length === 0) {
      let user = await userLocal.get();
      
      if (!user || !user.categories || user.categories.length === 0) {
        const res = await homeController.loadMe();
        if (res.ok && res.data) {
           user = res.data;
        }
      }

      if (user && user.categories) {
        setCategories(user.categories);
      }
    }

    fetchBestSellers();
    fetchDiscountProducts();
    fetchProducts();
  };

  const fetchBestSellers = async () => {
    const res = await productController.getBestSellers();
    if (res.ok) {
        setBestSellers(res.data);
    }
  };

  const fetchDiscountProducts = async () => {
      const res = await voucherController.getList(0, 10);
      if (res.ok) {
          setDiscountProducts(res.data);
      }
  };

  const fetchProducts = async () => {
    setLoading(true);
    
    if (selectedCategoryName) {
        const res = await productController.filter(
            [selectedCategoryName], 
            0,
            20,
            selectedSort.sortBy,
            selectedSort.order
        );
        if (res.ok) setProducts(res.data);
    } else {
        const res = await productController.getList(0, 20, selectedSort.sortBy, selectedSort.order);
        if (res.ok) setProducts(res.data);
    }

    setLoading(false);
    setRefreshing(false);
  };

  const toggleSearchBar = () => {
    if (isSearchActive) {
      Animated.timing(searchWidthAnim, {
        toValue: 0, duration: 300, useNativeDriver: false,
      }).start(() => { setIsSearchActive(false); setKeyword(""); });
    } else {
      setIsSearchActive(true);
      Animated.timing(searchWidthAnim, {
        toValue: width - 100, duration: 300, useNativeDriver: false,
      }).start();
    }
  };

  const handleSearchSubmit = async () => {
    if (!keyword.trim()) return;
    setLoading(true);
    setSelectedCategoryName(null);
    const res = await productController.search(keyword);
    if (res.ok) setProducts(res.data);
    setLoading(false);
  };

  const handleSelectCategory = (categoryName: string) => {
    if (selectedCategoryName === categoryName) {
        setSelectedCategoryName(null);
    } else {
        setSelectedCategoryName(categoryName);
    }
  };

  const applySort = () => {
    setIsFilterVisible(false);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  const renderProductItem = ({ item }: { item: Product }) => (
    <TouchableOpacity 
      activeOpacity={0.9}
      onPress={() => router.push({ pathname: "/product/[id]", params: { id: item.id.toString() } })}
    >
      <View className="bg-white rounded-xl shadow-sm mb-4 overflow-hidden border border-gray-100">
        <Image
          source={{ uri: item.imageUrl || "https://via.placeholder.com/150" }}
          className="w-full h-48 bg-gray-200"
          resizeMode="cover"
        />
        <View className="p-4">
          <Text className="text-lg font-bold text-gray-800 mb-1" numberOfLines={2}>{item.name}</Text>
          <View className="flex-row justify-between items-center">
             <Text className="text-red-600 font-bold text-base">{formatCurrency(item.price)}</Text>
             <Text className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded">
                {item.category?.name} 
             </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderBestSellerItem = ({ item }: { item: Product }) => (
    <TouchableOpacity 
      activeOpacity={0.9}
      onPress={() => router.push({ pathname: "/product/[id]", params: { id: item.id.toString() } })}
      className="mr-4 w-40"
    >
      <View className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <View className="relative">
             <Image
              source={{ uri: item.imageUrl || "https://via.placeholder.com/150" }}
              className="w-full h-32 bg-gray-200"
              resizeMode="cover"
            />
            {/* Badge HOT */}
            <View className="absolute top-2 left-2 bg-red-500 px-2 py-0.5 rounded">
                <Text className="text-white text-[10px] font-bold">HOT</Text>
            </View>
        </View>
        
        <View className="p-3">
          <Text className="text-sm font-bold text-gray-800 mb-1" numberOfLines={1}>{item.name}</Text>
          <Text className="text-red-600 font-bold text-sm">{formatCurrency(item.price)}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderDiscountItem = ({ item }: { item: ProductDiscount }) => (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={() =>
        router.push({
          pathname: "/product/[id]",
          params: { id: item.id.toString() },
        })
      }
      className="m-2"
      style={{ flexBasis: '48%' }}
    >
      <View className="bg-white rounded-xl shadow-sm border border-red-100 overflow-hidden">
        <View className="relative">
          <Image
            source={{ uri: item.imageUrl || "https://via.placeholder.com/150" }}
            className="w-full h-40 bg-gray-200"
            resizeMode="cover"
          />

          <View className="absolute top-0 right-0 bg-red-600 px-2 py-1 rounded-bl-lg">
            <Text className="text-white text-[10px] font-bold">
              Giảm {new Intl.NumberFormat("vi-VN", {
                style: "currency",
                currency: "VND",
              }).format(item.totalDiscountAmount)}
            </Text>
          </View>
        </View>

        <View className="p-3">
          <Text
            className="text-sm font-bold text-gray-800 mb-1"
            numberOfLines={2}
          >
            {item.name}
          </Text>

          <Text className="text-red-600 font-bold text-sm">
            {new Intl.NumberFormat("vi-VN", {
              style: "currency",
              currency: "VND",
            }).format(item.priceAfterDiscount)}
          </Text>

          <Text className="text-gray-400 text-xs line-through mt-0.5">
            {new Intl.NumberFormat("vi-VN", {
              style: "currency",
              currency: "VND",
            }).format(item.price)}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderHeaderContent = () => (
    <View>
      {/* Best seller */}
      {bestSellers.length > 0 && (
          <View className="mb-4 pl-4">
            <View className="flex-row items-center mb-3">
                <Ionicons name="flame" size={20} color="orange" />
                <Text className="text-lg font-bold text-gray-800 ml-1">Bán chạy nhất</Text>
            </View>
            
            <FlatList 
                horizontal
                data={bestSellers}
                renderItem={renderBestSellerItem}
                keyExtractor={(item) => "best_" + item.id.toString()}
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingRight: 20 }}
            />
          </View>
      )}

      {/* Discount products*/}
      {discountProducts.length > 0 && (
          <View className="mb-4 px-2">
            <View className="flex-row items-center mb-3 px-2">
                <Ionicons name="pricetag" size={20} color="#DC2626" />
                <Text className="text-lg font-bold text-gray-800 ml-1">Đang giảm giá</Text>
            </View>
            
            <FlatList 
                scrollEnabled={false}
                numColumns={2}
                data={discountProducts}
                renderItem={renderDiscountItem}
                keyExtractor={(item) => "voucher_" + item.id.toString()}
                contentContainerStyle={{ paddingBottom: 10 }}
                key={'grid_2_cols'} 
            />
          </View>
      )}

      <View className="px-4 mb-3">
        <Text className="text-lg font-bold text-gray-800">Tất cả sản phẩm</Text>
      </View>
    </View>
  );

  return (
    <View className="flex-1 bg-gray-50 pt-4 relative">

      {/* Header Bar */}
      <View className="flex-row items-center justify-between px-4 mb-2 z-20">
        {!isSearchActive ? (
           <TouchableOpacity 
              onPress={() => setIsFilterVisible(true)}
              className="flex-row items-center bg-white px-3 py-2 rounded-full border border-gray-200 shadow-sm"
           >
             <Ionicons name="filter" size={20} color="#374151" />
             <Text className="ml-2 font-medium text-gray-700">Sắp xếp</Text>
           </TouchableOpacity>
        ) : <View />}

        <View className="flex-row items-center justify-end flex-1">
          {isSearchActive && (
            <Animated.View style={{ width: searchWidthAnim, marginRight: 10, overflow: 'hidden' }}>
              <TextInput 
                placeholder="Tìm tên sản phẩm..."
                className="bg-white border border-gray-300 rounded-full px-4 py-2 text-sm"
                autoFocus value={keyword} onChangeText={setKeyword} onSubmitEditing={handleSearchSubmit}
              />
            </Animated.View>
          )}
          <TouchableOpacity onPress={toggleSearchBar}>
            <Ionicons name={isSearchActive ? "close-circle" : "search-circle"} size={32} color="#374151" />
          </TouchableOpacity>
        </View>
      </View>

      {/* CATEGORY LIST */}
      <View className="mb-2 pl-4">
        <FlatList 
            data={categories}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={{ paddingRight: 20, paddingVertical: 5 }}
            renderItem={({ item }) => {
                const isSelected = selectedCategoryName === item.name;
                return (
                    <TouchableOpacity
                        onPress={() => handleSelectCategory(item.name)}
                        className={`mr-2 px-4 py-2 rounded-full border ${
                            isSelected 
                                ? "bg-blue-600 border-blue-600" 
                                : "bg-white border-gray-300"
                        }`}
                    >
                        <Text className={`font-medium ${isSelected ? "text-white" : "text-gray-600"}`}>
                            {item.name}
                        </Text>
                    </TouchableOpacity>
                )
            }}
        />
      </View>

      {/* Overlay for search */}
      {isSearchActive && (
        <TouchableWithoutFeedback onPress={toggleSearchBar}>
          <View className="absolute top-[60px] left-0 right-0 bottom-0 bg-black/50 z-10" />
        </TouchableWithoutFeedback>
      )}

      {/* Product List */}
      <View className="flex-1 z-0"> 
        {loading ? (
           <ActivityIndicator size="large" color="#2563EB" className="mt-10" />
        ) : (
          <FlatList
            ListHeaderComponent={renderHeaderContent()}
            
            data={products}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderProductItem}
            showsVerticalScrollIndicator={false}
            
            contentContainerStyle={{ paddingBottom: 20 }}
            
            refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadInitialData(); }} />
            }
            ListEmptyComponent={
                <Text className="text-center text-gray-500 mt-10">Không tìm thấy sản phẩm nào</Text>
            }
            removeClippedSubviews={true}
            initialNumToRender={6}
            maxToRenderPerBatch={6}
            windowSize={5}
          />
        )}
      </View>

      {/* SORT MODAL */}
      <Modal
        visible={isFilterVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setIsFilterVisible(false)}
      >
        <View className="flex-1 bg-black/50 justify-end">
          <View className="bg-white w-full rounded-t-3xl p-6 pb-10">
            <View className="flex-row justify-between items-center mb-6 border-b border-gray-100 pb-4">
              <Text className="text-xl font-bold text-gray-800">Sắp xếp hiển thị</Text>
              <TouchableOpacity onPress={() => setIsFilterVisible(false)}>
                 <Ionicons name="close-circle" size={30} color="#E5E7EB" />
              </TouchableOpacity>
            </View>

            <View className="flex-row flex-wrap gap-3 mb-6">
                {SORT_OPTIONS.map((option, index) => {
                    const isActive = selectedSort.label === option.label;
                    return (
                        <TouchableOpacity
                            key={index}
                            onPress={() => setSelectedSort(option)}
                            className={`w-full py-3 px-4 rounded-xl border flex-row justify-between items-center ${
                                isActive ? "bg-blue-50 border-blue-600" : "bg-white border-gray-200"
                            }`}
                        >
                            <Text className={`font-medium text-base ${isActive ? "text-blue-700" : "text-gray-700"}`}>
                                {option.label}
                            </Text>
                            {isActive && <Ionicons name="checkmark-circle" size={24} color="#2563EB" />}
                        </TouchableOpacity>
                    )
                })}
            </View>

            <TouchableOpacity 
                className="bg-blue-600 rounded-xl py-4 items-center shadow-lg shadow-blue-200 mt-2"
                onPress={applySort}
            >
                <Text className="text-white font-bold text-lg">Áp dụng</Text>
            </TouchableOpacity>
            
          </View>
        </View>
      </Modal>

    </View>
  );
}