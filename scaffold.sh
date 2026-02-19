#!/bin/bash

# ============================================================
# In-Stocker — Project Scaffold Script
# Expo + TypeScript | Feature-Based Architecture
# ============================================================

set -e

echo "🚀 Scaffolding In-Stocker project structure..."

# ── Core ─────────────────────────────────────────────────────
mkdir -p src/core/navigation
mkdir -p src/core/theme
mkdir -p src/core/constants

touch src/core/navigation/AppNavigator.tsx
touch src/core/navigation/AuthNavigator.tsx
touch src/core/navigation/MainNavigator.tsx
touch src/core/navigation/types.ts

touch src/core/theme/colors.ts
touch src/core/theme/spacing.ts
touch src/core/theme/typography.ts
touch src/core/theme/index.ts

touch src/core/constants/config.ts
touch src/core/constants/routes.ts

# ── Lib ──────────────────────────────────────────────────────
mkdir -p src/lib/supabase

touch src/lib/supabase/client.ts
touch src/lib/supabase/types.ts

# ── Services ─────────────────────────────────────────────────
mkdir -p src/services

touch src/services/authService.ts
touch src/services/inventoryService.ts
touch src/services/salesService.ts
touch src/services/alertsService.ts

# ── Store (Zustand) ──────────────────────────────────────────
mkdir -p src/store

touch src/store/authStore.ts
touch src/store/inventoryStore.ts
touch src/store/salesStore.ts
touch src/store/alertsStore.ts

# ── Models (TypeScript interfaces) ───────────────────────────
mkdir -p src/models

touch src/models/User.ts
touch src/models/Product.ts
touch src/models/Sale.ts
touch src/models/SaleItem.ts
touch src/models/CartItem.ts

# ── Features ─────────────────────────────────────────────────

# auth
mkdir -p src/features/auth/screens
mkdir -p src/features/auth/components
mkdir -p src/features/auth/hooks

touch src/features/auth/screens/LoginScreen.tsx
touch src/features/auth/screens/RegisterScreen.tsx
touch src/features/auth/components/AuthForm.tsx
touch src/features/auth/hooks/useAuth.ts

# home
mkdir -p src/features/home/screens
mkdir -p src/features/home/components

touch src/features/home/screens/HomeScreen.tsx
touch src/features/home/components/SummaryCard.tsx

# inventory
mkdir -p src/features/inventory/screens
mkdir -p src/features/inventory/components
mkdir -p src/features/inventory/hooks

touch src/features/inventory/screens/InventoryListScreen.tsx
touch src/features/inventory/screens/ProductDetailScreen.tsx
touch src/features/inventory/screens/AddProductScreen.tsx
touch src/features/inventory/components/ProductCard.tsx
touch src/features/inventory/components/StockBadge.tsx
touch src/features/inventory/hooks/useInventory.ts

# sales
mkdir -p src/features/sales/screens
mkdir -p src/features/sales/components
mkdir -p src/features/sales/hooks

touch src/features/sales/screens/RecordSaleScreen.tsx
touch src/features/sales/screens/SalesHistoryScreen.tsx
touch src/features/sales/components/CartItem.tsx
touch src/features/sales/components/SaleCard.tsx
touch src/features/sales/hooks/useSales.ts

# settings
mkdir -p src/features/settings/screens
mkdir -p src/features/settings/components

touch src/features/settings/screens/SettingsScreen.tsx
touch src/features/settings/screens/ProfileScreen.tsx
touch src/features/settings/components/SettingsRow.tsx

# ── Done ─────────────────────────────────────────────────────
echo ""
echo "✅ Scaffold complete! Structure:"
echo ""
find src -type f | sort
echo ""
echo "Next: fill in your .env with Supabase credentials and run:"
echo "  npx expo start"
