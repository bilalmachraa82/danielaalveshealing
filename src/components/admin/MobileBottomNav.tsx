import { Link, useLocation } from "react-router-dom";
import { LayoutDashboard, Users, Calendar, Menu } from "lucide-react";
import { useSidebar } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

interface NavTab {
  label: string;
  icon: React.ElementType;
  href: string;
}

const tabs: NavTab[] = [
  { label: "Dashboard", icon: LayoutDashboard, href: "/admin/dashboard" },
  { label: "Clientes", icon: Users, href: "/admin/clientes" },
  { label: "Sessões", icon: Calendar, href: "/admin/sessoes" },
];

export function MobileBottomNav() {
  const location = useLocation();
  const { toggleSidebar } = useSidebar();

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around bg-background/80 backdrop-blur-lg border-t border-border"
      style={{ height: "calc(64px + env(safe-area-inset-bottom))", paddingBottom: "env(safe-area-inset-bottom)" }}
      aria-label="Navegação principal"
    >
      {tabs.map(({ label, icon: Icon, href }) => {
        const isActive = location.pathname.startsWith(href);
        return (
          <Link
            key={href}
            to={href}
            className={cn(
              "flex flex-col items-center justify-center gap-1 min-w-[44px] min-h-[44px] flex-1 px-2 py-1 rounded-lg transition-colors",
              isActive
                ? "text-primary"
                : "text-muted-foreground hover:text-foreground"
            )}
            aria-current={isActive ? "page" : undefined}
          >
            <Icon
              className={cn("h-5 w-5", isActive && "stroke-[2.5px]")}
              aria-hidden="true"
            />
            <span className="text-[10px] font-medium leading-none">{label}</span>
          </Link>
        );
      })}

      <button
        onClick={toggleSidebar}
        className="flex flex-col items-center justify-center gap-1 min-w-[44px] min-h-[44px] flex-1 px-2 py-1 rounded-lg text-muted-foreground hover:text-foreground transition-colors"
        aria-label="Abrir menu lateral"
      >
        <Menu className="h-5 w-5" aria-hidden="true" />
        <span className="text-[10px] font-medium leading-none">Mais</span>
      </button>
    </nav>
  );
}
