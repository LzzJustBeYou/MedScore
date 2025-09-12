import { useColorScheme } from "@/hooks/useColorScheme";
import { DarkTheme, DefaultTheme, ThemeProvider } from "@react-navigation/native";
import { Stack } from "expo-router";

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <Stack
        screenOptions={{
          headerBackTitle: "返回", // 默认返回按钮文字
          gestureEnabled: true, // 启用手势返回
          gestureDirection: 'horizontal', // 水平手势方向
        }}
        initialRouteName="(tabs)"
      >
        <Stack.Screen
          name="(tabs)"
          options={{
            headerShown: false,
            gestureEnabled: false, // 禁用手势返回
          }}
        />
        <Stack.Screen
          name="index"
          options={{
            title: "临床监护评分系统",
            headerBackVisible: false,
          }}
        />
        <Stack.Screen
          name="score/score-types"
          options={{ title: "选择评分系统" }}
        />
        <Stack.Screen
          name="score/patient-info"
          options={{ title: "患者信息" }}
        />
        <Stack.Screen
          name="score/score-form"
          options={{ title: "填写评分表单" }}
        />
        <Stack.Screen
          name="score/score-result"
          options={{ title: "评分结果" }}
        />
        <Stack.Screen
          name="records/patient-records"
          options={{ title: "患者历史记录" }}
        />
        <Stack.Screen
          name="records/record-detail"
          options={{ title: "记录详情" }}
        />
        <Stack.Screen name="+not-found" />
      </Stack>
    </ThemeProvider>
  );
}
