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
import { supabaseClient } from "@/lib/supabase-helper";

interface Loan {
  id: string;
  user_id: string;
  book_id: string;
  loan_date: string;
  due_date: string;
  return_date: string | null;
  status: string;
}

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
  const [loans, setLoans] = useState<Loan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLoans = async () => {
      setLoading(true);
      const { data } = await supabaseClient.from("loans").select("*").order("loan_date", { ascending: false });
      if (data) setLoans(data as any);
      setLoading(false);
    };
    fetchLoans();
  }, []);

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
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  Carregando...
                </TableCell>
              </TableRow>
            ) : loans.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  Nenhum empréstimo encontrado
                </TableCell>
              </TableRow>
            ) : (
              loans.map((loan) => {
                const daysRemaining = calculateDaysRemaining(loan.due_date);
                const isOverdue = !loan.return_date && daysRemaining < 0;
                const status = loan.return_date ? "returned" : isOverdue ? "overdue" : "active";
                
                return (
                  <TableRow key={loan.id}>
                    <TableCell className="font-medium">{loan.user_id.slice(0, 8)}</TableCell>
                    <TableCell>{loan.book_id.slice(0, 8)}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {new Date(loan.loan_date).toLocaleDateString("pt-BR")}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {new Date(loan.due_date).toLocaleDateString("pt-BR")}
                    </TableCell>
                    <TableCell>{getStatusBadge(status)}</TableCell>
                    <TableCell>
                      {loan.return_date ? (
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
                      {!loan.return_date && (
                        <Button variant="outline" size="sm">
                          Registrar Devolução
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
