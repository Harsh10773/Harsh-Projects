
import React from "react";
import { BottomNav } from "./BottomNav";
import { useLocation } from "react-router-dom";

interface AppLayoutProps {
  children: React.ReactNode;
  hideNav?: boolean;
}

export function AppLayout({ children, hideNav = false }: AppLayoutProps) {
  const location = useLocation();
  
  // Routes that should not have the bottom navigation
  const noNavRoutes = ['/', '/onboarding', '/style-quiz'];
  const shouldHideNav = hideNav || noNavRoutes.includes(location.pathname);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <main className={`flex-1 ${!shouldHideNav ? 'pb-20 lg:pb-4' : ''}`}>
        {children}
      </main>
      {!shouldHideNav && <BottomNav />}
    </div>
  );
}
