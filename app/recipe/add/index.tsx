import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { Picker } from "@react-native-picker/picker";
import {
  saveRecipe,
  getRecipeById,
  updateRecipe,
} from "../../../services/DatabaseService";
import Recipe from "../../../models/Recipe";
import { useLocalSearchParams, router } from "expo-router";

export default function RecipeFormScreen() {
  const params = useLocalSearchParams();
  const recipeId = params.id ? Number(params.id) : null;
  const isEditing = !!recipeId;

  const [title, setTitle] = useState<string>("");
  const [ingredients, setIngredients] = useState<string[]>([""]);
  const [instructions, setInstructions] = useState<string>("");
  const [preparationTime, setPreparationTime] = useState<string>("");
  const [servings, setServings] = useState<string>("");
  const [category, setCategory] = useState<string>("Almoço");
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);

  const categories: string[] = [
    "Café da Manhã",
    "Almoço",
    "Jantar",
    "Sobremesa",
    "Lanche",
    "Vegetariano",
    "Fitness",
  ];

  useEffect(() => {
    if (isEditing && recipeId) {
      loadRecipe();
    }
  }, []);

  const loadRecipe = async () => {
    if (!recipeId) return;

    setLoading(true);
    try {
      const recipe = await getRecipeById(recipeId);
      if (recipe) {
        setTitle(recipe.title);
        setIngredients(recipe.ingredients);
        setInstructions(recipe.instructions);
        setPreparationTime(recipe.preparationTime.toString());
        setServings(recipe.servings.toString());
        setCategory(recipe.category);
        setImage(recipe.image);
      }
    } catch (error) {
      console.error("Error loading recipe for editing:", error);
      Alert.alert("Erro", "Não foi possível carregar os dados da receita.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    (async () => {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permissão necessária",
          "Precisamos de permissão para acessar suas fotos."
        );
      }
    })();
  }, []);

  const selectImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [16, 9],
        quality: 0.8,
      });

      if (!result.canceled) {
        setImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error("Error selecting image:", error);
      Alert.alert("Erro", "Não foi possível selecionar a imagem.");
    }
  };

  const addIngredient = () => {
    setIngredients([...ingredients, ""]);
  };

  const removeIngredient = (index: number) => {
    if (ingredients.length > 1) {
      const newIngredients = [...ingredients];
      newIngredients.splice(index, 1);
      setIngredients(newIngredients);
    }
  };

  const updateIngredient = (text: string, index: number) => {
    const newIngredients = [...ingredients];
    newIngredients[index] = text;
    setIngredients(newIngredients);
  };

  const validateForm = (): boolean => {
    if (!title.trim()) {
      Alert.alert("Erro", "Por favor, informe o título da receita.");
      return false;
    }

    if (ingredients.filter((i) => i.trim()).length === 0) {
      Alert.alert("Erro", "Por favor, adicione pelo menos um ingrediente.");
      return false;
    }

    if (!instructions.trim()) {
      Alert.alert("Erro", "Por favor, descreva o modo de preparo.");
      return false;
    }

    if (
      !preparationTime ||
      isNaN(Number(preparationTime)) ||
      Number(preparationTime) <= 0
    ) {
      Alert.alert("Erro", "Por favor, informe um tempo de preparo válido.");
      return false;
    }

    if (!servings || isNaN(Number(servings)) || Number(servings) <= 0) {
      Alert.alert("Erro", "Por favor, informe um número válido de porções.");
      return false;
    }

    return true;
  };

  const saveOrUpdateRecipe = async () => {
    if (!validateForm()) return;

    setSaving(true);
    try {
      const filteredIngredients = ingredients.filter((i) => i.trim());

      const recipeData = new Recipe(
        isEditing ? recipeId : null,
        title,
        filteredIngredients,
        instructions,
        Number(preparationTime),
        Number(servings),
        category,
        image
      );

      if (isEditing && recipeId) {
        await updateRecipe(recipeData);
        Alert.alert("Sucesso", "Receita atualizada com sucesso!");
      } else {
        await saveRecipe(recipeData);
        Alert.alert("Sucesso", "Receita adicionada com sucesso!");
      }

      router.back();
    } catch (error) {
      console.error("Error saving recipe:", error);
      Alert.alert("Erro", "Não foi possível salvar a receita.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#ff6b6b" />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={100}
    >
      <ScrollView>
        <TouchableOpacity style={styles.imageContainer} onPress={selectImage}>
          {image ? (
            <Image source={{ uri: image }} style={styles.image} />
          ) : (
            <View style={styles.imagePlaceholder}>
              <Ionicons name="camera-outline" size={40} color="#aaa" />
              <Text style={styles.imagePlaceholderText}>Adicionar foto</Text>
            </View>
          )}
        </TouchableOpacity>

        <View style={styles.form}>
          <View style={styles.field}>
            <Text style={styles.label}>Título *</Text>
            <TextInput
              style={styles.input}
              value={title}
              onChangeText={setTitle}
              placeholder="Ex: Lasanha de Berinjela"
              maxLength={100}
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Categoria *</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={category}
                onValueChange={(value) => setCategory(value)}
                style={styles.picker}
              >
                {categories.map((cat) => (
                  <Picker.Item key={cat} label={cat} value={cat} />
                ))}
              </Picker>
            </View>
          </View>

          <View style={styles.fieldRow}>
            <View style={[styles.field, { flex: 1, marginRight: 10 }]}>
              <Text style={styles.label}>Tempo (min) *</Text>
              <TextInput
                style={styles.input}
                value={preparationTime}
                onChangeText={setPreparationTime}
                placeholder="Ex: 45"
                keyboardType="number-pad"
                maxLength={3}
              />
            </View>

            <View style={[styles.field, { flex: 1 }]}>
              <Text style={styles.label}>Porções *</Text>
              <TextInput
                style={styles.input}
                value={servings}
                onChangeText={setServings}
                placeholder="Ex: 4"
                keyboardType="number-pad"
                maxLength={2}
              />
            </View>
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Ingredientes *</Text>
            {ingredients.map((ingredient, index) => (
              <View key={index} style={styles.ingredientRow}>
                <TextInput
                  style={[styles.input, { flex: 1 }]}
                  value={ingredient}
                  onChangeText={(text) => updateIngredient(text, index)}
                  placeholder={`Ingrediente ${index + 1}`}
                />
                <TouchableOpacity
                  style={styles.removeButton}
                  onPress={() => removeIngredient(index)}
                  disabled={ingredients.length === 1}
                >
                  <Ionicons
                    name="trash-outline"
                    size={22}
                    color={ingredients.length === 1 ? "#ccc" : "#ff6b6b"}
                  />
                </TouchableOpacity>
              </View>
            ))}
            <TouchableOpacity style={styles.addButton} onPress={addIngredient}>
              <Ionicons name="add-circle-outline" size={22} color="#ff6b6b" />
              <Text style={styles.addButtonText}>Adicionar ingrediente</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Modo de Preparo *</Text>
            <TextInput
              style={[styles.input, styles.multilineText]}
              value={instructions}
              onChangeText={setInstructions}
              placeholder="Descreva o passo a passo da receita"
              multiline
              textAlignVertical="top"
              numberOfLines={8}
            />
          </View>

          <View style={styles.buttonsContainer}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={() => router.back()}
              disabled={saving}
            >
              <Text style={styles.buttonText}>Cancelar</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.saveButton]}
              onPress={saveOrUpdateRecipe}
              disabled={saving}
            >
              {saving ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.buttonText}>Salvar</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f8f8",
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  imageContainer: {
    width: "100%",
    height: 200,
    backgroundColor: "#fff",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  imagePlaceholder: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f0f0f0",
  },
  imagePlaceholderText: {
    marginTop: 10,
    color: "#aaa",
    fontSize: 16,
  },
  form: {
    padding: 15,
  },
  field: {
    marginBottom: 20,
  },
  fieldRow: {
    flexDirection: "row",
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 5,
    color: "#333",
  },
  input: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 5,
    padding: 12,
    fontSize: 16,
  },
  multilineText: {
    minHeight: 150,
    paddingTop: 12,
  },
  pickerContainer: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 5,
    overflow: "hidden",
  },
  picker: {
    height: 50,
  },
  ingredientRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  removeButton: {
    padding: 8,
    marginLeft: 8,
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 8,
  },
  addButtonText: {
    color: "#ff6b6b",
    marginLeft: 5,
    fontWeight: "500",
  },
  buttonsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  button: {
    flex: 1,
    padding: 15,
    borderRadius: 5,
    alignItems: "center",
    justifyContent: "center",
  },
  cancelButton: {
    backgroundColor: "#ccc",
    marginRight: 10,
  },
  saveButton: {
    backgroundColor: "#ff6b6b",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
});
