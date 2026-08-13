import { createContext, useContext, useEffect, useMemo, useState } from "react";

const CartContext = createContext(null);
const STORAGE_KEY = "farmchain_cart";

function readCart() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch {
    return [];
  }
}

export function CartProvider({ children }) {
  const [items, setItems] = useState(readCart);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const addItem = (product, quantity = product.minOrderQty || 1) => {
    setItems((current) => {
      const existing = current.find((item) => item.product._id === product._id);
      if (existing) {
        return current.map((item) =>
          item.product._id === product._id
            ? { ...item, quantity: Math.min(product.stock, item.quantity + Number(quantity)) }
            : item,
        );
      }
      return [...current, { product, quantity: Number(quantity) }];
    });
  };

  const setQuantity = (productId, quantity) => {
    setItems((current) =>
      current.map((item) => {
        if (item.product._id !== productId) return item;
        const minimum = item.product.minOrderQty || 1;
        return { ...item, quantity: Math.max(minimum, Math.min(item.product.stock, Number(quantity) || minimum)) };
      }),
    );
  };

  const removeItem = (productId) => setItems((current) => current.filter((item) => item.product._id !== productId));
  const clearCart = () => setItems([]);
  const count = items.reduce((sum, item) => sum + Number(item.quantity), 0);
  const subtotal = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const supplierCount = new Set(items.map((item) => item.product.supplier?._id || item.product.supplier)).size;
  const estimatedDelivery = items.reduce((fees, item) => {
    const supplierId = item.product.supplier?._id || item.product.supplier;
    fees[supplierId] = (fees[supplierId] || 0) + item.product.price * item.quantity;
    return fees;
  }, {});
  const deliveryFee = Object.values(estimatedDelivery).reduce((sum, amount) => sum + (amount >= 1000 ? 0 : 80), 0);

  const value = useMemo(
    () => ({ items, count, subtotal, supplierCount, deliveryFee, total: subtotal + deliveryFee, addItem, setQuantity, removeItem, clearCart }),
    [items, count, subtotal, supplierCount, deliveryFee],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export const useCart = () => useContext(CartContext);
