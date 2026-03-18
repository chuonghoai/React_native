import { homeController } from "@/src/controllers/home.controller"; // Import Controller
import { websocketService } from "@/src/services/websocket";
import { authStore } from "@/src/stores/auth.store";
import { router } from "expo-router";
import { useEffect } from "react";
import { ActivityIndicator, View } from "react-native";

export default function Index() {
  useEffect(() => {
    (async () => {
      try {
        await authStore.hydrate();
        const token = authStore.getToken();
        
        if (token) {
          const res = await homeController.loadMe();
          
          if (res.ok) {
            websocketService.connect(token);
            router.replace("/(tabs)/home");
          } else {
            websocketService.disconnect();
            await authStore.clear();
            router.replace("/(auth)/login");
          }
        } else {
          websocketService.disconnect();
          router.replace("/(auth)/login");
        }
      } catch {
        websocketService.disconnect();
        router.replace("/(auth)/login");
      }
    })();
  }, []);

  return (
    <View className="flex-1 items-center justify-center bg-white">
      <ActivityIndicator size="large" color="#2563EB" />
    </View>
  );
}
