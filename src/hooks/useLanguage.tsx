import React, { createContext, useContext, useState, useEffect } from "react";

export type Language = "en" | "es" | "hi" | "fr";

type LanguageContextType = {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
};

const TRANSLATIONS: Record<Language, Record<string, string>> = {
  en: {
    // Nav
    "nav.how": "How it works",
    "nav.why": "Why Medily",
    "nav.signin": "Sign in",
    "nav.getStarted": "Get started",
    "nav.backHome": "← Back to home",

    // Hero
    "hero.livestock": "Live stock from 2,400+ pharmacies",
    "hero.title1": "Find any medicine,",
    "hero.title2": "in minutes — not hours.",
    "hero.subtitle":
      "Stop running shop to shop. Search a medicine and see real-time availability, prices, and directions to nearby pharmacies.",
    "hero.placeholder": "Search any medicine, e.g. Paracetamol",
    "hero.searchBtn": "Search",
    "hero.try": "Try:",

    // Features
    "features.instant.title": "Instant results",
    "features.instant.desc":
      "Search once, see every nearby pharmacy with live stock in under a second.",
    "features.distance.title": "Sorted by distance",
    "features.distance.desc":
      "We show you the closest store with the best price first — saving travel time.",
    "features.verified.title": "Verified pharmacies",
    "features.verified.desc":
      "Every listing is a licensed pharmacy with up-to-date inventory and pricing.",

    // How it works
    "how.title": "Three steps between you and your medicine.",
    "how.step1.num": "01",
    "how.step1.title": "Search",
    "how.step1.desc": "Type the medicine name.",
    "how.step2.num": "02",
    "how.step2.title": "Compare",
    "how.step2.desc": "See availability, price & distance.",
    "how.step3.num": "03",
    "how.step3.title": "Go",
    "how.step3.desc": "Call the pharmacy or get directions.",
    "how.findBtn": "Find a medicine now",

    // Footer
    "footer.care": "Medily. Care, closer.",
    "footer.demo": "Demo data shown for preview purposes.",

    // Auth
    "auth.welcome": "Welcome back",
    "auth.createAccount": "Create your account",
    "auth.signinSubtitle": "Sign in to save pharmacies and track medicines.",
    "auth.signupSubtitle": "Join Medily to find medicines near you, faster.",
    "auth.signin": "Sign in",
    "auth.signup": "Sign up",
    "auth.fullname": "Full name",
    "auth.password": "Password",
    "auth.fillfields": "Please fill in all fields.",
    "auth.passlength": "Password must be at least 6 characters.",
    "auth.wait": "Please wait…",
    "auth.createAccountBtn": "Create account",
    "auth.new": "New to Medily? ",
    "auth.already": "Already have an account? ",
    "auth.createBtn": "Create an account",
    "auth.selectLang": "Select Language",
    "auth.signedin": "You're signed in",
    "auth.signout": "Sign out",
    "auth.gohome": "Go to home",

    // Search Results
    "search.showing": "Showing results for",
    "search.of": "of",
    "search.haveit": "pharmacies have it",
    "search.from": "From",
    "search.radius": "Within 5 km radius",
    "search.filter.all": "All",
    "search.filter.available": "Available only",
    "search.filter.open": "Open now",
    "search.sort.distance": "Sort: Distance",
    "search.sort.price": "Sort: Price",
    "search.nofilter": "No pharmacies match these filters.",
    "search.empty.title": "Search a medicine to begin",
    "search.empty.desc": "Type the name in the search bar above.",

    // Image/Voice search modals
    "image.title": "Photo Diagnosis Scanner",
    "image.upload": "Upload Medicine Photo",
    "image.drag": "Drag and drop an image of your medicine pack/bottle or choose a local file.",
    "image.browse": "Browse Photos",
    "image.webcam": "Use Web Camera",
    "image.demo": "Or try a demo medicine sample",
    "image.identified": "Medicine Successfully Identified",
    "image.match": "Match",
    "image.searchStores": "Search Stores for",
    "image.disclaimer":
      "Disclaimer: Image identification is simulated for preview. Always consult a licensed pharmacist or physician to verify medications.",

    "voice.title": "Voice Assistant",
    "voice.listening": "LISTENING...",
    "voice.say": "Say medicine name, e.g. Paracetamol",
    "voice.stopped": "Voice search stopped",
    "voice.speak": "Speak again",
    "voice.tapspeak": "Tap to speak again",
    "voice.searchBtn": "Search for",

    // Pharmacy Cards
    "card.available": "Available",
    "card.stock": "in stock",
    "card.notAvailable": "Not Available",
    "card.strip": "strip",
    "card.opennow": "Open now",
    "card.closed": "Closed",
    "card.call": "Call",
    "card.directions": "Directions",
  },
  es: {
    // Nav
    "nav.how": "Cómo funciona",
    "nav.why": "Por qué Medily",
    "nav.signin": "Iniciar sesión",
    "nav.getStarted": "Empezar",
    "nav.backHome": "← Volver al inicio",

    // Hero
    "hero.livestock": "Inventario en vivo de más de 2400 farmacias",
    "hero.title1": "Encuentra cualquier medicamento,",
    "hero.title2": "en minutos — no en horas.",
    "hero.subtitle":
      "Deja de correr de tienda en tienda. Busca un medicamento y consulta la disponibilidad, precios y direcciones en tiempo real a las farmacias cercanas.",
    "hero.placeholder": "Buscar cualquier medicamento, ej. Paracetamol",
    "hero.searchBtn": "Buscar",
    "hero.try": "Probar:",

    // Features
    "features.instant.title": "Resultados instantáneos",
    "features.instant.desc":
      "Busca una vez, mira cada farmacia cercana con stock en vivo en menos de un segundo.",
    "features.distance.title": "Ordenado por distancia",
    "features.distance.desc":
      "Te mostramos primero la tienda más cercana con el mejor precio, ahorrando tiempo de viaje.",
    "features.verified.title": "Farmacias verificadas",
    "features.verified.desc":
      "Cada listado es una farmacia autorizada con inventario y precios actualizados.",

    // How it works
    "how.title": "Tres pasos entre tú y tu medicina.",
    "how.step1.num": "01",
    "how.step1.title": "Buscar",
    "how.step1.desc": "Escribe el nombre del medicamento.",
    "how.step2.num": "02",
    "how.step2.title": "Comparar",
    "how.step2.desc": "Ver disponibilidad, precio y distancia.",
    "how.step3.num": "03",
    "how.step3.title": "Ir",
    "how.step3.desc": "Llama a la farmacia u obtén direcciones.",
    "how.findBtn": "Encuentra un medicamento ahora",

    // Footer
    "footer.care": "Medily. El cuidado, más cerca.",
    "footer.demo": "Datos de demostración mostrados con fines de vista previa.",

    // Auth
    "auth.welcome": "Bienvenido de nuevo",
    "auth.createAccount": "Crea tu cuenta",
    "auth.signinSubtitle": "Inicia sesión para guardar farmacias y rastrear medicamentos.",
    "auth.signupSubtitle": "Únete a Medily para encontrar medicamentos cerca de ti, más rápido.",
    "auth.signin": "Iniciar sesión",
    "auth.signup": "Registrarse",
    "auth.fullname": "Nombre completo",
    "auth.password": "Contraseña",
    "auth.fillfields": "Por favor complete todos los campos.",
    "auth.passlength": "La contraseña debe tener al menos 6 caracteres.",
    "auth.wait": "Por favor espere…",
    "auth.createAccountBtn": "Crear cuenta",
    "auth.new": "¿Nuevo en Medily? ",
    "auth.already": "¿Ya tienes una cuenta? ",
    "auth.createBtn": "Crear una cuenta",
    "auth.selectLang": "Seleccionar idioma",
    "auth.signedin": "Has iniciado sesión",
    "auth.signout": "Cerrar sesión",
    "auth.gohome": "Ir al inicio",

    // Search Results
    "search.showing": "Mostrando resultados para",
    "search.of": "de",
    "search.haveit": "las farmacias lo tienen",
    "search.from": "Desde",
    "search.radius": "Dentro de un radio de 5 km",
    "search.filter.all": "Todo",
    "search.filter.available": "Disponibles únicamente",
    "search.filter.open": "Abierto ahora",
    "search.sort.distance": "Ordenar: Distancia",
    "search.sort.price": "Ordenar: Precio",
    "search.nofilter": "Ninguna farmacia coincide con estos filtros.",
    "search.empty.title": "Busca un medicamento para comenzar",
    "search.empty.desc": "Escribe el nombre en la barra de búsqueda superior.",

    // Image/Voice search modals
    "image.title": "Escáner de diagnóstico fotográfico",
    "image.upload": "Cargar foto del medicamento",
    "image.drag":
      "Arrastre y suelte una imagen de su caja/frasco de medicamento o elija un archivo local.",
    "image.browse": "Examinar fotos",
    "image.webcam": "Usar cámara web",
    "image.demo": "O pruebe una muestra de medicamento",
    "image.identified": "Medicamento identificado con éxito",
    "image.match": "Coincidencia",
    "image.searchStores": "Buscar tiendas para",
    "image.disclaimer":
      "Descargo de responsabilidad: La identificación de la imagen es simulada para la vista previa. Consulte siempre a un farmacéutico o médico para verificar los medicamentos.",

    "voice.title": "Asistente de voz",
    "voice.listening": "ESCUCHANDO...",
    "voice.say": "Diga el nombre del medicamento, ej. Paracetamol",
    "voice.stopped": "Búsqueda por voz detenida",
    "voice.speak": "Hablar de nuevo",
    "voice.tapspeak": "Toca para hablar de nuevo",
    "voice.searchBtn": "Buscar",

    // Pharmacy Cards
    "card.available": "Disponible",
    "card.stock": "en stock",
    "card.notAvailable": "No disponible",
    "card.strip": "tira",
    "card.opennow": "Abierto ahora",
    "card.closed": "Cerrado",
    "card.call": "Llamar",
    "card.directions": "Cómo llegar",
  },
  hi: {
    // Nav
    "nav.how": "यह कैसे काम करता है",
    "nav.why": "मेडिली क्यों",
    "nav.signin": "साइन इन करें",
    "nav.getStarted": "शुरू करें",
    "nav.backHome": "← होम पर वापस जाएं",

    // Hero
    "hero.livestock": "2,400+ फार्मेसियों से लाइव स्टॉक",
    "hero.title1": "कोई भी दवा खोजें,",
    "hero.title2": "मिनटों में — घंटों में नहीं।",
    "hero.subtitle":
      "दुकान-दुकान दौड़ना बंद करें। दवा खोजें और वास्तविक समय में उपलब्धता, कीमतें और नजदीकी फार्मेसियों के दिशा-निर्देश देखें।",
    "hero.placeholder": "कोई भी दवा खोजें, जैसे. पैरासिटामोल",
    "hero.searchBtn": "खोजें",
    "hero.try": "कोशिश करें:",

    // Features
    "features.instant.title": "तुरंत परिणाम",
    "features.instant.desc":
      "एक बार खोजें, एक सेकंड से भी कम समय में लाइव स्टॉक के साथ हर नजदीकी फार्मेसी देखें।",
    "features.distance.title": "दूरी के अनुसार क्रमबद्ध",
    "features.distance.desc":
      "हम आपको सबसे पहले सबसे अच्छी कीमत वाली सबसे नजदीकी दुकान दिखाते हैं — यात्रा का समय बचाते हैं।",
    "features.verified.title": "सत्यापित फार्मेसियाँ",
    "features.verified.desc":
      "प्रत्येक सूची अद्यतित इन्वेंट्री और मूल्य निर्धारण के साथ एक लाइसेंस प्राप्त फार्मेसी है।",

    // How it works
    "how.title": "आपके और आपकी दवा के बीच तीन कदम।",
    "how.step1.num": "01",
    "how.step1.title": "खोजें",
    "how.step1.desc": "दवा का नाम टाइप करें।",
    "how.step2.num": "02",
    "how.step2.title": "तुलना करें",
    "how.step2.desc": "उपलब्धता, कीमत और दूरी देखें।",
    "how.step3.num": "03",
    "how.step3.title": "जायें",
    "how.step3.desc": "फार्मेसी को कॉल करें या दिशा-निर्देश प्राप्त करें।",
    "how.findBtn": "अभी दवा खोजें",

    // Footer
    "footer.care": "मेडिली। देखभाल, करीब।",
    "footer.demo": "पूर्वावलोकन उद्देश्यों के लिए दिखाया गया डेमो डेटा।",

    // Auth
    "auth.welcome": "वापसी पर स्वागत है",
    "auth.createAccount": "अपना खाता बनाएं",
    "auth.signinSubtitle": "फार्मेसियों को बचाने और दवाओं को ट्रैक करने के लिए साइन इन करें।",
    "auth.signupSubtitle": "अपने आस-पास दवाएं तेजी से खोजने के लिए मेडिली से जुड़ें।",
    "auth.signin": "साइन इन करें",
    "auth.signup": "साइन अप करें",
    "auth.fullname": "पूरा नाम",
    "auth.password": "पासवर्ड",
    "auth.fillfields": "कृपया सभी क्षेत्र भरें।",
    "auth.passlength": "पासवर्ड कम से कम 6 अक्षरों का होना चाहिए।",
    "auth.wait": "कृपया प्रतीक्षा करें...",
    "auth.createAccountBtn": "खाता बनाएं",
    "auth.new": "मेडिली में नए हैं? ",
    "auth.already": "पहले से ही एक खाता है? ",
    "auth.createBtn": "खाता बनाएं",
    "auth.selectLang": "भाषा चुनें",
    "auth.signedin": "आप साइन इन हैं",
    "auth.signout": "साइन आउट",
    "auth.gohome": "होम पर जाएं",

    // Search Results
    "search.showing": "के लिए परिणाम दिखाए जा रहे हैं",
    "search.of": "में से",
    "search.haveit": "फार्मेसियों के पास यह है",
    "search.from": "से",
    "search.radius": "5 किमी के दायरे में",
    "search.filter.all": "सभी",
    "search.filter.available": "केवल उपलब्ध",
    "search.filter.open": "अभी खुला है",
    "search.sort.distance": "क्रमबद्ध करें: दूरी",
    "search.sort.price": "क्रमबद्ध करें: कीमत",
    "search.nofilter": "कोई भी फार्मेसी इन फिल्टरों से मेल नहीं खाती।",
    "search.empty.title": "शुरू करने के लिए एक दवा खोजें",
    "search.empty.desc": "ऊपर सर्च बार में नाम टाइप करें।",

    // Image/Voice search modals
    "image.title": "फोटो निदान स्कैनर",
    "image.upload": "दवा की फोटो अपलोड करें",
    "image.drag": "अपने दवा पैक/बोतल की एक छवि खींचें और छोड़ें या एक स्थानीय फ़ाइल चुनें।",
    "image.browse": "तस्वीरें ब्राउज़ करें",
    "image.webcam": "वेब कैमरा का उपयोग करें",
    "image.demo": "या एक डेमो दवा नमूना आज़माएं",
    "image.identified": "दवा की पहचान सफलतापूर्वक की गई",
    "image.match": "मैच",
    "image.searchStores": "इसके लिए दुकानों में खोजें",
    "image.disclaimer":
      "अस्वीकरण: पूर्वावलोकन के लिए छवि पहचान का अनुकरण किया गया है। दवाओं को सत्यापित करने के लिए हमेशा एक लाइसेंस प्राप्त फार्मासिस्ट या चिकित्सक से परामर्श करें।",

    "voice.title": "आवाज सहायक",
    "voice.listening": "सुन रहा है...",
    "voice.say": "दवा का नाम बोलें, जैसे पैरासिटामोल",
    "voice.stopped": "वॉयस सर्च बंद हो गई",
    "voice.speak": "फिर से बोलें",
    "voice.tapspeak": "फिर से बोलने के लिए टैप करें",
    "voice.searchBtn": "खोजें",

    // Pharmacy Cards
    "card.available": "उपलब्ध",
    "card.stock": "स्टॉक में",
    "card.notAvailable": "उपलब्ध नहीं है",
    "card.strip": "पत्ता",
    "card.opennow": "अभी खुला है",
    "card.closed": "बंद है",
    "card.call": "कॉल करें",
    "card.directions": "दिशा-निर्देश",
  },
  fr: {
    // Nav
    "nav.how": "Comment ça marche",
    "nav.why": "Pourquoi Medily",
    "nav.signin": "Se connecter",
    "nav.getStarted": "S'inscrire",
    "nav.backHome": "← Retour à l'accueil",

    // Hero
    "hero.livestock": "Stock en direct de plus de 2 400 pharmacies",
    "hero.title1": "Trouvez n'importe quel médicament,",
    "hero.title2": "en quelques minutes — pas en heures.",
    "hero.subtitle":
      "Arrêtez de courir de magasin en magasin. Recherchez un médicament et voyez la disponibilité, les prix et les directions en temps réel vers les pharmacies à proximité.",
    "hero.placeholder": "Rechercher un médicament, ex: Paracétamol",
    "hero.searchBtn": "Rechercher",
    "hero.try": "Essayer :",

    // Features
    "features.instant.title": "Résultats instantanés",
    "features.instant.desc":
      "Recherchez une fois, voyez chaque pharmacie à proximité avec du stock en direct en moins d'une seconde.",
    "features.distance.title": "Trié par distance",
    "features.distance.desc":
      "Nous vous montrons d'abord le magasin le plus proche avec le meilleur prix — économisant du temps de voyage.",
    "features.verified.title": "Pharmacies vérifiées",
    "features.verified.desc":
      "Chaque annonce est une pharmacie agréée avec un inventaire et des prix à jour.",

    // How it works
    "how.title": "Trois étapes entre vous et votre médicament.",
    "how.step1.num": "01",
    "how.step1.title": "Rechercher",
    "how.step1.desc": "Tapez le nom du médicament.",
    "how.step2.num": "02",
    "how.step2.title": "Comparer",
    "how.step2.desc": "Voir la disponibilité, le prix et la distance.",
    "how.step3.num": "03",
    "how.step3.title": "Y aller",
    "how.step3.desc": "Appelez la pharmacie ou obtenez des itinéraires.",
    "how.findBtn": "Trouver un médicament maintenant",

    // Footer
    "footer.care": "Medily. Des soins, plus proches.",
    "footer.demo": "Données de démonstration affichées à des fins d'aperçu.",

    // Auth
    "auth.welcome": "Bon retour",
    "auth.createAccount": "Créez votre compte",
    "auth.signinSubtitle":
      "Connectez-vous pour enregistrer des pharmacies et suivre les médicaments.",
    "auth.signupSubtitle":
      "Rejoignez Medily pour trouver des médicaments près de chez vous, plus rapidement.",
    "auth.signin": "Se connecter",
    "auth.signup": "S'inscrire",
    "auth.fullname": "Nom complet",
    "auth.password": "Mot de passe",
    "auth.fillfields": "Veuillez remplir tous les champs.",
    "auth.passlength": "Le mot de passe doit comporter au moins 6 caractères.",
    "auth.wait": "Veuillez patienter…",
    "auth.createAccountBtn": "Créer un compte",
    "auth.new": "Nouveau sur Medily ? ",
    "auth.already": "Vous avez déjà un compte ? ",
    "auth.createBtn": "Créer un compte",
    "auth.selectLang": "Choisir la langue",
    "auth.signedin": "Vous êtes connecté",
    "auth.signout": "Se déconnecter",
    "auth.gohome": "Aller à l'accueil",

    // Search Results
    "search.showing": "Affichage des résultats pour",
    "search.of": "sur",
    "search.haveit": "les pharmacies l'ont",
    "search.from": "À partir de",
    "search.radius": "Dans un rayon de 5 km",
    "search.filter.all": "Tout",
    "search.filter.available": "Disponible uniquement",
    "search.filter.open": "Ouvert maintenant",
    "search.sort.distance": "Trier : Distance",
    "search.sort.price": "Trier : Prix",
    "search.nofilter": "Aucune pharmacie ne correspond à ces critères.",
    "search.empty.title": "Recherchez un médicament pour commencer",
    "search.empty.desc": "Tapez le nom dans la barre de recherche ci-dessus.",

    // Image/Voice search modals
    "image.title": "Scanner de diagnostic photo",
    "image.upload": "Télécharger la photo du médicament",
    "image.drag":
      "Glissez-déposez une image de votre boîte/flacon de médicament ou choisissez un fichier local.",
    "image.browse": "Parcourir les photos",
    "image.webcam": "Utiliser la webcam",
    "image.demo": "Ou essayez un échantillon de démonstration",
    "image.identified": "Médicament identifié avec succès",
    "image.match": "Correspondance",
    "image.searchStores": "Rechercher des magasins pour",
    "image.disclaimer":
      "Avis de non-responsabilité : L'identification de l'image est simulée pour l'aperçu. Consultez toujours un pharmacien ou un médecin pour vérifier vos médicaments.",

    "voice.title": "Assistant vocal",
    "voice.listening": "ÉCOUTE...",
    "voice.say": "Dites le nom du médicament, ex: Paracétamol",
    "voice.stopped": "Recherche vocale arrêtée",
    "voice.speak": "Parler à nouveau",
    "voice.tapspeak": "Appuyez pour parler à nouveau",
    "voice.searchBtn": "Rechercher",

    // Pharmacy Cards
    "card.available": "Disponible",
    "card.stock": "en stock",
    "card.notAvailable": "Non disponible",
    "card.strip": "plaquette",
    "card.opennow": "Ouvert maintenant",
    "card.closed": "Fermé",
    "card.call": "Appeler",
    "card.directions": "Itinéraire",
  },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>("en");

  useEffect(() => {
    try {
      const stored = localStorage.getItem("medily_lang") as Language;
      if (stored && ["en", "es", "hi", "fr"].includes(stored)) {
        setLanguageState(stored);
      }
    } catch {
      // ignore
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    try {
      localStorage.setItem("medily_lang", lang);
    } catch {
      // ignore
    }
  };

  const t = (key: string): string => {
    const langDict = TRANSLATIONS[language] || TRANSLATIONS.en;
    return langDict[key] || TRANSLATIONS.en[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};
