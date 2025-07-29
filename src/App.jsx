import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import {
  Camera, Utensils, Sun, Heart, Settings, Flame, Eye, Info, X, ChevronDown, CheckCircle,
  BookOpenText, CalendarOff, Clipboard, Loader2, Lightbulb, Salad, Apple, FlaskConical,
  ChefHat, Search, Eraser, PlusCircle, Package, Clock, TrendingUp, TrendingDown, History,
  Sparkles, User // Nouvelle icône pour l'onboarding et l'utilisateur
} from 'lucide-react'; // Import d'icônes enrichi

// Firebase Imports
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, doc, getDoc, setDoc, updateDoc, deleteDoc, onSnapshot, collection, query, addDoc, getDocs } from 'firebase/firestore';

// Global variables provided by the Canvas environment
// These variables are MANDATORY for Firebase integration
const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
const firebaseConfig = typeof __firebase_config !== 'undefined' ? JSON.parse(__firebase_config) : {};
const initialAuthToken = typeof __initial_auth_token !== 'undefined' ? __initial_auth_token : null;

// Initialize Firebase outside of the component to avoid re-initialization
let app;
let db;
let auth;

try {
  if (Object.keys(firebaseConfig).length > 0) {
    app = initializeApp(firebaseConfig);
    db = getFirestore(app);
    auth = getAuth(app);
  } else {
    console.warn("Firebase config is empty. Firebase will not be initialized.");
  }
} catch (e) {
  console.error("Failed to initialize Firebase:", e);
}


// --- Styles CSS personnalisés pour les animations ---
// Ces styles sont intégrés directement dans le composant pour la démonstration.
// Dans une application plus grande, ils seraient dans un fichier CSS séparé.
const customAnimations = `
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
.animate-fadeInUp { animation: fadeInUp 0.0s ease-out forwards; } /* Durée réduite pour une transition rapide */
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
`;


// --- Gestion des traductions ---
// Centralise tous les textes de l'interface pour faciliter la gestion multilingue
const translations = {
  fr: {
    appTitle: "Mon Frigo Malin 🥦�",
    uploadSectionTitle: "Ajouter une photo de votre frigo",
    analyzeButton: "Analyser mon frigo avec l'IA",
    analyzing: "Analyse en cours...",
    errorImageRead: "Erreur lors de la lecture du fichier.",
    errorNoImage: "Veuillez d'abord sélectionner une image de votre frigo.",
    ingredientsDetected: "Ingrédients détectés :",
    placeholderIngredients: "Nom de l'ingrédient",
    addIngredient: "Ajouter",
    addExpiryDate: "Date de péremption (JJ/MM/AAAA)",
    addQuantity: "Quantité", // Nouveau
    addUnit: "Unité", // Nouveau
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
    unitNone: "Aucune", // Nouvelle unité
    unitUnits: "unités",
    unitGrams: "grammes",
    unitKilograms: "kilogrammes",
    unitMilliliters: "millilitres",
    unitLiters: "litres",
    unitCups: "tasses",
    unitSpoons: "cuillères",
    cuisineType: "Type de cuisine :", // Nouveau filtre
    cuisineNone: "Aucun",
    cuisineFrench: "Française",
    cuisineItalian: "Italienne",
    cuisineAsian: "Asiatique",
    cuisineMexican: "Mexicaine",
    cuisineIndian: "Indienne",
    cuisineMediterranean: "Méditerranéenne",
    cuisineAmerican: "Américaine",
    cuisineOther: "Autre",
    prepTime: "Temps de préparation :", // Nouveau filtre
    timeNone: "Aucun",
    timeQuick: "Moins de 30 min",
    timeMedium: "30-60 min",
    timeLong: "Plus de 60 min",
    difficulty: "Difficulté :", // Nouveau filtre
    difficultyNone: "Aucune",
    difficultyEasy: "Facile",
    difficultyMedium: "Moyenne",
    difficultyHard: "Difficile",
    dishType: "Type de plat :", // Nouveau filtre
    dishTypeNone: "Aucun",
    dishTypeMain: "Plat principal",
    dishTypeDessert: "Dessert",
    dishTypeAppetizer: "Entrée",
    dishTypeSide: "Accompagnement",
    dishTypeBreakfast: "Petit-déjeuner",
    dishTypeSoup: "Soupe",
    dishTypeSalad: "Salade",
    dishTypeDrink: "Boisson",
    optimizingImage: "Optimisation de l'image...", // Nouveau message
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
    languageItalian: "Italian",
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
    copied: "Copié!",
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
  },
  de: {
    appTitle: "Mein Smarter Kühlschrank 🥦🥕",
    uploadSectionTitle: "Foto Ihres Kühlschranks hinzufügen",
    analyzeButton: "Meinen Kühlschrank mit KI analysieren",
    analyzing: "Analysiere...",
    errorImageRead: "Fehler beim Lesen der Datei.",
    errorNoImage: "Bitte wählen Sie zuerst ein Kühlschrankbild aus.",
    ingredientsDetected: "Erkannte Zutaten:",
    placeholderIngredients: "Zutat Name",
    addIngredient: "Hinzufügen",
    addExpiryDate: "Verfallsdatum (TT/MM/JJJJ)",
    addQuantity: "Menge",
    addUnit: "Einheit",
    generateRecipeButton: "Rezept generieren",
    generatingRecipe: "Rezept wird generiert...",
    errorDetectIngredients: "Zutaten konnten nicht erkannt werden. Bitte versuchen Sie es erneut.",
    errorGenerateRecipe: "Rezept konnte nicht generiert werden. Bitte versuchen Sie es erneut.",
    errorRecipeGeneration: "Fehler beim Generieren des Rezepts: ",
    errorImageAnalysis: "Fehler bei der Bildanalyse: ",
    recipeTitle: "Ihr Smartes Rezept!",
    magicHappening: "Magie im Gange... Rezept wird erstellt!",
    newAnalysis: "Neue Analyse",
    addToFavorites: "Zu Favoriten hinzufügen",
    removeFromFavorites: "Aus Favoriten entfernen",
    favorites: "Meine Favoriten",
    noFavorites: "Sie haben noch keine Lieblingsrezepte. Beginnen Sie mit der Generierung!",
    recipeOfTheDay: "Rezept des Tages",
    generatingDailyRecipe: "Rezept des Tages wird generiert...",
    noDailyRecipe: "Noch kein Rezept des Tages verfügbar. Schauen Sie morgen wieder vorbei oder generieren Sie Ihr eigenes!",
    settings: "Einstellungen",
    languageSelection: "Sprachauswahl:",
    languageFrench: "Französisch",
    languageEnglish: "Englisch",
    languageGerman: "Deutsch",
    languageSpanish: "Spanisch",
    languageItalian: "Italienisch",
    detectedSuccess: "Zutaten erfolgreich erkannt!",
    confirmDelete: "Löschen bestätigen",
    confirmDeleteRecipe: "Möchten Sie dieses Rezept wirklich aus Ihren Favoriten löschen?",
    cancel: "Abbrechen",
    delete: "Löschen",
    ok: "OK",
    recipeDeleted: "Rezept aus Favoriten gelöscht.",
    noIngredientsForRecipe: "Bitte erkennen Sie zuerst Zutaten oder geben Sie diese manuell ein.",
    adaptRecipe: "✨ Rezept anpassen",
    substituteIngredient: "✨ Zutat ersetzen",
    enterAdaptRequest: "Bsp: 'vegetarisch machen', 'weniger Zucker', 'schneller'",
    enterIngredientToSubstitute: "Zu ersetzende Zutat (Bsp: 'Hähnchen')",
    enterSubstituteWith: "Ersetzen durch (optional, Bsp: 'Tofu')",
    adapt: "Anpassen",
    substitute: "Ersetzen",
    adaptingRecipe: "Rezept wird angepasst...",
    substitutingIngredient: "Zutat wird ersetzt...",
    errorAdaptRecipe: "Fehler beim Anpassen des Rezepts: ",
    errorSubstituteIngredient: "Fehler beim Ersetzen der Zutat: ",
    noRecipeToAdapt: "Bitte generieren Sie zuerst ein Rezept zum Anpassen.",
    noRecipeToSubstitute: "Bitte generieren Sie zuerst ein Rezept zum Ersetzen.",
    scaleRecipe: "✨ Rezept skalieren",
    enterServings: "Anzahl der Portionen (Bsp: 2, 6)",
    scale: "Skalieren",
    scalingRecipe: "Rezept wird skaliert...",
    askCookingTip: "✨ Kochtipp anfragen",
    enterCookingQuestion: "Ihre Frage (Bsp: 'Wie brät man Zwiebeln richtig an?')",
    ask: "Fragen",
    gettingTip: "Tipp wird abgerufen...",
    noRecipeForTip: "Bitte generieren Sie zuerst ein Rezept, um einen Tipp zu erhalten.",
    cookingTip: "Kochtipp:",
    mealPrepGuide: "✨ Essensvorbereitungs-Leitfaden",
    generatingMealPrepGuide: "Leitfaden wird generiert...",
    noRecipeForMealPrep: "Bitte generieren Sie zuerst ein Rezept für den Essensvorbereitungs-Leitfaden.",
    foodPairingSuggestions: "✨ Food-Pairing-Vorschläge",
    enterFoodForPairing: "Zutat (z.B. 'Tomate')",
    gettingFoodPairings: "Vorschläge werden abgerufen...",
    noFoodForPairing: "Bitte geben Sie eine Zutat für Pairing-Vorschläge ein.",
    foodPairingResultTitle: "Pairing-Vorschläge für",
    getIngredientInfo: "✨ Zutat Info",
    enterIngredientName: "Zutat Name (z.B. 'Brokkoli')",
    gettingIngredientInfo: "Info wird abgerufen...",
    ingredientInfo: "Zutateninformationen",
    noIngredientForInfo: "Bitte geben Sie eine Zutat ein, um Informationen zu erhalten.",
    optimizeRecipeHealth: "✨ Rezeptgesundheit optimieren",
    enterHealthGoals: "Bsp: 'weniger Fett', 'mehr Ballaststoffe', 'vegetarisch'",
    optimize: "Optimieren",
    optimizingRecipe: "Rezept wird optimiert...",
    errorOptimizeRecipe: "Fehler beim Optimieren des Rezepts: ",
    noRecipeToOptimize: "Bitte generieren Sie zuerst ein Rezept zum Optimieren.",
    clearAllData: "Alle Daten löschen",
    confirmClearAllData: "Möchten Sie wirklich alle App-Daten (Rezepte, Favoriten usw.) löschen? Diese Aktion ist irreversibel.",
    dataCleared: "Alle Daten wurden gelöscht.",
    myCookingStreak: "Mein Koch-Streak",
    uploadMealPhotoButton: "Ich habe dieses Gericht gekocht!",
    uploadingMealPhoto: "Gerichtsfoto wird hochgeladen...",
    streakIncreased: "Großartig! Dein Koch-Streak ist auf {streak} Tage gestiegen!",
    streakReset: "Schade! Dein Streak wurde auf 1 Tag zurückgesetzt.",
    alreadyLoggedToday: "Sie haben heute bereits ein Gericht protokolliert.",
    darkModeOn: "An",
    darkModeOff: "Aus",
    viewRecipe: "Rezept ansehen",
    favoriteRecipeTitle: "Lieblingsrezept",
    dietaryPreferences: "Ernährungseinstellungen:",
    dietaryNone: "Standard",
    dietaryVegetarian: "Vegetarisch",
    dietaryVegan: "Vegano",
    dietaryGlutenFree: "Glutenfrei",
    dietaryHalal: "Halal",
    dietaryKosher: "Koscher",
    copyToClipboard: "Rezept kopieren",
    copied: "Kopiert!",
    unitNone: "Keine",
    unitUnits: "Einheiten",
    unitGrams: "Gramm",
    unitKilograms: "Kilogramm",
    unitMilliliters: "Milliliter",
    unitLiters: "Liter",
    unitCups: "Tassen",
    unitSpoons: "Löffel",
    cuisineType: "Küchentyp:",
    cuisineNone: "Keine",
    cuisineFrench: "Französisch",
    cuisineItalian: "Italienisch",
    cuisineAsian: "Asiatisch",
    cuisineMexican: "Mexikanisch",
    cuisineIndian: "Indisch",
    cuisineMediterranean: "Mediterran",
    cuisineAmerican: "Amerikanisch",
    cuisineOther: "Andere",
    prepTime: "Zubereitungszeit:",
    timeNone: "Keine",
    timeQuick: "Weniger als 30 Min.",
    timeMedium: "30-60 Min.",
    timeLong: "Mehr als 60 Min.",
    difficulty: "Schwierigkeit:",
    difficultyNone: "Keine",
    difficultyEasy: "Einfach",
    difficultyMedium: "Mittel",
    difficultyHard: "Schwer",
    dishType: "Gerichtstyp:",
    dishTypeNone: "Keine",
    dishTypeMain: "Hauptgericht",
    dishTypeDessert: "Dessert",
    dishTypeAppetizer: "Vorspeise",
    dishTypeSide: "Beilage",
    dishTypeBreakfast: "Frühstück",
    dishTypeSoup: "Suppe",
    dishTypeSalad: "Salat",
    dishTypeDrink: "Getränk",
    optimizingImage: "Bild wird optimiert...",
    history: "Meine Geschichte",
    noHistory: "Noch keine Rezepte generiert. Beginnen Sie mit der Erstellung!",
    searchRecipes: "Rezepte suchen...",
    filterByCuisine: "Nach Küche filtern:",
    filterByTime: "Nach Zeit filtern:",
    filterByDifficulty: "Nach Schwierigkeit filtern:",
    filterByDietary: "Nach Diät filtern:",
    filterByDishType: "Nach Gerichtstyp filtern:",
    clearFilters: "Filter löschen",
    onboardingTitle: "Willkommen bei Mein Smarter Kühlschrank!",
    onboardingStep1Title: "1. Analysieren Sie Ihren Kühlschrank",
    onboardingStep1Desc: "Machen Sie ein Foto vom Inneren Ihres Kühlschranks. Unsere KI erkennt die verfügbaren Zutaten.",
    onboardingStep2Title: "2. Rezepte generieren",
    onboardingStep2Desc: "Basierend auf Ihren Zutaten schlagen wir kreative und personalisierte Rezepte vor.",
    onboardingStep3Title: "3. Erkunden und anpassen",
    onboardingStep3Desc: "Speichern Sie Ihre Lieblingsrezepte, sehen Sie sich Ihren Verlauf an und passen Sie Rezepte mit unseren fortschrittlichen KI-Tools an.",
    onboardingButton: "Los geht's!",
    errorGeneric: "Ein unerwarteter Fehler ist aufgetreten. Bitte überprüfen Sie Ihre Internetverbindung oder versuchen Sie es später erneut. Wenn das Problem weiterhin besteht, wenden Sie sich an den Support.",
    analyzingImage: "Bild wird analysiert...",
    detectingIngredients: "Zutaten werden erkannt...",
    generatingRecipeDetailed: "Rezept wird generiert (dies kann einen Moment dauern)...",
    adaptingRecipeDetailed: "Rezept wird angepasst...",
    substitutingIngredientDetailed: "Zutat wird ersetzt...",
    scalingRecipeDetailed: "Mengen werden skaliert...",
    gettingTipDetailed: "Kochtipp wird abgerufen...",
    generatingMealPrepGuideDetailed: "Leitfaden zur Essensvorbereitung wird generiert...",
    gettingFoodPairingsDetailed: "Food-Pairing-Vorschläge werden abgerufen...",
    gettingIngredientInfoDetailed: "Zutateninformationen werden abgerufen...",
    optimizingRecipeDetailed: "Rezept wird für die Gesundheit optimiert...",
    uploadingMealPhotoDetailed: "Gerichtsfoto wird hochgeladen...",
    userIdDisplay: "Your User ID: ",
    firebaseNotInitialized: "Firebase not initialized. Some features may be limited.",
  },
  es: {
    appTitle: "Mi Nevera Inteligente 🥦🥕",
    uploadSectionTitle: "Añadir una foto de tu nevera",
    analyzeButton: "Analizar mi nevera con IA",
    analyzing: "Analizando...",
    errorImageRead: "Error al leer el archivo.",
    errorNoImage: "Por favor, selecciona primero una imagen de tu nevera.",
    ingredientsDetected: "Ingredientes detectados:",
    placeholderIngredients: "Nombre del ingrediente",
    addIngredient: "Añadir",
    addExpiryDate: "Fecha de caducidad (DD/MM/AAAA)",
    addQuantity: "Cantidad",
    addUnit: "Unidad",
    generateRecipeButton: "Generar receta",
    generatingRecipe: "Generando receta...",
    errorDetectIngredients: "No se pudieron detectar los ingredientes. Por favor, inténtalo de nuevo.",
    errorGenerateRecipe: "No se pudo generar la receta. Por favor, inténtalo de nuevo.",
    errorRecipeGeneration: "Error al generar la receta: ",
    errorImageAnalysis: "Error al analizar la imagen: ",
    recipeTitle: "¡Tu Receta Inteligente!",
    magicHappening: "La magia está en marcha... ¡Receta creándose!",
    newAnalysis: "Nuevo análisis",
    addToFavorites: "Añadir a Favoritos",
    removeFromFavorites: "Eliminar de Favoritos",
    favorites: "Mis Favoritos",
    noFavorites: "Aún no tienes recetas favoritas. ¡Empieza a generarlas!",
    recipeOfTheDay: "Receta del Día",
    generatingDailyRecipe: "Generando la receta del día...",
    noDailyRecipe: "No hay receta del día disponible por ahora. ¡Vuelve mañana o genera la tuya!",
    settings: "Ajustes",
    languageSelection: "Selección de idioma:",
    languageFrench: "Francés",
    languageEnglish: "Inglés",
    languageGerman: "Alemán",
    languageSpanish: "Español",
    languageItalian: "Italiano",
    detectedSuccess: "¡Ingredientes detectados con éxito!",
    confirmDelete: "Confirmar Eliminación",
    confirmDeleteRecipe: "¿Estás seguro de que quieres eliminar esta receta de tus favoritos?",
    cancel: "Cancelar",
    delete: "Eliminar",
    ok: "OK",
    recipeDeleted: "Receta eliminada de tus favoritos.",
    noIngredientsForRecipe: "Por favor, detecta los ingredientes primero o introdúcelos manualmente.",
    adaptRecipe: "✨ Adaptar Receta",
    substituteIngredient: "✨ Sustituir Ingrediente",
    enterAdaptRequest: "Ej: 'hacer vegetariano', 'menos azúcar', 'más rápido'",
    enterIngredientToSubstitute: "Ingrediente a sustituir (ej: 'pollo')",
    enterSubstituteWith: "Sustituir con (opcional, ej: 'tofu')",
    adapt: "Adaptar",
    substitute: "Sustituir",
    adaptingRecipe: "Adaptando receta...",
    substitutingIngredient: "Sustituyendo ingrediente...",
    errorAdaptRecipe: "Error al adaptar la receta: ",
    errorSubstituteIngredient: "Error al sustituir el ingrediente: ",
    noRecipeToAdapt: "Por favor, genera una receta para adaptar primero.",
    noRecipeToSubstitute: "Por favor, genera una receta para sustituir primero.",
    scaleRecipe: "✨ Escalar Receta",
    enterServings: "Número de porciones (ej: 2, 6)",
    scale: "Escalar",
    scalingRecipe: "Escalando receta...",
    askCookingTip: "✨ Pedir Consejo de Cocina",
    enterCookingQuestion: "Tu pregunta (ej: '¿Cómo dorar bien las cebollas?')",
    ask: "Preguntar",
    gettingTip: "Obteniendo consejo...",
    noRecipeForTip: "Por favor, genera una receta para obtener un consejo.",
    cookingTip: "Consejo de Cocina:",
    mealPrepGuide: "✨ Guía de preparación de comidas",
    generatingMealPrepGuide: "Generando guía...",
    noRecipeForMealPrep: "Por favor, genera una receta para la guía de preparación de comidas.",
    foodPairingSuggestions: "✨ Sugerencias de maridaje de alimentos",
    enterFoodForPairing: "Ingrediente (ej: 'tomate')",
    gettingFoodPairings: "Obteniendo sugerencias...",
    noFoodForPairing: "Por favor, introduce un ingrediente para sugerencias de maridaje.",
    foodPairingResultTitle: "Sugerencias de maridaje para",
    getIngredientInfo: "✨ Obtener Información del Ingrediente",
    enterIngredientName: "Nombre del Ingrediente (ej: 'brócoli')",
    gettingIngredientInfo: "Obteniendo información...",
    ingredientInfo: "Información del Ingrediente",
    noIngredientForInfo: "Por favor, introduce un ingrediente para obtener información.",
    optimizeRecipeHealth: "✨ Optimizar salud de receta",
    enterHealthGoals: "Ej: 'menos grasa', 'más fibra', 'vegetariano'",
    optimize: "Optimizar",
    optimizingRecipe: "Optimizando receta...",
    errorOptimizeRecipe: "Error al optimizar la receta: ",
    noRecipeToOptimize: "Por favor, genera una receta para optimizar primero.",
    clearAllData: "Borrar todos los datos",
    confirmClearAllData: "¿Estás seguro de que quieres borrar todos los datos de la aplicación (recetas, favoritos, etc.)? Esta acción es irreversible.",
    dataCleared: "Todos los datos han sido borrados.",
    myCookingStreak: "Mi racha de cocina",
    uploadMealPhotoButton: "¡Cocinó este plato!",
    uploadingMealPhoto: "Subiendo foto de la comida...",
    streakIncreased: "¡Genial! ¡Tu racha de cocina ha aumentado a {streak} días!",
    streakReset: "¡Qué lástima! Tu racha se ha reiniciado a 1 día.",
    alreadyLoggedToday: "Ya has registrado una comida hoy.",
    darkModeOn: "Activado",
    darkModeOff: "Desactivado",
    viewRecipe: "Ver receta",
    favoriteRecipeTitle: "Receta favorita",
    dietaryPreferences: "Preferencias dietéticas:",
    dietaryNone: "Normal",
    dietaryVegetarian: "Vegetariano",
    dietaryVegan: "Vegano",
    dietaryGlutenFree: "Sin Gluten",
    dietaryHalal: "Halal",
    dietaryKosher: "Kosher",
    copyToClipboard: "Copiar receta",
    copied: "Copiado!",
    unitNone: "Ninguna",
    unitUnits: "unidades",
    unitGrams: "gramos",
    unitKilograms: "kilogramos",
    unitMilliliters: "mililitros",
    unitLiters: "litros",
    unitCups: "tazas",
    unitSpoons: "cucharas",
    cuisineType: "Tipo de cocina:",
    cuisineNone: "Ninguno",
    cuisineFrench: "Francesa",
    cuisineItalian: "Italiana",
    cuisineAsian: "Asiática",
    cuisineMexican: "Mexicana",
    cuisineIndian: "India",
    cuisineMediterranean: "Mediterránea",
    cuisineAmerican: "Americana",
    cuisineOther: "Otro",
    prepTime: "Tiempo de preparación:",
    timeNone: "Ninguno",
    timeQuick: "Menos de 30 min",
    timeMedium: "30-60 min",
    timeLong: "Más de 60 min",
    difficulty: "Dificultad:",
    difficultyNone: "Ninguna",
    difficultyEasy: "Fácil",
    difficultyMedium: "Media",
    difficultyHard: "Difícil",
    dishType: "Tipo de plato:",
    dishTypeNone: "Ninguno",
    dishTypeMain: "Plato principal",
    dishTypeDessert: "Postre",
    dishTypeAppetizer: "Entrante",
    dishTypeSide: "Guarnición",
    dishTypeBreakfast: "Desayuno",
    dishTypeSoup: "Sopa",
    dishTypeSalad: "Ensalada",
    dishTypeDrink: "Bebida",
    optimizingImage: "Optimizando imagen...",
    history: "Mi Historial",
    noHistory: "No se han generado recetas todavía. ¡Empieza a crear una!",
    searchRecipes: "Buscar recetas...",
    filterByCuisine: "Filtrar por cocina:",
    filterByTime: "Filtrar por tiempo:",
    filterByDifficulty: "Filtrar por dificultad:",
    filterByDietary: "Filtrar por dieta:",
    filterByDishType: "Filtrar por tipo de plato:",
    clearFilters: "Borrar filtros",
    onboardingTitle: "¡Bienvenido a Mi Nevera Inteligente!",
    onboardingStep1Title: "1. Analiza tu nevera",
    onboardingStep1Desc: "Toma una foto del interior de tu nevera. Nuestra IA detectará los ingredientes disponibles.",
    onboardingStep2Title: "2. Genera recetas",
    onboardingStep2Desc: "Basándonos en tus ingredientes, te sugeriremos recetas creativas y personalizadas.",
    onboardingStep3Title: "3. Explora y adapta",
    onboardingStep3Desc: "Guarda tus recetas favoritas, consulta tu historial y adapta recetas con nuestras herramientas avanzadas de IA.",
    onboardingButton: "¡Vamos!",
    errorGeneric: "Ha ocurrido un error inesperado. Por favor, verifica tu conexión a internet o inténtalo de nuevo más tarde. Si el problema persiste, contacta con soporte.",
    analyzingImage: "Analizando imagen...",
    detectingIngredients: "Detectando ingredientes...",
    generatingRecipeDetailed: "Generando receta (esto puede tardar un momento)...",
    adaptingRecipeDetailed: "Adaptando receta...",
    substitutingIngredientDetailed: "Sustituyendo ingrediente...",
    scalingRecipeDetailed: "Escalando cantidades...",
    gettingTipDetailed: "Obteniendo consejo de cocina...",
    generatingMealPrepGuideDetailed: "Generando guía de preparación de comidas...",
    gettingFoodPairingsDetailed: "Obteniendo sugerencias de maridaje...",
    gettingIngredientInfoDetailed: "Obteniendo información del ingrediente...",
    optimizingRecipeDetailed: "Optimizando receta para la salud...",
    uploadingMealPhotoDetailed: "Subiendo foto de la comida...",
    userIdDisplay: "Your User ID: ",
    firebaseNotInitialized: "Firebase not initialized. Some features may be limited.",
  },
  it: {
    appTitle: "Il Mio Frigo Intelligente 🥦🥕",
    uploadSectionTitle: "Aggiungi una foto del tuo frigo",
    analyzeButton: "Analizza il mio frigo con l'IA",
    analyzing: "Analizzando...",
    errorImageRead: "Errore durante la lettura del file.",
    errorNoImage: "Per favor, seleziona prima un'immagine del tuo frigo.",
    ingredientsDetected: "Ingredienti rilevati:",
    placeholderIngredients: "Nome ingrediente",
    addIngredient: "Aggiungi",
    addExpiryDate: "Data di scadenza (GG/MM/AAAA)",
    addQuantity: "Quantità",
    addUnit: "Unità",
    generateRecipeButton: "Genera ricetta",
    generatingRecipe: "Generazione ricetta...",
    errorDetectIngredients: "Impossibile rilevare gli ingredienti. Riprova.",
    errorGenerateRecipe: "Impossibile generare la ricetta. Riprova.",
    errorRecipeGeneration: "Errore durante la generazione della ricetta: ",
    errorImageAnalysis: "Errore durante l'analisi dell'immagine: ",
    recipeTitle: "La Tua Ricetta Intelligente!",
    magicHappening: "La magia è in corso... Ricetta in creazione!",
    newAnalysis: "Nuova analisi",
    addToFavorites: "Aggiungi ai Preferiti",
    removeFromFavorites: "Rimuovi dai Preferiti",
    favorites: "I Miei Preferiti",
    noFavorites: "Non hai ancora ricette preferite. Inizia a generarne!",
    recipeOfTheDay: "Ricetta del Giorno",
    generatingDailyRecipe: "Generazione della ricetta del giorno...",
    noDailyRecipe: "Nessuna ricetta del giorno disponibile al momento. Torna domani o genera la tua!",
    settings: "Impostazioni",
    languageSelection: "Selezione della lingua:",
    languageFrench: "Francese",
    languageEnglish: "Inglese",
    languageGerman: "Tedesco",
    languageSpanish: "Spagnolo",
    languageItalian: "Italiano",
    detectedSuccess: "Ingredienti rilevati con successo!",
    confirmDelete: "Conferma Eliminazione",
    confirmDeleteRecipe: "Sei sicuro di voler eliminare questa ricetta dai tuoi preferiti?",
    cancel: "Annulla",
    delete: "Elimina",
    ok: "OK",
    recipeDeleted: "Ricetta eliminata dai preferiti.",
    noIngredientsForRecipe: "Per favor, rileva prima gli ingredienti o inseriscili manualmente.",
    adaptRecipe: "✨ Adatta la Ricetta",
    substituteIngredient: "✨ Sostituisci Ingrediente",
    enterAdaptRequest: "Es: 'rendi vegetariano', 'meno grassi', 'più veloce'",
    enterIngredientToSubstitute: "Ingrediente da sostituire (es: 'pollo')",
    enterSubstituteWith: "Sostituisci con (opzionale, es: 'tofu')",
    adapt: "Adatta",
    substitute: "Sostituisci",
    adaptingRecipe: "Adattamento ricetta...",
    substitutingIngredient: "Sostituzione ingrediente...",
    errorAdaptRecipe: "Errore durante l'adattamento della ricetta: ",
    errorSubstituteIngredient: "Errore durante la sostituzione dell'ingrediente: ",
    noRecipeToAdapt: "Per favor, genera prima una ricetta da adattare.",
    noRecipeToSubstitute: "Per favor, genera prima una ricetta per la sostituzione.",
    scaleRecipe: "✨ Scala Ricetta",
    enterServings: "Numero di porzioni (es: 2, 6)",
    scale: "Scala",
    scalingRecipe: "Scalatura ricetta...",
    askCookingTip: "✨ Chiedi un Consiglio di Cucina",
    enterCookingQuestion: "La tua domanda (es: 'Come si dorano bene le cipolle?')",
    ask: "Chiedi",
    gettingTip: "Ottenendo consiglio...",
    noRecipeForTip: "Per favor, genera prima una ricetta per ottenere un consiglio.",
    cookingTip: "Consiglio di Cucina:",
    mealPrepGuide: "✨ Guida alla preparazione dei pasti",
    generatingMealPrepGuide: "Generazione della guida...",
    noRecipeForMealPrep: "Per favor, genera una ricetta per la guida alla preparazione dei pasti.",
    foodPairingSuggestions: "✨ Suggerimenti di abbinamento alimentare",
    enterFoodForPairing: "Ingrediente (es: 'pomodoro')",
    gettingFoodPairings: "Ottenendo suggerimenti...",
    noFoodForPairing: "Per favor, inserisci un ingrediente per suggerimenti di abbinamento.",
    foodPairingResultTitle: "Suggerimenti di abbinamento per",
    getIngredientInfo: "✨ Ottieni Info Ingrediente",
    enterIngredientName: "Nome Ingrediente (es: 'broccoli')",
    gettingIngredientInfo: "Ottenendo info...",
    ingredientInfo: "Informazioni Ingrediente",
    noIngredientForInfo: "Per favor, inserisci un ingrediente per ottenere informazioni.",
    optimizeRecipeHealth: "✨ Ottimizza la salute della ricetta",
    enterHealthGoals: "Es: 'meno grassi', 'più fibre', 'végétarien'",
    optimize: "Ottimizza",
    optimizingRecipe: "Ottimizzazione della ricetta...",
    errorOptimizeRecipe: "Errore durante l'ottimizzazione della ricetta: ",
    noRecipeToOptimize: "Per favore, genera prima una ricetta da optimiser.",
    clearAllData: "Cancella tutti i dati",
    confirmClearAllData: "Sei sicuro di voler canceller tous les données de l'app (ricettes, preferiti, etc.)? Cette action est irréversible.",
    dataCleared: "Tutti i dati sono stati cancellati.",
    copyToClipboard: "Copia ricetta",
    copied: "Copiato!",
    unitNone: "Nessuna",
    unitUnits: "unità",
    unitGrams: "grammi",
    unitKilograms: "chilogrammi",
    unitMilliliters: "millilitri",
    unitLiters: "litri",
    unitCups: "tazze",
    unitSpoons: "cucchiai",
    cuisineType: "Tipo di cucina:",
    cuisineNone: "Nessuno",
    cuisineFrench: "Francese",
    cuisineItalian: "Italiana",
    cuisineAsian: "Asiatico",
    cuisineMexican: "Messicana",
    cuisineIndian: "Indiana",
    cuisineMediterranean: "Mediterranea",
    cuisineAmerican: "Americana",
    cuisineOther: "Altro",
    prepTime: "Tempo di preparazione:",
    timeNone: "Nessuno",
    timeQuick: "Meno di 30 min",
    timeMedium: "30-60 min",
    timeLong: "Più di 60 min",
    difficulty: "Difficoltà:",
    difficultyNone: "Nessuna",
    difficultyEasy: "Facile",
    difficultyMedium: "Media",
    difficultyHard: "Difficile",
    dishType: "Tipo di piatto:",
    dishTypeNone: "Nessuno",
    dishTypeMain: "Piatto principale",
    dishTypeDessert: "Dessert",
    dishTypeAppetizer: "Antipasto",
    dishTypeSide: "Contorno",
    dishTypeBreakfast: "Colazione",
    dishTypeSoup: "Zuppa",
    dishTypeSalad: "Insalata",
    dishTypeDrink: "Bevanda",
    optimizingImage: "Ottimizzazione immagine...",
    history: "Il Mio Storico",
    noHistory: "Nessuna ricetta è stata ancora generata. Inizia a crearne una!",
    searchRecipes: "Cerca ricette...",
    filterByCuisine: "Filtra per cucina:",
    filterByTime: "Filtra per tempo:",
    filterByDifficulty: "Filtra per difficoltà:",
    filterByDietary: "Filtra per dieta:",
    filterByDishType: "Filtra per tipo di piatto:",
    clearFilters: "Cancella filtri",
    onboardingTitle: "Benvenuto su Il Mio Frigo Intelligente!",
    onboardingStep1Title: "1. Analizza il tuo frigo",
    onboardingStep1Desc: "Scatta una foto dell'interno del tuo frigo. La nostra IA rileverà gli ingredienti disponibili.",
    onboardingStep2Title: "2. Genera ricette",
    onboardingStep2Desc: "In base ai tuoi ingredienti, ti suggeriremo ricette creative e personalizzate.",
    onboardingStep3Title: "3. Esplora e adatta",
    onboardingStep3Desc: "Salva le tue ricette preferite, consulta la cronologia e adatta le ricette con i nostri strumenti IA avanzati.",
    onboardingButton: "Andiamo!",
    errorGeneric: "Si è verificato un errore imprevisto. Controlla la tua connessione internet o riprova più tardi. Se il problema persiste, contatta il supporto.",
    analyzingImage: "Analizzando immagine...",
    detectingIngredients: "Rilevando ingredienti...",
    generatingRecipeDetailed: "Generazione ricetta (potrebbe richiedere un momento)...",
    adaptingRecipeDetailed: "Adattamento ricetta...",
    substitutingIngredientDetailed: "Sostituzione ingrediente...",
    scalingRecipeDetailed: "Scalatura quantità...",
    gettingTipDetailed: "Ottenendo consiglio di cucina...",
    generatingMealPrepGuideDetailed: "Generazione guida preparazione pasti...",
    gettingFoodPairingsDetailed: "Ottenendo suggerimenti abbinamento alimentare...",
    gettingIngredientInfoDetailed: "Ottenendo informazioni ingrediente...",
    optimizingRecipeDetailed: "Ottimizzazione ricetta per la salute...",
    uploadingMealPhotoDetailed: "Caricamento foto pasto...",
    userIdDisplay: "Your User ID: ",
    firebaseNotInitialized: "Firebase not initialized. Some features may be limited.",
  }
};

// Composant Modal personnalisé pour les messages et confirmations
const CustomModal = ({ message, onConfirm, onCancel, showConfirmButton = false, currentLanguage }) => {
  if (!message) return null;

  const t = translations[currentLanguage];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4 animate-fadeIn" aria-modal="true" role="dialog">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-6 max-w-sm w-full text-center transform animate-popIn">
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
      </div>
    </div>
  );
};

// Nouveau composant SkeletonLoader pour améliorer l'expérience de chargement
const SkeletonLoader = ({ lines = 5, className = "" }) => (
  <div className={`space-y-3 ${className}`}>
    <div className="h-6 bg-gray-300 dark:bg-gray-700 rounded w-3/4 animate-shimmer"></div>
    {Array.from({ length: lines - 1 }).map((_, i) => (
      <div key={i} className={`h-4 bg-gray-300 dark:bg-gray-700 rounded animate-shimmer ${i % 3 === 0 ? 'w-full' : i % 3 === 1 ? 'w-5/6' : 'w-4/5'}`}></div>
    ))}
  </div>
);

// Composant pour le spinner de chargement
const LoadingSpinner = () => (
  <Loader2 className="w-5 h-5 animate-spin text-white" />
);

// Composant OnboardingModal
const OnboardingModal = ({ onClose, currentLanguage }) => {
  const t = translations[currentLanguage];
  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50 p-4 animate-fadeIn" aria-modal="true" role="dialog">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-8 max-w-2xl w-full text-center transform animate-popIn">
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
      </div>
    </div>
  );
};


export default function App() {
  const [userId, setUserId] = useState(null);
  const [isAuthReady, setIsAuthReady] = useState(false); // To ensure Firestore operations wait for auth
  const [selectedImage, setSelectedImage] = useState(null); // Stores image in base64
  // Mise à jour de la structure de l'état des ingrédients pour inclure quantité et unité
  const [detectedIngredients, setDetectedIngredients] = useState([]); // Array of { name: string, quantity: number, unit: string, expiryDate?: string }
  const [newIngredientInput, setNewIngredientInput] = useState(''); // For manual ingredient input
  const [newIngredientExpiry, setNewIngredientExpiry] = useState(''); // For manual ingredient expiry date
  const [newIngredientQuantity, setNewIngredientQuantity] = useState(''); // Nouveau: Quantité pour la saisie manuelle
  const [newIngredientUnit, setNewIngredientUnit] = useState('unit'); // Nouveau: Unité pour la saisie manuelle (valeur par défaut 'unit')

  const [generatedRecipe, setGeneratedRecipe] = useState(''); // Recipe generated by AI
  const [loadingMessage, setLoadingMessage] = useState(null); // String for detailed loading messages
  const [error, setError] = useState(''); // Error message
  const [viewMode, setViewMode] = useState('upload'); // 'upload', 'recipe', 'favorites', 'dailyRecipe', 'settings', 'history'
  const [modalMessage, setModalMessage] = useState(''); // Message for the modal
  const [modalOnConfirm, setModalOnConfirm] = useState(null);
  const [modalOnCancel, setModalOnCancel] = useState(null);
  const [showModalConfirmButton, setShowModalConfirmButton] = useState(false);
  const [favoriteRecipes, setFavoriteRecipes] = useState([]); // Stores favorite recipes
  const [generatedRecipesHistory, setGeneratedRecipesHistory] = useState([]); // Stores all generated recipes
  const [dailyRecipe, setDailyRecipe] = useState(null); // Stores the daily recipe
  const [lastDailyRecipeDate, setLastDailyRecipeDate] = useState(null); // Date when daily recipe was last generated
  const [language, setLanguage] = useState('fr'); // Default language is French, loaded from Firestore
  const [darkMode, setDarkMode] = useState(false); // Dark mode state, loaded from Firestore
  const [dietaryPreference, setDietaryPreference] = useState('none'); // Dietary preference state, loaded from Firestore
  const [cookingStreak, setCookingStreak] = useState(0); // Loaded from Firestore
  const [lastCookingLogDate, setLastCookingLogDate] = useState(''); // Loaded from Firestore
  const [copied, setCopied] = useState(false); // State for copy to clipboard feedback
  const [isFirstTimeUser, setIsFirstTimeUser] = useState(true); // Onboarding state

  // Nouveaux états pour les filtres granulaires
  const [cuisineType, setCuisineType] = useState('none');
  const [preparationTime, setPreparationTime] = useState('none');
  const [difficulty, setDifficulty] = useState('none');
  const [dishType, setDishType] = useState('none');

  // Filtres pour les favoris et l'historique
  const [favoriteSearchTerm, setFavoriteSearchTerm] = useState('');
  const [favoriteCuisineFilter, setFavoriteCuisineFilter] = useState('none');
  const [favoriteTimeFilter, setFavoriteTimeFilter] = useState('none');
  const [favoriteDifficultyFilter, setFavoriteDifficultyFilter] = useState('none');
  const [favoriteDietaryFilter, setFavoriteDietaryFilter] = useState('none');
  const [favoriteDishTypeFilter, setFavoriteDishTypeFilter] = useState('none');


  const fileInputRef = useRef(null); // Ref for hidden file input

  // Use useMemo to ensure t is only computed when language changes
  const t = useMemo(() => translations[language], [language]);

  // States for new LLM features
  const [showAdaptRecipeInput, setShowAdaptRecipeInput] = useState(false);
  const [adaptRecipePrompt, setAdaptRecipePrompt] = useState('');
  const [showSubstituteIngredientInput, setShowSubstituteIngredientInput] = useState(false);
  const [ingredientToSubstitute, setIngredientToSubstitute] = useState('');
  const [substituteWith, setSubstituteWith] = useState('');
  const [showScaleRecipeInput, setShowScaleRecipeInput] = useState(false);
  const [scaleServings, setScaleServings] = useState('');
  const [showCookingTipInput, setShowCookingTipInput] = useState(false);
  const [cookingTipPrompt, setCookingTipPrompt] = useState('');
  const [cookingTipResult, setCookingTipResult] = '';
  const [showFoodPairingInput, setShowFoodPairingInput] = useState(false);
  const [foodPairingQuery, setFoodPairingQuery] = useState('');
  const [foodPairingResult, setFoodPairingResult] = '';
  const [showOptimizeRecipeInput, setShowOptimizeRecipeInput] = useState(false);
  const [optimizeRecipePrompt, setOptimizeRecipePrompt] = useState('');
  const [showIngredientInfoInput, setShowIngredientInfoInput] = useState(false);
  const [ingredientInfoQuery, setIngredientInfoQuery] = useState('');
  const [ingredientInfoResult, setIngredientInfoResult] = '';


  // --- Firebase Authentication and Data Loading ---
  useEffect(() => {
    if (!auth || !db) {
      console.error(t.firebaseNotInitialized);
      setIsAuthReady(true); // Allow app to render even if Firebase is not available
      return;
    }

    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      let currentUserId;
      if (user) {
        currentUserId = user.uid;
      } else {
        // Sign in anonymously if no user is authenticated
        try {
          if (initialAuthToken) {
            await signInWithCustomToken(auth, initialAuthToken);
          } else {
            await signInAnonymously(auth);
          }
          currentUserId = auth.currentUser.uid;
        } catch (error) {
          console.error("Firebase anonymous sign-in failed:", error);
          currentUserId = crypto.randomUUID(); // Fallback to a random ID if auth fails
        }
      }
      setUserId(currentUserId);
      setIsAuthReady(true); // Mark auth as ready

      // Load user preferences and data from Firestore
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
          // If no profile exists, set initial defaults and mark as first-time user
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
            isFirstTimeUser: true, // Mark as first time
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
    });

    return () => unsubscribeAuth();
  }, [t.firebaseNotInitialized]); // Depend on translation for error message

  // --- Persist user preferences to Firestore when they change ---
  useEffect(() => {
    if (userId && isAuthReady && db) {
      const userProfileRef = doc(db, `artifacts/${appId}/users/${userId}/user_data/profile`);
      // Use setDoc with merge: true to ensure the document is created if it doesn't exist
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
  }, [language, darkMode, dietaryPreference, cuisineType, preparationTime, difficulty, dishType, userId, isAuthReady]);

  // --- Fonctions de gestion de l'état global ---

  const showModal = useCallback((message, onConfirm = null, onCancel = null, showConfirmButton = false) => {
    setModalMessage(message);
    setModalOnConfirm(() => onConfirm); // Use a function to set the state
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
    // More user-friendly error messages
    let displayMessage = msg;
    if (err && err.message) {
      if (err.message.includes('Failed to fetch')) {
        displayMessage = `${msg} Veuillez vérifier votre connexion internet.`;
      } else if (err.message.includes('quota')) { // Example for quota exceeded
        displayMessage = `${msg} Quota de l'API dépassé. Veuillez réessayer plus tard.`;
      } else {
        displayMessage = `${msg} ${err.message}`;
      }
    } else {
      displayMessage = `${msg} ${t.errorGeneric}`;
    }

    setError(displayMessage);
    showModal(displayMessage, closeModal, closeModal);
    setLoadingMessage(null); // Clear loading message on error
  }, [showModal, closeModal, t.errorGeneric]);

  const clearError = useCallback(() => {
    setError('');
  }, []);

  const resetAllStates = useCallback(() => {
    setSelectedImage(null);
    setDetectedIngredients([]);
    setNewIngredientInput('');
    setNewIngredientExpiry('');
    setNewIngredientQuantity(''); // Réinitialise la quantité
    setNewIngredientUnit('unit'); // Réinitialise l'unité
    setGeneratedRecipe('');
    setLoadingMessage(null); // Reset loading message
    setError('');
    setViewMode('upload');
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
    // Réinitialise les filtres
    // These are now synced from Firestore, so no need to reset locally
    // setCuisineType('none');
    // setPreparationTime('none');
    // setDifficulty('none');
    // setDishType('none');
    // Réinitialise les filtres de favoris/historique
    setFavoriteSearchTerm('');
    setFavoriteCuisineFilter('none');
    setFavoriteTimeFilter('none');
    setFavoriteDifficultyFilter('none');
    setFavoriteDietaryFilter('none');
    setFavoriteDishTypeFilter('none');
  }, []);

  const handleOnboardingComplete = useCallback(() => {
    if (userId && db) {
      const userProfileRef = doc(db, `artifacts/${appId}/users/${userId}/user_data/profile`);
      setDoc(userProfileRef, { isFirstTimeUser: false }, { merge: true }).catch(console.error); // Use setDoc with merge
    }
    setIsFirstTimeUser(false);
  }, [userId, db]);

  // --- Gestion de l'image et de la détection des ingrédients ---

  const handleImageUpload = useCallback((event) => {
    clearError();
    const file = event.target.files[0];
    if (file) {
      // NOTE: L'optimisation d'image lourde (redimensionnement, compression avancée)
      // devrait idéalement être gérée côté backend pour les très grandes images
      // afin de réduire la charge sur le client et le temps de transfert vers l'API Gemini.
      // Ici, nous lisons simplement le fichier en base64.
      // Si des tâches gourmandes en calcul côté client devaient être ajoutées (ex: filtres d'image complexes),
      // un Web Worker serait approprié pour ne pas bloquer le thread principal de l'interface utilisateur.
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result); // Stocke l'image en base64
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

    setLoadingMessage(t.analyzingImage); // Detailed loading message
    setGeneratedRecipe(''); // Clear previous recipe
    setDetectedIngredients([]); // Clear previous ingredients

    // Le backend est censé gérer l'optimisation de l'image (redimensionnement, compression)
    // avant de l'envoyer à l'API Gemini.
    const payload = { image: selectedImage, language, dietaryPreference };
    console.log('Sending analyze-image request to:', 'http://localhost:3001/api/analyze-image');
    console.log('Payload:', payload);

    try {
      const response = await fetch('http://localhost:3001/api/analyze-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      console.log('Analyze-image response status:', response.status);
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Analyze-image error data:', errorData);
        throw new Error(errorData.error || response.statusText);
      }

      const data = await response.json();
      console.log('Analyze-image response data:', data);
      // Lorsque l'IA détecte des ingrédients, initialisez quantité et unité par défaut
      const ingredientsArray = data.ingredients.map(ing => ({
        name: ing.trim(),
        quantity: 1, // Valeur par défaut
        unit: 'unit', // Valeur par défaut
        expiryDate: ''
      }));
      setDetectedIngredients(ingredientsArray.filter(ing => ing.name));
      showModal(t.detectedSuccess, closeModal, closeModal);
    } catch (err) {
      handleError(t.errorImageAnalysis, err);
    } finally {
      setLoadingMessage(null); // Clear loading message
    }
  }, [selectedImage, language, dietaryPreference, clearError, showModal, closeModal, handleError, t.errorNoImage, t.errorImageAnalysis, t.detectedSuccess, t.analyzingImage]);

  const handleAddIngredient = useCallback(() => {
    if (newIngredientInput.trim()) {
      setDetectedIngredients(prev => [...prev, {
        name: newIngredientInput.trim(),
        quantity: newIngredientQuantity ? parseFloat(newIngredientQuantity) : 1, // Parse float for quantity
        unit: newIngredientUnit,
        expiryDate: newIngredientExpiry
      }]);
      setNewIngredientInput('');
      setNewIngredientExpiry('');
      setNewIngredientQuantity(''); // Réinitialise la quantité
      setNewIngredientUnit('unit'); // Réinitialise l'unité
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

  // --- Génération et gestion des recettes ---

  const handleGenerateRecipe = useCallback(async () => {
    clearError();
    if (!isAuthReady || !userId || !db) {
      showModal(t.firebaseNotInitialized, closeModal, closeModal);
      return;
    }
    if (detectedIngredients.length === 0) {
      showModal(t.noIngredientsForRecipe, closeModal, closeModal);
      return;
    }

    setLoadingMessage(t.generatingRecipeDetailed); // Detailed loading message
    setGeneratedRecipe(''); // Clear previous recipe
    setViewMode('recipe'); // Switch to recipe view

    // Formate les ingrédients pour l'API en incluant quantité et unité
    const ingredientsString = detectedIngredients.map(ing => {
      let ingredientText = ing.name;
      if (ing.quantity && ing.quantity > 0) {
        ingredientText = `${ing.quantity} ${t[`unit${ing.unit.charAt(0).toUpperCase() + ing.unit.slice(1)}`] || ing.unit} de ${ing.name}`;
      } else {
        ingredientText = ing.name; // Si pas de quantité, juste le nom
      }
      if (ing.expiryDate) {
        ingredientText += ` (expire le ${ing.expiryDate})`;
      }
      return ingredientText;
    }).join(', ');

    // Construire le prompt avec les filtres
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

    prompt += ` La recette doit être en ${language === 'fr' ? 'français' : (language === 'en' ? 'anglais' : (language === 'de' ? 'allemand' : (language === 'es' ? 'espagnol' : 'italien')))}.`;

    const payload = { ingredients: ingredientsString, language, dietaryPreference, cuisineType, preparationTime, difficulty, dishType, prompt };
    console.log('Sending generate-recipe request to:', 'http://localhost:3001/api/generate-recipe');
    console.log('Payload:', payload);

    try {
      const response = await fetch('http://localhost:3001/api/generate-recipe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload), // Passer le prompt complet
      });

      console.log('Generate-recipe response status:', response.status);
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Generate-recipe error data:', errorData);
        throw new Error(errorData.error || response.statusText);
      }

      const data = await response.json();
      console.log('Generate-recipe response data:', data);
      setGeneratedRecipe(data.recipe);

      // Ajouter la recette générée à l'historique dans Firestore
      const historyCollectionRef = collection(db, `artifacts/${appId}/users/${userId}/generated_recipes_history`);
      await addDoc(historyCollectionRef, {
        title: data.recipe.substring(0, 50).split('\n')[0].trim() || t.recipeTitle,
        content: data.recipe,
        date: new Date().toISOString().slice(0, 10),
        filters: { cuisineType, preparationTime, difficulty, dishType, dietaryPreference }
      });

    } catch (err) {
      handleError(t.errorGenerateRecipe, err);
    } finally {
      setLoadingMessage(null); // Clear loading message
    }
  }, [detectedIngredients, language, dietaryPreference, cuisineType, preparationTime, difficulty, dishType, clearError, showModal, closeModal, handleError, t.noIngredientsForRecipe, t.errorGenerateRecipe, t.generatingRecipeDetailed, t, isAuthReady, userId, db, t.firebaseNotInitialized]);

  const isFavorite = useCallback((recipeContent) => {
    return favoriteRecipes.some(fav => fav.content === recipeContent);
  }, [favoriteRecipes]);

  const handleToggleFavorite = useCallback(async () => {
    if (!isAuthReady || !userId || !db) {
      showModal(t.firebaseNotInitialized, closeModal, closeModal);
      return;
    }
    if (!generatedRecipe) return;

    // Use a more robust ID for the favorite recipe document
    // For simplicity, using a hash or a part of the content might be better for uniqueness
    // For a real app, you might generate a UUID or use a server-generated ID
    const docId = btoa(generatedRecipe.substring(0, 100)).replace(/=/g, ''); // Base64 encode first 100 chars and remove padding
    const favoriteRecipeRef = doc(db, `artifacts/${appId}/users/${userId}/favorite_recipes`, docId);

    if (isFavorite(generatedRecipe)) {
      try {
        await deleteDoc(favoriteRecipeRef);
        showModal(t.recipeDeleted, closeModal, closeModal);
      } catch (e) {
        handleError("Erreur lors de la suppression du favori :", e);
      }
    } else {
      // Trouver l'entrée correspondante dans l'historique pour récupérer les filtres
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
  }, [generatedRecipe, isFavorite, showModal, closeModal, handleError, t.recipeDeleted, t.addToFavorites, t.favoriteRecipeTitle, generatedRecipesHistory, cuisineType, preparationTime, difficulty, dishType, dietaryPreference, userId, isAuthReady, db, t.firebaseNotInitialized]);

  const handleDeleteFavorite = useCallback(async (recipeIdToDelete) => {
    if (!isAuthReady || !userId || !db) {
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
  }, [showModal, closeModal, handleError, t.confirmDeleteRecipe, t.recipeDeleted, userId, isAuthReady, db, t.firebaseNotInitialized]);

  const copyRecipeToClipboard = useCallback(() => {
    if (generatedRecipe) {
      const tempTextArea = document.createElement('textarea');
      tempTextArea.value = generatedRecipe.replace(/<[^>]*>/g, ''); // Remove HTML tags
      document.body.appendChild(tempTextArea);
      tempTextArea.select();
      document.execCommand('copy');
      document.body.removeChild(tempTextArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000); // Reset copied state after 2 seconds
    }
  }, [generatedRecipe]);

  // --- Recette du jour ---
  const fetchDailyRecipe = useCallback(async () => {
    clearError();
    if (!isAuthReady || !userId || !db) {
      showModal(t.firebaseNotInitialized, closeModal, closeModal);
      return;
    }
    setLoadingMessage(t.generatingDailyRecipe); // Detailed loading message
    setDailyRecipe(null); // Clear previous daily recipe

    const today = new Date().toDateString();
    const dailyRecipeDocRef = doc(db, `artifacts/${appId}/users/${userId}/user_data/daily_recipe_cache`);

    // Check if daily recipe was already fetched today from Firestore
    const docSnap = await getDoc(dailyRecipeDocRef);
    if (docSnap.exists() && docSnap.data().lastDailyRecipeDate === today && docSnap.data().recipe) {
      setDailyRecipe(docSnap.data().recipe);
      setLastDailyRecipeDate(docSnap.data().lastDailyRecipeDate);
      setLoadingMessage(null);
      return; // Already fetched today, use cached
    }

    const payload = { language, dietaryPreference };
    console.log('Sending daily-recipe request to:', 'http://localhost:3001/api/daily-recipe');
    console.log('Payload:', payload);

    try {
      const response = await fetch('http://localhost:3001/api/daily-recipe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      console.log('Daily-recipe response status:', response.status);
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Daily-recipe error data:', errorData);
        throw new Error(errorData.error || response.statusText);
      }

      const data = await response.json();
      console.log('Daily-recipe response data:', data);
      setDailyRecipe(data.recipe);
      setLastDailyRecipeDate(today);

      // Save to Firestore cache
      await setDoc(dailyRecipeDocRef, { recipe: data.recipe, lastDailyRecipeDate: today }, { merge: true }); // Use setDoc with merge

    } catch (err) {
      handleError(t.noDailyRecipe, err);
    } finally {
      setLoadingMessage(null); // Clear loading message
    }
  }, [dailyRecipe, lastDailyRecipeDate, language, dietaryPreference, clearError, handleError, t.noDailyRecipe, t.generatingDailyRecipe, userId, isAuthReady, db, t.firebaseNotInitialized]);


  // --- Fonctions d'adaptation LLM ---

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

    setLoadingMessage(t.adaptingRecipeDetailed); // Detailed loading message
    const payload = { recipe: generatedRecipe, prompt: adaptRecipePrompt, language, dietaryPreference };
    console.log('Sending adapt-recipe request to:', 'http://localhost:3001/api/adapt-recipe');
    console.log('Payload:', payload);

    try {
      const response = await fetch('http://localhost:3001/api/adapt-recipe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      console.log('Adapt-recipe response status:', response.status);
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Adapt-recipe error data:', errorData);
        throw new Error(errorData.error || response.statusText);
      }

      const data = await response.json();
      console.log('Adapt-recipe response data:', data);
      setGeneratedRecipe(data.adaptedRecipe);
      setAdaptRecipePrompt('');
      setShowAdaptRecipeInput(false);
      showModal("Recette adaptée avec succès !", closeModal, closeModal);
    } catch (err) {
      handleError(t.errorAdaptRecipe, err);
    } finally {
      setLoadingMessage(null); // Clear loading message
    }
  }, [generatedRecipe, adaptRecipePrompt, language, dietaryPreference, clearError, showModal, closeModal, handleError, t.noRecipeToAdapt, t.errorAdaptRecipe, t.adaptingRecipeDetailed]);

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

    setLoadingMessage(t.substitutingIngredientDetailed); // Detailed loading message
    const payload = {
      recipe: generatedRecipe,
      ingredientToSubstitute,
      substituteWith: substituteWith.trim(),
      language,
      dietaryPreference
    };
    console.log('Sending substitute-ingredient request to:', 'http://localhost:3001/api/substitute-ingredient');
    console.log('Payload:', payload);

    try {
      const response = await fetch('http://localhost:3001/api/substitute-ingredient', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      console.log('Substitute-ingredient response status:', response.status);
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Substitute-ingredient error data:', errorData);
        throw new Error(errorData.error || response.statusText);
      }

      const data = await response.json();
      console.log('Substitute-ingredient response data:', data);
      setGeneratedRecipe(data.substitutedRecipe);
      setIngredientToSubstitute('');
      setSubstituteWith('');
      setShowSubstituteIngredientInput(false);
      showModal("Ingrédient substitué avec succès !", closeModal, closeModal);
    } catch (err) {
      handleError(t.errorSubstituteIngredient, err);
    } finally {
      setLoadingMessage(null); // Clear loading message
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

    setLoadingMessage(t.scalingRecipeDetailed); // Detailed loading message
    const payload = { recipe: generatedRecipe, servings, language, dietaryPreference };
    console.log('Sending scale-recipe request to:', 'http://localhost:3001/api/scale-recipe');
    console.log('Payload:', payload);

    try {
      const response = await fetch('http://localhost:3001/api/scale-recipe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      console.log('Scale-recipe response status:', response.status);
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Scale-recipe error data:', errorData);
        throw new Error(errorData.error || response.statusText);
      }

      const data = await response.json();
      console.log('Scale-recipe response data:', data);
      setGeneratedRecipe(data.scaledRecipe);
      setScaleServings('');
      setShowScaleRecipeInput(false);
      showModal("Quantité de recette adaptée avec succès !", closeModal, closeModal);
    } catch (err) {
      handleError(t.errorAdaptRecipe, err); // Reusing adapt error message
    } finally {
      setLoadingMessage(null); // Clear loading message
    }
  }, [generatedRecipe, scaleServings, language, dietaryPreference, clearError, showModal, closeModal, handleError, t.noRecipeToAdapt, t.errorAdaptRecipe, t.scalingRecipeDetailed]);

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

    setLoadingMessage(t.gettingTipDetailed); // Detailed loading message
    setCookingTipResult('');
    const payload = { recipe: generatedRecipe, question: cookingTipPrompt, language, dietaryPreference };
    console.log('Sending cooking-tip request to:', 'http://localhost:3001/api/cooking-tip');
    console.log('Payload:', payload);

    try {
      const response = await fetch('http://localhost:3001/api/cooking-tip', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      console.log('Cooking-tip response status:', response.status);
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Cooking-tip error data:', errorData);
        throw new Error(errorData.error || response.statusText);
      }

      const data = await response.json();
      console.log('Cooking-tip response data:', data);
      setCookingTipResult(data.tip);
    } catch (err) {
      handleError("Erreur lors de l'obtention du conseil : ", err);
    } finally {
      setLoadingMessage(null); // Clear loading message
    }
  }, [generatedRecipe, cookingTipPrompt, language, dietaryPreference, clearError, showModal, closeModal, handleError, t.noRecipeForTip, t.gettingTipDetailed]);

  const handleGenerateMealPrepGuide = useCallback(async () => {
    clearError();
    if (!generatedRecipe) {
      showModal(t.noRecipeForMealPrep, closeModal, closeModal);
      return;
    }

    setLoadingMessage(t.generatingMealPrepGuideDetailed); // Detailed loading message
    const payload = { recipe: generatedRecipe, language, dietaryPreference };
    console.log('Sending meal-prep-guide request to:', 'http://localhost:3001/api/meal-prep-guide');
    console.log('Payload:', payload);

    try {
      const response = await fetch('http://localhost:3001/api/meal-prep-guide', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      console.log('Meal-prep-guide response status:', response.status);
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Meal-prep-guide error data:', errorData);
        throw new Error(errorData.error || response.statusText);
      }

      const data = await response.json();
      console.log('Meal-prep-guide response data:', data);
      setGeneratedRecipe(data.guide);
      showModal("Guide de préparation généré !", closeModal, closeModal);
      setViewMode('recipe'); // Show the guide in the recipe section
    } catch (err) {
      handleError("Erreur lors de la génération du guide : ", err);
    } finally {
      setLoadingMessage(null); // Clear loading message
    }
  }, [generatedRecipe, language, dietaryPreference, clearError, showModal, closeModal, handleError, t.noRecipeForMealPrep, t.generatingMealPrepGuideDetailed]);

  const handleGetFoodPairingSuggestions = useCallback(async () => {
    clearError();
    if (!foodPairingQuery.trim()) {
      showModal(t.noFoodForPairing, closeModal, closeModal);
      return;
    }

    setLoadingMessage(t.gettingFoodPairingsDetailed); // Detailed loading message
    setFoodPairingResult('');
    const payload = { food: foodPairingQuery, language, dietaryPreference };
    console.log('Sending food-pairing request to:', 'http://localhost:3001/api/food-pairing');
    console.log('Payload:', payload);

    try {
      const response = await fetch('http://localhost:3001/api/food-pairing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      console.log('Food-pairing response status:', response.status);
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Food-pairing error data:', errorData);
        throw new Error(errorData.error || response.statusText);
      }

      const data = await response.json();
      console.log('Food-pairing response data:', data);
      setFoodPairingResult(data.pairings);
    } catch (err) {
      handleError("Erreur lors de l'obtention des suggestions : ", err);
    } finally {
      setLoadingMessage(null); // Clear loading message
    }
  }, [foodPairingQuery, language, dietaryPreference, clearError, showModal, closeModal, handleError, t.noFoodForPairing, t.gettingFoodPairingsDetailed]);

  const handleGetIngredientInfo = useCallback(async () => {
    clearError();
    if (!ingredientInfoQuery.trim()) {
      showModal(t.noIngredientForInfo, closeModal, closeModal);
      return;
    }

    // --- Mise en cache de l'information sur les ingrédients ---
    const cacheKey = `ingredientInfo_${language}_${ingredientInfoQuery.toLowerCase()}`;
    const cachedData = localStorage.getItem(cacheKey);
    const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

    if (cachedData) {
      const { data, timestamp } = JSON.parse(cachedData);
      if (Date.now() - timestamp < CACHE_DURATION) {
        console.log('Using cached ingredient info:', ingredientInfoQuery);
        setIngredientInfoResult(data);
        return; // Exit early, use cached data
      }
    }

    setLoadingMessage(t.gettingIngredientInfoDetailed); // Detailed loading message
    setIngredientInfoResult('');
    const payload = { ingredientName: ingredientInfoQuery, language, dietaryPreference };
    console.log('Sending ingredient-info request to:', 'http://localhost:3001/api/ingredient-info');
    console.log('Payload:', payload);

    try {
      const response = await fetch('http://localhost:3001/api/ingredient-info', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      console.log('Ingredient-info response status:', response.status);
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Ingredient-info error data:', errorData);
        throw new Error(errorData.error || response.statusText);
      }

      const data = await response.json();
      console.log('Ingredient-info response data:', data);
      setIngredientInfoResult(data.info);

      // Cache the new data
      localStorage.setItem(cacheKey, JSON.stringify({ data: data.info, timestamp: Date.now() }));

    } catch (err) {
      handleError("Erreur lors de l'obtention des informations : ", err);
    } finally {
      setLoadingMessage(null); // Clear loading message
    }
  }, [ingredientInfoQuery, language, dietaryPreference, clearError, showModal, closeModal, handleError, t.noIngredientForInfo, t.gettingIngredientInfoDetailed]);

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

    setLoadingMessage(t.optimizingRecipeDetailed); // Detailed loading message
    const payload = { recipe: generatedRecipe, healthGoals: optimizeRecipePrompt, language, dietaryPreference };
    console.log('Sending optimize-recipe-health request to:', 'http://localhost:3001/api/optimize-recipe-health');
    console.log('Payload:', payload);

    try {
      const response = await fetch('http://localhost:3001/api/optimize-recipe-health', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      console.log('Optimize-recipe-health response status:', response.status);
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Optimize-recipe-health error data:', errorData);
        throw new Error(errorData.error || response.statusText);
      }

      const data = await response.json();
      console.log('Optimize-recipe-health response data:', data);
      setGeneratedRecipe(data.optimizedRecipe);
      setOptimizeRecipePrompt('');
      setShowOptimizeRecipeInput(false);
      showModal("Recette optimisée pour la santé !", closeModal, closeModal);
    } catch (err) {
      handleError(t.errorOptimizeRecipe, err);
    } finally {
      setLoadingMessage(null); // Clear loading message
    }
  }, [generatedRecipe, optimizeRecipePrompt, language, dietaryPreference, clearError, showModal, closeModal, handleError, t.noRecipeToOptimize, t.errorOptimizeRecipe, t.optimizingRecipeDetailed]);


  // --- Gestion des données globales ---
  const handleClearAllData = useCallback(async () => {
    if (!isAuthReady || !userId || !db) {
      showModal(t.firebaseNotInitialized, closeModal, closeModal);
      return;
    }
    showModal(t.confirmClearAllData, async () => {
      try {
        // Delete user profile document
        await deleteDoc(doc(db, `artifacts/${appId}/users/${userId}/user_data/profile`));
        // Delete daily recipe cache
        await deleteDoc(doc(db, `artifacts/${appId}/users/${userId}/user_data/daily_recipe_cache`));

        // Delete all favorite recipes
        const favoriteDocs = await getDocs(collection(db, `artifacts/${appId}/users/${userId}/favorite_recipes`));
        for (const doc of favoriteDocs.docs) {
          await deleteDoc(doc.ref);
        }

        // Delete all generated recipes history
        const historyDocs = await getDocs(collection(db, `artifacts/${appId}/users/${userId}/generated_recipes_history`));
        for (const doc of historyDocs.docs) {
          await deleteDoc(doc.ref);
        }

        // Clear local states
        setFavoriteRecipes([]);
        setGeneratedRecipesHistory([]);
        setDailyRecipe(null);
        setLastDailyRecipeDate(null);
        setCookingStreak(0);
        setLastCookingLogDate('');
        // Reset local preferences to default (will be re-synced from Firestore if profile is recreated)
        setLanguage('fr');
        setDarkMode(false);
        setDietaryPreference('none');
        setCuisineType('none');
        setPreparationTime('none');
        setDifficulty('none');
        setDishType('none');
        setIsFirstTimeUser(true); // Mark as first time user again

        resetAllStates(); // Resets only the "volatile" states
        closeModal();
        showModal(t.dataCleared, closeModal, closeModal);
      } catch (e) {
        handleError("Erreur lors de l'effacement des données :", e);
      }
    }, closeModal, true);
  }, [showModal, closeModal, resetAllStates, handleError, t.confirmClearAllData, t.dataCleared, userId, isAuthReady, db, t.firebaseNotInitialized]);


  // --- Gestion du défi cuisine (Cooking Streak) ---
  const handleUploadMealPhoto = useCallback(async () => {
    clearError();
    if (!isAuthReady || !userId || !db) {
      showModal(t.firebaseNotInitialized, closeModal, closeModal);
      return;
    }
    if (!selectedImage) {
      showModal("Veuillez d'abord télécharger une photo de votre plat.", closeModal, closeModal);
      return;
    }

    const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
    if (lastCookingLogDate === today) {
      showModal(t.alreadyLoggedToday, closeModal, closeModal);
      return;
    }

    setLoadingMessage(t.uploadingMealPhotoDetailed); // Detailed loading message
    const payload = { image: selectedImage, lastLogDate: lastCookingLogDate, currentStreak: cookingStreak };
    console.log('Sending log-meal-photo request to:', 'http://localhost:3001/api/log-meal-photo');
    console.log('Payload:', payload);

    try {
      const response = await fetch('http://localhost:3001/api/log-meal-photo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      console.log('Log-meal-photo response status:', response.status);
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Log-meal-photo error data:', errorData);
        throw new Error(errorData.error || response.statusText);
      }

      const data = await response.json();
      console.log('Log-meal-photo response data:', data);
      const newStreak = data.newStreak;
      const message = newStreak > cookingStreak ? t.streakIncreased.replace('{streak}', newStreak) : t.streakReset;

      // Update Firestore with new streak and last log date
      const userProfileRef = doc(db, `artifacts/${appId}/users/${userId}/user_data/profile`);
      await setDoc(userProfileRef, { // Use setDoc with merge: true
        cookingStreak: newStreak,
        lastCookingLogDate: today,
      }, { merge: true });

      setCookingStreak(newStreak);
      setLastCookingLogDate(today);
      showModal(message, closeModal, closeModal);
    } catch (err) {
      handleError("Erreur lors de l'enregistrement du plat : ", err);
    } finally {
      setLoadingMessage(null); // Clear loading message
    }
  }, [selectedImage, lastCookingLogDate, cookingStreak, clearError, showModal, closeModal, handleError, t.alreadyLoggedToday, t.streakIncreased, t.streakReset, t.uploadingMealPhotoDetailed, userId, isAuthReady, db, t.firebaseNotInitialized]);


  // --- Logique de filtrage pour les favoris et l'historique ---
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

  if (!isAuthReady) {
    return (
      <div className={`min-h-screen flex flex-col items-center justify-center ${darkMode ? 'bg-gray-900 text-gray-100' : 'bg-gray-100 text-gray-800'}`}>
        <Loader2 className="w-16 h-16 animate-spin text-indigo-600" />
        <p className="mt-4 text-lg">Chargement de l'application...</p>
      </div>
    );
  }

  return (
    <div className={`min-h-screen flex flex-col ${darkMode ? 'bg-gradient-to-br from-gray-900 to-gray-800 text-gray-100' : 'bg-gradient-to-br from-gray-100 to-gray-200 text-gray-800'} transition-colors duration-300 font-sans`}>
      {/* Styles personnalisés injectés */}
      <style>{customAnimations}</style>

      {/* Barre de navigation / Header */}
      <header className={`py-4 shadow-lg ${darkMode ? 'bg-gray-800' : 'bg-white'} border-b border-gray-200 ${darkMode ? 'border-gray-700' : ''}`}>
        <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center">
          <h1 className="text-3xl font-extrabold text-indigo-600 flex items-center gap-2 mb-4 md:mb-0">
            <Utensils className="w-8 h-8 transition-transform duration-300 hover:scale-110 hover:rotate-6" /> {t.appTitle}
          </h1>
          <nav className="flex flex-wrap justify-center gap-2">
            <button
              onClick={() => { setViewMode('upload'); resetAllStates(); }}
              className={`px-4 py-2 rounded-lg text-lg font-semibold transition-all duration-300 flex items-center gap-2
                ${viewMode === 'upload' ? 'bg-indigo-600 text-white shadow-md animate-pulse-glow' : (darkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-200')}
                hover:scale-105 hover:-translate-y-1 active:scale-98 focus:outline-none focus:ring-2 focus:ring-indigo-500
              `}
              aria-label={t.uploadSectionTitle}
            >
              <Camera className="w-5 h-5 transition-transform duration-200 hover:scale-110" /> {t.uploadSectionTitle.split(' ')[0]}
            </button>
            <button
              onClick={() => setViewMode('favorites')}
              className={`px-4 py-2 rounded-lg text-lg font-semibold transition-all duration-300 flex items-center gap-2
                ${viewMode === 'favorites' ? 'bg-indigo-600 text-white shadow-md animate-pulse-glow' : (darkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-200')}
                hover:scale-105 hover:-translate-y-1 active:scale-98 focus:outline-none focus:ring-2 focus:ring-indigo-500
              `}
              aria-label={t.favorites}
            >
              <Heart className="w-5 h-5 transition-transform duration-200 hover:scale-110" /> {t.favorites}
            </button>
            <button
              onClick={() => setViewMode('history')} // Nouveau bouton pour l'historique
              className={`px-4 py-2 rounded-lg text-lg font-semibold transition-all duration-300 flex items-center gap-2
                ${viewMode === 'history' ? 'bg-indigo-600 text-white shadow-md animate-pulse-glow' : (darkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-200')}
                hover:scale-105 hover:-translate-y-1 active:scale-98 focus:outline-none focus:ring-2 focus:ring-indigo-500
              `}
              aria-label={t.history}
            >
              <History className="w-5 h-5 transition-transform duration-200 hover:scale-110" /> {t.history}
            </button>
            <button
              onClick={() => { setViewMode('dailyRecipe'); fetchDailyRecipe(); }}
              className={`px-4 py-2 rounded-lg text-lg font-semibold transition-all duration-300 flex items-center gap-2
                ${viewMode === 'dailyRecipe' ? 'bg-indigo-600 text-white shadow-md animate-pulse-glow' : (darkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-200')}
                hover:scale-105 hover:-translate-y-1 active:scale-98 focus:outline-none focus:ring-2 focus:ring-indigo-500
              `}
              aria-label={t.recipeOfTheDay}
            >
              <Sun className="w-5 h-5 transition-transform duration-200 hover:scale-110" /> {t.recipeOfTheDay}
            </button>
            <button
              onClick={() => setViewMode('settings')}
              className={`px-4 py-2 rounded-lg text-lg font-semibold transition-all duration-300 flex items-center gap-2
                ${viewMode === 'settings' ? 'bg-indigo-600 text-white shadow-md animate-pulse-glow' : (darkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-200')}
                hover:scale-105 hover:-translate-y-1 active:scale-98 focus:outline-none focus:ring-2 focus:ring-indigo-500
              `}
              aria-label={t.settings}
            >
              <Settings className="w-5 h-5 transition-transform duration-200 hover:scale-110" /> {t.settings}
            </button>
          </nav>
        </div>
      </header>

      {/* Contenu principal */}
      <main className="container mx-auto px-4 py-8 flex-grow">
        {error && (
          <div className={`mt-4 mb-8 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg flex items-center gap-2 ${darkMode ? 'bg-red-900 border-red-700 text-red-200' : ''} animate-fadeIn`} role="alert">
            <Info className="w-5 h-5" aria-hidden="true" /> {error}
          </div>
        )}

        {viewMode === 'upload' && (
          <section className={`p-8 rounded-xl shadow-2xl ${darkMode ? 'bg-gray-800' : 'bg-white'} transition-shadow duration-300 animate-fadeInUp`}>
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-3 text-indigo-700 dark:text-indigo-400">
              <Eye className="w-7 h-7 transition-transform duration-200 hover:scale-110 hover:rotate-3" aria-hidden="true" /> {t.uploadSectionTitle}
            </h2>

            <div
              className={`border-2 border-dashed border-gray-300 ${darkMode ? 'border-gray-600' : ''} rounded-xl p-10 text-center cursor-pointer transition-all duration-300 relative overflow-hidden group
              ${selectedImage ? 'hover:bg-transparent' : (darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50')}
              ${loadingMessage ? 'pointer-events-none opacity-70' : 'hover:border-indigo-500 dark:hover:border-indigo-400'}
              `}
              onClick={() => !loadingMessage && fileInputRef.current.click()} // Disable click during any loading
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
              <div className={`mt-8 p-6 border rounded-xl border-gray-200 ${darkMode ? 'border-gray-700 bg-gray-700' : 'bg-gray-50'} shadow-inner animate-fadeInUp`}>
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-indigo-700 dark:text-indigo-400">
                  <Salad className="w-6 h-6 transition-transform duration-200 hover:scale-110" aria-hidden="true" /> {t.ingredientsDetected}
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
                      {/* Champs éditables pour quantité et unité */}
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
                    className={`col-span-full md:col-span-2 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${darkMode ? 'bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400' : 'bg-white text-gray-800'} transition-all duration-200`}
                    aria-label={t.placeholderIngredients}
                  />
                  <input
                    type="number"
                    placeholder={t.addQuantity}
                    value={newIngredientQuantity}
                    onChange={(e) => setNewIngredientQuantity(e.target.value)}
                    className={`p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${darkMode ? 'bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400' : 'bg-white text-gray-800'} transition-all duration-200`}
                    aria-label={t.addQuantity}
                  />
                  <select
                    value={newIngredientUnit}
                    onChange={(e) => setNewIngredientUnit(e.target.value)}
                    className={`p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${darkMode ? 'bg-gray-700 border-gray-600 text-gray-100' : 'bg-white text-gray-800'} transition-all duration-200`}
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
                    onChange={(e) => setNewIngredientExpiry(e.target.value)}
                    className={`col-span-full md:col-span-2 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${darkMode ? 'bg-gray-700 border-gray-600 text-gray-100' : 'bg-white text-gray-800'} transition-all duration-200`}
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

                {/* Nouveaux filtres de personnalisation */}
                <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Type de cuisine */}
                  <div>
                    <label htmlFor="cuisine-type-select" className="block text-md font-semibold mb-2 text-indigo-700 dark:text-indigo-400 flex items-center gap-1">
                      <ChefHat className="w-4 h-4 transition-transform duration-200 hover:scale-110" aria-hidden="true" /> {t.cuisineType}
                    </label>
                    <select
                      id="cuisine-type-select"
                      value={cuisineType}
                      onChange={(e) => setCuisineType(e.target.value)}
                      className={`w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${darkMode ? 'bg-gray-700 border-gray-600 text-gray-100' : 'bg-white text-gray-800'} transition-all duration-200`}
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

                  {/* Temps de préparation */}
                  <div>
                    <label htmlFor="prep-time-select" className="block text-md font-semibold mb-2 text-indigo-700 dark:text-indigo-400 flex items-center gap-1">
                      <Clock className="w-4 h-4 transition-transform duration-200 hover:scale-110" aria-hidden="true" /> {t.prepTime}
                    </label>
                    <select
                      id="prep-time-select"
                      value={preparationTime}
                      onChange={(e) => setPreparationTime(e.target.value)}
                      className={`w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${darkMode ? 'bg-gray-700 border-gray-600 text-gray-100' : 'bg-white text-gray-800'} transition-all duration-200`}
                      aria-label={t.prepTime}
                    >
                      <option value="none">{t.timeNone}</option>
                      <option value="quick">{t.timeQuick}</option>
                      <option value="medium">{t.timeMedium}</option>
                      <option value="long">{t.timeLong}</option>
                    </select>
                  </div>

                  {/* Difficulté */}
                  <div>
                    <label htmlFor="difficulty-select" className="block text-md font-semibold mb-2 text-indigo-700 dark:text-indigo-400 flex items-center gap-1">
                      <TrendingUp className="w-4 h-4 transition-transform duration-200 hover:scale-110" aria-hidden="true" /> {t.difficulty}
                    </label>
                    <select
                      id="difficulty-select"
                      value={difficulty}
                      onChange={(e) => setDifficulty(e.target.value)}
                      className={`w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${darkMode ? 'bg-gray-700 border-gray-600 text-gray-100' : 'bg-white text-gray-800'} transition-all duration-200`}
                      aria-label={t.difficulty}
                    >
                      <option value="none">{t.difficultyNone}</option>
                      <option value="easy">{t.difficultyEasy}</option>
                      <option value="medium">{t.difficultyMedium}</option>
                      <option value="hard">{t.difficultyHard}</option>
                    </select>
                  </div>

                  {/* Type de plat */}
                  <div>
                    <label htmlFor="dish-type-select" className="block text-md font-semibold mb-2 text-indigo-700 dark:text-indigo-400 flex items-center gap-1">
                      <Utensils className="w-4 h-4 transition-transform duration-200 hover:scale-110" aria-hidden="true" /> {t.dishType}
                    </label>
                    <select
                      id="dish-type-select"
                      value={dishType}
                      onChange={(e) => setDishType(e.target.value)}
                      className={`w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${darkMode ? 'bg-gray-700 border-gray-600 text-gray-100' : 'bg-white text-gray-800'} transition-all duration-200`}
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
          </section>
        )}

        {viewMode === 'recipe' && (
          <section className={`p-8 rounded-xl shadow-2xl ${darkMode ? 'bg-gray-800' : 'bg-white'} transition-shadow duration-300 animate-fadeInUp`}>
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-3 text-indigo-700 dark:text-indigo-400">
              <Utensils className="w-7 h-7 transition-transform duration-200 hover:scale-110 hover:rotate-3" aria-hidden="true" /> {t.recipeTitle}
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
              <div className={`prose dark:prose-invert max-w-none p-6 rounded-lg ${darkMode ? 'bg-gray-700 text-gray-200' : 'bg-gray-50 text-gray-700'} shadow-inner mb-6 animate-fadeIn`}>
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
                  <Heart className="w-5 h-5 transition-transform duration-200 hover:scale-110" aria-hidden="true" /> {isFavorite(generatedRecipe) ? t.removeFromFavorites : t.addToFavorites}
                </button>
                <button
                  onClick={() => resetAllStates()}
                  className="px-6 py-3 rounded-lg text-lg font-semibold bg-gray-300 text-gray-800 hover:bg-gray-400 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 transition-colors duration-300 flex items-center gap-2 shadow-md hover:shadow-lg transform hover:scale-105 hover:-translate-y-1 active:scale-98 focus:outline-none focus:ring-2 focus:ring-gray-500"
                  aria-label={t.newAnalysis}
                >
                  <Camera className="w-5 h-5 transition-transform duration-200 hover:scale-110" aria-hidden="true" /> {t.newAnalysis}
                </button>
              </div>
            )}

            {/* LLM Adaptations */}
            {generatedRecipe && !loadingMessage && (
              <div className="mt-10 pt-8 border-t border-gray-200 dark:border-gray-700">
                <h3 className="text-xl font-bold mb-4 text-indigo-700 dark:text-indigo-400">Améliorez votre recette :</h3>

                {/* Adapt Recipe */}
                <div className={`mb-4 p-4 rounded-xl border border-gray-200 ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white'} shadow-md transition-all duration-300 ease-in-out overflow-hidden`}>
                  <button
                    onClick={() => setShowAdaptRecipeInput(prev => !prev)}
                    className="w-full text-left font-semibold text-lg flex items-center justify-between py-2 hover:text-indigo-600 dark:hover:text-indigo-300 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded-md"
                    aria-expanded={showAdaptRecipeInput}
                    aria-controls="adapt-recipe-panel"
                  >
                    <span className="flex items-center gap-2"><Salad className="w-5 h-5 transition-transform duration-200 hover:scale-110" aria-hidden="true" /> {t.adaptRecipe}</span>
                    <ChevronDown className={`w-5 h-5 transition-transform duration-300 ${showAdaptRecipeInput ? 'rotate-180' : ''}`} aria-hidden="true" />
                  </button>
                  {showAdaptRecipeInput && (
                    <div id="adapt-recipe-panel" className="mt-4 animate-fadeIn">
                      <input
                        type="text"
                        placeholder={t.enterAdaptRequest}
                        value={adaptRecipePrompt}
                        onChange={(e) => setAdaptRecipePrompt(e.target.value)}
                        className={`w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${darkMode ? 'bg-gray-900 border-gray-600 text-gray-100 placeholder-gray-400' : 'bg-white text-gray-800'} transition-all duration-200`}
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
                    </div>
                  )}
                </div>

                {/* Substitute Ingredient */}
                <div className={`mb-4 p-4 rounded-xl border border-gray-200 ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white'} shadow-md transition-all duration-300 ease-in-out overflow-hidden`}>
                  <button
                    onClick={() => setShowSubstituteIngredientInput(prev => !prev)}
                    className="w-full text-left font-semibold text-lg flex items-center justify-between py-2 hover:text-indigo-600 dark:hover:text-indigo-300 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded-md"
                    aria-expanded={showSubstituteIngredientInput}
                    aria-controls="substitute-ingredient-panel"
                  >
                    <span className="flex items-center gap-2"><Apple className="w-5 h-5 transition-transform duration-200 hover:scale-110" aria-hidden="true" /> {t.substituteIngredient}</span>
                    <ChevronDown className={`w-5 h-5 transition-transform duration-300 ${showSubstituteIngredientInput ? 'rotate-180' : ''}`} aria-hidden="true" />
                  </button>
                  {showSubstituteIngredientInput && (
                    <div id="substitute-ingredient-panel" className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 animate-fadeIn">
                      <input
                        type="text"
                        placeholder={t.enterIngredientToSubstitute}
                        value={ingredientToSubstitute}
                        onChange={(e) => setIngredientToSubstitute(e.target.value)}
                        className={`p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${darkMode ? 'bg-gray-900 border-gray-600 text-gray-100 placeholder-gray-400' : 'bg-white text-gray-800'} transition-all duration-200`}
                        disabled={!!loadingMessage}
                        aria-label={t.enterIngredientToSubstitute}
                      />
                      <input
                        type="text"
                        placeholder={t.enterSubstituteWith}
                        value={substituteWith}
                        onChange={(e) => setSubstituteWith(e.target.value)}
                        className={`p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${darkMode ? 'bg-gray-900 border-gray-600 text-gray-100 placeholder-gray-400' : 'bg-white text-gray-800'} transition-all duration-200`}
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
                    </div>
                  )}
                </div>

                {/* Scale Recipe */}
                <div className={`mb-4 p-4 rounded-xl border border-gray-200 ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white'} shadow-md transition-all duration-300 ease-in-out overflow-hidden`}>
                  <button
                    onClick={() => setShowScaleRecipeInput(prev => !prev)}
                    className="w-full text-left font-semibold text-lg flex items-center justify-between py-2 hover:text-indigo-600 dark:hover:text-indigo-300 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded-md"
                    aria-expanded={showScaleRecipeInput}
                    aria-controls="scale-recipe-panel"
                  >
                    <span className="flex items-center gap-2"><Package className="w-5 h-5 transition-transform duration-200 hover:scale-110" aria-hidden="true" /> {t.scaleRecipe}</span>
                    <ChevronDown className={`w-5 h-5 transition-transform duration-300 ${showScaleRecipeInput ? 'rotate-180' : ''}`} aria-hidden="true" />
                  </button>
                  {showScaleRecipeInput && (
                    <div id="scale-recipe-panel" className="mt-4 animate-fadeIn">
                      <input
                        type="number"
                        placeholder={t.enterServings}
                        value={scaleServings}
                        onChange={(e) => setScaleServings(e.target.value)}
                        className={`w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${darkMode ? 'bg-gray-900 border-gray-600 text-gray-100 placeholder-gray-400' : 'bg-white text-gray-800'} transition-all duration-200`}
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
                    </div>
                  )}
                </div>

                {/* Optimize Recipe Health */}
                <div className={`mb-4 p-4 rounded-xl border border-gray-200 ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white'} shadow-md transition-all duration-300 ease-in-out overflow-hidden`}>
                  <button
                    onClick={() => setShowOptimizeRecipeInput(prev => !prev)}
                    className="w-full text-left font-semibold text-lg flex items-center justify-between py-2 hover:text-indigo-600 dark:hover:text-indigo-300 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded-md"
                    aria-expanded={showOptimizeRecipeInput}
                    aria-controls="optimize-recipe-panel"
                  >
                    <span className="flex items-center gap-2"><Heart className="w-5 h-5 transition-transform duration-200 hover:scale-110" aria-hidden="true" /> {t.optimizeRecipeHealth}</span>
                    <ChevronDown className={`w-5 h-5 transition-transform duration-300 ${showOptimizeRecipeInput ? 'rotate-180' : ''}`} aria-hidden="true" />
                  </button>
                  {showOptimizeRecipeInput && (
                    <div id="optimize-recipe-panel" className="mt-4 animate-fadeIn">
                      <input
                        type="text"
                        placeholder={t.enterHealthGoals}
                        value={optimizeRecipePrompt}
                        onChange={(e) => setOptimizeRecipePrompt(e.target.value)}
                        className={`w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${darkMode ? 'bg-gray-900 border-gray-600 text-gray-100 placeholder-gray-400' : 'bg-white text-gray-800'} transition-all duration-200`}
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
                    </div>
                  )}
                </div>

                {/* Ask Cooking Tip */}
                <div className={`mb-4 p-4 rounded-xl border border-gray-200 ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white'} transition-all duration-300 ease-in-out overflow-hidden`}>
                  <button
                    onClick={() => setShowCookingTipInput(prev => !prev)}
                    className="w-full text-left font-semibold text-lg flex items-center justify-between py-2 hover:text-indigo-600 dark:hover:text-indigo-300 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded-md"
                    aria-expanded={showCookingTipInput}
                    aria-controls="cooking-tip-panel"
                  >
                    <span className="flex items-center gap-2"><Lightbulb className="w-5 h-5 transition-transform duration-200 hover:scale-110" aria-hidden="true" /> {t.askCookingTip}</span>
                    <ChevronDown className={`w-5 h-5 transition-transform duration-300 ${showCookingTipInput ? 'rotate-180' : ''}`} aria-hidden="true" />
                  </button>
                  {showCookingTipInput && (
                    <div id="cooking-tip-panel" className="mt-4 animate-fadeIn">
                      <input
                        type="text"
                        placeholder={t.enterCookingQuestion}
                        value={cookingTipPrompt}
                        onChange={(e) => setCookingTipPrompt(e.target.value)}
                        className={`w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${darkMode ? 'bg-gray-900 border-gray-600 text-gray-100 placeholder-gray-400' : 'bg-white text-gray-800'} transition-all duration-200`}
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
                    </div>
                  )}
                </div>

                {/* Meal Prep Guide */}
                <div className={`mb-4 p-4 rounded-xl border border-gray-200 ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white'} shadow-md transition-all duration-300 ease-in-out overflow-hidden`}>
                  <button
                    onClick={handleGenerateMealPrepGuide}
                    className="w-full text-left font-semibold text-lg flex items-center justify-between py-2 hover:text-indigo-600 dark:hover:text-indigo-300 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded-md"
                    disabled={!!loadingMessage || !generatedRecipe}
                    aria-label={loadingMessage ? loadingMessage : t.mealPrepGuide}
                  >
                    <span className="flex items-center gap-2"><ChefHat className="w-5 h-5 transition-transform duration-200 hover:scale-110" aria-hidden="true" /> {t.mealPrepGuide}</span>
                    {loadingMessage && <LoadingSpinner />}
                    {!loadingMessage && <CheckCircle className="w-5 h-5 text-emerald-500" aria-hidden="true" />}
                  </button>
                </div>

                {/* Food Pairing Suggestions */}
                <div className={`mb-4 p-4 rounded-xl border border-gray-200 ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white'} shadow-md transition-all duration-300 ease-in-out overflow-hidden`}>
                  <button
                    onClick={() => setShowFoodPairingInput(prev => !prev)}
                    className="w-full text-left font-semibold text-lg flex items-center justify-between py-2 hover:text-indigo-600 dark:hover:text-indigo-300 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded-md"
                    aria-expanded={showFoodPairingInput}
                    aria-controls="food-pairing-panel"
                  >
                    <span className="flex items-center gap-2"><Salad className="w-5 h-5 transition-transform duration-200 hover:scale-110" aria-hidden="true" /> {t.foodPairingSuggestions}</span>
                    <ChevronDown className={`w-5 h-5 transition-transform duration-300 ${showFoodPairingInput ? 'rotate-180' : ''}`} aria-hidden="true" />
                  </button>
                  {showFoodPairingInput && (
                    <div id="food-pairing-panel" className="mt-4 animate-fadeIn">
                      <input
                        type="text"
                        placeholder={t.enterFoodForPairing}
                        value={foodPairingQuery}
                        onChange={(e) => setFoodPairingQuery(e.target.value)}
                        className={`w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${darkMode ? 'bg-gray-900 border-gray-600 text-gray-100 placeholder-gray-400' : 'bg-white text-gray-800'} transition-all duration-200`}
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
                    </div>
                  )}
                </div>

                {/* Get Ingredient Info */}
                <div className={`mb-4 p-4 rounded-xl border border-gray-200 ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white'} shadow-md transition-all duration-300 ease-in-out overflow-hidden`}>
                  <button
                    onClick={() => setShowIngredientInfoInput(prev => !prev)}
                    className="w-full text-left font-semibold text-lg flex items-center justify-between py-2 hover:text-indigo-600 dark:hover:text-indigo-300 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded-md"
                    aria-expanded={showIngredientInfoInput}
                    aria-controls="ingredient-info-panel"
                  >
                    <span className="flex items-center gap-2"><Search className="w-5 h-5 transition-transform duration-200 hover:scale-110" aria-hidden="true" /> {t.getIngredientInfo}</span>
                    <ChevronDown className={`w-5 h-5 transition-transform duration-300 ${showIngredientInfoInput ? 'rotate-180' : ''}`} aria-hidden="true" />
                  </button>
                  {showIngredientInfoInput && (
                    <div id="ingredient-info-panel" className="mt-4 animate-fadeIn">
                      <input
                        type="text"
                        placeholder={t.enterIngredientName}
                        value={ingredientInfoQuery}
                        onChange={(e) => setIngredientInfoQuery(e.target.value)}
                        className={`w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${darkMode ? 'bg-gray-900 border-gray-600 text-gray-100 placeholder-gray-400' : 'bg-white text-gray-800'} transition-all duration-200`}
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
                    </div>
                  )}
                </div>

              </div>
            )}
          </section>
        )}

        {viewMode === 'favorites' && (
          <section className={`p-8 rounded-xl shadow-2xl ${darkMode ? 'bg-gray-800' : 'bg-white'} transition-shadow duration-300 animate-fadeInUp`}>
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-3 text-indigo-700 dark:text-indigo-400">
              <Heart className="w-7 h-7 transition-transform duration-200 hover:scale-110 hover:rotate-3" aria-hidden="true" /> {t.favorites}
            </h2>

            {/* Filtres pour les favoris */}
            <div className={`mb-6 p-4 rounded-xl border border-gray-200 ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50'} shadow-inner animate-fadeIn`}>
              <h3 className="text-xl font-bold mb-4 text-indigo-700 dark:text-indigo-400">Filtrer les favoris :</h3>
              <input
                type="text"
                placeholder={t.searchRecipes}
                value={favoriteSearchTerm}
                onChange={(e) => setFavoriteSearchTerm(e.target.value)}
                className={`w-full p-3 mb-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${darkMode ? 'bg-gray-900 border-gray-600 text-gray-100 placeholder-gray-400' : 'bg-white text-gray-800'} transition-all duration-200`}
                aria-label={t.searchRecipes}
              />
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Type de cuisine */}
                <div>
                  <label htmlFor="fav-cuisine-filter" className="block text-sm font-semibold mb-1 text-gray-700 dark:text-gray-300">{t.filterByCuisine}</label>
                  <select
                    id="fav-cuisine-filter"
                    value={favoriteCuisineFilter}
                    onChange={(e) => setFavoriteCuisineFilter(e.target.value)}
                    className={`w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${darkMode ? 'bg-gray-900 border-gray-600 text-gray-100' : 'bg-white text-gray-800'} transition-all duration-200`}
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
                {/* Temps de préparation */}
                <div>
                  <label htmlFor="fav-time-filter" className="block text-sm font-semibold mb-1 text-gray-700 dark:text-gray-300">{t.filterByTime}</label>
                  <select
                    id="fav-time-filter"
                    value={favoriteTimeFilter}
                    onChange={(e) => setFavoriteTimeFilter(e.target.value)}
                    className={`w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${darkMode ? 'bg-gray-900 border-gray-600 text-gray-100' : 'bg-white text-gray-800'} transition-all duration-200`}
                    aria-label={t.filterByTime}
                  >
                    <option value="none">{t.timeNone}</option>
                    <option value="quick">{t.timeQuick}</option>
                    <option value="medium">{t.timeMedium}</option>
                    <option value="long">{t.timeLong}</option>
                  </select>
                </div>
                {/* Difficulté */}
                <div>
                  <label htmlFor="fav-difficulty-filter" className="block text-sm font-semibold mb-1 text-gray-700 dark:text-gray-300">{t.filterByDifficulty}</label>
                  <select
                    id="fav-difficulty-filter"
                    value={favoriteDifficultyFilter}
                    onChange={(e) => setFavoriteDifficultyFilter(e.target.value)}
                    className={`w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${darkMode ? 'bg-gray-900 border-gray-600 text-gray-100' : 'bg-white text-gray-800'} transition-all duration-200`}
                    aria-label={t.filterByDifficulty}
                  >
                    <option value="none">{t.difficultyNone}</option>
                    <option value="easy">{t.difficultyEasy}</option>
                    <option value="medium">{t.difficultyMedium}</option>
                    <option value="hard">{t.difficultyHard}</option>
                  </select>
                </div>
                {/* Préférence alimentaire */}
                <div>
                  <label htmlFor="fav-dietary-filter" className="block text-sm font-semibold mb-1 text-gray-700 dark:text-gray-300">{t.filterByDietary}</label>
                  <select
                    id="fav-dietary-filter"
                    value={favoriteDietaryFilter}
                    onChange={(e) => setFavoriteDietaryFilter(e.target.value)}
                    className={`w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${darkMode ? 'bg-gray-900 border-gray-600 text-gray-100' : 'bg-white text-gray-800'} transition-all duration-200`}
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
                {/* Type de plat */}
                <div>
                  <label htmlFor="fav-dish-type-filter" className="block text-sm font-semibold mb-1 text-gray-700 dark:text-gray-300">{t.filterByDishType}</label>
                  <select
                    id="fav-dish-type-filter"
                    value={favoriteDishTypeFilter}
                    onChange={(e) => setFavoriteDishTypeFilter(e.target.value)}
                    className={`w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${darkMode ? 'bg-gray-900 border-gray-600 text-gray-100' : 'bg-white text-gray-800'} transition-all duration-200`}
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
                {filteredFavoriteRecipes.map(recipe => (
                  <div key={recipe.id} className={`p-5 rounded-xl border border-gray-200 ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white'} shadow-lg flex flex-col transition-transform duration-300 hover:scale-[1.02] transform hover:shadow-xl animate-fadeIn`}>
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
                        aria-label={`Supprimer ${recipe.title} des favoris`}
                      >
                        <X className="w-5 h-5" aria-hidden="true" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {viewMode === 'history' && (
          <section className={`p-8 rounded-xl shadow-2xl ${darkMode ? 'bg-gray-800' : 'bg-white'} transition-shadow duration-300 animate-fadeInUp`}>
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-3 text-indigo-700 dark:text-indigo-400">
              <History className="w-7 h-7 transition-transform duration-200 hover:scale-110 hover:rotate-3" aria-hidden="true" /> {t.history}
            </h2>

            {/* Filtres pour l'historique (réutilise les mêmes états que les favoris pour la démo) */}
            <div className={`mb-6 p-4 rounded-xl border border-gray-200 ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50'} shadow-inner animate-fadeIn`}>
              <h3 className="text-xl font-bold mb-4 text-indigo-700 dark:text-indigo-400">Filtrer l'historique :</h3>
              <input
                type="text"
                placeholder={t.searchRecipes}
                value={favoriteSearchTerm} // Utilise le même état de recherche
                onChange={(e) => setFavoriteSearchTerm(e.target.value)}
                className={`w-full p-3 mb-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${darkMode ? 'bg-gray-900 border-gray-600 text-gray-100 placeholder-gray-400' : 'bg-white text-gray-800'} transition-all duration-200`}
                aria-label={t.searchRecipes}
              />
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Type de cuisine */}
                <div>
                  <label htmlFor="hist-cuisine-filter" className="block text-sm font-semibold mb-1 text-gray-700 dark:text-gray-300">{t.filterByCuisine}</label>
                  <select
                    id="hist-cuisine-filter"
                    value={favoriteCuisineFilter}
                    onChange={(e) => setFavoriteCuisineFilter(e.target.value)}
                    className={`w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${darkMode ? 'bg-gray-900 border-gray-600 text-gray-100' : 'bg-white text-gray-800'} transition-all duration-200`}
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
                {/* Temps de préparation */}
                <div>
                  <label htmlFor="hist-time-filter" className="block text-sm font-semibold mb-1 text-gray-700 dark:text-gray-300">{t.filterByTime}</label>
                  <select
                    id="hist-time-filter"
                    value={favoriteTimeFilter}
                    onChange={(e) => setFavoriteTimeFilter(e.target.value)}
                    className={`w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${darkMode ? 'bg-gray-900 border-gray-600 text-gray-100' : 'bg-white text-gray-800'} transition-all duration-200`}
                    aria-label={t.filterByTime}
                  >
                    <option value="none">{t.timeNone}</option>
                    <option value="quick">{t.timeQuick}</option>
                    <option value="medium">{t.timeMedium}</option>
                    <option value="long">{t.timeLong}</option>
                  </select>
                </div>
                {/* Difficulté */}
                <div>
                  <label htmlFor="hist-difficulty-filter" className="block text-sm font-semibold mb-1 text-gray-700 dark:text-gray-300">{t.filterByDifficulty}</label>
                  <select
                    id="hist-difficulty-filter"
                    value={favoriteDifficultyFilter}
                    onChange={(e) => setFavoriteDifficultyFilter(e.target.value)}
                    className={`w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${darkMode ? 'bg-gray-900 border-gray-600 text-gray-100' : 'bg-white text-gray-800'} transition-all duration-200`}
                    aria-label={t.filterByDifficulty}
                  >
                    <option value="none">{t.difficultyNone}</option>
                    <option value="easy">{t.difficultyEasy}</option>
                    <option value="medium">{t.difficultyMedium}</option>
                    <option value="hard">{t.difficultyHard}</option>
                  </select>
                </div>
                {/* Préférence alimentaire */}
                <div>
                  <label htmlFor="hist-dietary-filter" className="block text-sm font-semibold mb-1 text-gray-700 dark:text-gray-300">{t.filterByDietary}</label>
                  <select
                    id="hist-dietary-filter"
                    value={favoriteDietaryFilter}
                    onChange={(e) => setFavoriteDietaryFilter(e.target.value)}
                    className={`w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${darkMode ? 'bg-gray-900 border-gray-600 text-gray-100' : 'bg-white text-gray-800'} transition-all duration-200`}
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
                {/* Type de plat */}
                <div>
                  <label htmlFor="hist-dish-type-filter" className="block text-sm font-semibold mb-1 text-gray-700 dark:text-gray-300">{t.filterByDishType}</label>
                  <select
                    id="hist-dish-type-filter"
                    value={favoriteDishTypeFilter}
                    onChange={(e) => setFavoriteDishTypeFilter(e.target.value)}
                    className={`w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${darkMode ? 'bg-gray-900 border-gray-600 text-gray-100' : 'bg-white text-gray-800'} transition-all duration-200`}
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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredHistoryRecipes.map(recipe => (
                  <div key={recipe.id} className={`p-5 rounded-xl border border-gray-200 ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white'} shadow-lg flex flex-col transition-transform duration-300 hover:scale-[1.02] transform hover:shadow-xl animate-fadeIn`}>
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
                      {/* Optionnel: Ajouter aux favoris depuis l'historique si ce n'est pas déjà un favori */}
                      {!isFavorite(recipe.content) && (
                        <button
                          onClick={async () => {
                            if (!isAuthReady || !userId || !db) {
                              showModal(t.firebaseNotInitialized, closeModal, closeModal);
                              return;
                            }
                            try {
                              // Use a more robust ID for the favorite recipe document
                              const docId = btoa(recipe.content.substring(0, 100)).replace(/=/g, ''); // Base64 encode first 100 chars and remove padding
                              await setDoc(doc(db, `artifacts/${appId}/users/${userId}/favorite_recipes`, docId), {
                                title: recipe.title,
                                content: recipe.content,
                                date: recipe.date,
                                filters: recipe.filters
                              }, { merge: true }); // Use setDoc with merge
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
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {viewMode === 'dailyRecipe' && (
          <section className={`p-8 rounded-xl shadow-2xl ${darkMode ? 'bg-gray-800' : 'bg-white'} transition-shadow duration-300 animate-fadeInUp`}>
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-3 text-indigo-700 dark:text-indigo-400">
              <Sun className="w-7 h-7 transition-transform duration-200 hover:scale-110 hover:rotate-3" aria-hidden="true" /> {t.recipeOfTheDay}
            </h2>
            {loadingMessage ? (
              <div className="py-8">
                <SkeletonLoader lines={10} className="w-full" />
                <p className="text-center text-lg text-indigo-600 dark:text-indigo-300 flex items-center justify-center gap-2 mt-4">
                  <Flame className="w-6 h-6 animate-spin" aria-hidden="true" /> {loadingMessage}
                </p>
              </div>
            ) : dailyRecipe ? (
              <div className={`prose dark:prose-invert max-w-none p-6 rounded-lg ${darkMode ? 'bg-gray-700 text-gray-200' : 'bg-gray-50 text-gray-700'} shadow-inner mb-6 animate-fadeIn`}>
                <div dangerouslySetInnerHTML={{ __html: dailyRecipe }}></div>
              </div>
            ) : (
              <div className="text-center text-gray-500 dark:text-gray-400 py-8">
                <CalendarOff className="w-20 h-20 mx-auto mb-4 text-gray-400 dark:text-gray-600 animate-float" aria-hidden="true" />
                <p className="text-lg">{t.noDailyRecipe}</p>
              </div>
            )}
            <button
              onClick={() => fetchDailyRecipe()} // Allow explicit re-fetch
              className="mt-4 w-full bg-indigo-600 text-white py-3 rounded-lg text-xl font-bold hover:bg-indigo-700 transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transform hover:scale-105 hover:-translate-y-1 active:scale-98 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              disabled={!!loadingMessage}
              aria-label={loadingMessage ? loadingMessage : t.recipeOfTheDay}
            >
              {loadingMessage && <LoadingSpinner />}
              {loadingMessage ? loadingMessage : t.recipeOfTheDay}
            </button>
          </section>
        )}

        {viewMode === 'settings' && (
          <section className={`p-8 rounded-xl shadow-2xl ${darkMode ? 'bg-gray-800' : 'bg-white'} transition-shadow duration-300 animate-fadeInUp`}>
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-3 text-indigo-700 dark:text-indigo-400">
              <Settings className="w-7 h-7 transition-transform duration-200 hover:scale-110 hover:rotate-3" aria-hidden="true" /> {t.settings}
            </h2>

            {/* User ID Display */}
            {userId && (
              <div className={`mb-6 p-4 rounded-xl border border-gray-200 ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50'} shadow-sm flex items-center gap-3 animate-fadeIn`}>
                <User className="w-6 h-6 text-indigo-600 dark:text-indigo-300" aria-hidden="true" />
                <span className="text-lg font-semibold">{t.userIdDisplay}</span>
                <span className="break-all font-mono text-sm text-gray-700 dark:text-gray-300">{userId}</span>
              </div>
            )}


            {/* Language Selection */}
            <div className={`mb-6 p-4 rounded-xl border border-gray-200 ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50'} shadow-sm animate-fadeIn`}>
              <label htmlFor="language-select" className="block text-lg font-semibold mb-2">
                {t.languageSelection}
              </label>
              <select
                id="language-select"
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className={`w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${darkMode ? 'bg-gray-900 border-gray-600 text-gray-100' : 'bg-white text-gray-800'} transition-all duration-200`}
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
            <div className={`mb-6 p-4 rounded-xl border border-gray-200 ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50'} shadow-sm flex items-center justify-between animate-fadeIn`}>
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
            <div className={`mb-6 p-4 rounded-xl border border-gray-200 ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50'} shadow-sm animate-fadeIn`}>
              <label htmlFor="dietary-preference-select" className="block text-lg font-semibold mb-2">
                {t.dietaryPreferences}
              </label>
              <select
                id="dietary-preference-select"
                value={dietaryPreference}
                onChange={(e) => setDietaryPreference(e.target.value)}
                className={`w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${darkMode ? 'bg-gray-900 border-gray-600 text-gray-100' : 'bg-white text-gray-800'} transition-all duration-200`}
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
            <div className={`mb-6 p-4 rounded-xl border border-gray-200 ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50'} shadow-sm animate-fadeIn`}>
              <h3 className="text-lg font-semibold mb-2 flex items-center gap-2"><Flame className="w-5 h-5 text-indigo-600 transition-transform duration-200 hover:scale-110" aria-hidden="true" />{t.myCookingStreak} : <span className="text-indigo-600 dark:text-indigo-300 font-bold">{cookingStreak} {cookingStreak > 1 ? 'jours' : 'jour'}</span></h3>
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
            <div className={`mt-8 p-4 rounded-xl border border-red-300 ${darkMode ? 'bg-red-900 border-red-700' : 'bg-red-50'} shadow-sm animate-fadeIn`}>
              <button
                onClick={handleClearAllData}
                className="w-full bg-red-600 text-white py-3 rounded-lg text-lg font-bold hover:bg-red-700 transition-colors duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95"
                aria-label={t.clearAllData}
              >
                <Eraser className="w-5 h-5 inline-block mr-2 transition-transform duration-200 hover:rotate-12" aria-hidden="true" /> {t.clearAllData}
              </button>
            </div>
          </section>
        )}
      </main>

      {/* Modal personnalisé */}
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
    </div>
  );
}
