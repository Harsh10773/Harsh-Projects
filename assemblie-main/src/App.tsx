
import React, { useEffect } from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Index from "@/pages/Index";
import Tracking from "@/pages/Tracking";
import Vendor from "@/pages/Vendor";
import User from "@/pages/User";
import NotFound from "@/pages/NotFound";
import TermsConditions from "@/pages/TermsConditions";
import Auth from "@/pages/Auth";
import CustomerAuth from "@/pages/CustomerAuth";
import Customer from "@/pages/Customer";
import Admin from "@/pages/Admin";
import { AuthProvider } from "@/contexts/AuthContext";
import { Toaster } from "sonner";
import { initializeStorage } from "./utils/pdf/storageUtils";

function App() {
  useEffect(() => {
    // Initialize storage to ensure the invoices bucket exists
    initializeStorage();
  }, []);

  // Define routes outside of the rendering
  const router = createBrowserRouter([
    {
      path: "/",
      element: <Index />,
      errorElement: <NotFound />,
    },
    {
      path: "/tracking",
      element: <Tracking />,
    },
    {
      path: "/vendor",
      element: <Vendor />,
    },
    {
      path: "/user",
      element: <User />,
    },
    {
      path: "/terms-conditions",
      element: <TermsConditions />,
    },
    {
      path: "/auth",
      element: <Auth />,
    },
    {
      path: "/customer-auth",
      element: <CustomerAuth />,
    },
    {
      path: "/customer",
      element: <Customer />,
    },
    {
      path: "/admin",
      element: <Admin />,
    },
    {
      path: "*",
      element: <NotFound />,
    },
  ]);

  return (
    <React.StrictMode>
      <AuthProvider>
        <RouterProvider router={router} />
        <Toaster />
      </AuthProvider>
    </React.StrictMode>
  );
}

export default App;
