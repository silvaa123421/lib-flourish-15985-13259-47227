import { useState } from "react";
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

const mockUsers = [
  {
    id: 1,
    name: "João Silva",
    registration: "2023001",
    email: "joao.silva@email.com",
    type: "Aluno",
    activeLoans: 2,
    totalLoans: 15,
  },
  {
    id: 2,
    name: "Maria Santos",
    registration: "PROF001",
    email: "maria.santos@email.com",
    type: "Professor",
    activeLoans: 1,
    totalLoans: 45,
  },
  {
    id: 3,
    name: "Pedro Oliveira",
    registration: "2023045",
    email: "pedro.oliveira@email.com",
    type: "Aluno",
    activeLoans: 0,
    totalLoans: 8,
  },
  {
    id: 4,
    name: "Ana Costa",
    registration: "2023102",
    email: "ana.costa@email.com",
    type: "Aluno",
    activeLoans: 3,
    totalLoans: 22,
  },
];

export default function Users() {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredUsers = mockUsers.filter(
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
            {filteredUsers.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="font-medium">{user.name}</TableCell>
                <TableCell>{user.registration}</TableCell>
                <TableCell className="text-muted-foreground">
                  {user.email}
                </TableCell>
                <TableCell>
                  <Badge variant={user.type === "Professor" ? "default" : "secondary"}>
                    {user.type}
                  </Badge>
                </TableCell>
                <TableCell>
                  <span className={user.activeLoans > 0 ? "font-medium text-primary" : ""}>
                    {user.activeLoans}
                  </span>
                </TableCell>
                <TableCell>{user.totalLoans}</TableCell>
                <TableCell>
                  <Button variant="ghost" size="sm">
                    Ver Histórico
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
