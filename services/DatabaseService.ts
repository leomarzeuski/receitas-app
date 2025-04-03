import * as SQLite from "expo-sqlite";
import Recipe from "../models/Recipe";

const db = SQLite.openDatabaseSync("receitas.db");

export const initDatabase = async (): Promise<void> => {
  try {
    await db.execAsync(`
          CREATE TABLE IF NOT EXISTS recipes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        ingredients TEXT NOT NULL,
        instructions TEXT NOT NULL,
        preparationTime INTEGER,
        servings INTEGER,
        category TEXT,
        image TEXT,
        createdAt TEXT
      )
    `);
  } catch (error) {
    console.error("Erro ao inicializar o banco de dados:", error);
    throw error;
  }
};

export const saveRecipe = async (recipe: Recipe): Promise<number> => {
  try {
    const result = await db.runAsync(
      `INSERT INTO recipes (
        title, ingredients, instructions, preparationTime, 
        servings, category, image, createdAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        recipe.title,
        Array.isArray(recipe.ingredients)
          ? JSON.stringify(recipe.ingredients)
          : recipe.ingredients,
        recipe.instructions,
        recipe.preparationTime,
        recipe.servings,
        recipe.category,
        recipe.image,
        recipe.createdAt.toISOString(),
      ]
    );

    return result.lastInsertRowId;
  } catch (error) {
    console.error("Erro ao salvar receita:", error);
    throw error;
  }
};

export const updateRecipe = async (recipe: Recipe): Promise<boolean> => {
  try {
    const result = await db.runAsync(
      `UPDATE recipes SET 
          title = ?, ingredients = ?, instructions = ?, 
          preparationTime = ?, servings = ?, category = ?, 
          image = ? WHERE id = ?`,
      [
        recipe.title,
        Array.isArray(recipe.ingredients)
          ? JSON.stringify(recipe.ingredients)
          : recipe.ingredients,
        recipe.instructions,
        recipe.preparationTime,
        recipe.servings,
        recipe.category,
        recipe.image,
        recipe.id,
      ]
    );

    return result.changes > 0;
  } catch (error) {
    console.error("Erro ao atualizar receita:", error);
    throw error;
  }
};

export const deleteRecipe = async (id: number): Promise<boolean> => {
  try {
    const result = await db.runAsync("DELETE FROM recipes WHERE id = ?", [id]);

    return result.changes > 0;
  } catch (error) {
    console.error("Erro ao excluir receita:", error);
    throw error;
  }
};

interface RecipeDB {
  id: number;
  title: string;
  ingredients: string;
  instructions: string;
  preparationTime: number;
  servings: number;
  category: string;
  image: string | null;
  createdAt: string;
}

export const getRecipes = async (
  category: string | null = null
): Promise<Recipe[]> => {
  try {
    let sql = "SELECT * FROM recipes";
    const params: any[] = [];

    if (category) {
      sql += " WHERE category = ?";
      params.push(category);
    }

    sql += " ORDER BY createdAt DESC";

    const result = await db.getAllAsync<RecipeDB>(sql, params);

    return result.map((row) => {
      const recipe = new Recipe(
        row.id,
        row.title,
        JSON.parse(row.ingredients),
        row.instructions,
        row.preparationTime,
        row.servings,
        row.category,
        row.image
      );
      recipe.createdAt = new Date(row.createdAt);
      return recipe;
    });
  } catch (error) {
    console.error("Erro ao obter receitas:", error);
    throw error;
  }
};

export const getRecipeById = async (id: number): Promise<Recipe | null> => {
  try {
    const row = await db.getFirstAsync<RecipeDB>(
      "SELECT * FROM recipes WHERE id = ?",
      [id]
    );

    if (row) {
      const recipe = new Recipe(
        row.id,
        row.title,
        JSON.parse(row.ingredients),
        row.instructions,
        row.preparationTime,
        row.servings,
        row.category,
        row.image
      );
      recipe.createdAt = new Date(row.createdAt);
      return recipe;
    }

    return null;
  } catch (error) {
    console.error("Erro ao obter receita por ID:", error);
    throw error;
  }
};

export const searchRecipes = async (term: string): Promise<Recipe[]> => {
  try {
    const result = await db.getAllAsync<RecipeDB>(
      `SELECT * FROM recipes 
         WHERE title LIKE ? 
         OR ingredients LIKE ? 
         OR category LIKE ?
         ORDER BY createdAt DESC`,
      [`%${term}%`, `%${term}%`, `%${term}%`]
    );

    return result.map((row) => {
      const recipe = new Recipe(
        row.id,
        row.title,
        JSON.parse(row.ingredients),
        row.instructions,
        row.preparationTime,
        row.servings,
        row.category,
        row.image
      );
      recipe.createdAt = new Date(row.createdAt);
      return recipe;
    });
  } catch (error) {
    console.error("Erro ao buscar receitas:", error);
    throw error;
  }
};
