import { useState } from "react";
import { Plus, Search, Calendar } from "lucide-react";
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

const mockLoans = [
  {
    id: 1,
    userName: "João Silva",
    bookTitle: "1984",
    loanDate: "2024-01-15",
    dueDate: "2024-01-22",
    status: "active",
  },
  {
    id: 2,
    userName: "Maria Santos",
    bookTitle: "Dom Casmurro",
    loanDate: "2024-01-10",
    dueDate: "2024-01-17",
    status: "overdue",
  },
  {
    id: 3,
    userName: "Pedro Oliveira",
    bookTitle: "O Pequeno Príncipe",
    loanDate: "2024-01-05",
    dueDate: "2024-01-12",
    status: "returned",
  },
  {
    id: 4,
    userName: "Ana Costa",
    bookTitle: "Harry Potter",
    loanDate: "2024-01-18",
    dueDate: "2024-01-25",
    status: "active",
  },
];

const getStatusBadge = (status: string) => {
  switch (status) {
    case "active":
      return <Badge className="bg-success">Ativo</Badge>;
    case "overdue":
      return <Badge variant="destructive">Atrasado</Badge>;
    case "returned":
      return <Badge variant="outline">Devolvido</Badge>;
    default:
      return <Badge variant="secondary">{status}</Badge>;
  }
};

const calculateDaysRemaining = (dueDate: string) => {
  const today = new Date();
  const due = new Date(dueDate);
  const diffTime = due.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

export default function Loans() {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredLoans = mockLoans.filter(
    (loan) =>
      loan.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      loan.bookTitle.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Empréstimos</h1>
          <p className="text-muted-foreground mt-2">
            Gerencie empréstimos e devoluções
          </p>
        </div>
        <Button className="gradient-primary">
          <Plus className="h-4 w-4 mr-2" />
          Novo Empréstimo
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar por usuário ou livro..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Usuário</TableHead>
              <TableHead>Livro</TableHead>
              <TableHead>Data do Empréstimo</TableHead>
              <TableHead>Data de Devolução</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Dias Restantes</TableHead>
              <TableHead>Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredLoans.map((loan) => {
              const daysRemaining = calculateDaysRemaining(loan.dueDate);
              return (
                <TableRow key={loan.id}>
                  <TableCell className="font-medium">{loan.userName}</TableCell>
                  <TableCell>{loan.bookTitle}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {new Date(loan.loanDate).toLocaleDateString("pt-BR")}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {new Date(loan.dueDate).toLocaleDateString("pt-BR")}
                  </TableCell>
                  <TableCell>{getStatusBadge(loan.status)}</TableCell>
                  <TableCell>
                    {loan.status === "returned" ? (
                      <span className="text-muted-foreground">-</span>
                    ) : daysRemaining < 0 ? (
                      <span className="font-medium text-destructive">
                        {Math.abs(daysRemaining)} dias atrasado
                      </span>
                    ) : daysRemaining <= 2 ? (
                      <span className="font-medium text-warning">
                        {daysRemaining} dias
                      </span>
                    ) : (
                      <span>{daysRemaining} dias</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {loan.status !== "returned" && (
                      <Button variant="outline" size="sm">
                        Registrar Devolução
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
