import React, { useState, useEffect, useRef } from 'react';
import './App.css';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc, collection, query, where, getDocs, getDoc } from 'firebase/firestore';
import { getAuth, signInAnonymously, onAuthStateChanged } from "firebase/auth";

// Initialisation de Firebase
// Les variables d'environnement sont lues directement depuis Vite
// Netlify doit avoir ces variables configurées pour que cela fonctionne.
const firebaseConfig = JSON.parse(import.meta.env.VITE_FIREBASE_CONFIG);
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// Traduction
const translations = {
  fr: {
    title: "Mon Frigo Malin",
    analyzeButton: "Analyser mon frigo avec l'IA",
    ingredientsList: "Ingrédients détectés",
    noIngredients: "Aucun ingrédient détecté. Veuillez télécharger une autre photo ou les ajouter manuellement.",
    generateRecipe: "Générer une recette avec ces ingrédients",
    loading: "Analyse en cours...",
    generating: "Génération de la recette...",
    optimizingImage: "Optimisation de l'image...",
    errorImageRead: "Erreur lors de la lecture de l'image.",
    errorGemini: "Une erreur est survenue avec l'API Gemini. Veuillez réessayer.",
    addIngredient: "Ajouter un ingrédient",
    ingredientPlaceholder: "Ex: Tomate, Fromage",
    recipePreferences: "Préférences de recette (optionnel)",
    vegetarian: "Végétarien",
    vegan: "Végétalien",
    glutenFree: "Sans gluten",
    halal: "Halal",
    kosher: "Casher",
    cuisineType: "Type de cuisine",
    preparationTime: "Temps de préparation",
    difficulty: "Difficulté",
    beginner: "Débutant",
    intermediate: "Intermédiaire",
    expert: "Expert",
    dishType: "Type de plat",
    starter: "Entrée",
    mainCourse: "Plat principal",
    dessert: "Dessert",
    recipeResult: "Votre Recette",
    noRecipe: "Aucune recette générée pour le moment.",
    clearAll: "Tout effacer",
    addManually: "Ajouter manuellement",
    confirmClear: "Êtes-vous sûr de vouloir tout effacer ?",
    clear: "Effacer",
    cancel: "Annuler",
    adaptRecipe: "Adapter la recette",
    substituteIngredient: "Substituer un ingrédient",
    adaptQuantity: "Adapter la quantité",
    optimizeHealth: "Optimiser la santé",
    cookingTips: "Demander un conseil de cuisine",
    mealPrep: "Générer un guide de préparation de repas",
    culinaryPairing: "Suggestions d'accords culinaires",
    ingredientInfo: "Infos sur un ingrédient",
    myFavorites: "Mes Favoris",
    myHistory: "Historique",
    recipeOfTheDay: "Recette du Jour",
    challenge: "Défi Cuisine",
    loadingFavorites: "Chargement des favoris...",
    noFavorites: "Vous n'avez pas de recettes favorites.",
    removeFavorite: "Retirer des favoris",
    removeHistory: "Supprimer",
    confirmRemoveHistory: "Êtes-vous sûr de vouloir supprimer cette recette de l'historique ?",
    welcome: "Bienvenue sur Mon Frigo Malin !",
    welcomeText: "L'application qui vous aide à cuisiner avec ce que vous avez !",
    getStarted: "Commencer",
    language: "Langue",
    currentRecipeTab: "Ma Recette Actuelle",
    darkmode: "Mode Sombre",
    addToFavorites: "Ajouter aux favoris",
    copyRecipe: "Copier la recette",
    recipeCopied: "Recette copiée !",
    close: "Fermer",
    modalTitle: "Titre de la modale",
    modalMessage: "Message de la modale",
    recipe: "Recette",
    options: "Options",
    ingredient: "Ingrédient",
    save: "Sauvegarder",
    // Ajouts pour l'optimisation
    imageSizeError: "L'image est trop grande, veuillez en choisir une plus petite.",
    imageTooBig: "L'image est trop grande (max 5MB).",
    // Ajouts pour le nouveau bouton d'analyse d'image
    imageSelected: "Image sélectionnée, prête pour l'analyse.",
    chooseImage: "Choisir une image"
  },
  en: {
    title: "My Smart Fridge",
    analyzeButton: "Analyze my fridge with AI",
    ingredientsList: "Detected Ingredients",
    noIngredients: "No ingredients detected. Please upload another photo or add them manually.",
    generateRecipe: "Generate a recipe with these ingredients",
    loading: "Analysis in progress...",
    generating: "Generating recipe...",
    optimizingImage: "Optimizing image...",
    errorImageRead: "Error reading the image.",
    errorGemini: "An error occurred with the Gemini API. Please try again.",
    addIngredient: "Add an ingredient",
    ingredientPlaceholder: "Ex: Tomato, Cheese",
    recipePreferences: "Recipe preferences (optional)",
    vegetarian: "Vegetarian",
    vegan: "Vegan",
    glutenFree: "Gluten-Free",
    halal: "Halal",
    kosher: "Kosher",
    cuisineType: "Cuisine type",
    preparationTime: "Preparation time",
    difficulty: "Difficulty",
    beginner: "Beginner",
    intermediate: "Intermediate",
    expert: "Expert",
    dishType: "Dish type",
    starter: "Starter",
    mainCourse: "Main course",
    dessert: "Dessert",
    recipeResult: "Your Recipe",
    noRecipe: "No recipe generated at the moment.",
    clearAll: "Clear All",
    addManually: "Add manually",
    confirmClear: "Are you sure you want to clear everything?",
    clear: "Clear",
    cancel: "Cancel",
    adaptRecipe: "Adapt recipe",
    substituteIngredient: "Substitute an ingredient",
    adaptQuantity: "Adapt quantity",
    optimizeHealth: "Optimize health",
    cookingTips: "Ask for cooking tips",
    mealPrep: "Generate a meal prep guide",
    culinaryPairing: "Culinary pairing suggestions",
    ingredientInfo: "Info about an ingredient",
    myFavorites: "My Favorites",
    myHistory: "History",
    recipeOfTheDay: "Recipe of the Day",
    challenge: "Cooking Challenge",
    loadingFavorites: "Loading favorites...",
    noFavorites: "You have no favorite recipes.",
    removeFavorite: "Remove from favorites",
    removeHistory: "Delete",
    confirmRemoveHistory: "Are you sure you want to delete this recipe from history?",
    welcome: "Welcome to My Smart Fridge!",
    welcomeText: "The app that helps you cook with what you have!",
    getStarted: "Get Started",
    language: "Language",
    currentRecipeTab: "My Current Recipe",
    darkmode: "Dark Mode",
    addToFavorites: "Add to Favorites",
    copyRecipe: "Copy Recipe",
    recipeCopied: "Recipe copied!",
    close: "Close",
    modalTitle: "Modal Title",
    modalMessage: "Modal Message",
    recipe: "Recipe",
    options: "Options",
    ingredient: "Ingredient",
    save: "Save",
    imageSizeError: "Image is too large, please choose a smaller one.",
    imageTooBig: "Image is too big (max 5MB).",
    imageSelected: "Image selected, ready for analysis.",
    chooseImage: "Choose an image"
  },
  de: {
    title: "Mein Smarter Kühlschrank",
    analyzeButton: "Kühlschrank mit KI analysieren",
    ingredientsList: "Erkannte Zutaten",
    noIngredients: "Keine Zutaten erkannt. Bitte laden Sie ein anderes Foto hoch oder fügen Sie sie manuell hinzu.",
    generateRecipe: "Rezept mit diesen Zutaten generieren",
    loading: "Analyse läuft...",
    generating: "Rezept wird generiert...",
    optimizingImage: "Bild wird optimiert...",
    errorImageRead: "Fehler beim Lesen des Bildes.",
    errorGemini: "Ein Fehler ist mit der Gemini API aufgetreten. Bitte versuchen Sie es erneut.",
    addIngredient: "Zutat hinzufügen",
    ingredientPlaceholder: "Ex: Tomate, Käse",
    recipePreferences: "Rezepteinstellungen (optional)",
    vegetarian: "Vegetarisch",
    vegan: "Vegan",
    glutenFree: "Glutenfrei",
    halal: "Halal",
    kosher: "Koscher",
    cuisineType: "Küchenstil",
    preparationTime: "Zubereitungszeit",
    difficulty: "Schwierigkeitsgrad",
    beginner: "Anfänger",
    intermediate: "Mittelstufe",
    expert: "Experte",
    dishType: "Gerichtstyp",
    starter: "Vorspeise",
    mainCourse: "Hauptspeise",
    dessert: "Dessert",
    recipeResult: "Ihr Rezept",
    noRecipe: "Momentan wurde kein Rezept generiert.",
    clearAll: "Alles löschen",
    addManually: "Manuell hinzufügen",
    confirmClear: "Sind Sie sicher, dass Sie alles löschen möchten?",
    clear: "Löschen",
    cancel: "Abbrechen",
    adaptRecipe: "Rezept anpassen",
    substituteIngredient: "Zutat ersetzen",
    adaptQuantity: "Menge anpassen",
    optimizeHealth: "Gesundheit optimieren",
    cookingTips: "Kochtipps erfragen",
    mealPrep: "Mahlzeitenvorbereitungsleitfaden generieren",
    culinaryPairing: "Kulinarische Paarungsvorschläge",
    ingredientInfo: "Infos über eine Zutat",
    myFavorites: "Meine Favoriten",
    myHistory: "Verlauf",
    recipeOfTheDay: "Rezept des Tages",
    challenge: "Kochherausforderung",
    loadingFavorites: "Favoriten werden geladen...",
    noFavorites: "Sie haben keine Lieblingsrezepte.",
    removeFavorite: "Aus Favoriten entfernen",
    removeHistory: "Löschen",
    confirmRemoveHistory: "Sind Sie sicher, dass Sie dieses Rezept aus dem Verlauf löschen möchten?",
    welcome: "Willkommen bei Mein Smarter Kühlschrank!",
    welcomeText: "Die App, die Ihnen hilft, mit dem zu kochen, was Sie haben!",
    getStarted: "Starten",
    language: "Sprache",
    currentRecipeTab: "Mein Aktuelles Rezept",
    darkmode: "Dunkelmodus",
    addToFavorites: "Zu Favoriten hinzufügen",
    copyRecipe: "Rezept kopieren",
    recipeCopied: "Rezept kopiert!",
    close: "Schließen",
    modalTitle: "Modal Titel",
    modalMessage: "Modal Nachricht",
    recipe: "Rezept",
    options: "Optionen",
    ingredient: "Zutat",
    save: "Speichern",
    imageSizeError: "Das Bild ist zu groß, bitte wählen Sie ein kleineres.",
    imageTooBig: "Bild ist zu groß (max 5MB).",
    imageSelected: "Bild ausgewählt, bereit zur Analyse.",
    chooseImage: "Ein Bild auswählen"
  },
  es: {
    title: "Mi Nevera Inteligente",
    analyzeButton: "Analizar mi nevera con IA",
    ingredientsList: "Ingredientes detectados",
    noIngredients: "No se detectaron ingredientes. Por favor, suba otra foto o agréguelos manualmente.",
    generateRecipe: "Generar una receta con estos ingredientes",
    loading: "Análisis en curso...",
    generating: "Generando receta...",
    optimizingImage: "Optimizando imagen...",
    errorImageRead: "Error al leer la imagen.",
    errorGemini: "Ocurrió un error con la API de Gemini. Por favor, inténtelo de nuevo.",
    addIngredient: "Añadir un ingrediente",
    ingredientPlaceholder: "Ej: Tomate, Queso",
    recipePreferences: "Preferencias de la receta (opcional)",
    vegetarian: "Vegetariano",
    vegan: "Vegano",
    glutenFree: "Sin gluten",
    halal: "Halal",
    kosher: "Kosher",
    cuisineType: "Tipo de cocina",
    preparationTime: "Tiempo de preparación",
    difficulty: "Dificultad",
    beginner: "Principiante",
    intermediate: "Intermedio",
    expert: "Experto",
    dishType: "Tipo de plato",
    starter: "Entrada",
    mainCourse: "Plato principal",
    dessert: "Postre",
    recipeResult: "Tu Receta",
    noRecipe: "No se ha generado ninguna receta por el momento.",
    clearAll: "Borrar todo",
    addManually: "Añadir manualmente",
    confirmClear: "¿Está seguro de que desea borrar todo?",
    clear: "Borrar",
    cancel: "Cancelar",
    adaptRecipe: "Adaptar receta",
    substituteIngredient: "Sustituir un ingrediente",
    adaptQuantity: "Adaptar cantidad",
    optimizeHealth: "Optimizar salud",
    cookingTips: "Pedir un consejo de cocina",
    mealPrep: "Generar una guía de preparación de comidas",
    culinaryPairing: "Sugerencias de maridaje culinario",
    ingredientInfo: "Info sobre un ingrediente",
    myFavorites: "Mis Favoritos",
    myHistory: "Historial",
    recipeOfTheDay: "Receta del Día",
    challenge: "Desafío de Cocina",
    loadingFavorites: "Cargando favoritos...",
    noFavorites: "No tienes recetas favoritas.",
    removeFavorite: "Eliminar de favoritos",
    removeHistory: "Eliminar",
    confirmRemoveHistory: "¿Está seguro de que desea eliminar esta receta del historial?",
    welcome: "¡Bienvenido a Mi Nevera Inteligente!",
    welcomeText: "¡La aplicación que te ayuda a cocinar con lo que tienes!",
    getStarted: "Empezar",
    language: "Idioma",
    currentRecipeTab: "Mi Receta Actual",
    darkmode: "Modo Oscuro",
    addToFavorites: "Añadir a Favoritos",
    copyRecipe: "Copiar Receta",
    recipeCopied: "¡Receta copiada!",
    close: "Cerrar",
    modalTitle: "Título del modal",
    modalMessage: "Mensaje del modal",
    recipe: "Receta",
    options: "Opciones",
    ingredient: "Ingrediente",
    save: "Guardar",
    imageSizeError: "La imagen es demasiado grande, por favor elija una más pequeña.",
    imageTooBig: "La imagen es demasiado grande (max 5MB).",
    imageSelected: "Imagen seleccionada, lista para el análisis.",
    chooseImage: "Elegir una imagen"
  },
  it: {
    title: "Il Mio Frigo Intelligente",
    analyzeButton: "Analizza il mio frigo con l'IA",
    ingredientsList: "Ingredienti rilevati",
    noIngredients: "Nessun ingrediente rilevato. Si prega di caricare un'altra foto o di aggiungerli manualmente.",
    generateRecipe: "Genera una ricetta con questi ingredienti",
    loading: "Analisi in corso...",
    generating: "Generazione della ricetta...",
    optimizingImage: "Ottimizzazione dell'immagine...",
    errorImageRead: "Errore durante la lettura dell'immagine.",
    errorGemini: "Si è verificato un errore con l'API Gemini. Riprova.",
    addIngredient: "Aggiungi un ingrediente",
    ingredientPlaceholder: "Es: Pomodoro, Formaggio",
    recipePreferences: "Preferenze della ricetta (opzionale)",
    vegetarian: "Vegetariano",
    vegan: "Vegano",
    glutenFree: "Senza glutine",
    halal: "Halal",
    kosher: "Kosher",
    cuisineType: "Tipo di cucina",
    preparationTime: "Tempo di preparazione",
    difficulty: "Difficoltà",
    beginner: "Principiante",
    intermediate: "Intermedio",
    expert: "Esperto",
    dishType: "Tipo di piatto",
    starter: "Antipasto",
    mainCourse: "Piatto principale",
    dessert: "Dolce",
    recipeResult: "La Tua Ricetta",
    noRecipe: "Nessuna ricetta generata al momento.",
    clearAll: "Cancella tutto",
    addManually: "Aggiungi manualmente",
    confirmClear: "Sei sicuro di voler cancellare tutto?",
    clear: "Cancella",
    cancel: "Annulla",
    adaptRecipe: "Adatta ricetta",
    substituteIngredient: "Sostituisci un ingrediente",
    adaptQuantity: "Adatta quantità",
    optimizeHealth: "Ottimizza la salute",
    cookingTips: "Chiedi un consiglio di cucina",
    mealPrep: "Genera una guida alla preparazione dei pasti",
    culinaryPairing: "Suggerimenti per abbinamenti culinari",
    ingredientInfo: "Info su un ingrediente",
    myFavorites: "I Miei Preferiti",
    myHistory: "Cronologia",
    recipeOfTheDay: "Ricetta del Giorno",
    challenge: "Sfida Culinaria",
    loadingFavorites: "Caricamento dei preferiti...",
    noFavorites: "Non hai ricette preferite.",
    removeFavorite: "Rimuovi dai preferiti",
    removeHistory: "Elimina",
    confirmRemoveHistory: "Sei sicuro di voler eliminare questa ricetta dalla cronologia?",
    welcome: "Benvenuto su Il Mio Frigo Intelligente!",
    welcomeText: "L'app che ti aiuta a cucinare con ciò che hai!",
    getStarted: "Inizia",
    language: "Lingua",
    currentRecipeTab: "La Mia Ricetta Attuale",
    darkmode: "Modalità Scura",
    addToFavorites: "Aggiungi ai Preferiti",
    copyRecipe: "Copia Ricetta",
    recipeCopied: "Ricetta copiata!",
    close: "Chiudi",
    modalTitle: "Titolo modale",
    modalMessage: "Messaggio modale",
    recipe: "Ricetta",
    options: "Opzioni",
    ingredient: "Ingrediente",
    save: "Salva",
    imageSizeError: "L'immagine è troppo grande, si prega di sceglierne una più piccola.",
    imageTooBig: "L'immagine è troppo grande (max 5MB).",
    imageSelected: "Immagine selezionata, pronta per l'analisi.",
    chooseImage: "Scegli un'immagine"
  }
};

function App() {
  // Constantes
  const fileInputRef = useRef(null);

  // États (useState)
  const [selectedImage, setSelectedImage] = useState(null);
  const [loadingMessage, setLoadingMessage] = useState(null);
  const [ingredients, setIngredients] = useState([]);
  const [recipe, setRecipe] = useState(null);
  const [language, setLanguage] = useState('fr');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [currentView, setCurrentView] = useState('main'); // 'main', 'favorites', 'history', 'currentRecipe'
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState({ title: '', message: '' });
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
  const [favorites, setFavorites] = useState([]);
  const [history, setHistory] = useState([]);
  const [isWelcomeModalOpen, setIsWelcomeModalOpen] = useState(() => {
    return !localStorage.getItem('hasVisited');
  });

  // Préférences de recette
  const [isVegetarian, setIsVegetarian] = useState(false);
  const [isVegan, setIsVegan] = useState(false);
  const [isGlutenFree, setIsGlutenFree] = useState(false);
  const [isHalal, setIsHalal] = useState(false);
  const [isKosher, setIsKosher] = useState(false);
  const [cuisineType, setCuisineType] = useState('');
  const [prepTime, setPrepTime] = useState('');
  const [difficulty, setDifficulty] = useState('');
  const [dishType, setDishType] = useState('');

  // Saisie manuelle d'ingrédient
  const [newIngredient, setNewIngredient] = useState('');
  const [showConfirmClear, setShowConfirmClear] = useState(false);
  const [showConfirmHistoryRemove, setShowConfirmHistoryRemove] = useState(false);
  const [historyItemToRemove, setHistoryItemToRemove] = useState(null);

  // Traduction
  const t = translations[language];

  // Effets (useEffect)
  useEffect(() => {
    document.body.className = isDarkMode ? 'dark-mode' : '';
  }, [isDarkMode]);

  useEffect(() => {
    onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        // Chargement des favoris et de l'historique
        loadFavorites(currentUser.uid);
        loadHistory(currentUser.uid);
      } else {
        // Connexion anonyme
        try {
          await signInAnonymously(auth);
        } catch (error) {
          console.error("Erreur de connexion anonyme", error);
        }
      }
    });

    if (!localStorage.getItem('hasVisited')) {
      setIsWelcomeModalOpen(true);
      localStorage.setItem('hasVisited', 'true');
    }
  }, []);

  // Fonctions
  const openModal = (title, message) => {
    setModalContent({ title, message });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setModalContent({ title: '', message: '' });
  };

  const resizeImage = (file, maxWidth, maxHeight, quality) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target.result;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > maxWidth) {
              height = height * (maxWidth / width);
              width = maxWidth;
            }
          } else {
            if (height > maxHeight) {
              width = width * (maxHeight / height);
              height = maxHeight;
            }
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);

          canvas.toBlob((blob) => {
            resolve(blob);
          }, 'image/jpeg', quality);
        };
      };
      reader.onerror = error => reject(error);
    });
  };

  const handleImageChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Vérification de la taille du fichier avant redimensionnement
    const maxFileSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxFileSize) {
        setError(t.imageTooBig);
        return;
    }

    setLoadingMessage(t.optimizingImage);
    setError('');

    try {
      const resizedBlob = await resizeImage(file, 1024, 1024, 0.7); // Redimensionnement
      setSelectedImage(resizedBlob);
      console.log("Image redimensionnée et prête pour l'analyse.");
      setLoadingMessage(t.imageSelected);
    } catch (err) {
      console.error("Erreur de redimensionnement de l'image:", err);
      setError(t.errorImageRead);
      setLoadingMessage(null);
    }
  };

  const handleAnalyzeImage = async () => {
    if (!selectedImage) return;

    setLoadingMessage(t.loading);
    setIngredients([]);
    setRecipe(null);
    setError(null);
    setCurrentView('main');

    const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-pro-vision" });

    try {
      const base64Image = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result.split(',')[1]);
        reader.readAsDataURL(selectedImage);
      });

      const prompt = `Voici une photo d'un frigo. Peux-tu me lister les ingrédients que tu vois ? Réponds uniquement avec une liste séparée par des virgules, sans aucune autre phrase. Par exemple : Tomate, fromage, lait, oeufs.`;

      const result = await model.generateContent([prompt, {
        inlineData: {
          data: base64Image,
          mimeType: selectedImage.type
        }
      }]);
      const response = await result.response;
      const text = response.text();
      const detectedIngredients = text.split(',').map(item => item.trim()).filter(item => item !== '');
      setIngredients(detectedIngredients);
      setLoadingMessage(null);
    } catch (err) {
      console.error("Erreur avec l'API Gemini:", err);
      setError(t.errorGemini);
      setLoadingMessage(null);
    }
  };

  const handleGenerateRecipe = async () => {
    if (ingredients.length === 0) return;

    setLoadingMessage(t.generating);
    setRecipe(null);
    setError(null);
    setCurrentView('currentRecipe');

    const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    const preferences = [];
    if (isVegetarian) preferences.push(t.vegetarian);
    if (isVegan) preferences.push(t.vegan);
    if (isGlutenFree) preferences.push(t.glutenFree);
    if (isHalal) preferences.push(t.halal);
    if (isKosher) preferences.push(t.kosher);
    if (cuisineType) preferences.push(cuisineType);
    if (prepTime) preferences.push(prepTime);
    if (difficulty) preferences.push(difficulty);
    if (dishType) preferences.push(dishType);

    const prompt = `Génère une recette détaillée en français avec les ingrédients suivants : ${ingredients.join(', ')}.
      ${preferences.length > 0 ? `En tenant compte des préférences suivantes : ${preferences.join(', ')}.` : ''}
      La réponse doit être structurée avec un titre, une liste d'ingrédients, les instructions détaillées par étapes et les informations comme le temps de préparation et le nombre de portions.`;

    try {
      const result = await model.generateContent(prompt);
      const response = await result.response;
      setRecipe(response.text());
      setLoadingMessage(null);
      saveRecipeToHistory(response.text());
    } catch (err) {
      console.error("Erreur de génération de recette:", err);
      setError(t.errorGemini);
      setLoadingMessage(null);
    }
  };

  const handleAdaptRecipe = async (instruction) => {
    if (!recipe) return;

    setLoadingMessage(t.generating);
    setError(null);
    setCurrentView('currentRecipe');

    const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    const prompt = `En te basant sur la recette suivante, modifie-la en appliquant l'instruction : "${instruction}".
      Recette : ${recipe}`;

    try {
      const result = await model.generateContent(prompt);
      const response = await result.response;
      setRecipe(response.text());
      setLoadingMessage(null);
      saveRecipeToHistory(response.text());
    } catch (err) {
      console.error("Erreur d'adaptation de recette:", err);
      setError(t.errorGemini);
      setLoadingMessage(null);
    }
  };

  const handleClearAll = () => {
    setIngredients([]);
    setRecipe(null);
    setSelectedImage(null);
    setLoadingMessage(null);
    setError(null);
    setCurrentView('main');
    closeConfirmClear();
  };

  const handleAddIngredient = () => {
    if (newIngredient.trim() !== '') {
      setIngredients([...ingredients, newIngredient.trim()]);
      setNewIngredient('');
    }
  };

  const handleRemoveIngredient = (index) => {
    const newIngredients = ingredients.filter((_, i) => i !== index);
    setIngredients(newIngredients);
  };

  const handleToggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  const handleCopyToClipboard = () => {
    if (recipe) {
      navigator.clipboard.writeText(recipe);
      openModal(t.copyRecipe, t.recipeCopied);
    }
  };

  // Gestion de Firebase
  const loadFavorites = async (uid) => {
    setLoadingMessage(t.loadingFavorites);
    const q = query(collection(db, "favorites"), where("userId", "==", uid));
    const querySnapshot = await getDocs(q);
    const favoriteRecipes = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setFavorites(favoriteRecipes);
    setLoadingMessage(null);
  };

  const loadHistory = async (uid) => {
    const q = query(collection(db, "history"), where("userId", "==", uid));
    const querySnapshot = await getDocs(q);
    const historyRecipes = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setHistory(historyRecipes);
  };

  const saveRecipeToHistory = async (recipeText) => {
    if (user && recipeText) {
      const newDocRef = doc(collection(db, "history"));
      await setDoc(newDocRef, {
        userId: user.uid,
        recipe: recipeText,
        createdAt: new Date()
      });
      loadHistory(user.uid);
    }
  };

  const addToFavorites = async (recipeText) => {
    if (user && recipeText) {
      // Vérifier si la recette n'est pas déjà en favoris
      const isAlreadyFavorite = favorites.some(fav => fav.recipe === recipeText);
      if (isAlreadyFavorite) {
        openModal(t.modalTitle, "Cette recette est déjà dans vos favoris !");
        return;
      }
      const newDocRef = doc(collection(db, "favorites"));
      await setDoc(newDocRef, {
        userId: user.uid,
        recipe: recipeText,
        createdAt: new Date()
      });
      openModal(t.modalTitle, "Recette ajoutée aux favoris !");
      loadFavorites(user.uid);
    }
  };

  const removeFromFavorites = async (recipeId) => {
    if (user) {
      await setDoc(doc(db, "favorites", recipeId), {
        userId: user.uid,
        recipe: favorites.find(fav => fav.id === recipeId).recipe,
        isDeleted: true // Utiliser un flag pour la suppression 'logique'
      }, { merge: true });
      loadFavorites(user.uid);
    }
  };

  const removeFromHistory = async (recipeId) => {
    if (user) {
      await setDoc(doc(db, "history", recipeId), {
        userId: user.uid,
        recipe: history.find(his => his.id === recipeId).recipe,
        isDeleted: true
      }, { merge: true });
      loadHistory(user.uid);
      closeConfirmHistoryRemove();
    }
  };


  const showConfirmClearModal = () => {
    setShowConfirmClear(true);
  };

  const closeConfirmClear = () => {
    setShowConfirmClear(false);
  };

  const showConfirmHistoryRemoveModal = (item) => {
    setHistoryItemToRemove(item);
    setShowConfirmHistoryRemove(true);
  };

  const closeConfirmHistoryRemove = () => {
    setShowConfirmHistoryRemove(false);
    setHistoryItemToRemove(null);
  };

  const handleHistorySelect = (recipe) => {
    setRecipe(recipe);
    setCurrentView('currentRecipe');
  };

  const handleFavoriteSelect = (recipe) => {
    setRecipe(recipe);
    setCurrentView('currentRecipe');
  };

  // Composants modaux
  const CustomModal = ({ title, message, onClose, buttons }) => {
    if (!isModalOpen) return null;
    return (
      <div className="modal-overlay">
        <div className="modal-content">
          <h3>{title}</h3>
          <p>{message}</p>
          <div className="modal-buttons">
            {buttons && buttons.map((button, index) => (
              <button key={index} onClick={button.onClick}>{button.label}</button>
            ))}
            {!buttons && <button onClick={onClose}>{t.close}</button>}
          </div>
        </div>
      </div>
    );
  };

  const WelcomeModal = ({ isOpen, onClose }) => {
    if (!isOpen) return null;
    return (
      <div className="modal-overlay">
        <div className="modal-content welcome-modal">
          <h3>{t.welcome}</h3>
          <p>{t.welcomeText}</p>
          <button onClick={onClose}>{t.getStarted}</button>
        </div>
      </div>
    );
  };

  const ConfirmModal = ({ isOpen, title, message, onConfirm, onCancel }) => {
    if (!isOpen) return null;
    return (
      <div className="modal-overlay">
        <div className="modal-content">
          <h3>{title}</h3>
          <p>{message}</p>
          <div className="modal-buttons">
            <button onClick={onConfirm}>{t.clear}</button>
            <button onClick={onCancel}>{t.cancel}</button>
          </div>
        </div>
      </div>
    );
  };

  const SkeletonLoader = () => (
    <div className="skeleton-loader">
      <div className="skeleton-line large"></div>
      <div className="skeleton-line medium"></div>
      <div className="skeleton-line small"></div>
    </div>
  );

  const LoadingSpinner = () => (
    <div className="spinner-container">
      <div className="loading-spinner"></div>
    </div>
  );


  // Rendu de l'application
  return (
    <div className="app-container">
      <WelcomeModal isOpen={isWelcomeModalOpen} onClose={() => setIsWelcomeModalOpen(false)} />
      <CustomModal
        title={modalContent.title}
        message={modalContent.message}
        onClose={closeModal}
      />
      <ConfirmModal
        isOpen={showConfirmClear}
        title={t.confirmClear}
        message={t.confirmClear}
        onConfirm={handleClearAll}
        onCancel={closeConfirmClear}
      />
      <ConfirmModal
        isOpen={showConfirmHistoryRemove}
        title={t.confirmRemoveHistory}
        message={t.confirmRemoveHistory}
        onConfirm={() => removeFromHistory(historyItemToRemove.id)}
        onCancel={closeConfirmHistoryRemove}
      />

      <header className="app-header">
        <h1>{t.title}</h1>
        <div className="header-controls">
          <div className="language-selector">
            <select value={language} onChange={(e) => setLanguage(e.target.value)}>
              <option value="fr">Français</option>
              <option value="en">English</option>
              <option value="de">Deutsch</option>
              <option value="es">Español</option>
              <option value="it">Italiano</option>
            </select>
          </div>
          <div className="dark-mode-toggle" onClick={handleToggleDarkMode}>
            <span role="img" aria-label="dark mode">{isDarkMode ? '🌙' : '☀️'}</span>
          </div>
        </div>
      </header>

      <nav className="tabs">
        <button className={currentView === 'main' ? 'active' : ''} onClick={() => setCurrentView('main')}>
          {t.recipe}
        </button>
        <button className={currentView === 'currentRecipe' ? 'active' : ''} onClick={() => setCurrentView('currentRecipe')}>
          {t.currentRecipeTab}
        </button>
        <button className={currentView === 'favorites' ? 'active' : ''} onClick={() => setCurrentView('favorites')}>
          {t.myFavorites}
        </button>
        <button className={currentView === 'history' ? 'active' : ''} onClick={() => setCurrentView('history')}>
          {t.myHistory}
        </button>
      </nav>

      <main className="main-content">
        {currentView === 'main' && (
          <div className="fridge-analysis-section">
            <h2 className="section-title">1. {t.chooseImage}</h2>
            <div className="file-upload-container">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                ref={fileInputRef}
                className="hidden"
              />
              <button
                className="button-primary"
                onClick={() => fileInputRef.current.click()}
              >
                {t.chooseImage}
              </button>
              {loadingMessage === t.imageSelected && (
                <span className="success-message">{loadingMessage}</span>
              )}
            </div>
            {error && <p className="error-message">{error}</p>}
            <button
              className="button-primary"
              onClick={handleAnalyzeImage}
              disabled={!selectedImage || loadingMessage === t.loading || loadingMessage === t.optimizingImage}
            >
              {loadingMessage === t.loading ? t.loading : t.analyzeButton}
            </button>
            {loadingMessage === t.loading && <LoadingSpinner />}
            <div className="ingredients-section">
              <h2>2. {t.ingredientsList}</h2>
              {ingredients.length > 0 ? (
                <ul className="ingredients-list">
                  {ingredients.map((item, index) => (
                    <li key={index}>
                      {item}
                      <button onClick={() => handleRemoveIngredient(index)}>x</button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p>{t.noIngredients}</p>
              )}
              <div className="add-ingredient-section">
                <input
                  type="text"
                  value={newIngredient}
                  onChange={(e) => setNewIngredient(e.target.value)}
                  placeholder={t.ingredientPlaceholder}
                />
                <button onClick={handleAddIngredient} className="button-secondary">{t.addManually}</button>
              </div>
            </div>
            <div className="recipe-options">
              <h2>3. {t.recipePreferences}</h2>
              <div className="preferences-grid">
                <div className="preference-item">
                  <label>
                    <input type="checkbox" checked={isVegetarian} onChange={() => setIsVegetarian(!isVegetarian)} />
                    {t.vegetarian}
                  </label>
                </div>
                <div className="preference-item">
                  <label>
                    <input type="checkbox" checked={isVegan} onChange={() => setIsVegan(!isVegan)} />
                    {t.vegan}
                  </label>
                </div>
                <div className="preference-item">
                  <label>
                    <input type="checkbox" checked={isGlutenFree} onChange={() => setIsGlutenFree(!isGlutenFree)} />
                    {t.glutenFree}
                  </label>
                </div>
                <div className="preference-item">
                  <label>
                    <input type="checkbox" checked={isHalal} onChange={() => setIsHalal(!isHalal)} />
                    {t.halal}
                  </label>
                </div>
                <div className="preference-item">
                  <label>
                    <input type="checkbox" checked={isKosher} onChange={() => setIsKosher(!isKosher)} />
                    {t.kosher}
                  </label>
                </div>
                <div className="preference-item">
                  <label>{t.cuisineType}:</label>
                  <input type="text" value={cuisineType} onChange={(e) => setCuisineType(e.target.value)} />
                </div>
                <div className="preference-item">
                  <label>{t.preparationTime}:</label>
                  <input type="text" value={prepTime} onChange={(e) => setPrepTime(e.target.value)} />
                </div>
                <div className="preference-item">
                  <label>{t.difficulty}:</label>
                  <select value={difficulty} onChange={(e) => setDifficulty(e.target.value)}>
                    <option value="">--</option>
                    <option value={t.beginner}>{t.beginner}</option>
                    <option value={t.intermediate}>{t.intermediate}</option>
                    <option value={t.expert}>{t.expert}</option>
                  </select>
                </div>
                <div className="preference-item">
                  <label>{t.dishType}:</label>
                  <select value={dishType} onChange={(e) => setDishType(e.target.value)}>
                    <option value="">--</option>
                    <option value={t.starter}>{t.starter}</option>
                    <option value={t.mainCourse}>{t.mainCourse}</option>
                    <option value={t.dessert}>{t.dessert}</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="action-buttons">
              <button
                className="button-primary"
                onClick={handleGenerateRecipe}
                disabled={ingredients.length === 0 || loadingMessage !== null}
              >
                {loadingMessage === t.generating ? t.generating : t.generateRecipe}
              </button>
              <button className="button-secondary" onClick={showConfirmClearModal} disabled={ingredients.length === 0 && !selectedImage}>
                {t.clearAll}
              </button>
            </div>
          </div>
        )}

        {currentView === 'currentRecipe' && (
          <div className="recipe-result">
            <h2>{t.recipeResult}</h2>
            {loadingMessage === t.generating && <LoadingSpinner />}
            {recipe ? (
              <div className="recipe-content">
                <div className="recipe-actions">
                  <button onClick={() => addToFavorites(recipe)} className="button-icon" title={t.addToFavorites}>
                    ⭐
                  </button>
                  <button onClick={handleCopyToClipboard} className="button-icon" title={t.copyRecipe}>
                    📋
                  </button>
                </div>
                <pre className="recipe-text">{recipe}</pre>
                <div className="recipe-adaptation-tools">
                  <h3>{t.options}</h3>
                  <button onClick={() => handleAdaptRecipe("rendre la recette végétarienne")} className="button-tool">{t.adaptRecipe}</button>
                  <button onClick={() => handleAdaptRecipe("substituer le poulet par du tofu")} className="button-tool">{t.substituteIngredient}</button>
                  <button onClick={() => handleAdaptRecipe("adapter la quantité pour 4 personnes")} className="button-tool">{t.adaptQuantity}</button>
                  <button onClick={() => handleAdaptRecipe("optimiser pour une version plus saine (moins de gras, plus de fibres)")} className="button-tool">{t.optimizeHealth}</button>
                  <button onClick={() => handleAdaptRecipe("donne-moi un conseil de cuisine pour cette recette")} className="button-tool">{t.cookingTips}</button>
                  <button onClick={() => handleAdaptRecipe("donne-moi un guide de préparation de repas pour cette recette")} className="button-tool">{t.mealPrep}</button>
                  <button onClick={() => handleAdaptRecipe("donne-moi des suggestions d'accords culinaires pour cette recette")} className="button-tool">{t.culinaryPairing}</button>
                  <button onClick={() => handleAdaptRecipe("donne-moi des informations nutritionnelles pour l'ingrédient principal")} className="button-tool">{t.ingredientInfo}</button>
                </div>
              </div>
            ) : (
              !loadingMessage && <p>{t.noRecipe}</p>
            )}
            {error && <p className="error-message">{error}</p>}
          </div>
        )}

        {currentView === 'favorites' && (
          <div className="favorites-section">
            <h2>{t.myFavorites}</h2>
            {loadingMessage === t.loadingFavorites && <SkeletonLoader />}
            {favorites.length > 0 ? (
              <ul className="recipe-list">
                {favorites.map(fav => (
                  <li key={fav.id}>
                    <button onClick={() => handleFavoriteSelect(fav.recipe)}>
                      <pre>{fav.recipe.substring(0, 100)}...</pre>
                    </button>
                    <button onClick={() => removeFromFavorites(fav.id)} className="remove-button">
                      {t.removeFavorite}
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              !loadingMessage && <p>{t.noFavorites}</p>
            )}
          </div>
        )}

        {currentView === 'history' && (
          <div className="history-section">
            <h2>{t.myHistory}</h2>
            {history.length > 0 ? (
              <ul className="recipe-list">
                {history.map(his => (
                  <li key={his.id}>
                    <button onClick={() => handleHistorySelect(his.recipe)}>
                      <pre>{his.recipe.substring(0, 100)}...</pre>
                    </button>
                    <button onClick={() => showConfirmHistoryRemoveModal(his)} className="remove-button">
                      {t.removeHistory}
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p>Votre historique est vide.</p>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
