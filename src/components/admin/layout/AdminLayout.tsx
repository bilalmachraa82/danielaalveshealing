import { useState, useCallback, useMemo } from "react";
import { Outlet, Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { QuickBookingContext } from "@/contexts/QuickBookingContext";
import { AdminSidebar } from "./AdminSidebar";
import { AdminHeader } from "./AdminHeader";
import { MobileBottomNav } from "@/components/admin/MobileBottomNav";
import { QuickBooking, QuickBookingFab } from "@/components/admin/QuickBooking";
import {
  SidebarProvider,
  SidebarInset,
} from "@/components/ui/sidebar";

export function AdminLayout() {
  const { user, isLoading } = useAuth();
  const [quickBookingOpen, setQuickBookingOpen] = useState(false);

  const openQuickBooking = useCallback(() => setQuickBookingOpen(true), []);
  const quickBookingContextValue = useMemo(
    () => ({ openQuickBooking }),
    [openQuickBooking]
  );

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/admin/login" replace />;
  }

  return (
    <QuickBookingContext.Provider value={quickBookingContextValue}>
      <SidebarProvider>
        <div className="flex min-h-screen w-full">
          <AdminSidebar />
          <SidebarInset className="flex flex-col flex-1">
            <AdminHeader />
            <main className="flex-1 p-4 md:p-6 overflow-auto pb-20 md:pb-6">
              <Outlet />
            </main>
          </SidebarInset>
        </div>
        <MobileBottomNav />
        <QuickBookingFab onClick={openQuickBooking} />
        <QuickBooking open={quickBookingOpen} onOpenChange={setQuickBookingOpen} />
      </SidebarProvider>
    </QuickBookingContext.Provider>
  );
}
