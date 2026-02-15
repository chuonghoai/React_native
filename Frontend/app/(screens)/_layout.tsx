import { Stack } from "expo-router";
import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function ScreensLayout() {
  const insets = useSafeAreaInsets();
  
  return (
    <View style={{ flex: 1, paddingBottom: insets.bottom, backgroundColor: "white" }}>
      <Stack 
        screenOptions={{ 
          headerShown: false,
          animation: "slide_from_right"
        }} 
      />
    </View>
  );
}