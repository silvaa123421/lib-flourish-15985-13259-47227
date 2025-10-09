import { BookMarked } from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";

export function MobileHeader() {
  return (
    <header className="sticky top-0 z-10 flex items-center gap-3 border-b bg-background px-4 py-3 md:hidden">
      <SidebarTrigger />
      <div className="flex items-center gap-2">
        <BookMarked className="h-5 w-5 text-primary" />
        <div>
          <h1 className="text-sm font-bold">Biblioteca</h1>
          <p className="text-xs text-muted-foreground">Edmundo Silva</p>
        </div>
      </div>
    </header>
  );
}
