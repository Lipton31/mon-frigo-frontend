import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import {
  Camera, Utensils, Sun, Heart, Settings, Flame, Eye, Info, X, ChevronDown, CheckCircle,
  BookOpenText, CalendarOff, Clipboard, Loader2, Lightbulb, Salad, Apple, FlaskConical,
  ChefHat, Search, Eraser, PlusCircle, Package, Clock, TrendingUp, TrendingDown, History,
  Sparkles, User, Plus // Nouvelle icône pour le bouton central
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion'; // Import de Framer Motion

// Firebase Imports
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, doc, getDoc, setDoc, updateDoc, deleteDoc, onSnapshot, collection, query, addDoc, getDocs } from 'firebase/firestore';

// Global variables provided by the Canvas environment (keep for local testing in Canvas)
// These variables are MANDATORY for Firebase integration in Canvas.
const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
const initialAuthToken = typeof __initial_auth_token !== 'undefined' ? __initial_auth_token : null;

// Firebase configuration.
// This will now ONLY use __firebase_config provided by the Canvas environment.
let parsedFirebaseConfig = {};
if (typeof __firebase_config !== 'undefined') {
  try {
    parsedFirebaseConfig = JSON.parse(__firebase_config);
  } catch (e) {
    console.error("Failed to parse __firebase_config:", e);
  }
}

const firebaseConfig = {
  apiKey: parsedFirebaseConfig.apiKey,
  authDomain: parsedFirebaseConfig.authDomain,
  projectId: parsedFirebaseConfig.projectId,
  storageBucket: parsedFirebaseConfig.storageBucket,
  messagingSenderId: parsedFirebaseConfig.messagingSenderId,
  appId: parsedFirebaseConfig.appId,
  measurementId: parsedFirebaseConfig.measurementId,
};

// Initialize Firebase outside of the component to avoid re-initialization
let app;
let db;
let auth;

try {
  // Check if Firebase config is actually provided
  const isFirebaseConfigProvided = Object.values(firebaseConfig).some(value => value !== undefined && value !== null);

  if (isFirebaseConfigProvided && firebaseConfig.apiKey) { // Ensure apiKey is also present
    app = initializeApp(firebaseConfig);
    db = getFirestore(app);
    auth = getAuth(app);
  } else {
    console.warn("Firebase configuration is missing or incomplete. Firebase will not be initialized. Some features may be limited.");
  }
} catch (e) {
  console.error("Failed to initialize Firebase:", e);
}


// --- Custom CSS Animations and Glassmorphism ---
const customStyles = `
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes popIn {
  from { opacity: 0; transform: scale(0.8); }
  to { opacity: 1; transform: scale(1); }
}

@keyframes pulseGlow {
  0% { box-shadow: 0 0 0 0px rgba(99, 102, 241, 0.7); }
  70% { box-shadow: 0 0 0 10px rgba(99, 102, 241, 0); }
  100% { box-shadow: 0 0 0 0px rgba(99, 102, 241, 0); }
}

@keyframes shimmer {
  0% { background-position: -468px 0; }
  100% { background-position: 468px 0; }
}

@keyframes float {
  0% { transform: translateY(0px); }
  50% { transform: translateY(-8px); }
  100% { transform: translateY(0px); }
}

.animate-fadeIn { animation: fadeIn 0.5s ease-out forwards; }
.animate-fadeInUp { animation: fadeInUp 0.5s ease-out forwards; }
.animate-popIn { animation: popIn 0.3s cubic-bezier(0.68, -0.55, 0.27, 1.55) forwards; }
.animate-pulse-glow { animation: pulseGlow 1.5s infinite; }
.animate-shimmer {
  background: linear-gradient(to right, #f6f7f8 0%, #edeef0 20%, #f6f7f8 40%);
  background-size: 1000px 100%;
  animation: shimmer 1.5s infinite linear;
}
.dark .animate-shimmer {
  background: linear-gradient(to right, #374151 0%, #4b5563 20%, #374151 40%);
  background-size: 1000px 100%;
}
.animate-float { animation: float 3s ease-in-out infinite; }

/* Glassmorphism effect */
.glassmorphism {
  background: rgba(255, 255, 255, 0.3); /* Light background with transparency */
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px); /* Safari support */
  border: 1px solid rgba(255, 255, 255, 0.5);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}
.dark .glassmorphism {
  background: rgba(0, 0, 0, 0.2); /* Darker background with transparency */
  border: 1px solid rgba(255, 255, 255, 0.1);
}

/* Custom scrollbar for better aesthetics */
::-webkit-scrollbar {
  width: 8px;
}
::-webkit-scrollbar-track {
  background: transparent;
}
::-webkit-scrollbar-thumb {
  background: #cbd5e1; /* soft gray */
  border-radius: 4px;
}
.dark::-webkit-scrollbar-thumb {
  background: #4b5563; /* dark gray */
}
`;


// --- Translation Management ---
const translations = {
  fr: {
    appTitle: "Mon Frigo Malin 🥦🥕",
    uploadSectionTitle: "Ajouter une photo de votre frigo",
    analyzeButton: "Analyser mon frigo avec l'IA",
    analyzing: "Analyse en cours...",
    errorImageRead: "Erreur lors de la lecture du fichier.",
    errorNoImage: "Veuillez d'abord sélectionner une image de votre frigo.",
    ingredientsDetected: "Ingrédients détectés :",
    placeholderIngredients: "Nom de l'ingrédient",
    addIngredient: "Ajouter",
    addExpiryDate: "Date de péremption (JJ/MM/AAAA)",
    addQuantity: "Quantité",
    addUnit: "Unité",
    generateRecipeButton: "Générer une recette",
    generatingRecipe: "Génération de recette...",
    errorDetectIngredients: "Impossible de détecter les ingrédients. Veuillez réessayer.",
    errorGenerateRecipe: "Impossible de générer la recette. Veuillez réessayer.",
    errorRecipeGeneration: "Erreur lors de la génération de la recette : ",
    errorImageAnalysis: "Erreur lors de l'analyse de l'image : ",
    recipeTitle: "Votre Recette Malin !",
    magicHappening: "La magie opère... Recette en cours de création !",
    newAnalysis: "Nouvelle analyse",
    addToFavorites: "Ajouter aux Favoris",
    removeFromFavorites: "Retirer des Favoris",
    favorites: "Mes Favoris",
    noFavorites: "Vous n'avez pas encore de recettes favorites. Commencez à en générer !",
    recipeOfTheDay: "Recette du Jour",
    generatingDailyRecipe: "Génération de la recette du jour...",
    noDailyRecipe: "Aucune recette du jour disponible pour l'instant. Revenez demain ou générez la vôtre !",
    settings: "Paramètres",
    languageSelection: "Sélection de la langue :",
    languageFrench: "Français",
    languageEnglish: "Anglais",
    languageGerman: "Allemand",
    languageSpanish: "Espagnol",
    languageItalian: "Italien",
    detectedSuccess: "Ingrédients détectés avec succès !",
    confirmDelete: "Confirmer la suppression",
    confirmDeleteRecipe: "Voulez-vous vraiment supprimer cette recette de vos favoris ?",
    cancel: "Annuler",
    delete: "Supprimer",
    ok: "OK",
    recipeDeleted: "Recette supprimée de vos favoris.",
    noIngredientsForRecipe: "Veuillez d'abord détecter des ingrédients ou les saisir manuellement.",
    adaptRecipe: "✨ Adapter la recette",
    substituteIngredient: "✨ Substituer un ingrédient",
    enterAdaptRequest: "Ex: 'rendre végétarien', 'moins de sucre', 'plus rapide'",
    enterIngredientToSubstitute: "Ingrédient à substituer (ex: 'poulet')",
    enterSubstituteWith: "Substituer avec (facultatif, ex: 'tofu')",
    adapt: "Adapter",
    substitute: "Substituer",
    adaptingRecipe: "Adaptation de la recette...",
    substitutingIngredient: "Substitution en cours...",
    errorAdaptRecipe: "Erreur lors de l'adaptation de la recette : ",
    errorSubstituteIngredient: "Erreur lors de la substitution de l'ingrédient : ",
    noRecipeToAdapt: "Veuillez d'abord générer une recette à adapter.",
    noRecipeToSubstitute: "Veuillez d'abord générer une recette pour la substitution.",
    scaleRecipe: "✨ Adapter la quantité",
    enterServings: "Nombre de portions (ex: 2, 6)",
    scale: "Adapter",
    scalingRecipe: "Adaptation de la quantité...",
    askCookingTip: "✨ Demander un conseil de cuisine",
    enterCookingQuestion: "Votre question (ex: 'Comment bien dorer les oignons ?')",
    ask: "Demander",
    gettingTip: "Obtention du conseil...",
    noRecipeForTip: "Veuillez d'abord générer une recette pour obtenir un conseil.",
    cookingTip: "Conseil de cuisine :",
    mealPrepGuide: "✨ Guide de préparation de repas",
    generatingMealPrepGuide: "Génération du guide...",
    noRecipeForMealPrep: "Veuillez d'abord générer une recette pour le guide de préparation.",
    foodPairingSuggestions: "✨ Suggestions d'accords culinaires",
    enterFoodForPairing: "Ingrédient (ex: 'tomate')",
    gettingFoodPairings: "Obtention des suggestions...",
    noFoodForPairing: "Veuillez entrer un ingrédient pour des suggestions d'accords.",
    foodPairingResultTitle: "Suggestions d'accords pour",
    getIngredientInfo: "✨ Obtenir des infos sur un ingrédient",
    enterIngredientName: "Nom de l'ingrédient (ex: 'brocoli')",
    gettingIngredientInfo: "Obtention des infos...",
    ingredientInfo: "Informations sur l'ingrédient",
    noIngredientForInfo: "Veuillez entrer un ingrédient pour obtenir des informations.",
    optimizeRecipeHealth: "✨ Optimiser la santé de la recette",
    enterHealthGoals: "Ex: 'moins de gras', 'plus de fibres', 'végétarien'",
    optimize: "Optimiser",
    optimizingRecipe: "Optimisation de la recette...",
    errorOptimizeRecipe: "Erreur lors de l'optimisation de la recette : ",
    noRecipeToOptimize: "Veuillez d'abord générer une recette à optimiser.",
    clearAllData: "Effacer toutes les données",
    confirmClearAllData: "Voulez-vous vraiment effacer toutes les données de l'application (recettes, favoris, etc.) ? Cette action est irréversible.",
    dataCleared: "Toutes les données ont été effacées.",
    myCookingStreak: "Mon défi cuisine",
    uploadMealPhotoButton: "J'ai cuisiné ce plat !",
    uploadingMealPhoto: "Téléchargement en cours...",
    streakIncreased: "Super ! Votre série de cuisine a augmenté à {streak} jours !",
    streakReset: "Dommage ! Votre série a été réinitialisée à 1 jour.",
    alreadyLoggedToday: "Vous avez déjà enregistré un plat aujourd'hui.",
    darkModeOn: "Activé",
    darkModeOff: "Désactivé",
    viewRecipe: "Voir la recette",
    favoriteRecipeTitle: "Recette favorite",
    dietaryPreferences: "Préférences alimentaires :",
    dietaryNone: "Défaut",
    dietaryVegetarian: "Végétarien",
    dietaryVegan: "Végétalien",
    dietaryGlutenFree: "Sans Gluten",
    dietaryHalal: "Halal",
    dietaryKosher: "Casher",
    copyToClipboard: "Copier la recette",
    copied: "Copié !",
    unitNone: "Aucune",
    unitUnits: "unités",
    unitGrams: "grammes",
    unitKilograms: "kilogrammes",
    unitMilliliters: "millilitres",
    unitLiters: "litres",
    unitCups: "tasses",
    unitSpoons: "cuillères",
    cuisineType: "Type de cuisine :",
    cuisineNone: "Aucun",
    cuisineFrench: "Française",
    cuisineItalian: "Italienne",
    cuisineAsian: "Asiatique",
    cuisineMexican: "Mexicaine",
    cuisineIndian: "Indienne",
    cuisineMediterranean: "Méditerranéenne",
    cuisineAmerican: "Américaine",
    cuisineOther: "Autre",
    prepTime: "Temps de préparation :",
    timeNone: "Aucun",
    timeQuick: "Moins de 30 min",
    timeMedium: "30-60 min",
    timeLong: "Plus de 60 min",
    difficulty: "Difficulté :",
    difficultyNone: "Aucune",
    difficultyEasy: "Facile",
    difficultyMedium: "Moyenne",
    difficultyHard: "Difficile",
    dishType: "Type de plat :",
    dishTypeNone: "Aucun",
    dishTypeMain: "Plat principal",
    dishTypeDessert: "Dessert",
    dishTypeAppetizer: "Entrée",
    dishTypeSide: "Accompagnement",
    dishTypeBreakfast: "Petit-déjeuner",
    dishTypeSoup: "Soupe",
    dishTypeSalad: "Salade",
    dishTypeDrink: "Boisson",
    optimizingImage: "Optimisation de l'image...",
    history: "Mon Historique",
    noHistory: "Aucune recette n'a encore été générée. Commencez par en créer une !",
    searchRecipes: "Rechercher des recettes...",
    filterByCuisine: "Filtrer par cuisine :",
    filterByTime: "Filtrer par temps :",
    filterByDifficulty: "Filtrer par difficulté :",
    filterByDietary: "Filtrer par préférence :",
    filterByDishType: "Filtrer par type de plat :",
    clearFilters: "Effacer les filtres",
    onboardingTitle: "Bienvenue sur Mon Frigo Malin !",
    onboardingStep1Title: "1. Analysez votre frigo",
    onboardingStep1Desc: "Prenez une photo de l'intérieur de votre frigo. Notre IA détectera les ingrédients disponibles.",
    onboardingStep2Title: "2. Générez des recettes",
    onboardingStep2Desc: "À partir de vos ingrédients, nous vous proposerons des recettes créatives et personnalisées.",
    onboardingStep3Title: "3. Explorez et adaptez",
    onboardingStep3Desc: "Sauvegardez vos recettes favorites, consultez votre historique et adaptez les recettes avec nos outils IA avancés.",
    onboardingButton: "C'est parti !",
    errorGeneric: "Une erreur inattendue est survenue. Veuillez vérifier votre connexion internet ou réessayer plus tard. Si le problème persiste, contactez le support.",
    analyzingImage: "Analyse de l'image...",
    detectingIngredients: "Détection des ingrédients...",
    generatingRecipeDetailed: "Génération de la recette (cela peut prendre quelques instants)...",
    adaptingRecipeDetailed: "Adaptation de la recette...",
    substitutingIngredientDetailed: "Substitution de l'ingrédient...",
    scalingRecipeDetailed: "Adaptation des quantités...",
    gettingTipDetailed: "Obtention du conseil de cuisine...",
    generatingMealPrepGuideDetailed: "Génération du guide de préparation...",
    gettingFoodPairingsDetailed: "Obtention des suggestions d'accords...",
    gettingIngredientInfoDetailed: "Obtention des informations sur l'ingrédient...",
    optimizingRecipeDetailed: "Optimisation de la recette pour la santé...",
    uploadingMealPhotoDetailed: "Téléchargement de la photo du plat...",
    userIdDisplay: "Votre ID utilisateur : ",
    firebaseNotInitialized: "Firebase n'est pas initialisé. Certaines fonctionnalités peuvent être limitées.",
    addRecipeTitle: "Ajouter une nouvelle recette",
    recipeName: "Nom de la recette",
    recipeIngredients: "Ingrédients (un par ligne)",
    recipeInstructions: "Instructions",
    addRecipe: "Ajouter la recette",
    recipeAddedSuccess: "Recette ajoutée avec succès !",
  },
  en: {
    appTitle: "My Smart Fridge 🥦🥕",
    uploadSectionTitle: "Add a photo of your fridge",
    analyzeButton: "Analyze my fridge with AI",
    analyzing: "Analyzing...",
    errorImageRead: "Error reading file.",
    errorNoImage: "Please select a fridge image first.",
    ingredientsDetected: "Detected Ingredients:",
    placeholderIngredients: "Ingredient name",
    addIngredient: "Add",
    addExpiryDate: "Expiry Date (MM/DD/YYYY)",
    addQuantity: "Quantity",
    addUnit: "Unit",
    generateRecipeButton: "Generate Recipe",
    generatingRecipe: "Generating recipe...",
    errorDetectIngredients: "Could not detect ingredients. Please try again.",
    errorGenerateRecipe: "Could not generate recipe. Please try again.",
    errorRecipeGeneration: "Error generating recipe: ",
    errorImageAnalysis: "Error analyzing image: ",
    recipeTitle: "Your Smart Recipe!",
    magicHappening: "Magic in progress... Recipe being created!",
    newAnalysis: "New analysis",
    addToFavorites: "Add to Favorites",
    removeFromFavorites: "Remove From Favorites",
    favorites: "My Favorites",
    noFavorites: "You don't have any favorite recipes yet. Start generating some!",
    recipeOfTheDay: "Recipe of the Day",
    generatingDailyRecipe: "Generating daily recipe...",
    noDailyRecipe: "No daily recipe available yet. Check back tomorrow or generate your own!",
    settings: "Settings",
    languageSelection: "Language selection:",
    languageFrench: "French",
    languageEnglish: "English",
    languageGerman: "German",
    languageSpanish: "Spanish",
    languageItalian: "Italiano",
    detectedSuccess: "Ingredients detected successfully!",
    confirmDelete: "Confirm Deletion",
    confirmDeleteRecipe: "Are you sure you want to delete this recipe from your favorites?",
    cancel: "Cancel",
    delete: "Delete",
    ok: "OK",
    recipeDeleted: "Recipe deleted from your favorites.",
    noIngredientsForRecipe: "Please detect ingredients first or enter them manually.",
    adaptRecipe: "✨ Adapt Recipe",
    substituteIngredient: "✨ Substitute Ingredient",
    enterAdaptRequest: "Ex: 'make vegetarian', 'less sugar', 'quicker'",
    enterIngredientToSubstitute: "Ingredient to substitute (ex: 'chicken')",
    enterSubstituteWith: "Substitute with (optional, ex: 'tofu')",
    adapt: "Adapt",
    substitute: "Substitute",
    adaptingRecipe: "Adapting recipe...",
    substitutingIngredient: "Substituting ingredient...",
    errorAdaptRecipe: "Error adapting recipe: ",
    errorSubstituteIngredient: "Error substituting ingredient: ",
    noRecipeToAdapt: "Please generate a recipe to adapt first.",
    noRecipeToSubstitute: "Please generate a recipe for substitution first.",
    scaleRecipe: "✨ Scale Recipe",
    enterServings: "Number of servings (ex: 2, 6)",
    scale: "Scale",
    scalingRecipe: "Scaling recipe...",
    askCookingTip: "✨ Ask for Cooking Tip",
    enterCookingQuestion: "Your question (ex: 'How to properly sauté onions?')",
    ask: "Ask",
    gettingTip: "Getting tip...",
    noRecipeForTip: "Please generate a recipe to get a tip.",
    cookingTip: "Cooking Tip:",
    mealPrepGuide: "✨ Meal Prep Guide",
    generatingMealPrepGuide: "Generating guide...",
    noRecipeForMealPrep: "Please generate a recipe for the meal prep guide.",
    foodPairingSuggestions: "✨ Food Pairing Suggestions",
    enterFoodForPairing: "Ingredient (ex: 'tomato')",
    gettingFoodPairings: "Getting suggestions...",
    noFoodForPairing: "Please enter an ingredient for pairing suggestions.",
    foodPairingResultTitle: "Pairing Suggestions for",
    getIngredientInfo: "✨ Get Ingredient Info",
    enterIngredientName: "Ingredient Name (ex: 'broccoli')",
    gettingIngredientInfo: "Getting info...",
    ingredientInfo: "Ingredient Information",
    noIngredientForInfo: "Please enter an ingredient to get information.",
    optimizeRecipeHealth: "✨ Optimize Recipe Health",
    enterHealthGoals: "Ex: 'less fat', 'more fiber', 'vegetarian'",
    optimize: "Optimize",
    optimizingRecipe: "Optimizing recipe...",
    errorOptimizeRecipe: "Error optimizing recipe: ",
    noRecipeToOptimize: "Please generate a recipe to optimize first.",
    clearAllData: "Clear All Data",
    confirmClearAllData: "Are you sure you want to clear all app data (recipes, favorites, etc.)? This action is irreversible.",
    dataCleared: "All data cleared.",
    myCookingStreak: "My Cooking Streak",
    uploadMealPhotoButton: "I cooked this meal!",
    uploadingMealPhoto: "Uploading meal photo...",
    streakIncreased: "Great! Your cooking streak increased to {streak} days!",
    streakReset: "Too bad! Your streak has been reset to 1 day.",
    alreadyLoggedToday: "You have already logged a meal today.",
    darkModeOn: "On",
    darkModeOff: "Off",
    viewRecipe: "View Recipe",
    favoriteRecipeTitle: "Favorite Recipe",
    dietaryPreferences: "Dietary Preferences:",
    dietaryNone: "Default",
    dietaryVegetarian: "Vegetarian",
    dietaryVegan: "Vegan",
    dietaryGlutenFree: "Gluten-Free",
    dietaryHalal: "Halal",
    dietaryKosher: "Kosher",
    copyToClipboard: "Copy Recipe",
    copied: "Copied!",
    unitNone: "None",
    unitUnits: "units",
    unitGrams: "grams",
    unitKilograms: "kilograms",
    unitMilliliters: "milliliters",
    unitLiters: "liters",
    unitCups: "cups",
    unitSpoons: "spoons",
    cuisineType: "Cuisine Type:",
    cuisineNone: "None",
    cuisineFrench: "French",
    cuisineItalian: "Italian",
    cuisineAsian: "Asian",
    cuisineMexican: "Mexican",
    cuisineIndian: "Indian",
    cuisineMediterranean: "Mediterranean",
    cuisineAmerican: "American",
    cuisineOther: "Other",
    prepTime: "Preparation Time:",
    timeNone: "None",
    timeQuick: "Less than 30 min",
    timeMedium: "30-60 min",
    timeLong: "More than 60 min",
    difficulty: "Difficulty:",
    difficultyNone: "None",
    difficultyEasy: "Easy",
    difficultyMedium: "Medium",
    difficultyHard: "Hard",
    dishType: "Dish Type:",
    dishTypeNone: "None",
    dishTypeMain: "Main Course",
    dishTypeDessert: "Dessert",
    dishTypeAppetizer: "Appetizer",
    dishTypeSide: "Side Dish",
    dishTypeBreakfast: "Breakfast",
    dishTypeSoup: "Soup",
    dishTypeSalad: "Salad",
    dishTypeDrink: "Drink",
    optimizingImage: "Optimizing image...",
    history: "My History",
    noHistory: "No recipes have been generated yet. Start creating one!",
    searchRecipes: "Search recipes...",
    filterByCuisine: "Filter by cuisine:",
    filterByTime: "Filter by time:",
    filterByDifficulty: "Filter by difficulty:",
    filterByDietary: "Filter by dietary:",
    filterByDishType: "Filter by dish type:",
    clearFilters: "Clear filters",
    onboardingTitle: "Welcome to My Smart Fridge!",
    onboardingStep1Title: "1. Analyze your fridge",
    onboardingStep1Desc: "Take a photo of your fridge's interior. Our AI will detect available ingredients.",
    onboardingStep2Title: "2. Generate recipes",
    onboardingStep2Desc: "Based on your ingredients, we'll suggest creative and personalized recipes.",
    onboardingStep3Title: "3. Explore and adapt",
    onboardingStep3Desc: "Save your favorite recipes, view your history, and adapt recipes with our advanced AI tools.",
    onboardingButton: "Let's go!",
    errorGeneric: "An unexpected error occurred. Please check your internet connection or try again later. If the problem persists, contact support.",
    analyzingImage: "Analyzing image...",
    detectingIngredients: "Detecting ingredients...",
    generatingRecipeDetailed: "Generating recipe (this may take a moment)...",
    adaptingRecipeDetailed: "Adapting recipe...",
    substitutingIngredientDetailed: "Substituting ingredient...",
    scalingRecipeDetailed: "Scaling quantities...",
    gettingTipDetailed: "Getting cooking tip...",
    generatingMealPrepGuideDetailed: "Generating meal prep guide...",
    gettingFoodPairingsDetailed: "Getting food pairing suggestions...",
    gettingIngredientInfoDetailed: "Getting ingredient information...",
    optimizingRecipeDetailed: "Optimizing recipe for health...",
    uploadingMealPhotoDetailed: "Uploading meal photo...",
    userIdDisplay: "Your User ID: ",
    firebaseNotInitialized: "Firebase not initialized. Some features may be limited.",
    addRecipeTitle: "Add New Recipe",
    recipeName: "Recipe Name",
    recipeIngredients: "Ingredients (one per line)",
    recipeInstructions: "Instructions",
    addRecipe: "Add Recipe",
    recipeAddedSuccess: "Recipe added successfully!",
  }
};

// Custom Modal component for messages and confirmations
const CustomModal = ({ message, onConfirm, onCancel, showConfirmButton = false, currentLanguage }) => {
  if (!message) return null;

  const t = translations[currentLanguage];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4 animate-fadeIn" aria-modal="true" role="dialog">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-6 max-w-sm w-full text-center transform glassmorphism"
      >
        <p className="text-lg mb-6 text-gray-800 dark:text-gray-200">{message}</p>
        <div className="flex justify-center gap-4">
          {onCancel && (
            <button
              className="bg-gray-300 text-gray-800 px-5 py-2 rounded-lg font-semibold hover:bg-gray-400 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 transition-colors duration-200 transform hover:scale-105 active:scale-95"
              onClick={onCancel}
              aria-label={t.cancel}
            >
              {t.cancel}
            </button>
          )}
          {showConfirmButton && onConfirm ? (
            <button
              className="bg-red-500 text-white px-5 py-2 rounded-lg font-semibold hover:bg-red-600 transition-colors duration-200 transform hover:scale-105 active:scale-95"
              onClick={onConfirm}
              aria-label={t.delete}
            >
              {t.delete}
            </button>
          ) : (
            <button
              className="bg-indigo-600 text-white px-5 py-2 rounded-lg font-semibold hover:bg-indigo-700 transition-colors duration-200 transform hover:scale-105 active:scale-95"
              onClick={onCancel || onConfirm}
              aria-label={t.ok}
            >
              {t.ok}
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
};

// SkeletonLoader component for improved loading experience
const SkeletonLoader = ({ lines = 5, className = "" }) => (
  <div className={`space-y-3 ${className}`}>
    <div className="h-6 bg-gray-300 dark:bg-gray-700 rounded w-3/4 animate-shimmer"></div>
    {Array.from({ length: lines - 1 }).map((_, i) => (
      <div key={i} className={`h-4 bg-gray-300 dark:bg-gray-700 rounded animate-shimmer ${i % 3 === 0 ? 'w-full' : i % 3 === 1 ? 'w-5/6' : 'w-4/5'}`}></div>
    ))}
  </div>
);

// Loading spinner component
const LoadingSpinner = () => (
  <Loader2 className="w-5 h-5 animate-spin text-white" />
);

// OnboardingModal component
const OnboardingModal = ({ onClose, currentLanguage }) => {
  const t = translations[currentLanguage];
  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50 p-4 animate-fadeIn" aria-modal="true" role="dialog">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-8 max-w-2xl w-full text-center transform glassmorphism"
      >
        <h2 className="text-3xl font-extrabold mb-6 text-indigo-600 dark:text-indigo-400 flex items-center justify-center gap-3">
          <Sparkles className="w-8 h-8" /> {t.onboardingTitle}
        </h2>
        <div className="space-y-6 text-left text-gray-800 dark:text-gray-200">
          <div>
            <h3 className="text-xl font-semibold mb-2 flex items-center gap-2">
              <Camera className="w-6 h-6 text-emerald-500" /> {t.onboardingStep1Title}
            </h3>
            <p>{t.onboardingStep1Desc}</p>
          </div>
          <div>
            <h3 className="text-xl font-semibold mb-2 flex items-center gap-2">
              <Utensils className="w-6 h-6 text-blue-500" /> {t.onboardingStep2Title}
            </h3>
            <p>{t.onboardingStep2Desc}</p>
          </div>
          <div>
            <h3 className="text-xl font-semibold mb-2 flex items-center gap-2">
              <Lightbulb className="w-6 h-6 text-purple-500" /> {t.onboardingStep3Title}
            </h3>
            <p>{t.onboardingStep3Desc}</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="mt-8 bg-indigo-600 text-white px-8 py-3 rounded-lg text-xl font-bold hover:bg-indigo-700 transition-colors duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          aria-label={t.onboardingButton}
        >
          {t.onboardingButton}
        </button>
      </motion.div>
    </div>
  );
};

// Helper function for Gemini API calls with exponential backoff
const callGeminiApi = async (model, payload, retries = 3, delay = 1000) => {
  // Use __api_key if available from the environment (Canvas), otherwise default to empty string for Netlify injection.
  const apiKey = typeof __api_key !== 'undefined' ? __api_key : "";
  const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        if (response.status === 429 || response.status >= 500) {
          console.warn(`Attempt ${i + 1} failed with status ${response.status}. Retrying in ${delay / 1000}s...`);
          await new Promise(res => setTimeout(res, delay));
          delay *= 2;
          continue;
        }
        const errorData = await response.json();
        throw new Error(errorData.error?.message || response.statusText);
      }

      const result = await response.json();
      if (result.candidates && result.candidates.length > 0 &&
          result.candidates[0].content && result.candidates[0].content.parts &&
          result.candidates[0].content.parts.length > 0) {
        return result.candidates[0].content.parts[0].text;
      } else {
        throw new Error("Invalid API response structure or no content.");
      }
    } catch (error) {
      if (i === retries - 1) {
        throw error;
      }
      console.error(`Error on attempt ${i + 1}:`, error.message);
      await new Promise(res => setTimeout(res, delay));
      delay *= 2;
    }
  }
  throw new Error("Max retries exceeded.");
};


export default function App() {
  const [userId, setUserId] = useState(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [detectedIngredients, setDetectedIngredients] = useState([]);
  const [newIngredientInput, setNewIngredientInput] = useState('');
  const [newIngredientExpiry, setNewIngredientExpiry] = useState('');
  const [newIngredientQuantity, setNewIngredientQuantity] = useState('');
  const [newIngredientUnit, setNewIngredientUnit] = useState('unit');

  const [generatedRecipe, setGeneratedRecipe] = useState('');
  const [loadingMessage, setLoadingMessage] = useState(null);
  const [error, setError] = useState('');
  const [viewMode, setViewMode] = useState('recipeOfTheDay'); // Default to daily recipe
  const [modalMessage, setModalMessage] = useState('');
  const [modalOnConfirm, setModalOnConfirm] = useState(null);
  const [modalOnCancel, setModalOnCancel] = useState(null);
  const [showModalConfirmButton, setShowModalConfirmButton] = useState(false);
  const [favoriteRecipes, setFavoriteRecipes] = useState([]);
  const [generatedRecipesHistory, setGeneratedRecipesHistory] = useState([]);
  const [dailyRecipe, setDailyRecipe] = useState(null);
  const [lastDailyRecipeDate, setLastDailyRecipeDate] = useState(null);
  const [language, setLanguage] = useState('fr');
  const [darkMode, setDarkMode] = useState(false);
  const [dietaryPreference, setDietaryPreference] = useState('none');
  const [cookingStreak, setCookingStreak] = useState(0);
  const [lastCookingLogDate, setLastCookingLogDate] = useState('');
  const [copied, setCopied] = useState(false);
  const [isFirstTimeUser, setIsFirstTimeUser] = useState(true);
  const [showAddRecipeModal, setShowAddRecipeModal] = useState(false); // State for Add Recipe modal

  const [newRecipeName, setNewRecipeName] = useState('');
  const [newRecipeIngredients, setNewRecipeIngredients] = useState('');
  const [newRecipeInstructions, setNewRecipeInstructions] = useState('');


  const [cuisineType, setCuisineType] = useState('none');
  const [preparationTime, setPreparationTime] = useState('none');
  const [difficulty, setDifficulty] = useState('none');
  const [dishType, setDishType] = useState('none');

  const [favoriteSearchTerm, setFavoriteSearchTerm] = useState('');
  const [favoriteCuisineFilter, setFavoriteCuisineFilter] = useState('none');
  const [favoriteTimeFilter, setFavoriteTimeFilter] = useState('none');
  const [favoriteDifficultyFilter, setFavoriteDifficultyFilter] = useState('none');
  const [favoriteDietaryFilter, setFavoriteDietaryFilter] = useState('none');
  const [favoriteDishTypeFilter, setFavoriteDishTypeFilter] = useState('none');


  const fileInputRef = useRef(null);

  const t = useMemo(() => translations[language], [language]);

  const [showAdaptRecipeInput, setShowAdaptRecipeInput] = useState(false);
  const [adaptRecipePrompt, setAdaptRecipePrompt] = useState('');
  const [showSubstituteIngredientInput, setShowSubstituteIngredientInput] = useState(false);
  const [ingredientToSubstitute, setIngredientToSubstitute] = useState('');
  const [substituteWith, setSubstituteWith] = useState('');
  const [showScaleRecipeInput, setShowScaleRecipeInput] = useState(false);
  const [scaleServings, setScaleServings] = useState('');
  const [showCookingTipInput, setShowCookingTipInput] = useState(false);
  const [cookingTipPrompt, setCookingTipPrompt] = useState('');
  const [cookingTipResult, setCookingTipResult] = useState(''); // Initialize with empty string
  const [showFoodPairingInput, setShowFoodPairingInput] = useState(false);
  const [foodPairingQuery, setFoodPairingQuery] = useState('');
  const [foodPairingResult, setFoodPairingResult] = useState(''); // Initialize with empty string
  const [showOptimizeRecipeInput, setShowOptimizeRecipeInput] = useState(false);
  const [optimizeRecipePrompt, setOptimizeRecipePrompt] = useState('');
  const [showIngredientInfoInput, setShowIngredientInfoInput] = useState(false);
  const [ingredientInfoQuery, setIngredientInfoQuery] = useState('');
  const [ingredientInfoResult, setIngredientInfoResult] = useState(''); // Initialize with empty string


  // --- Firebase Authentication and Data Loading ---
  useEffect(() => {
    // Check if Firebase is initialized based on the global variables
    if (!auth || !db) {
      console.warn(t.firebaseNotInitialized);
      // If firebaseConfig is truly empty, we cannot initialize Firebase.
      // Set auth ready to true so the UI can render, but features will be limited.
      if (!firebaseConfig.apiKey && !firebaseConfig.projectId) { // More robust check for empty config
        setIsAuthReady(true);
        setUserId(crypto.randomUUID()); // Provide a dummy userId for non-Firebase features
        return;
      }
    }

    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      let currentUserId;
      if (user) {
        currentUserId = user.uid;
      } else {
        try {
          if (initialAuthToken) {
            await signInWithCustomToken(auth, initialAuthToken);
          } else {
            await signInAnonymously(auth);
          }
          currentUserId = auth.currentUser.uid;
        } catch (error) {
          console.error("Firebase anonymous sign-in failed:", error);
          currentUserId = crypto.randomUUID(); // Fallback if auth fails
        }
      }
      setUserId(currentUserId);
      setIsAuthReady(true);

      // Only attempt Firestore operations if db is actually initialized
      if (db) {
        const userProfileRef = doc(db, `artifacts/${appId}/users/${currentUserId}/user_data/profile`);
        const userDailyRecipeRef = doc(db, `artifacts/${appId}/users/${currentUserId}/user_data/daily_recipe_cache`);

        const unsubscribeProfile = onSnapshot(userProfileRef, (docSnap) => {
          if (docSnap.exists()) {
            const data = docSnap.data();
            setLanguage(data.language || 'fr');
            setDarkMode(data.darkMode || false);
            setDietaryPreference(data.dietaryPreference || 'none');
            setCookingStreak(data.cookingStreak || 0);
            setLastCookingLogDate(data.lastCookingLogDate || '');
            setCuisineType(data.cuisineType || 'none');
            setPreparationTime(data.preparationTime || 'none');
            setDifficulty(data.difficulty || 'none');
            setDishType(data.dishType || 'none');
            setIsFirstTimeUser(data.isFirstTimeUser === undefined ? true : data.isFirstTimeUser);
          } else {
            setDoc(userProfileRef, {
              language: 'fr',
              darkMode: false,
              dietaryPreference: 'none',
              cookingStreak: 0,
              lastCookingLogDate: '',
              cuisineType: 'none',
              preparationTime: 'none',
              difficulty: 'none',
              dishType: 'none',
              isFirstTimeUser: true,
            }, { merge: true }).catch(console.error);
            setIsFirstTimeUser(true);
          }
        });

        const unsubscribeDailyRecipe = onSnapshot(userDailyRecipeRef, (docSnap) => {
          if (docSnap.exists()) {
            const data = docSnap.data();
            setDailyRecipe(data.recipe || null);
            setLastDailyRecipeDate(data.lastDailyRecipeDate || null);
          }
        });

        const unsubscribeFavorites = onSnapshot(collection(db, `artifacts/${appId}/users/${currentUserId}/favorite_recipes`), (snapshot) => {
          const favorites = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          setFavoriteRecipes(favorites);
        });

        const unsubscribeHistory = onSnapshot(collection(db, `artifacts/${appId}/users/${currentUserId}/generated_recipes_history`), (snapshot) => {
          const history = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          setGeneratedRecipesHistory(history);
        });

        return () => {
          unsubscribeProfile();
          unsubscribeDailyRecipe();
          unsubscribeFavorites();
          unsubscribeHistory();
        };
      }
    });

    return () => {
      if (auth && unsubscribeAuth) { // Only unsubscribe if auth was actually initialized
        unsubscribeAuth();
      }
    };
  }, [t.firebaseNotInitialized]); // Removed firebaseConfig from dependencies to avoid re-running on every render

  // --- Persist user preferences to Firestore when they change ---
  useEffect(() => {
    if (userId && isAuthReady && db) { // Only attempt if db is initialized
      const userProfileRef = doc(db, `artifacts/${appId}/users/${userId}/user_data/profile`);
      setDoc(userProfileRef, {
        language,
        darkMode,
        dietaryPreference,
        cuisineType,
        preparationTime,
        difficulty,
        dishType,
      }, { merge: true }).catch(console.error);
    }
  }, [language, darkMode, dietaryPreference, cuisineType, preparationTime, difficulty, dishType, userId, isAuthReady, db]);

  // --- Global state management functions ---

  const showModal = useCallback((message, onConfirm = null, onCancel = null, showConfirmButton = false) => {
    setModalMessage(message);
    setModalOnConfirm(() => onConfirm);
    setModalOnCancel(() => onCancel);
    setShowModalConfirmButton(showConfirmButton);
  }, []);

  const closeModal = useCallback(() => {
    setModalMessage('');
    setModalOnConfirm(null);
    setModalOnCancel(null);
    setShowModalConfirmButton(false);
  }, []);

  const handleError = useCallback((msg, err) => {
    console.error(msg, err);
    let displayMessage = msg;
    if (err && err.message) {
      if (err.message.includes('Failed to fetch')) {
        displayMessage = `${msg} Veuillez vérifier votre connexion internet.`;
      } else if (err.message.includes('quota')) {
        displayMessage = `${msg} Quota de l'API dépassé. Veuillez réessayer plus tard.`;
      } else {
        displayMessage = `${msg} ${err.message}`;
      }
    } else {
      displayMessage = `${msg} ${t.errorGeneric}`;
    }

    setError(displayMessage);
    showModal(displayMessage, closeModal, closeModal);
    setLoadingMessage(null);
  }, [showModal, closeModal, t.errorGeneric]);

  const clearError = useCallback(() => {
    setError('');
  }, []);

  const resetAllStates = useCallback(() => {
    setSelectedImage(null);
    setDetectedIngredients([]);
    setNewIngredientInput('');
    setNewIngredientExpiry('');
    setNewIngredientQuantity('');
    setNewIngredientUnit('unit');
    setGeneratedRecipe('');
    setLoadingMessage(null);
    setError('');
    // setViewMode('upload'); // Keep current view mode or set to a default like 'recipeOfTheDay'
    setModalMessage('');
    setModalOnConfirm(null);
    setModalOnCancel(null);
    setShowModalConfirmButton(false);
    setShowAdaptRecipeInput(false);
    setAdaptRecipePrompt('');
    setShowSubstituteIngredientInput(false);
    setIngredientToSubstitute('');
    setSubstituteWith('');
    setShowScaleRecipeInput(false);
    setScaleServings('');
    setShowCookingTipInput(false);
    setCookingTipPrompt('');
    setCookingTipResult('');
    setShowFoodPairingInput(false);
    setFoodPairingQuery('');
    setFoodPairingResult('');
    setShowOptimizeRecipeInput(false);
    setOptimizeRecipePrompt('');
    setShowIngredientInfoInput(false);
    setIngredientInfoQuery('');
    setIngredientInfoResult('');
    setFavoriteSearchTerm('');
    setFavoriteCuisineFilter('none');
    setFavoriteTimeFilter('none');
    setFavoriteDifficultyFilter('none');
    setFavoriteDietaryFilter('none');
    setFavoriteDishTypeFilter('none');
    setNewRecipeName('');
    setNewRecipeIngredients('');
    setNewRecipeInstructions('');
  }, []);

  const handleOnboardingComplete = useCallback(() => {
    if (userId && db) { // Only attempt if db is initialized
      const userProfileRef = doc(db, `artifacts/${appId}/users/${userId}/user_data/profile`);
      setDoc(userProfileRef, { isFirstTimeUser: false }, { merge: true }).catch(console.error);
    }
    setIsFirstTimeUser(false);
  }, [userId, db]);

  // --- Image handling and ingredient detection ---

  const handleImageUpload = useCallback((event) => {
    clearError();
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result);
      };
      reader.onerror = () => {
        showModal(t.errorImageRead, closeModal, closeModal);
      };
      reader.readAsDataURL(file);
    } else {
      setSelectedImage(null);
    }
  }, [clearError, showModal, closeModal, t.errorImageRead]);

  const handleAnalyzeImage = useCallback(async () => {
    clearError();
    if (!selectedImage) {
      showModal(t.errorNoImage, closeModal, closeModal);
      return;
    }

    setLoadingMessage(t.analyzingImage);
    setGeneratedRecipe('');
    setDetectedIngredients([]);

    // Extract base64 data and mimeType from selectedImage (e.g., "data:image/png;base64,iVBORw...")
    const [mimeTypeHeader, base64ImageData] = selectedImage.split(',');
    const actualMimeType = mimeTypeHeader.split(':')[1].split(';')[0]; // e.g., "image/png" or "image/jpeg"

    const prompt = `List all food items and ingredients visible in this fridge image, focusing on raw ingredients and common pantry items. Provide a concise list, one item per line, without any additional text or formatting. For example:
- Apple
- Carrot
- Milk`;

    const payload = {
      contents: [
        {
          role: "user",
          parts: [
            { text: prompt },
            {
              inlineData: {
                mimeType: actualMimeType, // Use the dynamically extracted mimeType
                data: base64ImageData
              }
            }
          ]
        }
      ],
    };

    try {
      const resultText = await callGeminiApi("gemini-2.5-flash-preview-05-20", payload);
      const ingredientsArray = resultText.split('\n')
        .map(line => line.replace(/^- /, '').trim())
        .filter(name => name)
        .map(name => ({
          name: name,
          quantity: 1,
          unit: 'unit',
          expiryDate: ''
        }));
      setDetectedIngredients(ingredientsArray);
      showModal(t.detectedSuccess, closeModal, closeModal);
    } catch (err) {
      handleError(t.errorImageAnalysis, err);
    } finally {
      setLoadingMessage(null);
    }
  }, [selectedImage, clearError, showModal, closeModal, handleError, t.errorNoImage, t.errorImageAnalysis, t.detectedSuccess, t.analyzingImage]);

  const handleAddIngredient = useCallback(() => {
    if (newIngredientInput.trim()) {
      setDetectedIngredients(prev => [...prev, {
        name: newIngredientInput.trim(),
        quantity: newIngredientQuantity ? parseFloat(newIngredientQuantity) : 1,
        unit: newIngredientUnit,
        expiryDate: newIngredientExpiry
      }]);
      setNewIngredientInput('');
      setNewIngredientExpiry('');
      setNewIngredientQuantity('');
      setNewIngredientUnit('unit');
    }
  }, [newIngredientInput, newIngredientExpiry, newIngredientQuantity, newIngredientUnit]);

  const handleRemoveIngredient = useCallback((indexToRemove) => {
    setDetectedIngredients(prev => prev.filter((_, index) => index !== indexToRemove));
  }, []);

  const handleUpdateIngredientName = useCallback((index, newName) => {
    setDetectedIngredients(prev => prev.map((ing, i) => i === index ? { ...ing, name: newName } : ing));
  }, []);

  const handleUpdateIngredientQuantity = useCallback((index, newQuantity) => {
    setDetectedIngredients(prev => prev.map((ing, i) => i === index ? { ...ing, quantity: parseFloat(newQuantity) || 0 } : ing));
  }, []);

  const handleUpdateIngredientUnit = useCallback((index, newUnit) => {
    setDetectedIngredients(prev => prev.map((ing, i) => i === index ? { ...ing, unit: newUnit } : ing));
  }, []);

  const handleUpdateIngredientExpiry = useCallback((index, newDate) => {
    setDetectedIngredients(prev => prev.map((ing, i) => i === index ? { ...ing, expiryDate: newDate } : ing));
  }, []);

  // --- Recipe generation and management ---

  const handleGenerateRecipe = useCallback(async () => {
    clearError();
    // Check if Firebase is available for saving history, but don't block recipe generation
    if (!detectedIngredients.length === 0) {
      showModal(t.noIngredientsForRecipe, closeModal, closeModal);
      return;
    }

    setLoadingMessage(t.generatingRecipeDetailed);
    setGeneratedRecipe('');
    setViewMode('recipe');

    const ingredientsString = detectedIngredients.map(ing => {
      let ingredientText = ing.name;
      if (ing.quantity && ing.quantity > 0) {
        ingredientText = `${ing.quantity} ${t[`unit${ing.unit.charAt(0).toUpperCase() + ing.unit.slice(1)}`] || ing.unit} de ${ing.name}`;
      } else {
        ingredientText = ing.name;
      }
      if (ing.expiryDate) {
        ingredientText += ` (expire le ${ing.expiryDate})`;
      }
      return ingredientText;
    }).join(', ');

    let prompt = `Génère une recette détaillée et appétissante en utilisant les ingrédients suivants : ${ingredientsString}.`;

    if (dietaryPreference && dietaryPreference !== 'none') {
      prompt += ` Tiens compte de la préférence alimentaire : ${t[`dietary${dietaryPreference.charAt(0).toUpperCase() + dietaryPreference.slice(1)}`]}.`;
    }
    if (cuisineType && cuisineType !== 'none') {
      prompt += ` Le type de cuisine souhaité est : ${t[`cuisine${cuisineType.charAt(0).toUpperCase() + cuisineType.slice(1)}`]}.`;
    }
    if (preparationTime && preparationTime !== 'none') {
      prompt += ` Le temps de préparation doit être : ${t[`time${preparationTime.charAt(0).toUpperCase() + preparationTime.slice(1)}`]}.`;
    }
    if (difficulty && difficulty !== 'none') {
      prompt += ` La difficulté doit être : ${t[`difficulty${difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}`]}.`;
    }
    if (dishType && dishType !== 'none') {
      prompt += ` Le type de plat est : ${t[`dishType${dishType.charAt(0).toUpperCase() + dishType.slice(1)}`]}.`;
    }

    prompt += ` La recette doit être en ${language === 'fr' ? 'français' : (language === 'en' ? 'anglais' : (language === 'de' ? 'allemand' : (language === 'es' ? 'espagnol' : 'italien')))}. Formatte la recette en HTML avec des titres (h2, h3), des listes (ul, ol) et des paragraphes (p) pour une meilleure lisibilité.`;

    const payload = {
      contents: [{ role: "user", parts: [{ text: prompt }] }],
    };

    try {
      const resultText = await callGeminiApi("gemini-2.5-flash-preview-05-20", payload);
      setGeneratedRecipe(resultText);

      // Only attempt to save to Firestore if db is initialized
      if (db && userId) {
        const historyCollectionRef = collection(db, `artifacts/${appId}/users/${userId}/generated_recipes_history`);
        await addDoc(historyCollectionRef, {
          title: resultText.substring(0, 50).split('\n')[0].trim() || t.recipeTitle,
          content: resultText,
          date: new Date().toISOString().slice(0, 10),
          filters: { cuisineType, preparationTime, difficulty, dishType, dietaryPreference }
        });
      }

    } catch (err) {
      handleError(t.errorGenerateRecipe, err);
    } finally {
      setLoadingMessage(null);
    }
  }, [detectedIngredients, language, dietaryPreference, cuisineType, preparationTime, difficulty, dishType, clearError, showModal, closeModal, handleError, t.noIngredientsForRecipe, t.errorGenerateRecipe, t.generatingRecipeDetailed, t, userId, db]);

  const handleAddCustomRecipe = useCallback(async () => {
    clearError();
    if (!newRecipeName.trim() || !newRecipeIngredients.trim() || !newRecipeInstructions.trim()) {
      showModal("Veuillez remplir tous les champs de la recette.", closeModal, closeModal);
      return;
    }

    setLoadingMessage("Ajout de la recette...");

    const recipeContent = `<h2>${newRecipeName}</h2>
    <h3>Ingrédients :</h3>
    <ul>${newRecipeIngredients.split('\n').map(item => `<li>${item.trim()}</li>`).join('')}</ul>
    <h3>Instructions :</h3>
    <ol>${newRecipeInstructions.split('\n').map(item => `<li>${item.trim()}</li>`).join('')}</ol>`;

    try {
      if (db && userId) {
        const historyCollectionRef = collection(db, `artifacts/${appId}/users/${userId}/generated_recipes_history`);
        await addDoc(historyCollectionRef, {
          title: newRecipeName,
          content: recipeContent,
          date: new Date().toISOString().slice(0, 10),
          filters: { cuisineType: 'none', preparationTime: 'none', difficulty: 'none', dishType: 'none', dietaryPreference: 'none' } // Default filters for manual entry
        });
        showModal(t.recipeAddedSuccess, () => {
          setShowAddRecipeModal(false);
          resetAllStates();
          setViewMode('history'); // Navigate to history after adding
          closeModal();
        }, null);
      } else {
        showModal(t.firebaseNotInitialized, closeModal, closeModal);
      }
    } catch (err) {
      handleError("Erreur lors de l'ajout de la recette :", err);
    } finally {
      setLoadingMessage(null);
    }
  }, [newRecipeName, newRecipeIngredients, newRecipeInstructions, clearError, showModal, closeModal, handleError, t.recipeAddedSuccess, t.firebaseNotInitialized, userId, db, resetAllStates]);


  const isFavorite = useCallback((recipeContent) => {
    return favoriteRecipes.some(fav => fav.content === recipeContent);
  }, [favoriteRecipes]);

  const handleToggleFavorite = useCallback(async () => {
    if (!db || !userId) { // Check if db is initialized
      showModal(t.firebaseNotInitialized, closeModal, closeModal);
      return;
    }
    if (!generatedRecipe) return;

    const docId = btoa(generatedRecipe.substring(0, 100)).replace(/=/g, '');
    const favoriteRecipeRef = doc(db, `artifacts/${appId}/users/${userId}/favorite_recipes`, docId);

    if (isFavorite(generatedRecipe)) {
      try {
        await deleteDoc(favoriteRecipeRef);
        showModal(t.recipeDeleted, closeModal, closeModal);
      } catch (e) {
        handleError("Erreur lors de la suppression du favori :", e);
      }
    } else {
      const historyEntry = generatedRecipesHistory.find(entry => entry.content === generatedRecipe);
      try {
        await setDoc(favoriteRecipeRef, {
          title: generatedRecipe.substring(0, 50).split('\n')[0].trim() || t.favoriteRecipeTitle,
          content: generatedRecipe,
          date: new Date().toISOString().slice(0, 10),
          filters: historyEntry ? historyEntry.filters : { cuisineType, preparationTime, difficulty, dishType, dietaryPreference }
        });
        showModal(`${t.addToFavorites} !`, closeModal, closeModal);
      } catch (e) {
        handleError("Erreur lors de l'ajout aux favoris :", e);
      }
    }
  }, [generatedRecipe, isFavorite, showModal, closeModal, handleError, t.recipeDeleted, t.addToFavorites, t.favoriteRecipeTitle, generatedRecipesHistory, cuisineType, preparationTime, difficulty, dishType, dietaryPreference, userId, db, t.firebaseNotInitialized]);

  const handleDeleteFavorite = useCallback(async (recipeIdToDelete) => {
    if (!db || !userId) { // Check if db is initialized
      showModal(t.firebaseNotInitialized, closeModal, closeModal);
      return;
    }
    showModal(t.confirmDeleteRecipe, async () => {
      try {
        await deleteDoc(doc(db, `artifacts/${appId}/users/${userId}/favorite_recipes`, recipeIdToDelete));
        closeModal();
        showModal(t.recipeDeleted, closeModal, closeModal);
      } catch (e) {
        handleError("Erreur lors de la suppression du favori :", e);
      }
    }, closeModal, true);
  }, [showModal, closeModal, handleError, t.confirmDeleteRecipe, t.recipeDeleted, userId, db, t.firebaseNotInitialized]);

  const copyRecipeToClipboard = useCallback(() => {
    if (generatedRecipe) {
      const tempTextArea = document.createElement('textarea');
      tempTextArea.value = generatedRecipe.replace(/<[^>]*>/g, '');
      document.body.appendChild(tempTextArea);
      tempTextArea.select();
      document.execCommand('copy');
      document.body.removeChild(tempTextArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [generatedRecipe]);

  // --- Daily Recipe ---
  const fetchDailyRecipe = useCallback(async () => {
    clearError();
    if (!db || !userId) { // Check if db is initialized
      showModal(t.firebaseNotInitialized, closeModal, closeModal);
      return;
    }
    setLoadingMessage(t.generatingDailyRecipe);
    setDailyRecipe(null);

    const today = new Date().toDateString();
    const dailyRecipeDocRef = doc(db, `artifacts/${appId}/users/${userId}/user_data/daily_recipe_cache`);

    const docSnap = await getDoc(dailyRecipeDocRef);
    if (docSnap.exists() && docSnap.data().lastDailyRecipeDate === today && docSnap.data().recipe) {
      setDailyRecipe(docSnap.data().recipe);
      setLastDailyRecipeDate(docSnap.data().lastDailyRecipeDate);
      setLoadingMessage(null);
      return;
    }

    const prompt = `Génère une recette du jour unique et appétissante. La recette doit être en ${language === 'fr' ? 'français' : (language === 'en' ? 'anglais' : (language === 'de' ? 'allemand' : (language === 'es' ? 'espagnol' : 'italien')))}. Tiens compte de la préférence alimentaire : ${t[`dietary${dietaryPreference.charAt(0).toUpperCase() + dietaryPreference.slice(1)}`]}. Formatte la recette en HTML avec des titres (h2, h3), des listes (ul, ol) et des paragraphes (p) pour une meilleure lisibilité.`;

    const payload = {
      contents: [{ role: "user", parts: [{ text: prompt }] }],
    };

    try {
      const resultText = await callGeminiApi("gemini-2.5-flash-preview-05-20", payload);
      setDailyRecipe(resultText);
      setLastDailyRecipeDate(today);

      await setDoc(dailyRecipeDocRef, { recipe: resultText, lastDailyRecipeDate: today }, { merge: true });

    } catch (err) {
      handleError(t.noDailyRecipe, err);
    } finally {
      setLoadingMessage(null);
    }
  }, [dailyRecipe, lastDailyRecipeDate, language, dietaryPreference, clearError, handleError, t.noDailyRecipe, t.generatingDailyRecipe, userId, db, t.firebaseNotInitialized]);


  // --- LLM Adaptation Functions ---

  const handleAdaptRecipe = useCallback(async () => {
    clearError();
    if (!generatedRecipe) {
      showModal(t.noRecipeToAdapt, closeModal, closeModal);
      return;
    }
    if (!adaptRecipePrompt.trim()) {
      showModal("Veuillez entrer votre demande d'adaptation.", closeModal, closeModal);
      return;
    }

    setLoadingMessage(t.adaptingRecipeDetailed);
    const prompt = `Adapte la recette suivante :
    ${generatedRecipe}
    Selon la demande : "${adaptRecipePrompt}".
    La recette doit rester en ${language === 'fr' ? 'français' : (language === 'en' ? 'anglais' : (language === 'de' ? 'allemand' : (language === 'es' ? 'espagnol' : 'italien')))}. Formatte la recette adaptée en HTML avec des titres (h2, h3), des listes (ul, ol) et des paragraphes (p) pour une meilleure lisibilité.`;

    const payload = {
      contents: [{ role: "user", parts: [{ text: prompt }] }],
    };

    try {
      const resultText = await callGeminiApi("gemini-2.5-flash-preview-05-20", payload);
      setGeneratedRecipe(resultText);
      setAdaptRecipePrompt('');
      setShowAdaptRecipeInput(false);
      showModal("Recette adaptée avec succès !", closeModal, closeModal);
    } catch (err) {
      handleError(t.errorAdaptRecipe, err);
    } finally {
      setLoadingMessage(null);
    }
  }, [generatedRecipe, adaptRecipePrompt, language, clearError, showModal, closeModal, handleError, t.noRecipeToAdapt, t.errorAdaptRecipe, t.adaptingRecipeDetailed]);

  const handleSubstituteIngredient = useCallback(async () => {
    clearError();
    if (!generatedRecipe) {
      showModal(t.noRecipeToSubstitute, closeModal, closeModal);
      return;
    }
    if (!ingredientToSubstitute.trim()) {
      showModal("Veuillez spécifier l'ingrédient à substituer.", closeModal, closeModal);
      return;
    }

    setLoadingMessage(t.substitutingIngredientDetailed);
    const prompt = `Dans la recette suivante :
    ${generatedRecipe}
    Substitue l'ingrédient "${ingredientToSubstitute}" par "${substituteWith.trim() || 'un substitut approprié'}" en tenant compte de la préférence alimentaire "${t[`dietary${dietaryPreference.charAt(0).toUpperCase() + dietaryPreference.slice(1)}`]}".
    La recette doit rester en ${language === 'fr' ? 'français' : (language === 'en' ? 'anglais' : (language === 'de' ? 'allemand' : (language === 'es' ? 'espagnol' : 'italien')))}. Formatte la recette adaptée en HTML avec des titres (h2, h3), des listes (ul, ol) et des paragraphes (p) pour une meilleure lisibilité.`;

    const payload = {
      contents: [{ role: "user", parts: [{ text: prompt }] }],
    };

    try {
      const resultText = await callGeminiApi("gemini-2.5-flash-preview-05-20", payload);
      setGeneratedRecipe(resultText);
      setIngredientToSubstitute('');
      setSubstituteWith('');
      setShowSubstituteIngredientInput(false);
      showModal("Ingrédient substitué avec succès !", closeModal, closeModal);
    } catch (err) {
      handleError(t.errorSubstituteIngredient, err);
    } finally {
      setLoadingMessage(null);
    }
  }, [generatedRecipe, ingredientToSubstitute, substituteWith, language, dietaryPreference, clearError, showModal, closeModal, handleError, t.noRecipeToSubstitute, t.errorSubstituteIngredient, t.substitutingIngredientDetailed]);

  const handleScaleRecipe = useCallback(async () => {
    clearError();
    if (!generatedRecipe) {
      showModal(t.noRecipeToAdapt, closeModal, closeModal);
      return;
    }
    const servings = parseInt(scaleServings, 10);
    if (isNaN(servings) || servings <= 0) {
      showModal("Veuillez entrer un nombre de portions valide.", closeModal, closeModal);
      return;
    }

    setLoadingMessage(t.scalingRecipeDetailed);
    const prompt = `Adapte la recette suivante pour ${servings} personnes :
    ${generatedRecipe}
    La recette doit rester en ${language === 'fr' ? 'français' : (language === 'en' ? 'anglais' : (language === 'de' ? 'allemand' : (language === 'es' ? 'espagnol' : 'italien')))}. Formatte la recette adaptée en HTML avec des titres (h2, h3), des listes (ul, ol) et des paragraphes (p) pour une meilleure lisibilité.`;

    const payload = {
      contents: [{ role: "user", parts: [{ text: prompt }] }],
    };

    try {
      const resultText = await callGeminiApi("gemini-2.5-flash-preview-05-20", payload);
      setGeneratedRecipe(resultText);
      setScaleServings('');
      setShowScaleRecipeInput(false);
      showModal("Quantité de recette adaptée avec succès !", closeModal, closeModal);
    } catch (err) {
      handleError(t.errorAdaptRecipe, err);
    } finally {
      setLoadingMessage(null);
    }
  }, [generatedRecipe, scaleServings, language, clearError, showModal, closeModal, handleError, t.noRecipeToAdapt, t.errorAdaptRecipe, t.scalingRecipeDetailed]);

  const handleAskCookingTip = useCallback(async () => {
    clearError();
    if (!generatedRecipe && !cookingTipPrompt.trim()) {
      showModal(t.noRecipeForTip, closeModal, closeModal);
      return;
    }
    if (!cookingTipPrompt.trim()) {
      showModal("Veuillez poser votre question.", closeModal, closeModal);
      return;
    }

    setLoadingMessage(t.gettingTipDetailed);
    setCookingTipResult('');
    const prompt = `En te basant sur la recette suivante (si fournie) :
    ${generatedRecipe || "Aucune recette fournie."}
    Réponds à la question suivante : "${cookingTipPrompt}".
    Le conseil doit être en ${language === 'fr' ? 'français' : (language === 'en' ? 'anglais' : (language === 'de' ? 'allemand' : (language === 'es' ? 'espagnol' : 'italien')))}. Formatte la réponse en HTML.`;

    const payload = {
      contents: [{ role: "user", parts: [{ text: prompt }] }],
    };

    try {
      const resultText = await callGeminiApi("gemini-2.5-flash-preview-05-20", payload);
      setCookingTipResult(resultText);
    } catch (err) {
      handleError("Erreur lors de l'obtention du conseil : ", err);
    } finally {
      setLoadingMessage(null);
    }
  }, [generatedRecipe, cookingTipPrompt, language, clearError, showModal, closeModal, handleError, t.noRecipeForTip, t.gettingTipDetailed]);

  const handleGenerateMealPrepGuide = useCallback(async () => {
    clearError();
    if (!generatedRecipe) {
      showModal(t.noRecipeForMealPrep, closeModal, closeModal);
      return;
    }

    setLoadingMessage(t.generatingMealPrepGuideDetailed);
    const prompt = `Génère un guide de préparation de repas détaillé pour la recette suivante :
    ${generatedRecipe}
    Le guide doit être en ${language === 'fr' ? 'français' : (language === 'en' ? 'anglais' : (language === 'de' ? 'allemand' : (language === 'es' ? 'espagnol' : 'italien')))}. Formatte le guide en HTML avec des titres (h2, h3), des listes (ul, ol) et des paragraphes (p) pour une meilleure lisibilité.`;

    const payload = {
      contents: [{ role: "user", parts: [{ text: prompt }] }],
    };

    try {
      const resultText = await callGeminiApi("gemini-2.5-flash-preview-05-20", payload);
      setGeneratedRecipe(resultText); // Display the guide in the recipe section
      showModal("Guide de préparation généré !", closeModal, closeModal);
      setViewMode('recipe');
    } catch (err) {
      handleError("Erreur lors de la génération du guide : ", err);
    } finally {
      setLoadingMessage(null);
    }
  }, [generatedRecipe, language, clearError, showModal, closeModal, handleError, t.noRecipeForMealPrep, t.generatingMealPrepGuideDetailed]);

  const handleGetFoodPairingSuggestions = useCallback(async () => {
    clearError();
    if (!foodPairingQuery.trim()) {
      showModal(t.noFoodForPairing, closeModal, closeModal);
      return;
    }

    setLoadingMessage(t.gettingFoodPairingsDetailed);
    setFoodPairingResult('');
    const prompt = `Donne des suggestions d'accords culinaires pour l'ingrédient suivant : "${foodPairingQuery}".
    Les suggestions doivent être en ${language === 'fr' ? 'français' : (language === 'en' ? 'anglais' : (language === 'de' ? 'allemand' : (language === 'es' ? 'espagnol' : 'italien')))}. Formatte la réponse en HTML.`;

    const payload = {
      contents: [{ role: "user", parts: [{ text: prompt }] }],
    };

    try {
      const resultText = await callGeminiApi("gemini-2.5-flash-preview-05-20", payload);
      setFoodPairingResult(resultText);
    } catch (err) {
      handleError("Erreur lors de l'obtention des suggestions : ", err);
    } finally {
      setLoadingMessage(null);
    }
  }, [foodPairingQuery, language, clearError, showModal, closeModal, handleError, t.noFoodForPairing, t.gettingFoodPairingsDetailed]);

  const handleGetIngredientInfo = useCallback(async () => {
    clearError();
    if (!ingredientInfoQuery.trim()) {
      showModal(t.noIngredientForInfo, closeModal, closeModal);
      return;
    }

    const cacheKey = `ingredientInfo_${language}_${ingredientInfoQuery.toLowerCase()}`;
    const cachedData = localStorage.getItem(cacheKey);
    const CACHE_DURATION = 24 * 60 * 60 * 1000;

    if (cachedData) {
      const { data, timestamp } = JSON.parse(cachedData);
      if (Date.now() - timestamp < CACHE_DURATION) {
        console.log('Using cached ingredient info:', ingredientInfoQuery);
        setIngredientInfoResult(data);
        return;
      }
    }

    setLoadingMessage(t.gettingIngredientInfoDetailed);
    setIngredientInfoResult('');
    const prompt = `Donne des informations détaillées sur l'ingrédient suivant : "${ingredientInfoQuery}". Inclue des informations nutritionnelles, des utilisations courantes et des conseils de conservation.
    Les informations doivent être en ${language === 'fr' ? 'français' : (language === 'en' ? 'anglais' : (language === 'de' ? 'allemand' : (language === 'es' ? 'espagnol' : 'italien')))}. Formatte la réponse en HTML.`;

    const payload = {
      contents: [{ role: "user", parts: [{ text: prompt }] }],
    };

    try {
      const resultText = await callGeminiApi("gemini-2.5-flash-preview-05-20", payload);
      setIngredientInfoResult(resultText);
      localStorage.setItem(cacheKey, JSON.stringify({ data: resultText, timestamp: Date.now() }));
    } catch (err) {
      handleError("Erreur lors de l'obtention des informations : ", err);
    } finally {
      setLoadingMessage(null);
    }
  }, [ingredientInfoQuery, language, clearError, showModal, closeModal, handleError, t.noIngredientForInfo, t.gettingIngredientInfoDetailed]);

  const handleOptimizeRecipeHealth = useCallback(async () => {
    clearError();
    if (!generatedRecipe) {
      showModal(t.noRecipeToOptimize, closeModal, closeModal);
      return;
    }
    if (!optimizeRecipePrompt.trim()) {
      showModal("Veuillez décrire vos objectifs de santé.", closeModal, closeModal);
      return;
    }

    setLoadingMessage(t.optimizingRecipeDetailed);
    const prompt = `Optimise la recette suivante pour des objectifs de santé spécifiques :
    ${generatedRecipe}
    Objectifs de santé : "${optimizeRecipePrompt}".
    La recette optimisée doit être en ${language === 'fr' ? 'français' : (language === 'en' ? 'anglais' : (language === 'de' ? 'allemand' : (language === 'es' ? 'espagnol' : 'italien')))}. Formatte la recette en HTML avec des titres (h2, h3), des listes (ul, ol) et des paragraphes (p) pour une meilleure lisibilité.`;

    const payload = {
      contents: [{ role: "user", parts: [{ text: prompt }] }],
    };

    try {
      const resultText = await callGeminiApi("gemini-2.5-flash-preview-05-20", payload);
      setGeneratedRecipe(resultText);
      setOptimizeRecipePrompt('');
      setShowOptimizeRecipeInput(false);
      showModal("Recette optimisée pour la santé !", closeModal, closeModal);
    } catch (err) {
      handleError(t.errorOptimizeRecipe, err);
    } finally {
      setLoadingMessage(null);
    }
  }, [generatedRecipe, optimizeRecipePrompt, language, clearError, showModal, closeModal, handleError, t.noRecipeToOptimize, t.errorOptimizeRecipe, t.optimizingRecipeDetailed]);


  // --- Global Data Management ---
  const handleClearAllData = useCallback(async () => {
    if (!db || !userId) { // Check if db is initialized
      showModal(t.firebaseNotInitialized, closeModal, closeModal);
      return;
    }
    showModal(t.confirmClearAllData, async () => {
      try {
        await deleteDoc(doc(db, `artifacts/${appId}/users/${userId}/user_data/profile`));
        await deleteDoc(doc(db, `artifacts/${appId}/users/${userId}/user_data/daily_recipe_cache`));

        const favoriteDocs = await getDocs(collection(db, `artifacts/${appId}/users/${userId}/favorite_recipes`));
        for (const doc of favoriteDocs.docs) {
          await deleteDoc(doc.ref);
        }

        const historyDocs = await getDocs(collection(db, `artifacts/${appId}/users/${userId}/generated_recipes_history`));
        for (const doc of historyDocs.docs) {
          await deleteDoc(doc.ref);
        }

        setFavoriteRecipes([]);
        setGeneratedRecipesHistory([]);
        setDailyRecipe(null);
        setLastDailyRecipeDate(null);
        setCookingStreak(0);
        setLastCookingLogDate('');
        setLanguage('fr');
        setDarkMode(false);
        setDietaryPreference('none');
        setCuisineType('none');
        setPreparationTime('none');
        setDifficulty('none');
        setDishType('none');
        setIsFirstTimeUser(true);

        resetAllStates();
        closeModal();
        showModal(t.dataCleared, closeModal, closeModal);
      } catch (e) {
        handleError("Erreur lors de l'effacement des données :", e);
      }
    }, closeModal, true);
  }, [showModal, closeModal, resetAllStates, handleError, t.confirmClearAllData, t.dataCleared, userId, db, t.firebaseNotInitialized]);


  // --- Cooking Streak Management ---
  const handleUploadMealPhoto = useCallback(async () => {
    clearError();
    if (!db || !userId) { // Check if db is initialized
      showModal(t.firebaseNotInitialized, closeModal, closeModal);
      return;
    }
    if (!selectedImage) {
      showModal("Veuillez d'abord télécharger une photo de votre plat.", closeModal, closeModal);
      return;
    }

    const today = new Date().toISOString().slice(0, 10);
    if (lastCookingLogDate === today) {
      showModal(t.alreadyLoggedToday, closeModal, closeModal);
      return;
    }

    setLoadingMessage(t.uploadingMealPhotoDetailed);

    let newStreak = cookingStreak;
    const lastLogDateObj = lastCookingLogDate ? new Date(lastCookingLogDate) : null;
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayISO = yesterday.toISOString().slice(0, 10);

    if (lastLogDateObj && lastCookingLogDate === yesterdayISO) {
      newStreak += 1;
    } else {
      newStreak = 1;
    }

    const message = newStreak > cookingStreak ? t.streakIncreased.replace('{streak}', newStreak) : t.streakReset;

    try {
      const userProfileRef = doc(db, `artifacts/${appId}/users/${userId}/user_data/profile`);
      await setDoc(userProfileRef, {
        cookingStreak: newStreak,
        lastCookingLogDate: today,
      }, { merge: true });

      setCookingStreak(newStreak);
      setLastCookingLogDate(today);
      showModal(message, closeModal, closeModal);
    } catch (err) {
      handleError("Erreur lors de l'enregistrement du plat : ", err);
    } finally {
      setLoadingMessage(null);
    }
  }, [selectedImage, lastCookingLogDate, cookingStreak, clearError, showModal, closeModal, handleError, t.alreadyLoggedToday, t.streakIncreased, t.streakReset, t.uploadingMealPhotoDetailed, userId, db, t.firebaseNotInitialized]);


  // --- Filtering logic for favorites and history ---
  const filterRecipes = useCallback((recipes) => {
    return recipes.filter(recipe => {
      const matchesSearch = recipe.title.toLowerCase().includes(favoriteSearchTerm.toLowerCase()) ||
                            recipe.content.toLowerCase().includes(favoriteSearchTerm.toLowerCase());

      const matchesCuisine = favoriteCuisineFilter === 'none' ||
                             (recipe.filters && recipe.filters.cuisineType === favoriteCuisineFilter);
      const matchesTime = favoriteTimeFilter === 'none' ||
                          (recipe.filters && recipe.filters.preparationTime === favoriteTimeFilter);
      const matchesDifficulty = favoriteDifficultyFilter === 'none' ||
                                (recipe.filters && recipe.filters.difficulty === favoriteDifficultyFilter);
      const matchesDietary = favoriteDietaryFilter === 'none' ||
                             (recipe.filters && recipe.filters.dietaryPreference === favoriteDietaryFilter);
      const matchesDishType = favoriteDishTypeFilter === 'none' ||
                              (recipe.filters && recipe.filters.dishType === favoriteDishTypeFilter);

      return matchesSearch && matchesCuisine && matchesTime && matchesDifficulty && matchesDietary && matchesDishType;
    });
  }, [favoriteSearchTerm, favoriteCuisineFilter, favoriteTimeFilter, favoriteDifficultyFilter, favoriteDietaryFilter, favoriteDishTypeFilter]);

  const filteredFavoriteRecipes = useMemo(() => filterRecipes(favoriteRecipes), [favoriteRecipes, filterRecipes]);
  const filteredHistoryRecipes = useMemo(() => filterRecipes(generatedRecipesHistory), [generatedRecipesHistory, filterRecipes]);

  const clearFavoriteFilters = useCallback(() => {
    setFavoriteSearchTerm('');
    setFavoriteCuisineFilter('none');
    setFavoriteTimeFilter('none');
    setFavoriteDifficultyFilter('none');
    setFavoriteDietaryFilter('none');
    setFavoriteDishTypeFilter('none');
  }, []);

  // Variants for page transitions
  const pageVariants = {
    initial: { opacity: 0, x: 200 },
    in: { opacity: 1, x: 0 },
    out: { opacity: 0, x: -200 }
  };

  const pageTransition = {
    type: "tween",
    ease: "easeInOut",
    duration: 0.4
  };

  if (!isAuthReady) {
    return (
      <div className={`min-h-screen flex flex-col items-center justify-center ${darkMode ? 'bg-gray-900 text-gray-100' : 'bg-gray-100 text-gray-800'}`}>
        <Loader2 className="w-16 h-16 animate-spin text-indigo-600" />
        <p className="mt-4 text-lg">Chargement de l'application...</p>
      </div>
    );
  }

  return (
    <div className={`min-h-screen flex flex-col ${darkMode ? 'bg-gradient-to-br from-gray-900 to-gray-800 text-gray-100' : 'bg-gradient-to-br from-red-50 to-orange-100 text-gray-800'} transition-colors duration-300 font-sans`}>
      {/* Custom styles injected */}
      <style>{customStyles}</style>

      {/* Main Content Area */}
      <main className="container mx-auto px-4 py-8 flex-grow overflow-y-auto pb-20"> {/* Added pb-20 for bottom nav */}
        {error && (
          <div className={`mt-4 mb-8 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg flex items-center gap-2 ${darkMode ? 'bg-red-900 border-red-700 text-red-200' : ''} animate-fadeIn`} role="alert">
            <Info className="w-5 h-5" aria-hidden="true" /> {error}
          </div>
        )}

        <AnimatePresence mode='wait'>
          {viewMode === 'upload' && (
            <motion.section
              key="upload"
              initial="initial"
              animate="in"
              exit="out"
              variants={pageVariants}
              transition={pageTransition}
              className={`p-8 rounded-xl shadow-2xl ${darkMode ? 'bg-gray-800' : 'bg-white'} transition-shadow duration-300 glassmorphism`}
            >
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-3 text-indigo-700 dark:text-indigo-400">
                <Eye className="w-7 h-7" aria-hidden="true" /> {t.uploadSectionTitle}
              </h2>

              <div
                className={`border-2 border-dashed border-gray-300 ${darkMode ? 'border-gray-600' : ''} rounded-xl p-10 text-center cursor-pointer transition-all duration-300 relative overflow-hidden group
                ${selectedImage ? 'hover:bg-transparent' : (darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50')}
                ${loadingMessage ? 'pointer-events-none opacity-70' : 'hover:border-indigo-500 dark:hover:border-indigo-400'}
                `}
                onClick={() => !loadingMessage && fileInputRef.current.click()}
                role="button"
                tabIndex="0"
                aria-label={selectedImage ? "Changer l'image du frigo" : "Télécharger une image de votre frigo"}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { !loadingMessage && fileInputRef.current.click(); } }}
              >
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  ref={fileInputRef}
                  className="hidden"
                  id="file-upload"
                />
                <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center justify-center h-full w-full">
                  {selectedImage ? (
                    <>
                      <img src={selectedImage} alt="Selected Fridge" className="max-h-64 object-contain rounded-lg mb-4 shadow-md transition-transform duration-300 group-hover:scale-105 animate-popIn" />
                      <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl">
                        <Camera className="w-12 h-12 text-white animate-float" aria-hidden="true" />
                      </div>
                    </>
                  ) : (
                    <div className="flex flex-col items-center text-gray-500 dark:text-gray-400">
                      <Camera className="w-16 h-16 mb-4 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6" aria-hidden="true" />
                      <p className="text-xl font-medium">{t.uploadSectionTitle}</p>
                      <p className="text-sm mt-1">(JPEG, PNG, GIF)</p>
                    </div>
                  )}
                </label>
              </div>

              <button
                onClick={handleAnalyzeImage}
                className="mt-6 w-full bg-indigo-600 text-white py-3 rounded-lg text-xl font-bold hover:bg-indigo-700 transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transform hover:scale-105 hover:-translate-y-1 active:scale-98 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                disabled={!!loadingMessage || !selectedImage}
                aria-label={loadingMessage ? loadingMessage : t.analyzeButton}
              >
                {loadingMessage && <LoadingSpinner />}
                {loadingMessage ? loadingMessage : t.analyzeButton}
              </button>

              {detectedIngredients.length > 0 && (
                <div className={`mt-8 p-6 border rounded-xl border-gray-200 ${darkMode ? 'border-gray-700 bg-gray-700' : 'bg-gray-50'} shadow-inner animate-fadeInUp glassmorphism`}>
                  <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-indigo-700 dark:text-indigo-400">
                    <Salad className="w-6 h-6" aria-hidden="true" /> {t.ingredientsDetected}
                  </h3>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {detectedIngredients.map((ing, index) => (
                      <span key={index} className={`flex items-center bg-indigo-100 text-indigo-800 text-sm font-medium px-3 py-1 rounded-full ${darkMode ? 'bg-indigo-800 text-indigo-100' : ''} transition-all duration-200 transform hover:scale-105`}>
                        <input
                          type="text"
                          value={ing.name}
                          onChange={(e) => handleUpdateIngredientName(index, e.target.value)}
                          className={`bg-transparent border-none outline-none focus:ring-0 ${darkMode ? 'text-indigo-100' : 'text-indigo-800'} w-20`}
                          aria-label={`Nom de l'ingrédient ${ing.name}`}
                        />
                        <input
                          type="number"
                          value={ing.quantity}
                          onChange={(e) => handleUpdateIngredientQuantity(index, e.target.value)}
                          className={`bg-transparent border-none outline-none focus:ring-0 ${darkMode ? 'text-indigo-100' : 'text-indigo-800'} w-12 text-right ml-1`}
                          min="0"
                          aria-label={`Quantité de ${ing.name}`}
                        />
                        <select
                          value={ing.unit}
                          onChange={(e) => handleUpdateIngredientUnit(index, e.target.value)}
                          className={`bg-transparent border-none outline-none focus:ring-0 ${darkMode ? 'text-indigo-100' : 'text-indigo-800'} w-20 ml-1`}
                          aria-label={`Unité de ${ing.name}`}
                        >
                          <option value="unit">{t.unitUnits}</option>
                          <option value="none">{t.unitNone}</option>
                          <option value="grams">{t.unitGrams}</option>
                          <option value="kilograms">{t.unitKilograms}</option>
                          <option value="milliliters">{t.unitMilliliters}</option>
                          <option value="liters">{t.unitLiters}</option>
                          <option value="cups">{t.unitCups}</option>
                          <option value="spoons">{t.unitSpoons}</option>
                        </select>
                        {ing.expiryDate && (
                          <span className="ml-2 text-xs opacity-80" aria-label={`Date de péremption : ${ing.expiryDate}`}>({ing.expiryDate})</span>
                        )}
                        <button
                          onClick={() => handleRemoveIngredient(index)}
                          className="ml-2 text-indigo-600 hover:text-indigo-800 dark:text-indigo-300 dark:hover:text-indigo-100 font-bold transition-transform hover:scale-125"
                          aria-label={`Supprimer ${ing.name}`}
                        >
                          <X className="w-4 h-4" aria-hidden="true" />
                        </button>
                      </span>
                    ))}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                    <input
                      type="text"
                      placeholder={t.placeholderIngredients}
                      value={newIngredientInput}
                      onChange={(e) => setNewIngredientInput(e.target.value)}
                      className={`col-span-full md:col-span-2 p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 ${darkMode ? 'bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400' : 'bg-white text-gray-800'} transition-all duration-200`}
                      aria-label={t.placeholderIngredients}
                    />
                    <input
                      type="number"
                      placeholder={t.addQuantity}
                      value={newIngredientQuantity}
                      onChange={(e) => setNewIngredientQuantity(e.target.value)}
                      className={`p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 ${darkMode ? 'bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400' : 'bg-white text-gray-800'} transition-all duration-200`}
                      aria-label={t.addQuantity}
                    />
                    <select
                      value={newIngredientUnit}
                      onChange={(e) => setNewIngredientUnit(e.target.value)}
                      className={`p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 ${darkMode ? 'bg-gray-700 border-gray-600 text-gray-100' : 'bg-white text-gray-800'} transition-all duration-200`}
                      aria-label={t.addUnit}
                    >
                      <option value="unit">{t.unitUnits}</option>
                      <option value="none">{t.unitNone}</option>
                      <option value="grams">{t.unitGrams}</option>
                      <option value="kilograms">{t.unitKilograms}</option>
                      <option value="milliliters">{t.unitMilliliters}</option>
                      <option value="liters">{t.unitLiters}</option>
                      <option value="cups">{t.unitCups}</option>
                      <option value="spoons">{t.unitSpoons}</option>
                    </select>
                    <input
                      type="date"
                      placeholder={t.addExpiryDate}
                      value={newIngredientExpiry}
                      onChange={(e) => handleUpdateIngredientExpiry(e.target.value)}
                      className={`col-span-full md:col-span-2 p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 ${darkMode ? 'bg-gray-700 border-gray-600 text-gray-100' : 'bg-white text-gray-800'} transition-all duration-200`}
                      aria-label={t.addExpiryDate}
                    />
                    <button
                      onClick={handleAddIngredient}
                      className="col-span-full bg-indigo-500 text-white px-5 py-2 rounded-lg font-semibold hover:bg-indigo-600 transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 hover:-translate-y-1 active:scale-98"
                      disabled={!newIngredientInput.trim()}
                      aria-label={t.addIngredient}
                    >
                      <PlusCircle className="w-5 h-5 inline-block mr-2 transition-transform duration-200 group-hover:rotate-90" aria-hidden="true" /> {t.addIngredient}
                    </button>
                  </div>

                  {/* New customization filters */}
                  <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Cuisine Type */}
                    <div>
                      <label htmlFor="cuisine-type-select" className="block text-md font-semibold mb-2 text-indigo-700 dark:text-indigo-400 flex items-center gap-1">
                        <ChefHat className="w-4 h-4" aria-hidden="true" /> {t.cuisineType}
                      </label>
                      <select
                        id="cuisine-type-select"
                        value={cuisineType}
                        onChange={(e) => setCuisineType(e.target.value)}
                        className={`w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 ${darkMode ? 'bg-gray-700 border-gray-600 text-gray-100' : 'bg-white text-gray-800'} transition-all duration-200`}
                        aria-label={t.cuisineType}
                      >
                        <option value="none">{t.cuisineNone}</option>
                        <option value="french">{t.cuisineFrench}</option>
                        <option value="italian">{t.cuisineItalian}</option>
                        <option value="asian">{t.cuisineAsian}</option>
                        <option value="mexican">{t.cuisineMexican}</option>
                        <option value="indian">{t.cuisineIndian}</option>
                        <option value="mediterranean">{t.cuisineMediterranean}</option>
                        <option value="american">{t.cuisineAmerican}</option>
                        <option value="other">{t.cuisineOther}</option>
                      </select>
                    </div>

                    {/* Preparation Time */}
                    <div>
                      <label htmlFor="prep-time-select" className="block text-md font-semibold mb-2 text-indigo-700 dark:text-indigo-400 flex items-center gap-1">
                        <Clock className="w-4 h-4" aria-hidden="true" /> {t.prepTime}
                      </label>
                      <select
                        id="prep-time-select"
                        value={preparationTime}
                        onChange={(e) => setPreparationTime(e.target.value)}
                        className={`w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 ${darkMode ? 'bg-gray-700 border-gray-600 text-gray-100' : 'bg-white text-gray-800'} transition-all duration-200`}
                        aria-label={t.prepTime}
                      >
                        <option value="none">{t.timeNone}</option>
                        <option value="quick">{t.timeQuick}</option>
                        <option value="medium">{t.timeMedium}</option>
                        <option value="long">{t.timeLong}</option>
                      </select>
                    </div>

                    {/* Difficulty */}
                    <div>
                      <label htmlFor="difficulty-select" className="block text-md font-semibold mb-2 text-indigo-700 dark:text-indigo-400 flex items-center gap-1">
                        <TrendingUp className="w-4 h-4" aria-hidden="true" /> {t.difficulty}
                      </label>
                      <select
                        id="difficulty-select"
                        value={difficulty}
                        onChange={(e) => setDifficulty(e.target.value)}
                        className={`w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 ${darkMode ? 'bg-gray-700 border-gray-600 text-gray-100' : 'bg-white text-gray-800'} transition-all duration-200`}
                        aria-label={t.difficulty}
                      >
                        <option value="none">{t.difficultyNone}</option>
                        <option value="easy">{t.difficultyEasy}</option>
                        <option value="medium">{t.difficultyMedium}</option>
                        <option value="hard">{t.difficultyHard}</option>
                      </select>
                    </div>

                    {/* Dish Type */}
                    <div>
                      <label htmlFor="dish-type-select" className="block text-md font-semibold mb-2 text-indigo-700 dark:text-indigo-400 flex items-center gap-1">
                        <Utensils className="w-4 h-4" aria-hidden="true" /> {t.dishType}
                      </label>
                      <select
                        id="dish-type-select"
                        value={dishType}
                        onChange={(e) => setDishType(e.target.value)}
                        className={`w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 ${darkMode ? 'bg-gray-700 border-gray-600 text-gray-100' : 'bg-white text-gray-800'} transition-all duration-200`}
                        aria-label={t.dishType}
                      >
                        <option value="none">{t.dishTypeNone}</option>
                        <option value="main">{t.dishTypeMain}</option>
                        <option value="dessert">{t.dishTypeDessert}</option>
                        <option value="appetizer">{t.dishTypeAppetizer}</option>
                        <option value="side">{t.dishTypeSide}</option>
                        <option value="breakfast">{t.dishTypeBreakfast}</option>
                        <option value="soup">{t.dishTypeSoup}</option>
                        <option value="salad">{t.dishTypeSalad}</option>
                        <option value="drink">{t.dishTypeDrink}</option>
                      </select>
                    </div>
                  </div>


                  <button
                    onClick={handleGenerateRecipe}
                    className="mt-6 w-full bg-emerald-600 text-white py-3 rounded-lg text-lg font-bold hover:bg-emerald-700 transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transform hover:scale-105 hover:-translate-y-1 active:scale-98 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    disabled={!!loadingMessage || detectedIngredients.length === 0}
                    aria-label={loadingMessage ? loadingMessage : t.generateRecipeButton}
                  >
                    {loadingMessage && <LoadingSpinner />}
                    {loadingMessage ? loadingMessage : t.generateRecipeButton}
                  </button>
                </div>
              )}
            </motion.section>
          )}

          {viewMode === 'recipe' && (
            <motion.section
              key="recipe"
              initial="initial"
              animate="in"
              exit="out"
              variants={pageVariants}
              transition={pageTransition}
              className={`p-8 rounded-xl shadow-2xl ${darkMode ? 'bg-gray-800' : 'bg-white'} transition-shadow duration-300 glassmorphism`}
            >
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-3 text-indigo-700 dark:text-indigo-400">
                <Utensils className="w-7 h-7" aria-hidden="true" /> {t.recipeTitle}
              </h2>

              {loadingMessage && (
                <div className="py-8">
                  <SkeletonLoader lines={10} className="w-full" />
                  <p className="text-center text-lg text-indigo-600 dark:text-indigo-300 flex items-center justify-center gap-2 mt-4">
                    <Flame className="w-6 h-6 animate-spin" aria-hidden="true" /> {loadingMessage}
                  </p>
                </div>
              )}

              {generatedRecipe && !loadingMessage && (
                <div className={`prose dark:prose-invert max-w-none p-6 rounded-lg ${darkMode ? 'bg-gray-700 text-gray-200' : 'bg-gray-50 text-gray-700'} shadow-inner mb-6 glassmorphism`}>
                  <div dangerouslySetInnerHTML={{ __html: generatedRecipe }}></div>
                  <button
                    onClick={copyRecipeToClipboard}
                    className="mt-4 bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors duration-200 flex items-center gap-2 transform hover:scale-105 active:scale-95"
                    aria-label={copied ? t.copied : t.copyToClipboard}
                  >
                    {copied ? <CheckCircle className="w-4 h-4 text-emerald-500" aria-hidden="true" /> : <Clipboard className="w-4 h-4" aria-hidden="true" />}
                    {copied ? t.copied : t.copyToClipboard}
                  </button>
                </div>
              )}

              {!generatedRecipe && !loadingMessage && (
                <div className="text-center text-gray-500 dark:text-gray-400 py-8">
                  <BookOpenText className="w-20 h-20 mx-auto mb-4 text-gray-400 dark:text-gray-600 animate-float" aria-hidden="true" />
                  <p className="text-lg">{t.noIngredientsForRecipe}</p>
                </div>
              )}

              {generatedRecipe && !loadingMessage && (
                <div className="mt-6 flex flex-wrap gap-4 justify-center">
                  <button
                    onClick={handleToggleFavorite}
                    className={`px-6 py-3 rounded-lg text-lg font-semibold transition-colors duration-300 flex items-center gap-2 shadow-md hover:shadow-lg
                      ${isFavorite(generatedRecipe) ? 'bg-red-500 text-white hover:bg-red-600 focus:ring-red-500' : 'bg-pink-500 text-white hover:bg-pink-600 focus:ring-pink-500'}
                      transform hover:scale-105 hover:-translate-y-1 active:scale-98 focus:outline-none focus:ring-2
                    `}
                    aria-label={isFavorite(generatedRecipe) ? t.removeFromFavorites : t.addToFavorites}
                  >
                    <Heart className="w-5 h-5" aria-hidden="true" /> {isFavorite(generatedRecipe) ? t.removeFromFavorites : t.addToFavorites}
                  </button>
                  <button
                    onClick={() => resetAllStates()}
                    className="px-6 py-3 rounded-lg text-lg font-semibold bg-gray-300 text-gray-800 hover:bg-gray-400 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 transition-colors duration-300 flex items-center gap-2 shadow-md hover:shadow-lg transform hover:scale-105 hover:-translate-y-1 active:scale-98 focus:outline-none focus:ring-2 focus:ring-gray-500"
                    aria-label={t.newAnalysis}
                  >
                    <Camera className="w-5 h-5" aria-hidden="true" /> {t.newAnalysis}
                  </button>
                </div>
              )}

              {/* LLM Adaptations */}
              {generatedRecipe && !loadingMessage && (
                <div className="mt-10 pt-8 border-t border-gray-200 dark:border-gray-700">
                  <h3 className="text-xl font-bold mb-4 text-indigo-700 dark:text-indigo-400">Améliorez votre recette :</h3>

                  {/* Adapt Recipe */}
                  <div className={`mb-4 p-4 rounded-xl border border-gray-200 ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white'} shadow-md transition-all duration-300 ease-in-out overflow-hidden glassmorphism`}>
                    <button
                      onClick={() => setShowAdaptRecipeInput(prev => !prev)}
                      className="w-full text-left font-semibold text-lg flex items-center justify-between py-2 hover:text-indigo-600 dark:hover:text-indigo-300 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded-md"
                      aria-expanded={showAdaptRecipeInput}
                      aria-controls="adapt-recipe-panel"
                    >
                      <span className="flex items-center gap-2"><Salad className="w-5 h-5" aria-hidden="true" /> {t.adaptRecipe}</span>
                      <ChevronDown className={`w-5 h-5 transition-transform duration-300 ${showAdaptRecipeInput ? 'rotate-180' : ''}`} aria-hidden="true" />
                    </button>
                    {showAdaptRecipeInput && (
                      <motion.div
                        id="adapt-recipe-panel"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                        className="mt-4"
                      >
                        <input
                          type="text"
                          placeholder={t.enterAdaptRequest}
                          value={adaptRecipePrompt}
                          onChange={(e) => setAdaptRecipePrompt(e.target.value)}
                          className={`w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 ${darkMode ? 'bg-gray-900 border-gray-600 text-gray-100 placeholder-gray-400' : 'bg-white text-gray-800'} transition-all duration-200`}
                          disabled={!!loadingMessage}
                          aria-label={t.enterAdaptRequest}
                        />
                        <button
                          onClick={handleAdaptRecipe}
                          className="mt-3 w-full bg-emerald-600 text-white py-2 rounded-lg font-semibold hover:bg-emerald-700 transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 active:scale-95"
                          disabled={!!loadingMessage || !adaptRecipePrompt.trim()}
                          aria-label={loadingMessage ? loadingMessage : t.adapt}
                        >
                          {loadingMessage && <LoadingSpinner />}
                          {loadingMessage ? loadingMessage : t.adapt}
                        </button>
                      </motion.div>
                    )}
                  </div>

                  {/* Substitute Ingredient */}
                  <div className={`mb-4 p-4 rounded-xl border border-gray-200 ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white'} shadow-md transition-all duration-300 ease-in-out overflow-hidden glassmorphism`}>
                    <button
                      onClick={() => setShowSubstituteIngredientInput(prev => !prev)}
                      className="w-full text-left font-semibold text-lg flex items-center justify-between py-2 hover:text-indigo-600 dark:hover:text-indigo-300 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded-md"
                      aria-expanded={showSubstituteIngredientInput}
                      aria-controls="substitute-ingredient-panel"
                    >
                      <span className="flex items-center gap-2"><Apple className="w-5 h-5" aria-hidden="true" /> {t.substituteIngredient}</span>
                      <ChevronDown className={`w-5 h-5 transition-transform duration-300 ${showSubstituteIngredientInput ? 'rotate-180' : ''}`} aria-hidden="true" />
                    </button>
                    {showSubstituteIngredientInput && (
                      <motion.div
                        id="substitute-ingredient-panel"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                        className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4"
                      >
                        <input
                          type="text"
                          placeholder={t.enterIngredientToSubstitute}
                          value={ingredientToSubstitute}
                          onChange={(e) => setIngredientToSubstitute(e.target.value)}
                          className={`p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 ${darkMode ? 'bg-gray-900 border-gray-600 text-gray-100 placeholder-gray-400' : 'bg-white text-gray-800'} transition-all duration-200`}
                          disabled={!!loadingMessage}
                          aria-label={t.enterIngredientToSubstitute}
                        />
                        <input
                          type="text"
                          placeholder={t.enterSubstituteWith}
                          value={substituteWith}
                          onChange={(e) => setSubstituteWith(e.target.value)}
                          className={`p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 ${darkMode ? 'bg-gray-900 border-gray-600 text-gray-100 placeholder-gray-400' : 'bg-white text-gray-800'} transition-all duration-200`}
                          disabled={!!loadingMessage}
                          aria-label={t.enterSubstituteWith}
                        />
                        <button
                          onClick={handleSubstituteIngredient}
                          className="md:col-span-2 bg-emerald-600 text-white py-2 rounded-lg font-semibold hover:bg-emerald-700 transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 active:scale-95"
                          disabled={!!loadingMessage || !ingredientToSubstitute.trim()}
                          aria-label={loadingMessage ? loadingMessage : t.substitute}
                        >
                          {loadingMessage && <LoadingSpinner />}
                          {loadingMessage ? loadingMessage : t.substitute}
                        </button>
                      </motion.div>
                    )}
                  </div>

                  {/* Scale Recipe */}
                  <div className={`mb-4 p-4 rounded-xl border border-gray-200 ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white'} shadow-md transition-all duration-300 ease-in-out overflow-hidden glassmorphism`}>
                    <button
                      onClick={() => setShowScaleRecipeInput(prev => !prev)}
                      className="w-full text-left font-semibold text-lg flex items-center justify-between py-2 hover:text-indigo-600 dark:hover:text-indigo-300 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded-md"
                      aria-expanded={showScaleRecipeInput}
                      aria-controls="scale-recipe-panel"
                    >
                      <span className="flex items-center gap-2"><Package className="w-5 h-5" aria-hidden="true" /> {t.scaleRecipe}</span>
                      <ChevronDown className={`w-5 h-5 transition-transform duration-300 ${showScaleRecipeInput ? 'rotate-180' : ''}`} aria-hidden="true" />
                    </button>
                    {showScaleRecipeInput && (
                      <motion.div
                        id="scale-recipe-panel"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                        className="mt-4"
                      >
                        <input
                          type="number"
                          placeholder={t.enterServings}
                          value={scaleServings}
                          onChange={(e) => setScaleServings(e.target.value)}
                          className={`w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 ${darkMode ? 'bg-gray-900 border-gray-600 text-gray-100 placeholder-gray-400' : 'bg-white text-gray-800'} transition-all duration-200`}
                          disabled={!!loadingMessage}
                          aria-label={t.enterServings}
                        />
                        <button
                          onClick={handleScaleRecipe}
                          className="mt-3 w-full bg-emerald-600 text-white py-2 rounded-lg font-semibold hover:bg-emerald-700 transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 active:scale-95"
                          disabled={!!loadingMessage || !scaleServings}
                          aria-label={loadingMessage ? loadingMessage : t.scale}
                        >
                          {loadingMessage && <LoadingSpinner />}
                          {loadingMessage ? loadingMessage : t.scale}
                        </button>
                      </motion.div>
                    )}
                  </div>

                  {/* Optimize Recipe Health */}
                  <div className={`mb-4 p-4 rounded-xl border border-gray-200 ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white'} shadow-md transition-all duration-300 ease-in-out overflow-hidden glassmorphism`}>
                    <button
                      onClick={() => setShowOptimizeRecipeInput(prev => !prev)}
                      className="w-full text-left font-semibold text-lg flex items-center justify-between py-2 hover:text-indigo-600 dark:hover:text-indigo-300 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded-md"
                      aria-expanded={showOptimizeRecipeInput}
                      aria-controls="optimize-recipe-panel"
                    >
                      <span className="flex items-center gap-2"><Heart className="w-5 h-5" aria-hidden="true" /> {t.optimizeRecipeHealth}</span>
                      <ChevronDown className={`w-5 h-5 transition-transform duration-300 ${showOptimizeRecipeInput ? 'rotate-180' : ''}`} aria-hidden="true" />
                    </button>
                    {showOptimizeRecipeInput && (
                      <motion.div
                        id="optimize-recipe-panel"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                        className="mt-4"
                      >
                        <input
                          type="text"
                          placeholder={t.enterHealthGoals}
                          value={optimizeRecipePrompt}
                          onChange={(e) => setOptimizeRecipePrompt(e.target.value)}
                          className={`w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 ${darkMode ? 'bg-gray-900 border-gray-600 text-gray-100 placeholder-gray-400' : 'bg-white text-gray-800'} transition-all duration-200`}
                          disabled={!!loadingMessage}
                          aria-label={t.enterHealthGoals}
                        />
                        <button
                          onClick={handleOptimizeRecipeHealth}
                          className="mt-3 w-full bg-emerald-600 text-white py-2 rounded-lg font-semibold hover:bg-emerald-700 transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 active:scale-95"
                          disabled={!!loadingMessage || !optimizeRecipePrompt.trim()}
                          aria-label={loadingMessage ? loadingMessage : t.optimize}
                        >
                          {loadingMessage && <LoadingSpinner />}
                          {loadingMessage ? loadingMessage : t.optimize}
                        </button>
                      </motion.div>
                    )}
                  </div>

                  {/* Ask Cooking Tip */}
                  <div className={`mb-4 p-4 rounded-xl border border-gray-200 ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white'} shadow-md transition-all duration-300 ease-in-out overflow-hidden glassmorphism`}>
                    <button
                      onClick={() => setShowCookingTipInput(prev => !prev)}
                      className="w-full text-left font-semibold text-lg flex items-center justify-between py-2 hover:text-indigo-600 dark:hover:text-indigo-300 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded-md"
                      aria-expanded={showCookingTipInput}
                      aria-controls="cooking-tip-panel"
                    >
                      <span className="flex items-center gap-2"><Lightbulb className="w-5 h-5" aria-hidden="true" /> {t.askCookingTip}</span>
                      <ChevronDown className={`w-5 h-5 transition-transform duration-300 ${showCookingTipInput ? 'rotate-180' : ''}`} aria-hidden="true" />
                    </button>
                    {showCookingTipInput && (
                      <motion.div
                        id="cooking-tip-panel"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                        className="mt-4"
                      >
                        <input
                          type="text"
                          placeholder={t.enterCookingQuestion}
                          value={cookingTipPrompt}
                          onChange={(e) => setCookingTipPrompt(e.target.value)}
                          className={`w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 ${darkMode ? 'bg-gray-900 border-gray-600 text-gray-100 placeholder-gray-400' : 'bg-white text-gray-800'} transition-all duration-200`}
                          disabled={!!loadingMessage}
                          aria-label={t.enterCookingQuestion}
                        />
                        <button
                          onClick={handleAskCookingTip}
                          className="mt-3 w-full bg-emerald-600 text-white py-2 rounded-lg font-semibold hover:bg-emerald-700 transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 active:scale-95"
                          disabled={!!loadingMessage || !cookingTipPrompt.trim()}
                          aria-label={loadingMessage ? loadingMessage : t.ask}
                        >
                          {loadingMessage && <LoadingSpinner />}
                          {loadingMessage ? loadingMessage : t.ask}
                        </button>
                        {cookingTipResult && (
                          <div className={`mt-4 p-4 rounded-lg ${darkMode ? 'bg-gray-800 text-gray-200' : 'bg-blue-50 text-blue-800'} border border-blue-200 dark:border-blue-700 animate-fadeIn`}>
                            <h4 className="font-bold mb-2 flex items-center gap-2"><Info className="w-5 h-5" aria-hidden="true" />{t.cookingTip}</h4>
                            <div className="prose dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: cookingTipResult }}></div>
                          </div>
                        )}
                      </motion.div>
                    )}
                  </div>

                  {/* Meal Prep Guide */}
                  <div className={`mb-4 p-4 rounded-xl border border-gray-200 ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white'} shadow-md transition-all duration-300 ease-in-out overflow-hidden glassmorphism`}>
                    <button
                      onClick={handleGenerateMealPrepGuide}
                      className="w-full text-left font-semibold text-lg flex items-center justify-between py-2 hover:text-indigo-600 dark:hover:text-indigo-300 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded-md"
                      disabled={!!loadingMessage || !generatedRecipe}
                      aria-label={loadingMessage ? loadingMessage : t.mealPrepGuide}
                    >
                      <span className="flex items-center gap-2"><ChefHat className="w-5 h-5" aria-hidden="true" /> {t.mealPrepGuide}</span>
                      {loadingMessage && <LoadingSpinner />}
                      {!loadingMessage && <CheckCircle className="w-5 h-5 text-emerald-500" aria-hidden="true" />}
                    </button>
                  </div>

                  {/* Food Pairing Suggestions */}
                  <div className={`mb-4 p-4 rounded-xl border border-gray-200 ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white'} shadow-md transition-all duration-300 ease-in-out overflow-hidden glassmorphism`}>
                    <button
                      onClick={() => setShowFoodPairingInput(prev => !prev)}
                      className="w-full text-left font-semibold text-lg flex items-center justify-between py-2 hover:text-indigo-600 dark:hover:text-indigo-300 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded-md"
                      aria-expanded={showFoodPairingInput}
                      aria-controls="food-pairing-panel"
                    >
                      <span className="flex items-center gap-2"><Salad className="w-5 h-5" aria-hidden="true" /> {t.foodPairingSuggestions}</span>
                      <ChevronDown className={`w-5 h-5 transition-transform duration-300 ${showFoodPairingInput ? 'rotate-180' : ''}`} aria-hidden="true" />
                    </button>
                    {showFoodPairingInput && (
                      <motion.div
                        id="food-pairing-panel"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                        className="mt-4"
                      >
                        <input
                          type="text"
                          placeholder={t.enterFoodForPairing}
                          value={foodPairingQuery}
                          onChange={(e) => setFoodPairingQuery(e.target.value)}
                          className={`w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 ${darkMode ? 'bg-gray-900 border-gray-600 text-gray-100 placeholder-gray-400' : 'bg-white text-gray-800'} transition-all duration-200`}
                          disabled={!!loadingMessage}
                          aria-label={t.enterFoodForPairing}
                        />
                        <button
                          onClick={handleGetFoodPairingSuggestions}
                          className="mt-3 w-full bg-emerald-600 text-white py-2 rounded-lg font-semibold hover:bg-emerald-700 transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 active:scale-95"
                          disabled={!!loadingMessage || !foodPairingQuery.trim()}
                          aria-label={loadingMessage ? loadingMessage : t.ask}
                        >
                          {loadingMessage && <LoadingSpinner />}
                          {loadingMessage ? loadingMessage : t.ask}
                        </button>
                        {foodPairingResult && (
                          <div className={`mt-4 p-4 rounded-lg ${darkMode ? 'bg-gray-800 text-gray-200' : 'bg-blue-50 text-blue-800'} border border-blue-200 dark:border-blue-700 animate-fadeIn`}>
                            <h4 className="font-bold mb-2 flex items-center gap-2"><Info className="w-5 h-5" aria-hidden="true" />{t.foodPairingResultTitle} {foodPairingQuery} :</h4>
                            <div className="prose dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: foodPairingResult }}></div>
                          </div>
                        )}
                      </motion.div>
                    )}
                  </div>

                  {/* Get Ingredient Info */}
                  <div className={`mb-4 p-4 rounded-xl border border-gray-200 ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white'} shadow-md transition-all duration-300 ease-in-out overflow-hidden glassmorphism`}>
                    <button
                      onClick={() => setShowIngredientInfoInput(prev => !prev)}
                      className="w-full text-left font-semibold text-lg flex items-center justify-between py-2 hover:text-indigo-600 dark:hover:text-indigo-300 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded-md"
                      aria-expanded={showIngredientInfoInput}
                      aria-controls="ingredient-info-panel"
                    >
                      <span className="flex items-center gap-2"><Search className="w-5 h-5" aria-hidden="true" /> {t.getIngredientInfo}</span>
                      <ChevronDown className={`w-5 h-5 transition-transform duration-300 ${showIngredientInfoInput ? 'rotate-180' : ''}`} aria-hidden="true" />
                    </button>
                    {showIngredientInfoInput && (
                      <motion.div
                        id="ingredient-info-panel"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                        className="mt-4"
                      >
                        <input
                          type="text"
                          placeholder={t.enterIngredientName}
                          value={ingredientInfoQuery}
                          onChange={(e) => setIngredientInfoQuery(e.target.value)}
                          className={`w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 ${darkMode ? 'bg-gray-900 border-gray-600 text-gray-100 placeholder-gray-400' : 'bg-white text-gray-800'} transition-all duration-200`}
                          disabled={!!loadingMessage}
                          aria-label={t.enterIngredientName}
                        />
                        <button
                          onClick={handleGetIngredientInfo}
                          className="mt-3 w-full bg-emerald-600 text-white py-2 rounded-lg font-semibold hover:bg-emerald-700 transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 active:scale-95"
                          disabled={!!loadingMessage || !ingredientInfoQuery.trim()}
                          aria-label={loadingMessage ? loadingMessage : t.ask}
                        >
                          {loadingMessage && <LoadingSpinner />}
                          {loadingMessage ? loadingMessage : t.ask}
                        </button>
                        {ingredientInfoResult && (
                          <div className={`mt-4 p-4 rounded-lg ${darkMode ? 'bg-gray-800 text-gray-200' : 'bg-blue-50 text-blue-800'} border border-blue-200 dark:border-blue-700 animate-fadeIn`}>
                            <h4 className="font-bold mb-2 flex items-center gap-2"><Info className="w-5 h-5" aria-hidden="true" />{t.ingredientInfo} :</h4>
                            <div className="prose dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: ingredientInfoResult }}></div>
                          </div>
                        )}
                      </motion.div>
                    )}
                  </div>

                </div>
              )}
            </motion.section>
          )}

          {viewMode === 'favorites' && (
            <motion.section
              key="favorites"
              initial="initial"
              animate="in"
              exit="out"
              variants={pageVariants}
              transition={pageTransition}
              className={`p-8 rounded-xl shadow-2xl ${darkMode ? 'bg-gray-800' : 'bg-white'} transition-shadow duration-300 glassmorphism`}
            >
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-3 text-indigo-700 dark:text-indigo-400">
                <Heart className="w-7 h-7" aria-hidden="true" /> {t.favorites}
              </h2>

              {/* Filters for favorites */}
              <div className={`mb-6 p-4 rounded-xl border border-gray-200 ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50'} shadow-inner glassmorphism`}>
                <h3 className="text-xl font-bold mb-4 text-indigo-700 dark:text-indigo-400">Filtrer les favoris :</h3>
                <input
                  type="text"
                  placeholder={t.searchRecipes}
                  value={favoriteSearchTerm}
                  onChange={(e) => setFavoriteSearchTerm(e.target.value)}
                  className={`w-full p-3 mb-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 ${darkMode ? 'bg-gray-900 border-gray-600 text-gray-100 placeholder-gray-400' : 'bg-white text-gray-800'} transition-all duration-200`}
                  aria-label={t.searchRecipes}
                />
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {/* Cuisine Type */}
                  <div>
                    <label htmlFor="fav-cuisine-filter" className="block text-sm font-semibold mb-1 text-gray-700 dark:text-gray-300">{t.filterByCuisine}</label>
                    <select
                      id="fav-cuisine-filter"
                      value={favoriteCuisineFilter}
                      onChange={(e) => setFavoriteCuisineFilter(e.target.value)}
                      className={`w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 ${darkMode ? 'bg-gray-900 border-gray-600 text-gray-100' : 'bg-white text-gray-800'} transition-all duration-200`}
                      aria-label={t.filterByCuisine}
                    >
                      <option value="none">{t.cuisineNone}</option>
                      <option value="french">{t.cuisineFrench}</option>
                      <option value="italian">{t.cuisineItalian}</option>
                      <option value="asian">{t.cuisineAsian}</option>
                      <option value="mexican">{t.cuisineMexican}</option>
                      <option value="indian">{t.cuisineIndian}</option>
                      <option value="mediterranean">{t.cuisineMediterranean}</option>
                      <option value="american">{t.cuisineAmerican}</option>
                      <option value="other">{t.cuisineOther}</option>
                    </select>
                  </div>
                  {/* Preparation Time */}
                  <div>
                    <label htmlFor="fav-time-filter" className="block text-sm font-semibold mb-1 text-gray-700 dark:text-gray-300">{t.filterByTime}</label>
                    <select
                      id="fav-time-filter"
                      value={favoriteTimeFilter}
                      onChange={(e) => setFavoriteTimeFilter(e.target.value)}
                      className={`w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 ${darkMode ? 'bg-gray-900 border-gray-600 text-gray-100' : 'bg-white text-gray-800'} transition-all duration-200`}
                      aria-label={t.filterByTime}
                    >
                      <option value="none">{t.timeNone}</option>
                      <option value="quick">{t.timeQuick}</option>
                      <option value="medium">{t.timeMedium}</option>
                      <option value="long">{t.timeLong}</option>
                    </select>
                  </div>
                  {/* Difficulty */}
                  <div>
                    <label htmlFor="fav-difficulty-filter" className="block text-sm font-semibold mb-1 text-gray-700 dark:text-gray-300">{t.filterByDifficulty}</label>
                    <select
                      id="fav-difficulty-filter"
                      value={favoriteDifficultyFilter}
                      onChange={(e) => setFavoriteDifficultyFilter(e.target.value)}
                      className={`w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 ${darkMode ? 'bg-gray-900 border-gray-600 text-gray-100' : 'bg-white text-gray-800'} transition-all duration-200`}
                      aria-label={t.filterByDifficulty}
                    >
                      <option value="none">{t.difficultyNone}</option>
                      <option value="easy">{t.difficultyEasy}</option>
                      <option value="medium">{t.difficultyMedium}</option>
                      <option value="hard">{t.difficultyHard}</option>
                    </select>
                  </div>
                  {/* Dietary Preference */}
                  <div>
                    <label htmlFor="fav-dietary-filter" className="block text-sm font-semibold mb-1 text-gray-700 dark:text-gray-300">{t.filterByDietary}</label>
                    <select
                      id="fav-dietary-filter"
                      value={favoriteDietaryFilter}
                      onChange={(e) => setFavoriteDietaryFilter(e.target.value)}
                      className={`w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 ${darkMode ? 'bg-gray-900 border-gray-600 text-gray-100' : 'bg-white text-gray-800'} transition-all duration-200`}
                      aria-label={t.filterByDietary}
                    >
                      <option value="none">{t.dietaryNone}</option>
                      <option value="vegetarian">{t.dietaryVegetarian}</option>
                      <option value="vegan">{t.dietaryVegan}</option>
                      <option value="gluten-free">{t.dietaryGlutenFree}</option>
                      <option value="halal">{t.dietaryHalal}</option>
                      <option value="kosher">{t.dietaryKosher}</option>
                    </select>
                  </div>
                  {/* Dish Type */}
                  <div>
                    <label htmlFor="fav-dish-type-filter" className="block text-sm font-semibold mb-1 text-gray-700 dark:text-gray-300">{t.filterByDishType}</label>
                    <select
                      id="fav-dish-type-filter"
                      value={favoriteDishTypeFilter}
                      onChange={(e) => setFavoriteDishTypeFilter(e.target.value)}
                      className={`w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 ${darkMode ? 'bg-gray-900 border-gray-600 text-gray-100' : 'bg-white text-gray-800'} transition-all duration-200`}
                      aria-label={t.filterByDishType}
                    >
                      <option value="none">{t.dishTypeNone}</option>
                      <option value="main">{t.dishTypeMain}</option>
                      <option value="dessert">{t.dishTypeDessert}</option>
                      <option value="appetizer">{t.dishTypeAppetizer}</option>
                      <option value="side">{t.dishTypeSide}</option>
                      <option value="breakfast">{t.dishTypeBreakfast}</option>
                      <option value="soup">{t.dishTypeSoup}</option>
                      <option value="salad">{t.dishTypeSalad}</option>
                      <option value="drink">{t.dishTypeDrink}</option>
                    </select>
                  </div>
                  <button
                    onClick={clearFavoriteFilters}
                    className="col-span-full bg-gray-300 text-gray-800 px-5 py-2 rounded-lg font-semibold hover:bg-gray-400 dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500 transition-colors duration-200 transform hover:scale-105 active:scale-95"
                    aria-label={t.clearFilters}
                  >
                    <Eraser className="w-5 h-5 inline-block mr-2" aria-hidden="true" /> {t.clearFilters}
                  </button>
                </div>
              </div>


              {filteredFavoriteRecipes.length === 0 ? (
                <div className="text-center text-gray-500 dark:text-gray-400 py-8">
                  <BookOpenText className="w-20 h-20 mx-auto mb-4 text-gray-400 dark:text-gray-600 animate-float" aria-hidden="true" />
                  <p className="text-lg">{t.noFavorites}</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredFavoriteRecipes.map((recipe, index) => (
                    <motion.div
                      key={recipe.id}
                      initial={{ opacity: 0, y: 50 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                      whileHover={{ scale: 1.03, boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)" }}
                      className={`p-5 rounded-xl border border-gray-200 ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white'} shadow-lg flex flex-col glassmorphism`}
                    >
                      <h3 className="text-lg font-semibold mb-3 text-indigo-600 dark:text-indigo-300">{recipe.title}</h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                        {recipe.filters && (
                          <>
                            {recipe.filters.cuisineType !== 'none' && `${t[`cuisine${recipe.filters.cuisineType.charAt(0).toUpperCase() + recipe.filters.cuisineType.slice(1)}`]} | `}
                            {recipe.filters.preparationTime !== 'none' && `${t[`time${recipe.filters.preparationTime.charAt(0).toUpperCase() + recipe.filters.preparationTime.slice(1)}`]} | `}
                            {recipe.filters.difficulty !== 'none' && `${t[`difficulty${recipe.filters.difficulty.charAt(0).toUpperCase() + recipe.filters.difficulty.slice(1)}`]} | `}
                            {recipe.filters.dietaryPreference !== 'none' && `${t[`dietary${recipe.filters.dietaryPreference.charAt(0).toUpperCase() + recipe.filters.dietaryPreference.slice(1)}`]} | `}
                            {recipe.filters.dishType !== 'none' && `${t[`dishType${recipe.filters.dishType.charAt(0).toUpperCase() + recipe.filters.dishType.slice(1)}`]}`}
                          </>
                        )}
                      </p>
                      <div className="prose dark:prose-invert max-w-none text-sm overflow-hidden h-32 mb-4">
                        <div dangerouslySetInnerHTML={{ __html: recipe.content }}></div>
                      </div>
                      <div className="mt-auto flex justify-between items-center pt-4 border-t border-gray-200 dark:border-gray-600">
                        <button
                          onClick={() => { setGeneratedRecipe(recipe.content); setViewMode('recipe'); }}
                          className="bg-indigo-500 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-indigo-600 transition-colors duration-300 transform hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          aria-label={t.viewRecipe}
                        >
                          {t.viewRecipe}
                        </button>
                        <button
                          onClick={() => handleDeleteFavorite(recipe.id)}
                          className="text-red-500 hover:text-red-700 transition-colors duration-300 ml-4 transform hover:scale-125 focus:outline-none focus:ring-2 focus:ring-red-500 rounded-full p-1"
                          aria-label={t.removeFromFavorites}
                        >
                          <X className="w-5 h-5" aria-hidden="true" />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.section>
          )}

          {viewMode === 'history' && (
            <motion.section
              key="history"
              initial="initial"
              animate="in"
              exit="out"
              variants={pageVariants}
              transition={pageTransition}
              className={`p-8 rounded-xl shadow-2xl ${darkMode ? 'bg-gray-800' : 'bg-white'} transition-shadow duration-300 glassmorphism`}
            >
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-3 text-indigo-700 dark:text-indigo-400">
                <History className="w-7 h-7" aria-hidden="true" /> {t.history}
              </h2>

              {/* Filters for history (reusing same states as favorites for demo) */}
              <div className={`mb-6 p-4 rounded-xl border border-gray-200 ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50'} shadow-inner glassmorphism`}>
                <h3 className="text-xl font-bold mb-4 text-indigo-700 dark:text-indigo-400">Filtrer l'historique :</h3>
                <input
                  type="text"
                  placeholder={t.searchRecipes}
                  value={favoriteSearchTerm}
                  onChange={(e) => setFavoriteSearchTerm(e.target.value)}
                  className={`w-full p-3 mb-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 ${darkMode ? 'bg-gray-900 border-gray-600 text-gray-100 placeholder-gray-400' : 'bg-white text-gray-800'} transition-all duration-200`}
                  aria-label={t.searchRecipes}
                />
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {/* Cuisine Type */}
                  <div>
                    <label htmlFor="hist-cuisine-filter" className="block text-sm font-semibold mb-1 text-gray-700 dark:text-gray-300">{t.filterByCuisine}</label>
                    <select
                      id="hist-cuisine-filter"
                      value={favoriteCuisineFilter}
                      onChange={(e) => setFavoriteCuisineFilter(e.target.value)}
                      className={`w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 ${darkMode ? 'bg-gray-900 border-gray-600 text-gray-100' : 'bg-white text-gray-800'} transition-all duration-200`}
                      aria-label={t.filterByCuisine}
                    >
                      <option value="none">{t.cuisineNone}</option>
                      <option value="french">{t.cuisineFrench}</option>
                      <option value="italian">{t.cuisineItalian}</option>
                      <option value="asian">{t.cuisineAsian}</option>
                      <option value="mexican">{t.cuisineMexican}</option>
                      <option value="indian">{t.cuisineIndian}</option>
                      <option value="mediterranean">{t.cuisineMediterranean}</option>
                      <option value="american">{t.cuisineAmerican}</option>
                      <option value="other">{t.cuisineOther}</option>
                    </select>
                  </div>
                  {/* Preparation Time */}
                  <div>
                    <label htmlFor="hist-time-filter" className="block text-sm font-semibold mb-1 text-gray-700 dark:text-gray-300">{t.filterByTime}</label>
                    <select
                      id="hist-time-filter"
                      value={favoriteTimeFilter}
                      onChange={(e) => setFavoriteTimeFilter(e.target.value)}
                      className={`w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 ${darkMode ? 'bg-gray-900 border-gray-600 text-gray-100' : 'bg-white text-gray-800'} transition-all duration-200`}
                      aria-label={t.filterByTime}
                    >
                      <option value="none">{t.timeNone}</option>
                      <option value="quick">{t.timeQuick}</option>
                      <option value="medium">{t.timeMedium}</option>
                      <option value="long">{t.timeLong}</option>
                    </select>
                  </div>
                  {/* Difficulty */}
                  <div>
                    <label htmlFor="hist-difficulty-filter" className="block text-sm font-semibold mb-1 text-gray-700 dark:text-gray-300">{t.filterByDifficulty}</label>
                    <select
                      id="hist-difficulty-filter"
                      value={favoriteDifficultyFilter}
                      onChange={(e) => setFavoriteDifficultyFilter(e.target.value)}
                      className={`w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 ${darkMode ? 'bg-gray-900 border-gray-600 text-gray-100' : 'bg-white text-gray-800'} transition-all duration-200`}
                      aria-label={t.filterByDifficulty}
                    >
                      <option value="none">{t.difficultyNone}</option>
                      <option value="easy">{t.difficultyEasy}</option>
                      <option value="medium">{t.difficultyMedium}</option>
                      <option value="hard">{t.difficultyHard}</option>
                    </select>
                  </div>
                  {/* Dietary Preference */}
                  <div>
                    <label htmlFor="hist-dietary-filter" className="block text-sm font-semibold mb-1 text-gray-700 dark:text-gray-300">{t.filterByDietary}</label>
                    <select
                      id="hist-dietary-filter"
                      value={favoriteDietaryFilter}
                      onChange={(e) => setFavoriteDietaryFilter(e.target.value)}
                      className={`w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 ${darkMode ? 'bg-gray-900 border-gray-600 text-gray-100' : 'bg-white text-gray-800'} transition-all duration-200`}
                      aria-label={t.filterByDietary}
                    >
                      <option value="none">{t.dietaryNone}</option>
                      <option value="vegetarian">{t.dietaryVegetarian}</option>
                      <option value="vegan">{t.dietaryVegan}</option>
                      <option value="gluten-free">{t.dietaryGlutenFree}</option>
                      <option value="halal">{t.dietaryHalal}</option>
                      <option value="kosher">{t.dietaryKosher}</option>
                    </select>
                  </div>
                  {/* Dish Type */}
                  <div>
                    <label htmlFor="hist-dish-type-filter" className="block text-sm font-semibold mb-1 text-gray-700 dark:text-gray-300">{t.filterByDishType}</label>
                    <select
                      id="hist-dish-type-filter"
                      value={favoriteDishTypeFilter}
                      onChange={(e) => setFavoriteDishTypeFilter(e.target.value)}
                      className={`w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 ${darkMode ? 'bg-gray-900 border-gray-600 text-gray-100' : 'bg-white text-gray-800'} transition-all duration-200`}
                      aria-label={t.filterByDishType}
                    >
                      <option value="none">{t.dishTypeNone}</option>
                      <option value="main">{t.dishTypeMain}</option>
                      <option value="dessert">{t.dishTypeDessert}</option>
                      <option value="appetizer">{t.dishTypeAppetizer}</option>
                      <option value="side">{t.dishTypeSide}</option>
                      <option value="breakfast">{t.dishTypeBreakfast}</option>
                      <option value="soup">{t.dishTypeSoup}</option>
                      <option value="salad">{t.dishTypeSalad}</option>
                      <option value="drink">{t.dishTypeDrink}</option>
                    </select>
                  </div>
                  <button
                    onClick={clearFavoriteFilters}
                    className="col-span-full bg-gray-300 text-gray-800 px-5 py-2 rounded-lg font-semibold hover:bg-gray-400 dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500 transition-colors duration-200 transform hover:scale-105 active:scale-95"
                    aria-label={t.clearFilters}
                  >
                    <Eraser className="w-5 h-5 inline-block mr-2" aria-hidden="true" /> {t.clearFilters}
                  </button>
                </div>
              </div>

              {filteredHistoryRecipes.length === 0 ? (
                <div className="text-center text-gray-500 dark:text-gray-400 py-8">
                  <BookOpenText className="w-20 h-20 mx-auto mb-4 text-gray-400 dark:text-gray-600 animate-float" aria-hidden="true" />
                  <p className="text-lg">{t.noHistory}</p>
                </div>
              ) : (
                <div className="relative pl-6 md:pl-12">
                  {filteredHistoryRecipes.map((recipe, index) => (
                    <motion.div
                      key={recipe.id}
                      initial={{ opacity: 0, y: 50 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                      className={`mb-8 p-5 rounded-xl border border-gray-200 ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white'} shadow-lg glassmorphism relative`}
                    >
                      {/* Timeline dot and line */}
                      <div className="absolute left-[-20px] md:left-[-40px] top-0 h-full flex flex-col items-center">
                        <div className="w-4 h-4 rounded-full bg-indigo-500 dark:bg-indigo-400 z-10 flex-shrink-0"></div>
                        {index < filteredHistoryRecipes.length - 1 && (
                          <div className="w-0.5 bg-indigo-300 dark:bg-indigo-600 flex-grow"></div>
                        )}
                      </div>

                      <h3 className="text-lg font-semibold mb-3 text-indigo-600 dark:text-indigo-300">{recipe.title}</h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                        {recipe.date}
                        {recipe.filters && (
                          <>
                            {recipe.filters.cuisineType !== 'none' && ` | ${t[`cuisine${recipe.filters.cuisineType.charAt(0).toUpperCase() + recipe.filters.cuisineType.slice(1)}`]}`}
                            {recipe.filters.preparationTime !== 'none' && ` | ${t[`time${recipe.filters.preparationTime.charAt(0).toUpperCase() + recipe.filters.preparationTime.slice(1)}`]}`}
                            {recipe.filters.difficulty !== 'none' && ` | ${t[`difficulty${recipe.filters.difficulty.charAt(0).toUpperCase() + recipe.filters.difficulty.slice(1)}`]}`}
                            {recipe.filters.dietaryPreference !== 'none' && ` | ${t[`dietary${recipe.filters.dietaryPreference.charAt(0).toUpperCase() + recipe.filters.dietaryPreference.slice(1)}`]}`}
                            {recipe.filters.dishType !== 'none' && ` | ${t[`dishType${recipe.filters.dishType.charAt(0).toUpperCase() + recipe.filters.dishType.slice(1)}`]}`}
                          </>
                        )}
                      </p>
                      <div className="prose dark:prose-invert max-w-none text-sm overflow-hidden h-32 mb-4">
                        <div dangerouslySetInnerHTML={{ __html: recipe.content }}></div>
                      </div>
                      <div className="mt-auto flex justify-between items-center pt-4 border-t border-gray-200 dark:border-gray-600">
                        <button
                          onClick={() => { setGeneratedRecipe(recipe.content); setViewMode('recipe'); }}
                          className="bg-indigo-500 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-indigo-600 transition-colors duration-300 transform hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          aria-label={t.viewRecipe}
                        >
                          {t.viewRecipe}
                        </button>
                        {!isFavorite(recipe.content) && (
                          <button
                            onClick={async () => {
                              if (!db || !userId) { // Check if db is initialized
                                showModal(t.firebaseNotInitialized, closeModal, closeModal);
                                return;
                              }
                              try {
                                const docId = btoa(recipe.content.substring(0, 100)).replace(/=/g, '');
                                await setDoc(doc(db, `artifacts/${appId}/users/${userId}/favorite_recipes`, docId), {
                                  title: recipe.title,
                                  content: recipe.content,
                                  date: recipe.date,
                                  filters: recipe.filters
                                }, { merge: true });
                                showModal(`${t.addToFavorites} !`, closeModal, closeModal);
                              } catch (e) {
                                handleError("Erreur lors de l'ajout aux favoris :", e);
                              }
                            }}
                            className="text-pink-500 hover:text-pink-700 transition-colors duration-300 ml-4 transform hover:scale-125 focus:outline-none focus:ring-2 focus:ring-pink-500 rounded-full p-1"
                            aria-label={t.addToFavorites}
                          >
                            <Heart className="w-5 h-5" aria-hidden="true" />
                          </button>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.section>
          )}

          {viewMode === 'dailyRecipe' && (
            <motion.section
              key="dailyRecipe"
              initial="initial"
              animate="in"
              exit="out"
              variants={pageVariants}
              transition={pageTransition}
              className={`p-8 rounded-xl shadow-2xl ${darkMode ? 'bg-gray-800' : 'bg-white'} transition-shadow duration-300 glassmorphism`}
            >
              <div className="relative h-48 w-full rounded-xl overflow-hidden mb-6 shadow-md">
                <img
                  src="https://placehold.co/600x200/FFDDC1/FF6B6B?text=Recette+du+Jour"
                  alt="Daily Recipe Header"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-4">
                  <h2 className="text-3xl font-extrabold text-white flex items-center gap-3">
                    <Sun className="w-8 h-8" aria-hidden="true" /> {t.recipeOfTheDay}
                  </h2>
                </div>
              </div>

              {loadingMessage ? (
                <div className="py-8">
                  <SkeletonLoader lines={10} className="w-full" />
                  <p className="text-center text-lg text-indigo-600 dark:text-indigo-300 flex items-center justify-center gap-2 mt-4">
                    <Flame className="w-6 h-6 animate-spin" aria-hidden="true" /> {loadingMessage}
                  </p>
                </div>
              ) : dailyRecipe ? (
                <motion.div
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                  className={`prose dark:prose-invert max-w-none p-6 rounded-lg ${darkMode ? 'bg-gray-700 text-gray-200' : 'bg-gray-50 text-gray-700'} shadow-inner mb-6 glassmorphism`}
                >
                  <div dangerouslySetInnerHTML={{ __html: dailyRecipe }}></div>
                </motion.div>
              ) : (
                <div className="text-center text-gray-500 dark:text-gray-400 py-8">
                  <CalendarOff className="w-20 h-20 mx-auto mb-4 text-gray-400 dark:text-gray-600 animate-float" aria-hidden="true" />
                  <p className="text-lg">{t.noDailyRecipe}</p>
                </div>
              )}
              <button
                onClick={() => fetchDailyRecipe()}
                className="mt-4 w-full bg-indigo-600 text-white py-3 rounded-lg text-xl font-bold hover:bg-indigo-700 transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transform hover:scale-105 hover:-translate-y-1 active:scale-98 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                disabled={!!loadingMessage}
                aria-label={loadingMessage ? loadingMessage : t.recipeOfTheDay}
              >
                {loadingMessage && <LoadingSpinner />}
                {loadingMessage ? loadingMessage : t.recipeOfTheDay}
              </button>
            </motion.section>
          )}

          {viewMode === 'settings' && (
            <motion.section
              key="settings"
              initial="initial"
              animate="in"
              exit="out"
              variants={pageVariants}
              transition={pageTransition}
              className={`p-8 rounded-xl shadow-2xl ${darkMode ? 'bg-gray-800' : 'bg-white'} transition-shadow duration-300 glassmorphism`}
            >
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-3 text-indigo-700 dark:text-indigo-400">
                <Settings className="w-7 h-7" aria-hidden="true" /> {t.settings}
              </h2>

              {/* User ID Display */}
              {userId && (
                <div className={`mb-6 p-4 rounded-xl border border-gray-200 ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50'} shadow-sm flex items-center gap-3 glassmorphism`}>
                  <User className="w-6 h-6 text-indigo-600 dark:text-indigo-300" aria-hidden="true" />
                  <span className="text-lg font-semibold">{t.userIdDisplay}</span>
                  <span className="break-all font-mono text-sm text-gray-700 dark:text-gray-300">{userId}</span>
                </div>
              )}


              {/* Language Selection */}
              <div className={`mb-6 p-4 rounded-xl border border-gray-200 ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50'} shadow-sm glassmorphism`}>
                <label htmlFor="language-select" className="block text-lg font-semibold mb-2">
                  {t.languageSelection}
                </label>
                <select
                  id="language-select"
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className={`w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 ${darkMode ? 'bg-gray-900 border-gray-600 text-gray-100' : 'bg-white text-gray-800'} transition-all duration-200`}
                  aria-label={t.languageSelection}
                >
                  <option value="fr">{t.languageFrench}</option>
                  <option value="en">{t.languageEnglish}</option>
                  <option value="de">{t.languageGerman}</option>
                  <option value="es">{t.languageSpanish}</option>
                  <option value="it">{t.languageItalian}</option>
                </select>
              </div>

              {/* Dark Mode Toggle */}
              <div className={`mb-6 p-4 rounded-xl border border-gray-200 ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50'} shadow-sm flex items-center justify-between glassmorphism`}>
                <span className="text-lg font-semibold">Mode Sombre :</span>
                <button
                  onClick={() => setDarkMode(prev => !prev)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300 ${darkMode ? 'bg-indigo-600' : 'bg-gray-200'} focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                  aria-pressed={darkMode}
                  aria-label={`Toggle dark mode, currently ${darkMode ? t.darkModeOn : t.darkModeOff}`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-lg transition-transform duration-300 ${darkMode ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
                <span className="text-sm ml-2">
                  {darkMode ? t.darkModeOn : t.darkModeOff}
                </span>
              </div>

              {/* Dietary Preferences */}
              <div className={`mb-6 p-4 rounded-xl border border-gray-200 ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50'} shadow-sm glassmorphism`}>
                <label htmlFor="dietary-preference-select" className="block text-lg font-semibold mb-2">
                  {t.dietaryPreferences}
                </label>
                <select
                  id="dietary-preference-select"
                  value={dietaryPreference}
                  onChange={(e) => setDietaryPreference(e.target.value)}
                  className={`w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 ${darkMode ? 'bg-gray-900 border-gray-600 text-gray-100' : 'bg-white text-gray-800'} transition-all duration-200`}
                  aria-label={t.dietaryPreferences}
                >
                  <option value="none">{t.dietaryNone}</option>
                  <option value="vegetarian">{t.dietaryVegetarian}</option>
                  <option value="vegan">{t.dietaryVegan}</option>
                  <option value="gluten-free">{t.dietaryGlutenFree}</option>
                  <option value="halal">{t.dietaryHalal}</option>
                  <option value="kosher">{t.dietaryKosher}</option>
                </select>
              </div>


              {/* Cooking Streak */}
              <div className={`mb-6 p-4 rounded-xl border border-gray-200 ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50'} shadow-sm glassmorphism`}>
                <h3 className="text-lg font-semibold mb-2 flex items-center gap-2"><Flame className="w-5 h-5 text-indigo-600" aria-hidden="true" />{t.myCookingStreak} : <span className="text-indigo-600 dark:text-indigo-300 font-bold">{cookingStreak} {cookingStreak > 1 ? 'jours' : 'jour'}</span></h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  Enregistrez un plat cuisiné chaque jour pour augmenter votre série ! Dernière connexion : {lastCookingLogDate || 'Jamais'}
                </p>
                <button
                  onClick={handleUploadMealPhoto}
                  className="bg-purple-600 text-white px-5 py-2 rounded-lg font-semibold hover:bg-purple-700 transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transform hover:scale-105 active:scale-95"
                  disabled={!!loadingMessage || !selectedImage}
                  aria-label={loadingMessage ? loadingMessage : t.uploadMealPhotoButton}
                >
                  {loadingMessage && <LoadingSpinner />}
                  {loadingMessage ? loadingMessage : t.uploadMealPhotoButton}
                </button>
              </div>

              {/* Clear All Data */}
              <div className={`mt-8 p-4 rounded-xl border border-red-300 ${darkMode ? 'bg-red-900 border-red-700' : 'bg-red-50'} shadow-sm glassmorphism`}>
                <button
                  onClick={handleClearAllData}
                  className="w-full bg-red-600 text-white py-3 rounded-lg text-lg font-bold hover:bg-red-700 transition-colors duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95"
                  aria-label={t.clearAllData}
                >
                  <Eraser className="w-5 h-5 inline-block mr-2" aria-hidden="true" /> {t.clearAllData}
                </button>
              </div>
            </motion.section>
          )}
        </AnimatePresence>
      </main>

      {/* Bottom Navigation Bar */}
      <nav className={`fixed bottom-0 left-0 right-0 ${darkMode ? 'bg-gray-800' : 'bg-white'} border-t border-gray-200 ${darkMode ? 'border-gray-700' : ''} shadow-lg py-2 z-40`}>
        <div className="flex justify-around items-center h-full max-w-lg mx-auto">
          <button
            onClick={() => { setViewMode('recipeOfTheDay'); fetchDailyRecipe(); }}
            className={`flex flex-col items-center p-2 rounded-lg text-sm font-medium transition-all duration-300 ${viewMode === 'recipeOfTheDay' ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-500 dark:text-gray-400'} hover:text-indigo-600 dark:hover:text-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500`}
            aria-label={t.recipeOfTheDay}
          >
            <Sun className="w-6 h-6 mb-1" />
            <span className="hidden sm:inline">{t.recipeOfTheDay.split(' ')[0]}</span>
          </button>

          <button
            onClick={() => setViewMode('favorites')}
            className={`flex flex-col items-center p-2 rounded-lg text-sm font-medium transition-all duration-300 ${viewMode === 'favorites' ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-500 dark:text-gray-400'} hover:text-indigo-600 dark:hover:text-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500`}
            aria-label={t.favorites}
          >
            <Heart className="w-6 h-6 mb-1" />
            <span className="hidden sm:inline">{t.favorites}</span>
          </button>

          {/* Central Add Button */}
          <motion.button
            whileTap={{ scale: 1.2 }}
            onClick={() => setShowAddRecipeModal(true)}
            className="flex flex-col items-center justify-center w-16 h-16 bg-indigo-600 text-white rounded-full shadow-lg -mt-8 border-4 border-white dark:border-gray-800 transition-all duration-300 hover:bg-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-500 focus:ring-opacity-50"
            aria-label={t.addRecipeTitle}
          >
            <Plus className="w-8 h-8" />
            <span className="sr-only">{t.addRecipeTitle}</span>
          </motion.button>

          <button
            onClick={() => setViewMode('history')}
            className={`flex flex-col items-center p-2 rounded-lg text-sm font-medium transition-all duration-300 ${viewMode === 'history' ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-500 dark:text-gray-400'} hover:text-indigo-600 dark:hover:text-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500`}
            aria-label={t.history}
          >
            <History className="w-6 h-6 mb-1" />
            <span className="hidden sm:inline">{t.history}</span>
          </button>

          <button
            onClick={() => setViewMode('settings')}
            className={`flex flex-col items-center p-2 rounded-lg text-sm font-medium transition-all duration-300 ${viewMode === 'settings' ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-500 dark:text-gray-400'} hover:text-indigo-600 dark:hover:text-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500`}
            aria-label={t.settings}
          >
            <Settings className="w-6 h-6 mb-1" />
            <span className="hidden sm:inline">{t.settings}</span>
          </button>
        </div>
      </nav>

      {/* Custom Modal */}
      <CustomModal
        message={modalMessage}
        onConfirm={modalOnConfirm}
        onCancel={modalOnCancel}
        showConfirmButton={showModalConfirmButton}
        currentLanguage={language}
      />

      {/* Onboarding Modal */}
      {isFirstTimeUser && (
        <OnboardingModal onClose={handleOnboardingComplete} currentLanguage={language} />
      )}

      {/* Add Recipe Modal */}
      <AnimatePresence>
        {showAddRecipeModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4"
            aria-modal="true"
            role="dialog"
          >
            <motion.div
              initial={{ y: "100vh", opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: "100vh", opacity: 0 }}
              transition={{ type: "spring", damping: 20, stiffness: 100 }}
              className={`bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-6 max-w-md w-full glassmorphism relative`}
            >
              <button
                onClick={() => setShowAddRecipeModal(false)}
                className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
                aria-label="Fermer"
              >
                <X className="w-6 h-6" />
              </button>
              <h2 className="text-2xl font-bold mb-6 text-indigo-700 dark:text-indigo-400">
                {t.addRecipeTitle}
              </h2>

              <motion.div
                initial="hidden"
                animate="visible"
                variants={{
                  visible: {
                    transition: {
                      staggerChildren: 0.1
                    }
                  }
                }}
              >
                {[
                  { label: t.recipeName, type: 'text', value: newRecipeName, onChange: setNewRecipeName, placeholder: t.recipeName },
                  { label: t.recipeIngredients, type: 'textarea', value: newRecipeIngredients, onChange: setNewRecipeIngredients, placeholder: t.recipeIngredients },
                  { label: t.recipeInstructions, type: 'textarea', value: newRecipeInstructions, onChange: setNewRecipeInstructions, placeholder: t.recipeInstructions },
                ].map((field, index) => (
                  <motion.div
                    key={index}
                    variants={{
                      hidden: { opacity: 0, y: 20 },
                      visible: { opacity: 1, y: 0 }
                    }}
                    className="mb-4"
                  >
                    <label htmlFor={`add-recipe-${field.label.toLowerCase().replace(/\s/g, '-')}`} className="block text-md font-semibold mb-2 text-gray-700 dark:text-gray-300">
                      {field.label}
                    </label>
                    {field.type === 'text' ? (
                      <input
                        type="text"
                        id={`add-recipe-${field.label.toLowerCase().replace(/\s/g, '-')}`}
                        value={field.value}
                        onChange={(e) => field.onChange(e.target.value)}
                        placeholder={field.placeholder}
                        className={`w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 ${darkMode ? 'bg-gray-900 border-gray-600 text-gray-100 placeholder-gray-400' : 'bg-white text-gray-800'} transition-all duration-200`}
                        aria-label={field.label}
                      />
                    ) : (
                      <textarea
                        id={`add-recipe-${field.label.toLowerCase().replace(/\s/g, '-')}`}
                        value={field.value}
                        onChange={(e) => field.onChange(e.target.value)}
                        placeholder={field.placeholder}
                        rows="4"
                        className={`w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 ${darkMode ? 'bg-gray-900 border-gray-600 text-gray-100 placeholder-gray-400' : 'bg-white text-gray-800'} transition-all duration-200`}
                        aria-label={field.label}
                      ></textarea>
                    )}
                  </motion.div>
                ))}
              </motion.div>

              <button
                onClick={handleAddCustomRecipe}
                className="mt-6 w-full bg-indigo-600 text-white py-3 rounded-lg text-lg font-bold hover:bg-indigo-700 transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                disabled={!!loadingMessage || !newRecipeName.trim() || !newRecipeIngredients.trim() || !newRecipeInstructions.trim()}
                aria-label={loadingMessage ? loadingMessage : t.addRecipe}
              >
                {loadingMessage && <LoadingSpinner />}
                {loadingMessage ? loadingMessage : t.addRecipe}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
