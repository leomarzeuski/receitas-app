// app/index.tsx
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Image,
  TextInput,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { getRecipes, searchRecipes } from "../services/DatabaseService";
import Recipe from "../models/Recipe";
import { router } from "expo-router";

export default function RecipeListScreen() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [filter, setFilter] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [currentCategory, setCurrentCategory] = useState<string | null>(null);

  const categories: string[] = [
    "Todas",
    "Café da Manhã",
    "Almoço",
    "Jantar",
    "Sobremesa",
    "Lanche",
    "Vegetariano",
    "Fitness",
  ];

  useEffect(() => {
    loadRecipes();
  }, [currentCategory]);

  const loadRecipes = async () => {
    setLoading(true);
    try {
      const category = currentCategory !== "Todas" ? currentCategory : null;
      const data = await getRecipes(category);
      setRecipes(data);
    } catch (error: any) {
      console.error("Error loading recipes:", error);
      if (
        !error?.message?.includes("no such table") &&
        !error?.message?.includes("undefined")
      ) {
        alert("Não foi possível carregar as receitas");
      }
    } finally {
      setLoading(false);
    }
  };

  const searchForRecipes = async () => {
    if (!filter.trim()) {
      loadRecipes();
      return;
    }

    setLoading(true);
    try {
      const results = await searchRecipes(filter);
      setRecipes(results);
    } catch (error) {
      console.error("Error searching recipes:", error);
      alert("Não foi possível realizar a busca");
    } finally {
      setLoading(false);
    }
  };

  const openRecipeDetails = (recipeId: number) => {
    router.push(`/recipe/${recipeId}`);
  };

  const renderRecipeItem = ({ item }: { item: Recipe }) => (
    <TouchableOpacity
      style={styles.recipeCard}
      onPress={() => openRecipeDetails(item.id as number)}
    >
      {item.image ? (
        <Image source={{ uri: item.image }} style={styles.recipeImage} />
      ) : (
        <View style={[styles.recipeImage, styles.recipeImagePlaceholder]}>
          <Ionicons name="restaurant-outline" size={40} color="#aaa" />
        </View>
      )}
      <View style={styles.recipeInfo}>
        <Text style={styles.recipeTitle}>{item.title}</Text>
        <View style={styles.recipeMetaInfo}>
          <Text style={styles.recipeCategory}>{item.category}</Text>
          <Text style={styles.recipeTime}>
            <Ionicons name="time-outline" size={14} /> {item.preparationTime}{" "}
            min
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar receitas..."
            value={filter}
            onChangeText={setFilter}
            onSubmitEditing={searchForRecipes}
          />
          <TouchableOpacity
            style={styles.searchButton}
            onPress={searchForRecipes}
          >
            <Ionicons name="search" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.categoriesContainer}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={categories}
          keyExtractor={(item) => item}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.categoryButton,
                currentCategory === item && styles.categoryActive,
              ]}
              onPress={() => setCurrentCategory(item === "Todas" ? null : item)}
            >
              <Text
                style={[
                  styles.categoryText,
                  currentCategory === item && styles.categoryTextActive,
                ]}
              >
                {item}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#ff6b6b" style={styles.loader} />
      ) : (
        <FlatList
          data={recipes}
          keyExtractor={(item) =>
            item.id?.toString() || Math.random().toString()
          }
          renderItem={renderRecipeItem}
          contentContainerStyle={styles.listContainer}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="restaurant-outline" size={80} color="#ddd" />
              <Text style={styles.emptyText}>Nenhuma receita encontrada</Text>
              <Text style={styles.emptySubText}>
                Adicione sua primeira receita clicando no botão abaixo
              </Text>
            </View>
          }
        />
      )}

      <TouchableOpacity
        style={styles.fab}
        onPress={() => router.push("/recipe/add")}
      >
        <Ionicons name="add" size={24} color="#fff" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f8f8",
  },
  header: {
    padding: 15,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  searchInput: {
    flex: 1,
    height: 46,
    backgroundColor: "#f0f0f0",
    borderRadius: 23,
    paddingHorizontal: 15,
    fontSize: 16,
  },
  searchButton: {
    backgroundColor: "#ff6b6b",
    width: 46,
    height: 46,
    borderRadius: 23,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 10,
  },
  categoriesContainer: {
    paddingVertical: 12,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginHorizontal: 6,
    borderRadius: 20,
    backgroundColor: "#f0f0f0",
  },
  categoryActive: {
    backgroundColor: "#ff6b6b",
  },
  categoryText: {
    fontWeight: "500",
    color: "#555",
  },
  categoryTextActive: {
    color: "#fff",
  },
  listContainer: {
    padding: 15,
  },
  recipeCard: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 10,
    overflow: "hidden",
    marginBottom: 15,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  recipeImage: {
    width: 100,
    height: 100,
  },
  recipeImagePlaceholder: {
    backgroundColor: "#f0f0f0",
    justifyContent: "center",
    alignItems: "center",
  },
  recipeInfo: {
    flex: 1,
    padding: 12,
    justifyContent: "space-between",
  },
  recipeTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 6,
  },
  recipeMetaInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  recipeCategory: {
    fontSize: 12,
    color: "#ff6b6b",
    fontWeight: "500",
  },
  recipeTime: {
    fontSize: 12,
    color: "#888",
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 30,
  },
  emptyText: {
    fontSize: 18,
    color: "#888",
    marginTop: 10,
  },
  emptySubText: {
    fontSize: 14,
    color: "#aaa",
    textAlign: "center",
    marginTop: 5,
  },
  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  fab: {
    position: "absolute",
    bottom: 16,
    right: 16,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#ff6b6b",
    justifyContent: "center",
    alignItems: "center",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
});
