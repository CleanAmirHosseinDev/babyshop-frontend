import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { PageLoader, RequireAdmin, RequireAuth, RequireManager, ScrollToTop } from './shared/components/RouteGuards';

// صفحات به‌صورت تنبل (lazy) بارگذاری می‌شوند تا حجم باندل اولیه کم بماند
const HomePage = lazy(() => import('./features/home/pages/HomePage'));
const ProductDetailsPage = lazy(() => import('./features/product/pages/ProductDetailsPage'));
const CartPage = lazy(() => import('./features/cart/pages/CartPage'));
const CheckoutPage = lazy(() => import('./features/order/cart/pages/CheckoutPage'));
const PaymentResultPage = lazy(() => import('./features/cart/pages/PaymentResultPage'));
const BankGateway = lazy(() => import('./features/order/cart/pages/BankGateway'));

const LoginPage = lazy(() => import('./features/auth/pages/LoginPage'));
const RegisterPage = lazy(() => import('./features/auth/pages/RegisterPage'));
const VerifyPhonePage = lazy(() => import('./features/auth/pages/VerifyPhonePage'));
const ForgotPasswordPage = lazy(() => import('./features/auth/pages/ForgotPasswordPage'));
const ResetPasswordPage = lazy(() => import('./features/auth/pages/ResetPasswordPage'));

const DashboardPage = lazy(() => import('./features/dashboard/pages/DashboardPage'));
const OrderDetailsPage = lazy(() => import('./features/dashboard/pages/OrderDetailsPage'));
const TicketCreatePage = lazy(() => import('./features/dashboard/pages/TicketCreatePage'));
const TicketDetailsPage = lazy(() => import('./features/dashboard/pages/TicketDetailsPage'));

const AdminTicketsPage = lazy(() => import('./features/dashboard/pages/AdminTicketsPage'));
const AdminOrdersPage = lazy(() => import('./features/dashboard/pages/AdminOrdersPage'));
const InventoryListPage = lazy(() => import('./features/dashboard/pages/InventoryListPage'));
const CategoryListPage = lazy(() => import('./features/admin/pages/CategoryListPage'));

const ProductListPage = lazy(() => import('./features/product/pages/ProductListPage'));
const ProductCreatePage = lazy(() => import('./features/product/pages/ProductCreatePage'));
const ProductEditPage = lazy(() => import('./features/product/pages/ProductEditPage'));

function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* ویترین فروشگاه: برای همه (مهمان هم می‌تواند خرید را ببیند) */}
          <Route path="/" element={<HomePage />} />
          <Route path="/product/:id" element={<ProductDetailsPage />} />
          <Route path="/cart" element={<CartPage />} />

          {/* فرآیند خرید: نیازمند ورود */}
          <Route
            path="/checkout"
            element={
              <RequireAuth>
                <CheckoutPage />
              </RequireAuth>
            }
          />
          <Route
            path="/bank-gateway"
            element={
              <RequireAuth>
                <BankGateway />
              </RequireAuth>
            }
          />
          <Route
            path="/payment/callback"
            element={
              <RequireAuth>
                <PaymentResultPage />
              </RequireAuth>
            }
          />

          {/* داشبورد کاربر */}
          <Route
            path="/dashboard"
            element={
              <RequireAuth>
                <DashboardPage />
              </RequireAuth>
            }
          />
          <Route
            path="/dashboard/order/:id"
            element={
              <RequireAuth>
                <OrderDetailsPage />
              </RequireAuth>
            }
          />
          <Route
            path="/dashboard/tickets/create"
            element={
              <RequireAuth>
                <TicketCreatePage />
              </RequireAuth>
            }
          />
          <Route
            path="/dashboard/tickets/:id"
            element={
              <RequireAuth>
                <TicketDetailsPage />
              </RequireAuth>
            }
          />

          {/* پنل مدیریت فروشگاه (Admin/Manager) */}
          <Route
            path="/admin/tickets"
            element={
              <RequireManager>
                <AdminTicketsPage />
              </RequireManager>
            }
          />
          <Route
            path="/admin/orders"
            element={
              <RequireAdmin>
                <AdminOrdersPage />
              </RequireAdmin>
            }
          />
          <Route
            path="/admin/inventory"
            element={
              <RequireManager>
                <InventoryListPage />
              </RequireManager>
            }
          />
          <Route
            path="/admin/categories"
            element={
              <RequireManager>
                <CategoryListPage />
              </RequireManager>
            }
          />
          <Route
            path="/products"
            element={
              <RequireManager>
                <ProductListPage />
              </RequireManager>
            }
          />
          <Route
            path="/products/create"
            element={
              <RequireManager>
                <ProductCreatePage />
              </RequireManager>
            }
          />
          <Route
            path="/products/edit/:id"
            element={
              <RequireManager>
                <ProductEditPage />
              </RequireManager>
            }
          />

          {/* احراز هویت */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/verify-phone" element={<VerifyPhonePage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>

      <ToastContainer
        position="top-center"
        autoClose={3500}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
        limit={3}
      />
    </BrowserRouter>
  );
}

export default App;
