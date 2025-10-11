import { useState, useEffect } from "react";
import { Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { supabaseClient } from "@/lib/supabase-helper";

interface User {
  id: string;
  name: string;
  registration: string;
  email: string;
  type: string;
  avatar_url?: string;
  activeLoans?: number;
  totalLoans?: number;
}

export default function Users() {
  const [searchTerm, setSearchTerm] = useState("");
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      
      // Fetch profiles
      const { data: profiles } = await supabaseClient
        .from("profiles")
        .select("*")
        .order("name");
      
      if (profiles) {
        // Fetch loan counts for each user
        const usersWithLoans = await Promise.all(
          profiles.map(async (profile) => {
            // Count active loans
            const { count: activeCount } = await supabaseClient
              .from("loans")
              .select("*", { count: "exact", head: true })
              .eq("user_id", profile.id)
              .eq("status", "active");
            
            // Count total loans
            const { count: totalCount } = await supabaseClient
              .from("loans")
              .select("*", { count: "exact", head: true })
              .eq("user_id", profile.id);
            
            return {
              ...profile,
              activeLoans: activeCount || 0,
              totalLoans: totalCount || 0,
            };
          })
        );
        
        setUsers(usersWithLoans as any);
      }
      
      setLoading(false);
    };
    fetchUsers();
  }, []);

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.registration.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Usuários</h1>
          <p className="text-muted-foreground mt-2">
            Gerencie os usuários da biblioteca
          </p>
        </div>
        <Button className="gradient-primary">
          <Plus className="h-4 w-4 mr-2" />
          Adicionar Usuário
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar por nome, matrícula ou e-mail..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Matrícula</TableHead>
              <TableHead>E-mail</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Empréstimos Ativos</TableHead>
              <TableHead>Total de Empréstimos</TableHead>
              <TableHead>Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  Carregando...
                </TableCell>
              </TableRow>
            ) : filteredUsers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  Nenhum usuário encontrado
                </TableCell>
              </TableRow>
            ) : (
              filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={user.avatar_url || ""} alt={user.name} />
                        <AvatarFallback>
                          {user.name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <span>{user.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>{user.registration}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {user.email}
                  </TableCell>
                  <TableCell>
                    <Badge variant={user.type === "Professor" ? "default" : "secondary"}>
                      {user.type}
                    </Badge>
                  </TableCell>
                  <TableCell>{user.activeLoans || 0}</TableCell>
                  <TableCell>{user.totalLoans || 0}</TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm">
                      Ver Histórico
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
