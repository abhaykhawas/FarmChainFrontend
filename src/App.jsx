import { Navigate, Route, Routes } from "react-router-dom";
import { DashboardLayout, PublicLayout } from "./components/Layout";
import { GuestRoute, ProtectedRoute, RoleRoute } from "./components/RouteGuards";
import HomePage from "./pages/public/HomePage";
import MarketplacePage from "./pages/public/MarketplacePage";
import SuppliersPage from "./pages/public/SuppliersPage";
import SupplierDetailPage from "./pages/public/SupplierDetailPage";
import { LoginPage, RegisterPage } from "./pages/auth/AuthPages";
import DashboardPage from "./pages/app/DashboardPage";
import ProfilePage from "./pages/app/ProfilePage";
import { OrderDetailPage, OrdersPage } from "./pages/app/OrdersPages";
import { InvoicesPage, PaymentsPage } from "./pages/app/FinancePages";
import DisputesPage from "./pages/app/DisputesPage";
import ReportsPage from "./pages/app/ReportsPage";
import ChatPage from "./pages/app/ChatPage";
import CartPage from "./pages/buyer/CartPage";
import CheckoutPage from "./pages/buyer/CheckoutPage";
import { PaymentResultPage, ResumePaymentPage } from "./pages/buyer/PaymentPages";
import FavoritesPage from "./pages/buyer/FavoritesPage";
import { ProductFormPage, ProductsPage } from "./pages/supplier/ProductPages";
import CertificationPage from "./pages/supplier/CertificationPage";
import { ProductReviewsPage, SupplierReviewsPage } from "./pages/admin/AdminReviewPages";
import { Sprout } from "lucide-react";

export default function App() {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route index element={<HomePage />} />
        <Route path="marketplace" element={<MarketplacePage />} />
        <Route path="suppliers" element={<SuppliersPage />} />
        <Route path="suppliers/:id" element={<SupplierDetailPage />} />
      </Route>

      <Route element={<GuestRoute />}>
        <Route path="login" element={<LoginPage />} />
        <Route path="register" element={<RegisterPage />} />
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route element={<DashboardLayout />}>
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="profile" element={<ProfilePage />} />
          <Route path="disputes" element={<DisputesPage />} />
          <Route path="reports" element={<ReportsPage />} />

          <Route element={<RoleRoute roles={["buyer", "supplier"]} />}>
            <Route path="orders" element={<OrdersPage />} />
            <Route path="orders/:id" element={<OrderDetailPage />} />
            <Route path="invoices" element={<InvoicesPage />} />
            <Route path="payments" element={<PaymentsPage />} />
            <Route path="chat" element={<ChatPage />} />
          </Route>

          <Route element={<RoleRoute roles={["buyer"]} />}>
            <Route path="cart" element={<CartPage />} />
            <Route path="checkout" element={<CheckoutPage />} />
            <Route path="checkout/result" element={<PaymentResultPage />} />
            <Route path="checkout/payment/:id" element={<ResumePaymentPage />} />
            <Route path="favorites" element={<FavoritesPage />} />
          </Route>

          <Route element={<RoleRoute roles={["supplier"]} />}>
            <Route path="products" element={<ProductsPage />} />
            <Route path="products/new" element={<ProductFormPage />} />
            <Route path="products/:id/edit" element={<ProductFormPage />} />
            <Route path="certification" element={<CertificationPage />} />
          </Route>

          <Route element={<RoleRoute roles={["admin"]} />}>
            <Route path="admin/suppliers" element={<SupplierReviewsPage />} />
            <Route path="admin/products" element={<ProductReviewsPage />} />
          </Route>
        </Route>
      </Route>

      <Route path="404" element={<NotFound />} />
      <Route path="*" element={<Navigate to="/404" replace />} />
    </Routes>
  );
}

function NotFound() {
  return <main className="not-found"><span className="brand-mark"><Sprout /></span><span className="eyebrow">404 · Lost in the field</span><h1>This path hasn’t been planted.</h1><p>The page you’re looking for may have moved or never existed.</p><a className="button" href="/">Return home</a></main>;
}
