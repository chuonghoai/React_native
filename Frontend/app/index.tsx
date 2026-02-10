import { homeController } from "@/src/controllers/home.controller"; // Import Controller
import { authStore } from "@/src/stores/auth.store";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";

export default function Index() {
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    (async () => {
      try {
        await authStore.hydrate();
        const token = authStore.getToken();
        
        if (token) {
          const res = await homeController.loadMe();
          
          if (res.ok) {
            router.replace("/(tabs)/home");
          } else {
            await authStore.clear();
            router.replace("/(auth)/login");
          }
        } else {
          router.replace("/(auth)/login");
        }
      } catch (e) {
        router.replace("/(auth)/login");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <View className="flex-1 items-center justify-center bg-white">
      <ActivityIndicator size="large" color="#2563EB" />
    </View>
  );
}