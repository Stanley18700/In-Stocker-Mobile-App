// ---------------------------------------------------------------------------
// Navigation param list types — single source of truth for all routes.
// Import these wherever you need typed navigation props.
// ---------------------------------------------------------------------------

// Root
export type RootStackParamList = {
    Auth: undefined;
    Main: undefined;
};

// Auth stack
export type AuthStackParamList = {
    Login: undefined;
    Register: undefined;
};

// Main bottom tabs
export type MainTabParamList = {
    Home: undefined;
    Inventory: undefined;
    Sales: undefined;
    Alerts: undefined;
    Settings: undefined;
};

// Inventory stack
export type InventoryStackParamList = {
    InventoryList: undefined;
    ProductDetail: { productId: string };
    AddProduct: { scannedSku?: string } | undefined;
    EditProduct: { productId: string };
    BarcodeScanner: { returnTo: 'AddProduct' };
    BufferStock: undefined;
};

// Sales stack
export type SalesStackParamList = {
    RecordSale: undefined;
    SalesHistory: undefined;
    Reports: undefined;
};

// Settings stack
export type SettingsStackParamList = {
    SettingsList: undefined;
    Profile: undefined;
    EditProfile: undefined;
    EditPreferences: undefined;
};
