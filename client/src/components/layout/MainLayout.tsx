import React, { type ReactNode } from 'react';
import { Header } from './Header';
import { Footer } from './Footer';

interface MainLayoutProps {
  children: ReactNode;
  isAuthenticated?: boolean;
  userName?: string;
  onLogin?: () => void;
  onLogout?: () => void;
  showFooter?: boolean;
}

export const MainLayout: React.FC<MainLayoutProps> = ({
  children,
  isAuthenticated = false,
  userName,
  onLogin,
  onLogout,
  showFooter = true,
}) => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header
        isAuthenticated={isAuthenticated}
        userName={userName}
        onLogin={onLogin}
        onLogout={onLogout}
      />

      <main className="flex-1">
        {children}
      </main>

      {showFooter && <Footer />}
    </div>
  );
};
