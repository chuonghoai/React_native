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
        console.log("TOKEN:", authStore.getToken());
        if (authStore.isLoggedIn()) {
          router.replace("/(tabs)/home");
        } else {
          router.replace("/(auth)/login");
        }
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <View className="flex-1 items-center justify-center bg-white">
      <ActivityIndicator size="large" />
    </View>
  );
}
