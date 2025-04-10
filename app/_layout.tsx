import { Stack } from "expo-router";
import { StatusBar } from "react-native";
import { useEffect } from "react";
import { initDatabase } from "../services/DatabaseService";

export default function AppLayout() {
  useEffect(() => {
    const initDB = async () => {
      try {
        await initDatabase();
        console.log("Database initialized successfully");
      } catch (error) {
        console.error("Error initializing database:", error);
      }
    };

    initDB();
  }, []);

  return (
    <>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <Stack
        screenOptions={{
          headerStyle: {
            backgroundColor: "#ff6b6b",
          },
          headerTintColor: "#fff",
          headerTitleStyle: {
            fontWeight: "bold",
          },
        }}
      >
        <Stack.Screen name="index" options={{ title: "Minhas Receitas" }} />
        <Stack.Screen
          name="recipe/[id]/index"
          options={{ title: "Detalhes da Receita" }}
        />
        <Stack.Screen
          name="recipe/add/index"
          options={{ title: "Nova Receita" }}
        />
        <Stack.Screen
          name="recipe/edit/[id]/index"
          options={{ title: "Editar Receita" }}
        />
      </Stack>
    </>
  );
}
