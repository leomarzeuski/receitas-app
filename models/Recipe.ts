// models/Recipe.ts
export default class Recipe {
  id: number | null;
  title: string;
  ingredients: string[];
  instructions: string;
  preparationTime: number;
  servings: number;
  category: string;
  image: string | null;
  createdAt: Date;

  constructor(
    id: number | null, 
    title: string, 
    ingredients: string[], 
    instructions: string, 
    preparationTime: number, 
    servings: number, 
    category: string, 
    image: string | null = null
  ) {
    this.id = id;
    this.title = title;
    this.ingredients = ingredients;
    this.instructions = instructions;
    this.preparationTime = preparationTime;
    this.servings = servings;
    this.category = category;
    this.image = image;
    this.createdAt = new Date();
  }
}