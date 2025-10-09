import { LayoutDashboard, BookOpen, Users, RefreshCw, BarChart3, BookMarked, LogOut, User } from "lucide-react";
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
import { useUserRole } from "@/hooks/useUserRole";
import { useIsMobile } from "@/hooks/use-mobile";

const menuItems = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard, librarianOnly: true },
  { title: "Livros", url: "/books", icon: BookOpen, librarianOnly: false },
  { title: "Usuários", url: "/users", icon: Users, librarianOnly: true },
  { title: "Empréstimos", url: "/loans", icon: RefreshCw, librarianOnly: true },
  { title: "Relatórios", url: "/reports", icon: BarChart3, librarianOnly: true },
  { title: "Perfil", url: "/profile", icon: User, librarianOnly: false },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const { signOut } = useAuth();
  const { isLibrarian } = useUserRole();
  const location = useLocation();
  const isMobile = useIsMobile();
  const isCollapsed = state === "collapsed";

  const isActive = (path: string) => location.pathname === path;
  
  const filteredMenuItems = menuItems.filter(
    item => !item.librarianOnly || isLibrarian
  );

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b border-sidebar-border p-4">
        <div className="flex items-center gap-2">
          <BookMarked className="h-6 w-6 text-sidebar-primary" />
          {(!isCollapsed || isMobile) && (
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
              {filteredMenuItems.map((item) => (
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
