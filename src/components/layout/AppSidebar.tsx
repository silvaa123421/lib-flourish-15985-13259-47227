import { LayoutDashboard, BookOpen, Users, RefreshCw, BarChart3, BookMarked, LogOut } from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";

const menuItems = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "Livros", url: "/books", icon: BookOpen },
  { title: "Usuários", url: "/users", icon: Users },
  { title: "Empréstimos", url: "/loans", icon: RefreshCw },
  { title: "Relatórios", url: "/reports", icon: BarChart3 },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const { signOut } = useAuth();
  const location = useLocation();
  const isCollapsed = state === "collapsed";

  const isActive = (path: string) => location.pathname === path;

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b border-sidebar-border p-4">
        <div className="flex items-center gap-2">
          <BookMarked className="h-6 w-6 text-sidebar-primary" />
          {!isCollapsed && (
            <div>
              <h2 className="font-bold text-sidebar-foreground">Biblioteca</h2>
              <p className="text-xs text-sidebar-foreground/70">Edmundo Silva</p>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menu Principal</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={isActive(item.url)}>
                    <NavLink to={item.url}>
                      <item.icon className="h-4 w-4" />
                      {!isCollapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border p-4">
        <Button
          variant="ghost"
          className="w-full justify-start gap-2"
          onClick={signOut}
        >
          <LogOut className="h-4 w-4" />
          {!isCollapsed && <span>Sair</span>}
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
