import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { db } from '../lib/data';
import type { CartLine, InventoryItem, Supplier } from '../lib/types';

interface InventoryPosValue {
  items: InventoryItem[];
  lowStock: InventoryItem[];
  suppliers: Supplier[];
  cart: CartLine[];
  cartTotal: number;
  loading: boolean;
  loadInventory: () => Promise<void>;
  loadSuppliers: () => Promise<void>;
  stockIn: (itemId: number, quantity: number) => Promise<void>;
  stockOut: (itemId: number, quantity: number) => Promise<void>;
  addToCart: (item: InventoryItem, quantity?: number) => void;
  removeFromCart: (itemId: number) => void;
  clearCart: () => void;
  checkout: (cashierId: number) => Promise<{ pos_id: number; total_amount: number }>;
}

const InventoryPosContext = createContext<InventoryPosValue | null>(null);

export function InventoryPosProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [lowStock, setLowStock] = useState<InventoryItem[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [cart, setCart] = useState<CartLine[]>([]);
  const [loading, setLoading] = useState(false);

  const loadInventory = useCallback(async () => {
    setLoading(true);
    try {
      const [all, low] = await Promise.all([db.inventory.items(), db.inventory.lowStock()]);
      setItems(all);
      setLowStock(low);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadSuppliers = useCallback(async () => {
    setSuppliers(await db.suppliers.list());
  }, []);

  const replaceItem = useCallback((updated: InventoryItem) => {
    setItems((prev) => prev.map((i) => (i.item_id === updated.item_id ? updated : i)));
  }, []);

  const stockIn = useCallback(
    async (itemId: number, quantity: number) => {
      replaceItem(await db.inventory.stockIn(itemId, quantity));
    },
    [replaceItem],
  );

  const stockOut = useCallback(
    async (itemId: number, quantity: number) => {
      replaceItem(await db.inventory.stockOut(itemId, quantity));
    },
    [replaceItem],
  );

  const addToCart = useCallback((item: InventoryItem, quantity = 1) => {
    setCart((prev) => {
      const existing = prev.find((l) => l.item.item_id === item.item_id);
      if (existing) {
        return prev.map((l) =>
          l.item.item_id === item.item_id ? { ...l, quantity: l.quantity + quantity } : l,
        );
      }
      return [...prev, { item, quantity }];
    });
  }, []);

  const removeFromCart = useCallback((itemId: number) => {
    setCart((prev) => prev.filter((l) => l.item.item_id !== itemId));
  }, []);

  const clearCart = useCallback(() => setCart([]), []);

  const checkout = useCallback(
    async (cashierId: number) => {
      const result = await db.pos.checkout(
        cart.map((l) => ({ item_id: l.item.item_id, quantity: l.quantity })),
        cashierId,
      );
      setCart([]);
      await loadInventory();
      return result;
    },
    [cart, loadInventory],
  );

  const cartTotal = useMemo(
    () => cart.reduce((sum, l) => sum + (l.item.selling_price ?? 0) * l.quantity, 0),
    [cart],
  );

  const value = useMemo<InventoryPosValue>(
    () => ({
      items,
      lowStock,
      suppliers,
      cart,
      cartTotal,
      loading,
      loadInventory,
      loadSuppliers,
      stockIn,
      stockOut,
      addToCart,
      removeFromCart,
      clearCart,
      checkout,
    }),
    [items, lowStock, suppliers, cart, cartTotal, loading, loadInventory, loadSuppliers, stockIn, stockOut, addToCart, removeFromCart, clearCart, checkout],
  );

  return <InventoryPosContext.Provider value={value}>{children}</InventoryPosContext.Provider>;
}

export function useInventoryPos(): InventoryPosValue {
  const ctx = useContext(InventoryPosContext);
  if (!ctx) throw new Error('useInventoryPos must be used within <InventoryPosProvider>.');
  return ctx;
}
