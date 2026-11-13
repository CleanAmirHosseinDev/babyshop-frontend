import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { CartProvider } from './shared/context/CartContext';
import { WishlistProvider } from './shared/context/WishlistContext';

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('ریشه‌ی اپلیکیشن (#root) در index.html پیدا نشد.');
}

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <CartProvider>
      <WishlistProvider>
        <App />
      </WishlistProvider>
    </CartProvider>
  </React.StrictMode>,
);
