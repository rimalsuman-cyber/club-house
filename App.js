import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import * as Print from "expo-print";
import { StatusBar } from "expo-status-bar";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Alert,
  Animated,
  KeyboardAvoidingView,
  Image,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  useWindowDimensions
} from "react-native";

const HISTORY_KEY = "clubhaus.orderHistory";
const MENU_KEY = "clubhouse.menu";
const LANGUAGE_KEY = "clubhouse.language";
const ADMIN_PIN_KEY = "clubhouse.adminPin";
const CURRENCY_KEY = "clubhouse.currency";
const DEFAULT_ADMIN_PIN = "1234";
const CURRENCIES = ["EUR", "USD", "GBP", "CHF", "TRY", "ALL"];

const defaultCategories = [
  {
    id: "starters",
    name: "Starters",
    items: [
      { id: "bruschetta", name: "Tomato Bruschetta", price: 6.5 },
      { id: "soup", name: "Soup of the Day", price: 5.9 },
      { id: "wings", name: "Crispy Chicken Wings", price: 8.5 }
    ]
  },
  {
    id: "mains",
    name: "Mains",
    items: [
      { id: "burger", name: "ClubHouse Burger", price: 13.9 },
      { id: "pasta", name: "Creamy Mushroom Pasta", price: 12.5 },
      { id: "salmon", name: "Grilled Salmon", price: 17.9 },
      { id: "steak", name: "Pepper Steak", price: 21.5 }
    ]
  },
  {
    id: "sides",
    name: "Sides",
    items: [
      { id: "fries", name: "House Fries", price: 4.5 },
      { id: "salad", name: "Green Salad", price: 5.2 },
      { id: "bread", name: "Garlic Bread", price: 4.0 }
    ]
  },
  {
    id: "drinks",
    name: "Drinks",
    items: [
      { id: "water", name: "Sparkling Water", price: 2.8 },
      { id: "lemonade", name: "Fresh Lemonade", price: 3.9 },
      { id: "coffee", name: "Coffee", price: 2.9 }
    ]
  }
];

const tables = Array.from({ length: 16 }, (_, index) => index + 1);

const palette = {
  primary: "#2563EB",
  primaryDark: "#1D4ED8",
  secondary: "#F97316",
  success: "#10B981",
  background: "#F8FAFC",
  card: "#FFFFFF",
  ink: "#0F172A",
  muted: "#64748B",
  line: "#E2E8F0",
  warning: "#F59E0B",
  danger: "#EF4444"
};

const categoryVisuals = {
  starters: { icon: "★", color: "#F97316", soft: "#FFF7ED" },
  mains: { icon: "◆", color: "#2563EB", soft: "#EFF6FF" },
  sides: { icon: "◐", color: "#10B981", soft: "#ECFDF5" },
  drinks: { icon: "●", color: "#7C3AED", soft: "#F5F3FF" }
};

const tableStatusStyles = {
  available: { label: "Available", color: palette.success, soft: "#ECFDF5" },
  occupied: { label: "Occupied", color: palette.danger, soft: "#FEF2F2" },
  reserved: { label: "Reserved", color: "#FACC15", soft: "#FEFCE8" }
};

const LANGUAGES = [
  { code: "EN", label: "English" },
  { code: "DE", label: "Deutsch" },
  { code: "IT", label: "Italiano" },
  { code: "FR", label: "Francais" },
  { code: "TR", label: "Turkce" },
  { code: "AL", label: "Shqip" }
];

const LOCALES = {
  EN: "en-GB",
  DE: "de-DE",
  IT: "it-IT",
  FR: "fr-FR",
  TR: "tr-TR",
  AL: "sq-AL"
};

const translations = {
  EN: {
    add: "Add",
    addItems: "Add items",
    cart: "Cart",
    cartEmpty: "Cart is empty",
    cartEmptyMessage: "Select a table and add menu items to begin.",
    chooseTable: "Choose a table",
    dateTime: "Date/Time",
    demoPrintPreview: "Demo print preview",
    history: "History",
    historyUnavailable: "History unavailable",
    historyUnavailableMessage: "Saved orders could not be loaded.",
    kitchenReceipt: "Kitchen Order Receipt",
    language: "Language",
    menu: "Menu",
    noPrintedOrders: "No printed orders yet",
    noTable: "No table",
    note: "Note",
    notesPlaceholder: "Notes: no chili, extra sauce",
    order: "Order",
    orderCart: "Order cart",
    orderHistory: "Order history",
    ordersAfterPrint: "Orders appear here after the print preview completes.",
    printCancelled: "Print cancelled",
    printCancelledMessage: "The order was not saved because printing did not finish.",
    printOrder: "Print Order",
    printedOrders: "Printed orders",
    review: "Review",
    selectTable: "Select a table",
    selectTableBeforePrint: "Choose a table before printing the order.",
    startOrder: "Start a new order by selecting the guest table.",
    table: "Table",
    tableSelection: "Table selection",
    total: "Total",
    categories: {
      starters: "Starters",
      mains: "Mains",
      sides: "Sides",
      drinks: "Drinks"
    }
  },
  DE: {
    add: "Hinzufugen",
    addItems: "Artikel hinzufugen",
    cart: "Warenkorb",
    cartEmpty: "Warenkorb ist leer",
    cartEmptyMessage: "Wahlen Sie einen Tisch und fugen Sie Speisen hinzu.",
    chooseTable: "Tisch wahlen",
    dateTime: "Datum/Zeit",
    demoPrintPreview: "Demo-Druckvorschau",
    history: "Verlauf",
    historyUnavailable: "Verlauf nicht verfugbar",
    historyUnavailableMessage: "Gespeicherte Bestellungen konnten nicht geladen werden.",
    kitchenReceipt: "Kuchenbestellung",
    language: "Sprache",
    menu: "Menu",
    noPrintedOrders: "Noch keine gedruckten Bestellungen",
    noTable: "Kein Tisch",
    note: "Notiz",
    notesPlaceholder: "Notizen: ohne Chili, extra Sauce",
    order: "Bestellung",
    orderCart: "Bestellkorb",
    orderHistory: "Bestellverlauf",
    ordersAfterPrint: "Bestellungen erscheinen hier nach der Druckvorschau.",
    printCancelled: "Druck abgebrochen",
    printCancelledMessage: "Die Bestellung wurde nicht gespeichert, da der Druck nicht abgeschlossen wurde.",
    printOrder: "Bestellung drucken",
    printedOrders: "Gedruckte Bestellungen",
    review: "Prufen",
    selectTable: "Tisch auswahlen",
    selectTableBeforePrint: "Wahlen Sie vor dem Drucken einen Tisch.",
    startOrder: "Starten Sie eine neue Bestellung durch Auswahl des Tisches.",
    table: "Tisch",
    tableSelection: "Tischauswahl",
    total: "Summe",
    categories: {
      starters: "Vorspeisen",
      mains: "Hauptgerichte",
      sides: "Beilagen",
      drinks: "Getranke"
    }
  },
  IT: {
    add: "Aggiungi",
    addItems: "Aggiungi piatti",
    cart: "Carrello",
    cartEmpty: "Carrello vuoto",
    cartEmptyMessage: "Seleziona un tavolo e aggiungi piatti per iniziare.",
    chooseTable: "Scegli un tavolo",
    dateTime: "Data/Ora",
    demoPrintPreview: "Anteprima stampa demo",
    history: "Storico",
    historyUnavailable: "Storico non disponibile",
    historyUnavailableMessage: "Non e stato possibile caricare gli ordini salvati.",
    kitchenReceipt: "Ricevuta ordine cucina",
    language: "Lingua",
    menu: "Menu",
    noPrintedOrders: "Nessun ordine stampato",
    noTable: "Nessun tavolo",
    note: "Nota",
    notesPlaceholder: "Note: senza chili, salsa extra",
    order: "Ordine",
    orderCart: "Carrello ordine",
    orderHistory: "Storico ordini",
    ordersAfterPrint: "Gli ordini appariranno qui dopo l'anteprima di stampa.",
    printCancelled: "Stampa annullata",
    printCancelledMessage: "L'ordine non e stato salvato perche la stampa non e terminata.",
    printOrder: "Stampa ordine",
    printedOrders: "Ordini stampati",
    review: "Controlla",
    selectTable: "Seleziona tavolo",
    selectTableBeforePrint: "Scegli un tavolo prima di stampare l'ordine.",
    startOrder: "Avvia un nuovo ordine selezionando il tavolo.",
    table: "Tavolo",
    tableSelection: "Selezione tavolo",
    total: "Totale",
    categories: {
      starters: "Antipasti",
      mains: "Piatti principali",
      sides: "Contorni",
      drinks: "Bevande"
    }
  },
  FR: {
    add: "Ajouter",
    addItems: "Ajouter des articles",
    cart: "Panier",
    cartEmpty: "Panier vide",
    cartEmptyMessage: "Selectionnez une table et ajoutez des articles.",
    chooseTable: "Choisir une table",
    dateTime: "Date/Heure",
    demoPrintPreview: "Apercu impression demo",
    history: "Historique",
    historyUnavailable: "Historique indisponible",
    historyUnavailableMessage: "Les commandes enregistrees n'ont pas pu etre chargees.",
    kitchenReceipt: "Bon de commande cuisine",
    language: "Langue",
    menu: "Menu",
    noPrintedOrders: "Aucune commande imprimee",
    noTable: "Aucune table",
    note: "Note",
    notesPlaceholder: "Notes: sans piment, sauce extra",
    order: "Commande",
    orderCart: "Panier de commande",
    orderHistory: "Historique des commandes",
    ordersAfterPrint: "Les commandes apparaissent ici apres l'apercu d'impression.",
    printCancelled: "Impression annulee",
    printCancelledMessage: "La commande n'a pas ete enregistree car l'impression n'est pas terminee.",
    printOrder: "Imprimer",
    printedOrders: "Commandes imprimees",
    review: "Verifier",
    selectTable: "Selectionner une table",
    selectTableBeforePrint: "Choisissez une table avant d'imprimer la commande.",
    startOrder: "Demarrez une commande en selectionnant la table.",
    table: "Table",
    tableSelection: "Selection de table",
    total: "Total",
    categories: {
      starters: "Entrees",
      mains: "Plats",
      sides: "Accompagnements",
      drinks: "Boissons"
    }
  },
  TR: {
    add: "Ekle",
    addItems: "Urun ekle",
    cart: "Sepet",
    cartEmpty: "Sepet bos",
    cartEmptyMessage: "Baslamak icin masa secin ve urun ekleyin.",
    chooseTable: "Masa sec",
    dateTime: "Tarih/Saat",
    demoPrintPreview: "Demo yazdirma onizleme",
    history: "Gecmis",
    historyUnavailable: "Gecmis kullanilamiyor",
    historyUnavailableMessage: "Kayitli siparisler yuklenemedi.",
    kitchenReceipt: "Mutfak siparis fisi",
    language: "Dil",
    menu: "Menu",
    noPrintedOrders: "Henuz yazdirilan siparis yok",
    noTable: "Masa yok",
    note: "Not",
    notesPlaceholder: "Notlar: acisiz, ekstra sos",
    order: "Siparis",
    orderCart: "Siparis sepeti",
    orderHistory: "Siparis gecmisi",
    ordersAfterPrint: "Siparisler yazdirma onizlemesinden sonra burada gorunur.",
    printCancelled: "Yazdirma iptal edildi",
    printCancelledMessage: "Yazdirma tamamlanmadigi icin siparis kaydedilmedi.",
    printOrder: "Siparisi yazdir",
    printedOrders: "Yazdirilan siparisler",
    review: "Kontrol",
    selectTable: "Masa secin",
    selectTableBeforePrint: "Siparisi yazdirmadan once masa secin.",
    startOrder: "Musteri masasini secerek yeni siparis baslatin.",
    table: "Masa",
    tableSelection: "Masa secimi",
    total: "Toplam",
    categories: {
      starters: "Baslangiclar",
      mains: "Ana yemekler",
      sides: "Yan urunler",
      drinks: "Icecekler"
    }
  },
  AL: {
    add: "Shto",
    addItems: "Shto artikuj",
    cart: "Shporta",
    cartEmpty: "Shporta eshte bosh",
    cartEmptyMessage: "Zgjidhni nje tavoline dhe shtoni artikuj.",
    chooseTable: "Zgjidh tavolinen",
    dateTime: "Data/Ora",
    demoPrintPreview: "Parapamje printimi demo",
    history: "Historia",
    historyUnavailable: "Historia nuk eshte e disponueshme",
    historyUnavailableMessage: "Porosite e ruajtura nuk mund te ngarkoheshin.",
    kitchenReceipt: "Fature porosie kuzhine",
    language: "Gjuha",
    menu: "Menu",
    noPrintedOrders: "Ende nuk ka porosi te printuara",
    noTable: "Pa tavoline",
    note: "Shenim",
    notesPlaceholder: "Shenime: pa djeges, salce ekstra",
    order: "Porosi",
    orderCart: "Shporta e porosise",
    orderHistory: "Historia e porosive",
    ordersAfterPrint: "Porosite shfaqen ketu pas parapamjes se printimit.",
    printCancelled: "Printimi u anulua",
    printCancelledMessage: "Porosia nuk u ruajt sepse printimi nuk perfundoi.",
    printOrder: "Printo porosine",
    printedOrders: "Porosi te printuara",
    review: "Kontrollo",
    selectTable: "Zgjidh tavoline",
    selectTableBeforePrint: "Zgjidhni nje tavoline para printimit te porosise.",
    startOrder: "Filloni porosi te re duke zgjedhur tavolinen.",
    table: "Tavolina",
    tableSelection: "Zgjedhja e tavolines",
    total: "Totali",
    categories: {
      starters: "Fillestare",
      mains: "Kryesore",
      sides: "Shoqeruese",
      drinks: "Pije"
    }
  }
};

const money = (value, currency = "EUR") => `${currency} ${value.toFixed(2)}`;

const formatDateTime = (date, language = "EN") =>
  new Intl.DateTimeFormat(LOCALES[language] || LOCALES.EN, {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(date);

const createReceiptHtml = (order, t, language, currency) => {
  const rows = order.items
    .map(
      (item) => `
        <tr>
          <td>
            <strong>${item.name}</strong>
            ${item.notes ? `<div class="note">${t.note}: ${item.notes}</div>` : ""}
          </td>
          <td class="qty">${item.quantity}</td>
          <td class="total">${money(item.price * item.quantity, currency)}</td>
        </tr>`
    )
    .join("");

  return `
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; padding: 24px; color: #1f2421; }
          .receipt { max-width: 360px; margin: 0 auto; }
          h1 { font-size: 24px; margin: 0 0 4px; text-align: center; }
          .subhead { text-align: center; color: #69706a; margin-bottom: 20px; }
          .meta { border-top: 1px dashed #9da69f; border-bottom: 1px dashed #9da69f; padding: 12px 0; margin-bottom: 12px; }
          .meta div { display: flex; justify-content: space-between; margin: 4px 0; }
          table { width: 100%; border-collapse: collapse; }
          td { border-bottom: 1px solid #ece7de; padding: 10px 0; vertical-align: top; }
          .qty { width: 44px; text-align: center; }
          .total { width: 82px; text-align: right; }
          .note { color: #69706a; font-size: 12px; margin-top: 4px; }
          .grand { display: flex; justify-content: space-between; font-size: 20px; font-weight: 800; margin-top: 18px; }
          .footer { text-align: center; margin-top: 28px; color: #69706a; }
        </style>
      </head>
      <body>
        <section class="receipt">
          <h1>ClubHouse</h1>
          <div class="subhead">${t.kitchenReceipt}</div>
          <div class="meta">
            <div><span>${t.order}</span><strong>#${order.orderNumber}</strong></div>
            <div><span>${t.table}</span><strong>${order.tableNumber}</strong></div>
            <div><span>${t.dateTime}</span><strong>${formatDateTime(new Date(order.createdAt), language)}</strong></div>
          </div>
          <table>${rows}</table>
          <div class="grand"><span>${t.total}</span><span>${money(order.total, currency)}</span></div>
          <div class="footer">${t.demoPrintPreview}</div>
        </section>
      </body>
    </html>`;
};

export default function App() {
  const { width } = useWindowDimensions();
  const [screen, setScreen] = useState("tables");
  const [selectedTable, setSelectedTable] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(defaultCategories[0].id);
  const [menuCategories, setMenuCategories] = useState(defaultCategories);
  const [cartsByTable, setCartsByTable] = useState({});
  const [tableStatuses, setTableStatuses] = useState({});
  const [statusMode, setStatusMode] = useState(null);
  const [history, setHistory] = useState([]);
  const [language, setLanguage] = useState("EN");
  const [currency, setCurrency] = useState("EUR");
  const [adminPin, setAdminPin] = useState(DEFAULT_ADMIN_PIN);
  const screenOpacity = useRef(new Animated.Value(1)).current;

  const t = translations[language];
  const isWideLayout = width >= 760;

  useEffect(() => {
    loadHistory();
    loadMenu();
    loadSettings();
  }, []);

  useEffect(() => {
    screenOpacity.setValue(0);
    Animated.timing(screenOpacity, {
      toValue: 1,
      duration: 220,
      useNativeDriver: true
    }).start();
  }, [screen, screenOpacity]);

  useEffect(() => {
    if (Platform.OS !== "web") {
      return;
    }

    document.title = "ClubHouse";

    let viewport = document.querySelector("meta[name='viewport']");
    if (!viewport) {
      viewport = document.createElement("meta");
      viewport.setAttribute("name", "viewport");
      document.head.appendChild(viewport);
    }
    viewport.setAttribute(
      "content",
      "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no"
    );

    document.documentElement.style.touchAction = "manipulation";
    document.body.style.overscrollBehavior = "none";

    let selectionStyle = document.getElementById("clubhouse-selection-style");
    if (!selectionStyle) {
      selectionStyle = document.createElement("style");
      selectionStyle.id = "clubhouse-selection-style";
      document.head.appendChild(selectionStyle);
    }
    selectionStyle.textContent = `
      *:not(input):not(textarea) {
        -webkit-tap-highlight-color: transparent;
        -webkit-touch-callout: none;
        -webkit-user-select: none;
        user-select: none;
      }
      input, textarea {
        -webkit-user-select: text;
        user-select: text;
      }
    `;
  }, []);

  const activeCategory =
    menuCategories.find((category) => category.id === selectedCategory) || menuCategories[0];
  const cart = selectedTable ? cartsByTable[selectedTable] || [] : [];

  const cartCount = useMemo(
    () => cart.reduce((sum, item) => sum + item.quantity, 0),
    [cart]
  );

  const total = useMemo(
    () => cart.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [cart]
  );

  const tableItemCounts = useMemo(() => {
    return Object.fromEntries(
      Object.entries(cartsByTable).map(([tableNumber, tableCart]) => [
        tableNumber,
        tableCart.reduce((sum, item) => sum + item.quantity, 0)
      ])
    );
  }, [cartsByTable]);

  const loadHistory = async () => {
    try {
      const saved = await AsyncStorage.getItem(HISTORY_KEY);
      setHistory(saved ? JSON.parse(saved) : []);
    } catch {
      Alert.alert(t.historyUnavailable, t.historyUnavailableMessage);
    }
  };

  const loadMenu = async () => {
    try {
      const saved = await AsyncStorage.getItem(MENU_KEY);
      setMenuCategories(saved ? JSON.parse(saved) : defaultCategories);
    } catch {
      setMenuCategories(defaultCategories);
    }
  };

  const loadSettings = async () => {
    try {
      const [savedLanguage, savedCurrency, savedAdminPin] = await Promise.all([
        AsyncStorage.getItem(LANGUAGE_KEY),
        AsyncStorage.getItem(CURRENCY_KEY),
        AsyncStorage.getItem(ADMIN_PIN_KEY)
      ]);

      if (savedLanguage && translations[savedLanguage]) {
        setLanguage(savedLanguage);
      }

      if (savedCurrency && CURRENCIES.includes(savedCurrency)) {
        setCurrency(savedCurrency);
      }

      if (savedAdminPin) {
        setAdminPin(savedAdminPin);
      }
    } catch {
      setCurrency("EUR");
      setAdminPin(DEFAULT_ADMIN_PIN);
    }
  };

  const saveCurrency = async (nextCurrency) => {
    setCurrency(nextCurrency);
    await AsyncStorage.setItem(CURRENCY_KEY, nextCurrency);
  };

  const saveLanguage = async (nextLanguage) => {
    setLanguage(nextLanguage);
    await AsyncStorage.setItem(LANGUAGE_KEY, nextLanguage);
  };

  const saveAdminPin = async (nextPin) => {
    setAdminPin(nextPin);
    await AsyncStorage.setItem(ADMIN_PIN_KEY, nextPin);
  };

  const saveMenu = async (nextCategories) => {
    setMenuCategories(nextCategories);
    await AsyncStorage.setItem(MENU_KEY, JSON.stringify(nextCategories));
  };

  const saveHistory = async (orders) => {
    setHistory(orders);
    await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(orders));
  };

  const chooseTable = (tableNumber) => {
    applyTableStatus(tableNumber, "occupied");
    setSelectedTable(tableNumber);
    setScreen("menu");
  };

  const applyTableStatus = (tableNumber, status) => {
    setTableStatuses((current) => {
      const nextStatuses = { ...current };

      if (status === "available") {
        delete nextStatuses[tableNumber];
      } else {
        nextStatuses[tableNumber] = status;
      }

      return nextStatuses;
    });
  };

  const updateSelectedTableCart = (updater) => {
    if (!selectedTable) {
      return;
    }

    setCartsByTable((current) => {
      const currentCart = current[selectedTable] || [];
      const nextCart = updater(currentCart);
      const nextCarts = { ...current };

      if (nextCart.length === 0) {
        delete nextCarts[selectedTable];
      } else {
        nextCarts[selectedTable] = nextCart;
      }

      return nextCarts;
    });
  };

  const addItem = (menuItem) => {
    updateSelectedTableCart((current) => {
      const existing = current.find((item) => item.id === menuItem.id);
      if (!existing) {
        return [...current, { ...menuItem, quantity: 1, notes: "" }];
      }
      return current.map((item) =>
        item.id === menuItem.id ? { ...item, quantity: item.quantity + 1 } : item
      );
    });
  };

  const updateQuantity = (itemId, change) => {
    updateSelectedTableCart((current) =>
      current
        .map((item) =>
          item.id === itemId
            ? { ...item, quantity: Math.max(0, item.quantity + change) }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const updateNotes = (itemId, notes) => {
    updateSelectedTableCart((current) =>
      current.map((item) => (item.id === itemId ? { ...item, notes } : item))
    );
  };

  const buildOrder = () => ({
    id: `${Date.now()}`,
    orderNumber: `${new Date().getFullYear()}${String(history.length + 1).padStart(4, "0")}`,
    tableNumber: selectedTable,
    createdAt: new Date().toISOString(),
    items: cart,
    total
  });

  const printOrder = async () => {
    if (!selectedTable) {
      Alert.alert(t.selectTable, t.selectTableBeforePrint);
      return;
    }

    if (cart.length === 0) {
      Alert.alert(t.cartEmpty, t.cartEmptyMessage);
      return;
    }

    const order = buildOrder();

    try {
      await Print.printAsync({
        html: createReceiptHtml(order, t, language, currency)
      });

      // Later printer integration can be added here:
      // - Bluetooth thermal printer SDK for waiter printers.
      // - Wi-Fi / LAN ESC/POS printer command bridge for kitchen printers.
      // - Cloud print endpoint if orders should route through a backend.
      await saveHistory([order, ...history]);
      setCartsByTable((current) => {
        const nextCarts = { ...current };
        delete nextCarts[selectedTable];
        return nextCarts;
      });
      applyTableStatus(selectedTable, "available");
      setSelectedTable(null);
      setScreen("history");
    } catch {
      Alert.alert(t.printCancelled, t.printCancelledMessage);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />
      <KeyboardAvoidingView
        style={[styles.app, isWideLayout && styles.appWide]}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <Header
          cartCount={cartCount}
          onGoCart={() => setScreen("cart")}
          onGoAdmin={() => setScreen("admin")}
          onGoHistory={() => setScreen("history")}
          onGoSettings={() => setScreen("settings")}
          onGoTables={() => setScreen("tables")}
          selectedTable={selectedTable}
          t={t}
        />

        <Animated.View style={[styles.screenShell, { opacity: screenOpacity }]}>
          {screen === "tables" && (
            <TableSelection
              selectedTable={selectedTable}
              statusMode={statusMode}
              tableStatuses={tableStatuses}
              tableItemCounts={tableItemCounts}
              onApplyTableStatus={applyTableStatus}
              onSelectStatusMode={(nextMode) =>
                setStatusMode((currentMode) =>
                  nextMode === null || currentMode === nextMode ? null : nextMode
                )
              }
              onSelect={chooseTable}
              isWideLayout={isWideLayout}
              t={t}
            />
          )}

          {screen === "menu" && (
            <MenuScreen
              activeCategory={activeCategory}
              cart={cart}
              categories={menuCategories}
              currency={currency}
              selectedCategory={selectedCategory}
              setSelectedCategory={setSelectedCategory}
              onAddItem={addItem}
              onOpenCart={() => setScreen("cart")}
              isWideLayout={isWideLayout}
              t={t}
            />
          )}

          {screen === "cart" && (
            <CartScreen
              cart={cart}
              selectedTable={selectedTable}
              total={total}
              currency={currency}
              onBackToMenu={() => setScreen(selectedTable ? "menu" : "tables")}
              onPrint={printOrder}
              onUpdateNotes={updateNotes}
              onUpdateQuantity={updateQuantity}
              isWideLayout={isWideLayout}
              t={t}
            />
          )}

          {screen === "history" && (
              <HistoryScreen
                history={history}
                language={language}
                currency={currency}
                isWideLayout={isWideLayout}
                t={t}
              />
          )}

          {screen === "admin" && (
            <AdminScreen
              adminPin={adminPin}
              categories={menuCategories}
              currency={currency}
              onSaveMenu={saveMenu}
              selectedCategory={selectedCategory}
              setSelectedCategory={setSelectedCategory}
              isWideLayout={isWideLayout}
            />
          )}

          {screen === "settings" && (
            <SettingsScreen
              adminPin={adminPin}
              currency={currency}
              language={language}
              onSaveAdminPin={saveAdminPin}
              onSelectCurrency={saveCurrency}
              onSelectLanguage={saveLanguage}
              isWideLayout={isWideLayout}
            />
          )}
        </Animated.View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function Header({
  cartCount,
  onGoAdmin,
  onGoCart,
  onGoHistory,
  onGoSettings,
  onGoTables,
  selectedTable,
  t
}) {
  return (
    <LinearGradient colors={["#BAE6FD", "#E0F2FE"]} style={styles.header}>
      <View style={styles.brandRow}>
        <View>
          <Text style={styles.appName}>ClubHouse</Text>
          <Text style={styles.appTagline}>relax, drink and eat!</Text>
          {selectedTable ? (
            <Text style={styles.headerMeta}>
              {t.table} {selectedTable}
            </Text>
          ) : null}
        </View>
      </View>
      <View style={styles.headerControlStack}>
        <ScalePressable
          accessibilityLabel={t.language}
          style={styles.languageButton}
          onPress={onGoSettings}
        >
          <GlobeIcon />
        </ScalePressable>
        <View style={styles.headerActions}>
          <ScalePressable style={styles.iconButton} onPress={onGoTables}>
            <Text style={styles.iconButtonText}>T</Text>
          </ScalePressable>
          <ScalePressable style={styles.iconButton} onPress={onGoHistory}>
            <Text style={styles.iconButtonText}>H</Text>
          </ScalePressable>
          <ScalePressable style={styles.iconButton} onPress={onGoAdmin}>
            <Text style={styles.iconButtonText}>A</Text>
          </ScalePressable>
          <ScalePressable style={styles.cartButton} onPress={onGoCart}>
            <Image source={require("./assets/cart-icon.png")} style={styles.cartIcon} />
            {cartCount > 0 ? (
              <View style={styles.cartBadge}>
                <Text style={styles.cartBadgeText}>{cartCount}</Text>
              </View>
            ) : null}
          </ScalePressable>
        </View>
      </View>
    </LinearGradient>
  );
}

function GlobeIcon() {
  return <Image source={require("./assets/language-globe.png")} style={styles.globeIcon} />;
}

function ScalePressable({ children, style, onPress, disabled, accessibilityLabel }) {
  const scale = useRef(new Animated.Value(1)).current;

  const animateTo = (value) => {
    Animated.spring(scale, {
      toValue: value,
      useNativeDriver: true,
      speed: 36,
      bounciness: 4
    }).start();
  };

  return (
    <Pressable
      accessibilityLabel={accessibilityLabel}
      disabled={disabled}
      onPress={onPress}
      onPressIn={() => animateTo(0.96)}
      onPressOut={() => animateTo(1)}
    >
      <Animated.View style={[style, { transform: [{ scale }] }]}>{children}</Animated.View>
    </Pressable>
  );
}

function LogoMark() {
  return (
    <LinearGradient colors={[palette.primary, "#7C3AED"]} style={styles.logoMark}>
      <Text style={styles.logoMarkText}>CH</Text>
    </LinearGradient>
  );
}

function TableSelection({
  isWideLayout,
  selectedTable,
  statusMode,
  tableStatuses,
  tableItemCounts,
  onApplyTableStatus,
  onSelect,
  onSelectStatusMode,
  t
}) {
  return (
    <ScrollView contentContainerStyle={[styles.content, isWideLayout && styles.contentWide]}>
      <LinearGradient colors={["#EFF6FF", "#FFF7ED"]} style={styles.heroPanel}>
        <Text style={styles.tableOnlyTitle}>{t.tableSelection}</Text>
      </LinearGradient>
      <View style={styles.statusLegend}>
        {Object.entries(tableStatusStyles).map(([status, meta]) => (
          <ScalePressable
            key={status}
            style={[
              styles.statusLegendItem,
              statusMode === status && {
                backgroundColor: meta.soft,
                borderColor: meta.color
              }
            ]}
            onPress={() => onSelectStatusMode(status)}
          >
            <View style={[styles.statusDot, { backgroundColor: meta.color }]} />
            <Text
              style={[
                styles.statusLegendText,
                statusMode === status && { color: meta.color }
              ]}
            >
              {meta.label}
            </Text>
          </ScalePressable>
        ))}
        <ScalePressable
          style={[
            styles.statusLegendItem,
            !statusMode && {
              backgroundColor: "#EFF6FF",
              borderColor: palette.primary
            }
          ]}
          onPress={() => onSelectStatusMode(null)}
        >
          <View style={[styles.statusDot, { backgroundColor: palette.primary }]} />
          <Text
            style={[
              styles.statusLegendText,
              !statusMode && { color: palette.primary }
            ]}
          >
            {t.order}
          </Text>
        </ScalePressable>
      </View>
      <View style={styles.tableGrid}>
        {tables.map((table) => {
          const tableItemCount = tableItemCounts[table] || 0;
          const status = tableItemCount > 0 ? "occupied" : tableStatuses[table] || "available";
          const statusMeta = tableStatusStyles[status];
          return (
          <ScalePressable
            key={table}
            style={[
              styles.tableTile,
              { backgroundColor: statusMeta.soft, borderColor: statusMeta.color },
              selectedTable === table && styles.tableTileActive
            ]}
            onPress={() => {
              if (statusMode) {
                onApplyTableStatus(table, statusMode);
                return;
              }

              onSelect(table);
            }}
          >
            <View style={styles.tableStarWrap}>
              <Image
                source={require("./assets/table-star.png")}
                style={[styles.tableStar, { tintColor: statusMeta.color }]}
              />
              <Text
                style={[
                  styles.tableNumber,
                  selectedTable === table && styles.tableNumberActive
                ]}
            >
                {table}
              </Text>
            </View>
            {tableItemCount > 0 ? (
              <View style={styles.tableOrderBadge}>
                <Text style={styles.tableOrderBadgeText}>{tableItemCount}</Text>
              </View>
            ) : null}
          </ScalePressable>
        );
        })}
      </View>
    </ScrollView>
  );
}

function MenuScreen({
  activeCategory,
  cart,
  categories,
  currency,
  isWideLayout,
  selectedCategory,
  setSelectedCategory,
  onAddItem,
  onOpenCart,
  t
}) {
  return (
    <ScrollView contentContainerStyle={[styles.content, isWideLayout && styles.contentWide]}>
      <LinearGradient colors={["#EEF2FF", "#FFF7ED"]} style={styles.heroPanel}>
      <View style={styles.rowBetween}>
        <View>
          <Text style={styles.eyebrow}>{t.menu}</Text>
          <Text style={styles.title}>{t.addItems}</Text>
        </View>
        <ScalePressable style={styles.secondaryButton} onPress={onOpenCart}>
          <Text style={styles.secondaryButtonText}>{t.review}</Text>
        </ScalePressable>
      </View>
      </LinearGradient>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoryTabs}
      >
        {categories.map((category) => {
          const categoryMeta = categoryVisuals[category.id];
          return (
          <ScalePressable
            key={category.id}
            style={[
              styles.categoryTab,
              { backgroundColor: categoryMeta.soft },
              selectedCategory === category.id && styles.categoryTabActive
            ]}
            onPress={() => setSelectedCategory(category.id)}
          >
            <Text
              style={[
                styles.categoryTabText,
                selectedCategory === category.id && styles.categoryTabTextActive
              ]}
            >
              {t.categories[category.id]}
            </Text>
          </ScalePressable>
        );
        })}
      </ScrollView>

      <View style={[styles.itemList, isWideLayout && styles.itemListWide]}>
        {activeCategory.items.map((item) => {
          const inCart = cart.find((cartItem) => cartItem.id === item.id);
          return (
            <View key={item.id} style={[styles.menuItem, isWideLayout && styles.menuItemWide]}>
              <View style={styles.menuItemText}>
                <Text style={styles.itemName}>{item.name}</Text>
                <Text style={styles.itemPrice}>{money(item.price, currency)}</Text>
              </View>
              <ScalePressable style={styles.addButton} onPress={() => onAddItem(item)}>
                <Text style={styles.addButtonText}>
                  {inCart ? `+ ${inCart.quantity}` : t.add}
                </Text>
              </ScalePressable>
            </View>
          );
        })}
      </View>
    </ScrollView>
  );
}

function AdminScreen({
  adminPin,
  categories,
  currency,
  isWideLayout,
  onSaveMenu,
  selectedCategory,
  setSelectedCategory
}) {
  const [pin, setPin] = useState("");
  const [pinError, setPinError] = useState("");
  const [unlocked, setUnlocked] = useState(false);
  const [adminCategory, setAdminCategory] = useState(selectedCategory || defaultCategories[0].id);
  const [draftCategories, setDraftCategories] = useState(categories);
  const [newItemName, setNewItemName] = useState("");
  const [newItemPrice, setNewItemPrice] = useState("");

  useEffect(() => {
    setDraftCategories(categories);
  }, [categories]);

  const activeAdminCategory =
    draftCategories.find((category) => category.id === adminCategory) || draftCategories[0];

  const unlockAdmin = () => {
    if (pin === adminPin) {
      setUnlocked(true);
      setPin("");
      setPinError("");
      return;
    }

    setPinError("Wrong password");
  };

  const saveDraft = async (nextCategories = draftCategories) => {
    await onSaveMenu(nextCategories);
    Alert.alert("Saved", "Menu changes are now available for waiters.");
  };

  const updateItem = (itemId, field, value) => {
    setDraftCategories((current) =>
      current.map((category) =>
        category.id === adminCategory
          ? {
              ...category,
              items: category.items.map((item) =>
                item.id === itemId
                  ? {
                      ...item,
                      [field]: field === "price" ? Number(value) || 0 : value
                    }
                  : item
              )
            }
          : category
      )
    );
  };

  const deleteItem = async (itemId) => {
    const nextCategories = draftCategories.map((category) =>
      category.id === adminCategory
        ? { ...category, items: category.items.filter((item) => item.id !== itemId) }
        : category
    );
    setDraftCategories(nextCategories);
    await onSaveMenu(nextCategories);
  };

  const addAdminItem = async () => {
    const cleanName = newItemName.trim();
    const price = Number(newItemPrice);

    if (!cleanName || !Number.isFinite(price) || price <= 0) {
      Alert.alert("Missing item", "Enter an item name and a valid price.");
      return;
    }

    const nextItem = {
      id: `${adminCategory}-${Date.now()}`,
      name: cleanName,
      price
    };

    const nextCategories = draftCategories.map((category) =>
      category.id === adminCategory
        ? { ...category, items: [...category.items, nextItem] }
        : category
    );

    setNewItemName("");
    setNewItemPrice("");
    setDraftCategories(nextCategories);
    setSelectedCategory(adminCategory);
    await onSaveMenu(nextCategories);
  };

  if (!unlocked) {
    return (
      <ScrollView contentContainerStyle={[styles.content, isWideLayout && styles.contentWide]}>
        <LinearGradient colors={["#EFF6FF", "#FFF7ED"]} style={styles.heroPanel}>
          <Text style={styles.eyebrow}>Admin</Text>
          <Text style={styles.title}>Menu manager</Text>
          <Text style={styles.subtitle}>Enter PIN to add items and change prices.</Text>
        </LinearGradient>
        <View style={styles.adminCard}>
          <TextInput
            style={styles.adminInput}
            placeholder="Admin PIN"
            placeholderTextColor="#94A3B8"
            secureTextEntry
            keyboardType="number-pad"
            value={pin}
            onChangeText={(value) => {
              setPin(value);
              setPinError("");
            }}
          />
          {pinError ? <Text style={styles.pinErrorText}>{pinError}</Text> : null}
          <ScalePressable style={styles.printButton} onPress={unlockAdmin}>
            <Text style={styles.printButtonText}>Unlock Admin</Text>
          </ScalePressable>
        </View>
      </ScrollView>
    );
  }

  return (
    <ScrollView contentContainerStyle={[styles.content, isWideLayout && styles.contentWide]}>
      <LinearGradient colors={["#EFF6FF", "#FFF7ED"]} style={styles.heroPanel}>
        <Text style={styles.eyebrow}>Admin</Text>
        <Text style={styles.title}>Menu manager</Text>
        <Text style={styles.subtitle}>Add dishes, update prices, and remove old items.</Text>
      </LinearGradient>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryTabs}>
        {draftCategories.map((category) => {
          const categoryMeta = categoryVisuals[category.id] || categoryVisuals.mains;
          return (
            <ScalePressable
              key={category.id}
              style={[
                styles.categoryTab,
                { backgroundColor: categoryMeta.soft },
                adminCategory === category.id && styles.categoryTabActive
              ]}
              onPress={() => setAdminCategory(category.id)}
            >
              <Text
                style={[
                  styles.categoryTabText,
                  adminCategory === category.id && styles.categoryTabTextActive
                ]}
              >
                {category.name}
              </Text>
            </ScalePressable>
          );
        })}
      </ScrollView>

      <View style={styles.adminCard}>
        <Text style={styles.adminSectionTitle}>Add item</Text>
        <TextInput
          style={styles.adminInput}
          placeholder="Item name"
          placeholderTextColor="#94A3B8"
          value={newItemName}
          onChangeText={setNewItemName}
        />
        <TextInput
          style={styles.adminInput}
          placeholder="Price"
          placeholderTextColor="#94A3B8"
          keyboardType="decimal-pad"
          value={newItemPrice}
          onChangeText={setNewItemPrice}
        />
        <ScalePressable style={styles.addButtonWide} onPress={addAdminItem}>
          <Text style={styles.addButtonText}>Add Item</Text>
        </ScalePressable>
      </View>

      <View style={[styles.adminList, isWideLayout && styles.adminListWide]}>
        {activeAdminCategory.items.map((item) => (
          <View key={item.id} style={[styles.adminItemCard, isWideLayout && styles.adminItemCardWide]}>
            <TextInput
              style={styles.adminInput}
              value={item.name}
              onChangeText={(value) => updateItem(item.id, "name", value)}
            />
            <TextInput
              style={styles.adminInput}
              keyboardType="decimal-pad"
              value={`${item.price}`}
              onChangeText={(value) => updateItem(item.id, "price", value)}
            />
            <View style={styles.adminItemActions}>
              <ScalePressable style={styles.saveSmallButton} onPress={() => saveDraft()}>
                <Text style={styles.saveSmallButtonText}>Save</Text>
              </ScalePressable>
              <ScalePressable style={styles.deleteSmallButton} onPress={() => deleteItem(item.id)}>
                <Text style={styles.deleteSmallButtonText}>Delete</Text>
              </ScalePressable>
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

function SettingsScreen({
  adminPin,
  currency,
  isWideLayout,
  language,
  onSaveAdminPin,
  onSelectCurrency,
  onSelectLanguage
}) {
  const [pinDraft, setPinDraft] = useState(adminPin);

  useEffect(() => {
    setPinDraft(adminPin);
  }, [adminPin]);

  const saveDailyPin = async () => {
    const cleanPin = pinDraft.trim();

    if (cleanPin.length < 4) {
      Alert.alert("PIN too short", "Use at least 4 digits for the daily admin password.");
      return;
    }

    await onSaveAdminPin(cleanPin);
    Alert.alert("Saved", "Daily admin password updated.");
  };

  return (
    <ScrollView contentContainerStyle={[styles.content, isWideLayout && styles.contentWide]}>
      <LinearGradient colors={["#EFF6FF", "#FFF7ED"]} style={styles.heroPanel}>
        <Text style={styles.eyebrow}>Settings</Text>
        <Text style={styles.title}>Restaurant setup</Text>
        <Text style={styles.subtitle}>Choose language, currency, and daily admin access.</Text>
      </LinearGradient>

      <View style={styles.settingsCard}>
        <Text style={styles.adminSectionTitle}>Language</Text>
        <View style={styles.settingsGrid}>
          {LANGUAGES.map((option) => (
            <ScalePressable
              key={option.code}
              style={[
                styles.settingsChip,
                language === option.code && styles.settingsChipActive
              ]}
              onPress={() => onSelectLanguage(option.code)}
            >
              <Text
                style={[
                  styles.settingsChipText,
                  language === option.code && styles.settingsChipTextActive
                ]}
              >
                {option.code}
              </Text>
            </ScalePressable>
          ))}
        </View>
      </View>

      <View style={styles.settingsCard}>
        <Text style={styles.adminSectionTitle}>Currency</Text>
        <View style={styles.settingsGrid}>
          {CURRENCIES.map((option) => (
            <ScalePressable
              key={option}
              style={[
                styles.settingsChip,
                currency === option && styles.settingsChipActive
              ]}
              onPress={() => onSelectCurrency(option)}
            >
              <Text
                style={[
                  styles.settingsChipText,
                  currency === option && styles.settingsChipTextActive
                ]}
              >
                {option}
              </Text>
            </ScalePressable>
          ))}
        </View>
      </View>

      <View style={styles.settingsCard}>
        <Text style={styles.adminSectionTitle}>A Administer</Text>
        <Text style={styles.emptyText}>Set the daily password used to unlock Admin.</Text>
        <TextInput
          style={styles.adminInput}
          placeholder="Daily admin password"
          placeholderTextColor="#94A3B8"
          secureTextEntry
          value={pinDraft}
          onChangeText={setPinDraft}
        />
        <ScalePressable style={styles.saveSmallButtonFull} onPress={saveDailyPin}>
          <Text style={styles.saveSmallButtonText}>Save Daily Password</Text>
        </ScalePressable>
      </View>
    </ScrollView>
  );
}

function CartScreen({
  cart,
  currency,
  isWideLayout,
  selectedTable,
  total,
  onBackToMenu,
  onPrint,
  onUpdateNotes,
  onUpdateQuantity,
  t
}) {
  return (
    <ScrollView contentContainerStyle={[styles.content, isWideLayout && styles.contentWide]}>
      <LinearGradient colors={["#ECFDF5", "#EFF6FF"]} style={styles.heroPanel}>
      <View style={styles.rowBetween}>
        <View>
          <Text style={styles.eyebrow}>{t.orderCart}</Text>
          <Text style={styles.title}>
            {selectedTable ? `${t.table} ${selectedTable}` : t.noTable}
          </Text>
        </View>
        <ScalePressable style={styles.secondaryButton} onPress={onBackToMenu}>
          <Text style={styles.secondaryButtonText}>{t.menu}</Text>
        </ScalePressable>
      </View>
      </LinearGradient>

      {cart.length === 0 ? (
        <View style={styles.emptyState}>
          <View style={styles.emptyIllustration}>
            <Text style={styles.emptyIllustrationText}>+</Text>
          </View>
          <Text style={styles.emptyTitle}>{t.cartEmpty}</Text>
          <Text style={styles.emptyText}>{t.cartEmptyMessage}</Text>
        </View>
      ) : (
        <View style={[styles.cartList, isWideLayout && styles.cartListWide]}>
          {cart.map((item) => (
            <View key={item.id} style={[styles.cartItem, isWideLayout && styles.cartItemWide]}>
              <View style={styles.rowBetween}>
                <View style={styles.cartItemText}>
                  <Text style={styles.itemName}>{item.name}</Text>
                  <Text style={styles.itemPrice}>
                    {money(item.price * item.quantity, currency)}
                  </Text>
                </View>
                <View style={styles.stepper}>
                  <ScalePressable
                    style={styles.stepperButton}
                    onPress={() => onUpdateQuantity(item.id, -1)}
                  >
                    <Text style={styles.stepperText}>-</Text>
                  </ScalePressable>
                  <Text style={styles.quantityText}>{item.quantity}</Text>
                  <ScalePressable
                    style={styles.stepperButton}
                    onPress={() => onUpdateQuantity(item.id, 1)}
                  >
                    <Text style={styles.stepperText}>+</Text>
                  </ScalePressable>
                </View>
              </View>
              <TextInput
                style={styles.noteInput}
                placeholder={t.notesPlaceholder}
                placeholderTextColor="#8f968f"
                value={item.notes}
                onChangeText={(text) => onUpdateNotes(item.id, text)}
              />
            </View>
          ))}
        </View>
      )}

      <LinearGradient colors={["#1E40AF", palette.primary]} style={styles.totalPanel}>
        <Text style={styles.totalLabel}>{t.total}</Text>
        <Text style={styles.totalValue}>{money(total, currency)}</Text>
      </LinearGradient>

      <ScalePressable
        style={[styles.printButton, cart.length === 0 && styles.disabledButton]}
        onPress={onPrint}
      >
        <Text style={styles.printButtonText}>{t.printOrder}</Text>
      </ScalePressable>
    </ScrollView>
  );
}

function HistoryScreen({ history, language, currency, isWideLayout, t }) {
  return (
    <ScrollView contentContainerStyle={[styles.content, isWideLayout && styles.contentWide]}>
      <LinearGradient colors={["#F5F3FF", "#EFF6FF"]} style={styles.heroPanel}>
        <Text style={styles.eyebrow}>{t.orderHistory}</Text>
        <Text style={styles.title}>{t.printedOrders}</Text>
      </LinearGradient>
      {history.length === 0 ? (
        <View style={styles.emptyState}>
          <View style={styles.emptyIllustration}>
            <Text style={styles.emptyIllustrationText}>#</Text>
          </View>
          <Text style={styles.emptyTitle}>{t.noPrintedOrders}</Text>
          <Text style={styles.emptyText}>{t.ordersAfterPrint}</Text>
        </View>
      ) : (
        <View style={[styles.historyList, isWideLayout && styles.historyListWide]}>
          {history.map((order) => (
            <View key={order.id} style={[styles.historyItem, isWideLayout && styles.historyItemWide]}>
              <View style={styles.rowBetween}>
                <View>
                  <Text style={styles.historyTitle}>
                    #{order.orderNumber} - {t.table} {order.tableNumber}
                  </Text>
                  <Text style={styles.itemPrice}>
                    {formatDateTime(new Date(order.createdAt), language)}
                  </Text>
                </View>
                <Text style={styles.historyTotal}>{money(order.total, currency)}</Text>
              </View>
              <Text style={styles.historyItems}>
                {order.items.map((item) => `${item.quantity}x ${item.name}`).join(", ")}
              </Text>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    alignItems: Platform.OS === "web" ? "center" : "stretch",
    flex: 1,
    backgroundColor: palette.background
  },
  app: {
    flex: 1,
    backgroundColor: palette.background,
    maxWidth: Platform.OS === "web" ? 430 : undefined,
    width: "100%"
  },
  appWide: {
    maxWidth: Platform.OS === "web" ? 1180 : undefined
  },
  screenShell: {
    flex: 1
  },
  header: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    minHeight: 108,
    paddingHorizontal: 18,
    paddingVertical: 16,
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 18,
    elevation: 8,
    zIndex: 50
  },
  brandRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 12,
    flex: 1
  },
  logoMark: {
    alignItems: "center",
    borderColor: "rgba(255,255,255,0.45)",
    borderRadius: 16,
    borderWidth: 1,
    height: 46,
    justifyContent: "center",
    width: 46
  },
  logoMarkText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "900",
    letterSpacing: 0
  },
  appName: {
    color: palette.ink,
    fontSize: 24,
    fontWeight: "900",
    letterSpacing: 0
  },
  appTagline: {
    color: "#1E3A8A",
    fontSize: 13,
    fontStyle: "italic",
    marginTop: 1
  },
  headerMeta: {
    color: "#1D4ED8",
    fontSize: 13,
    fontWeight: "800",
    marginTop: 4
  },
  headerControlStack: {
    alignItems: "flex-end",
    gap: 8,
    position: "relative",
    zIndex: 20
  },
  languageButton: {
    alignItems: "center",
    backgroundColor: "transparent",
    borderRadius: 20,
    height: 40,
    justifyContent: "center",
    width: 40
  },
  globeIcon: {
    height: 28,
    resizeMode: "contain",
    width: 28
  },
  headerActions: {
    alignItems: "center",
    flexDirection: "row",
    gap: 8
  },
  iconButton: {
    alignItems: "center",
    backgroundColor: "transparent",
    borderRadius: 20,
    height: 40,
    justifyContent: "center",
    width: 40
  },
  iconButtonText: {
    color: palette.primary,
    fontSize: 14,
    fontWeight: "900"
  },
  cartButton: {
    alignItems: "center",
    backgroundColor: "transparent",
    borderRadius: 20,
    height: 40,
    justifyContent: "center",
    position: "relative",
    width: 40
  },
  cartIcon: {
    height: 28,
    resizeMode: "contain",
    width: 28
  },
  cartBadge: {
    alignItems: "center",
    backgroundColor: palette.secondary,
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    justifyContent: "center",
    position: "absolute",
    right: 0,
    top: 1
  },
  cartBadgeText: {
    color: "#ffffff",
    fontSize: 10,
    fontWeight: "900",
    lineHeight: 12,
    paddingHorizontal: 3
  },
  content: {
    alignSelf: "center",
    padding: 18,
    paddingBottom: 40,
    width: "100%"
  },
  contentWide: {
    maxWidth: 1080,
    paddingHorizontal: 28
  },
  heroPanel: {
    borderRadius: 16,
    marginBottom: 16,
    padding: 18,
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 14,
    elevation: 3
  },
  eyebrow: {
    color: palette.primary,
    fontSize: 12,
    fontWeight: "900",
    letterSpacing: 0,
    marginBottom: 6,
    textTransform: "uppercase"
  },
  title: {
    color: palette.ink,
    fontSize: 26,
    fontWeight: "900",
    letterSpacing: 0
  },
  tableOnlyTitle: {
    color: palette.primary,
    fontSize: 16,
    fontWeight: "900",
    letterSpacing: 0,
    textAlign: "center",
    textTransform: "uppercase"
  },
  subtitle: {
    color: palette.muted,
    fontSize: 15,
    lineHeight: 22,
    marginTop: 8
  },
  tableGrid: {
    alignItems: "center",
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    columnGap: 10,
    rowGap: 10,
    marginTop: 16
  },
  tableTile: {
    alignItems: "center",
    height: 64,
    borderRadius: 32,
    borderWidth: 2,
    justifyContent: "center",
    overflow: "hidden",
    padding: 0,
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
    width: 64
  },
  tableTileActive: {
    backgroundColor: palette.primary,
    borderColor: palette.primary
  },
  tableStarWrap: {
    alignItems: "center",
    height: 54,
    justifyContent: "center",
    position: "relative",
    width: 54
  },
  tableStar: {
    height: 50,
    position: "absolute",
    resizeMode: "contain",
    width: 50
  },
  tableNumber: {
    color: "#111111",
    fontSize: 17,
    fontWeight: "900",
    height: 54,
    lineHeight: 54,
    position: "absolute",
    textAlign: "center",
    textAlignVertical: "center",
    width: 54
  },
  tableNumberActive: {
    color: "#111111"
  },
  tableOrderBadge: {
    alignItems: "center",
    backgroundColor: palette.primary,
    borderColor: "#FFFFFF",
    borderRadius: 10,
    borderWidth: 2,
    height: 22,
    justifyContent: "center",
    minWidth: 22,
    position: "absolute",
    right: -1,
    top: -1
  },
  tableOrderBadgeText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "900",
    paddingHorizontal: 4
  },
  statusLegend: {
    alignItems: "center",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    justifyContent: "center"
  },
  statusLegendItem: {
    alignItems: "center",
    backgroundColor: palette.card,
    borderColor: palette.line,
    borderRadius: 999,
    borderWidth: 1,
    flexDirection: "row",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 7
  },
  statusDot: {
    borderRadius: 4,
    height: 8,
    width: 8
  },
  statusLegendText: {
    color: palette.muted,
    fontSize: 11,
    fontWeight: "800"
  },
  rowBetween: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 14
  },
  secondaryButton: {
    alignItems: "center",
    backgroundColor: palette.card,
    borderRadius: 14,
    minHeight: 48,
    justifyContent: "center",
    paddingHorizontal: 18,
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 2
  },
  secondaryButtonText: {
    color: palette.primary,
    fontSize: 15,
    fontWeight: "900"
  },
  categoryTabs: {
    gap: 6,
    paddingBottom: 18,
    paddingTop: 2
  },
  categoryTab: {
    alignItems: "center",
    borderColor: "transparent",
    borderRadius: 999,
    borderWidth: 1,
    flexDirection: "row",
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 10
  },
  categoryTabActive: {
    backgroundColor: palette.primary,
    borderColor: palette.primary
  },
  categoryTabText: {
    color: palette.ink,
    fontSize: 12,
    fontWeight: "900"
  },
  categoryTabTextActive: {
    color: "#ffffff"
  },
  itemList: {
    gap: 12
  },
  itemListWide: {
    flexDirection: "row",
    flexWrap: "wrap"
  },
  menuItem: {
    alignItems: "center",
    backgroundColor: palette.card,
    borderColor: palette.line,
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 14,
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 14,
    elevation: 3
  },
  menuItemWide: {
    width: "48.5%"
  },
  menuItemText: {
    flex: 1,
    paddingRight: 12
  },
  itemName: {
    color: palette.ink,
    fontSize: 16,
    fontWeight: "900"
  },
  itemPrice: {
    color: palette.muted,
    fontSize: 13,
    marginTop: 4
  },
  addButton: {
    alignItems: "center",
    backgroundColor: palette.secondary,
    borderRadius: 14,
    minHeight: 46,
    justifyContent: "center",
    minWidth: 76,
    paddingHorizontal: 14,
    shadowColor: palette.secondary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 4
  },
  addButtonText: {
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "900"
  },
  addButtonWide: {
    alignItems: "center",
    backgroundColor: palette.secondary,
    borderRadius: 14,
    minHeight: 50,
    justifyContent: "center",
    marginTop: 4,
    paddingHorizontal: 16
  },
  adminCard: {
    backgroundColor: palette.card,
    borderColor: palette.line,
    borderRadius: 16,
    borderWidth: 1,
    gap: 12,
    padding: 16,
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 14,
    elevation: 3
  },
  settingsCard: {
    backgroundColor: palette.card,
    borderColor: palette.line,
    borderRadius: 16,
    borderWidth: 1,
    gap: 12,
    marginBottom: 14,
    padding: 16,
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 14,
    elevation: 3
  },
  settingsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10
  },
  settingsChip: {
    alignItems: "center",
    backgroundColor: palette.background,
    borderColor: palette.line,
    borderRadius: 14,
    borderWidth: 1,
    minHeight: 46,
    justifyContent: "center",
    minWidth: 72,
    paddingHorizontal: 14
  },
  settingsChipActive: {
    backgroundColor: "#EFF6FF",
    borderColor: palette.primary
  },
  settingsChipText: {
    color: palette.ink,
    fontSize: 14,
    fontWeight: "900"
  },
  settingsChipTextActive: {
    color: palette.primary
  },
  adminSectionTitle: {
    color: palette.ink,
    fontSize: 17,
    fontWeight: "900"
  },
  adminInput: {
    backgroundColor: palette.background,
    borderColor: palette.line,
    borderRadius: 14,
    borderWidth: 1,
    color: palette.ink,
    fontSize: 16,
    minHeight: 48,
    paddingHorizontal: 12
  },
  pinErrorText: {
    color: palette.danger,
    fontSize: 14,
    fontWeight: "900",
    marginTop: -4
  },
  adminList: {
    gap: 12,
    marginTop: 14
  },
  adminListWide: {
    flexDirection: "row",
    flexWrap: "wrap"
  },
  adminItemCard: {
    backgroundColor: palette.card,
    borderColor: palette.line,
    borderRadius: 16,
    borderWidth: 1,
    gap: 10,
    padding: 14,
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 14,
    elevation: 3
  },
  adminItemCardWide: {
    width: "48.5%"
  },
  adminItemActions: {
    flexDirection: "row",
    gap: 10,
    justifyContent: "center"
  },
  saveSmallButton: {
    alignItems: "center",
    backgroundColor: palette.success,
    borderRadius: 12,
    minHeight: 42,
    justifyContent: "center",
    width: 92
  },
  saveSmallButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "900"
  },
  saveSmallButtonFull: {
    alignItems: "center",
    backgroundColor: palette.success,
    borderRadius: 12,
    minHeight: 48,
    justifyContent: "center"
  },
  deleteSmallButton: {
    alignItems: "center",
    backgroundColor: "#FEF2F2",
    borderColor: palette.danger,
    borderRadius: 12,
    borderWidth: 1,
    minHeight: 42,
    justifyContent: "center",
    width: 92
  },
  deleteSmallButtonText: {
    color: palette.danger,
    fontSize: 14,
    fontWeight: "900"
  },
  emptyState: {
    alignItems: "center",
    backgroundColor: palette.card,
    borderColor: palette.line,
    borderRadius: 16,
    borderWidth: 1,
    marginTop: 22,
    padding: 26,
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 3
  },
  emptyIllustration: {
    alignItems: "center",
    backgroundColor: "#EFF6FF",
    borderRadius: 22,
    height: 58,
    justifyContent: "center",
    marginBottom: 12,
    width: 58
  },
  emptyIllustrationText: {
    color: palette.primary,
    fontSize: 28,
    fontWeight: "900"
  },
  emptyTitle: {
    color: palette.ink,
    fontSize: 18,
    fontWeight: "900"
  },
  emptyText: {
    color: palette.muted,
    fontSize: 14,
    lineHeight: 21,
    marginTop: 8,
    textAlign: "center"
  },
  cartList: {
    gap: 12,
    marginTop: 18
  },
  cartListWide: {
    flexDirection: "row",
    flexWrap: "wrap"
  },
  cartItem: {
    backgroundColor: palette.card,
    borderColor: palette.line,
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 14,
    elevation: 3
  },
  cartItemWide: {
    width: "48.5%"
  },
  cartItemText: {
    flex: 1,
    paddingRight: 12
  },
  stepper: {
    alignItems: "center",
    flexDirection: "row",
    gap: 10
  },
  stepperButton: {
    alignItems: "center",
    backgroundColor: "#EFF6FF",
    borderRadius: 14,
    height: 40,
    justifyContent: "center",
    width: 40
  },
  stepperText: {
    color: palette.primary,
    fontSize: 20,
    fontWeight: "900"
  },
  quantityText: {
    color: palette.ink,
    fontSize: 18,
    fontWeight: "900",
    minWidth: 24,
    textAlign: "center"
  },
  noteInput: {
    backgroundColor: palette.background,
    borderColor: palette.line,
    borderRadius: 14,
    borderWidth: 1,
    color: palette.ink,
    fontSize: 16,
    marginTop: 12,
    minHeight: 46,
    paddingHorizontal: 12
  },
  totalPanel: {
    alignItems: "center",
    borderRadius: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 18,
    padding: 18,
    shadowColor: palette.primary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.18,
    shadowRadius: 16,
    elevation: 4
  },
  totalLabel: {
    color: "rgba(255,255,255,0.78)",
    fontSize: 15,
    fontWeight: "800"
  },
  totalValue: {
    color: "#FFFFFF",
    fontSize: 24,
    fontWeight: "900"
  },
  printButton: {
    alignItems: "center",
    backgroundColor: palette.success,
    borderRadius: 16,
    minHeight: 58,
    justifyContent: "center",
    marginTop: 12,
    shadowColor: palette.success,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.24,
    shadowRadius: 16,
    elevation: 5
  },
  disabledButton: {
    opacity: 0.45
  },
  printButtonText: {
    color: "#ffffff",
    fontSize: 17,
    fontWeight: "900"
  },
  historyList: {
    gap: 12,
    marginTop: 18
  },
  historyListWide: {
    flexDirection: "row",
    flexWrap: "wrap"
  },
  historyItem: {
    backgroundColor: palette.card,
    borderColor: palette.line,
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 14,
    elevation: 3
  },
  historyItemWide: {
    width: "48.5%"
  },
  historyTitle: {
    color: palette.ink,
    fontSize: 16,
    fontWeight: "900"
  },
  historyTotal: {
    color: palette.success,
    fontSize: 16,
    fontWeight: "900"
  },
  historyItems: {
    color: palette.muted,
    fontSize: 14,
    lineHeight: 21,
    marginTop: 10
  }
});
