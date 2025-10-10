import { useState, useEffect } from "react";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import { AddLoanDialog } from "@/components/loans/AddLoanDialog";
import { toast } from "@/hooks/use-toast";

interface Loan {
  id: string;
  user_id: string;
  book_id: string;
  loan_date: string;
  due_date: string;
  return_date: string | null;
  status: string;
  profiles?: {
    name: string;
    registration: string;
  };
  books?: {
    title: string;
  };
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
  const [activeTab, setActiveTab] = useState("active");

  const fetchLoans = async () => {
    setLoading(true);
    const { data } = await supabaseClient
      .from("loans")
      .select(`
        *,
        profiles:user_id(name, registration),
        books:book_id(title)
      `)
      .order("loan_date", { ascending: false });
    if (data) setLoans(data as any);
    setLoading(false);
  };

  useEffect(() => {
    fetchLoans();
  }, []);

  const handleReturnBook = async (loanId: string, bookId: string) => {
    try {
      // Get book current availability
      const { data: book } = await supabaseClient
        .from("books")
        .select("available")
        .eq("id", bookId)
        .single();

      if (!book) {
        toast({
          title: "Erro",
          description: "Livro não encontrado",
          variant: "destructive",
        });
        return;
      }

      // Update loan with return date
      const { error: loanError } = await supabaseClient
        .from("loans")
        .update({ 
          return_date: new Date().toISOString(),
          status: "returned"
        })
        .eq("id", loanId);

      if (loanError) throw loanError;

      // Update book availability
      const { error: bookError } = await supabaseClient
        .from("books")
        .update({ available: book.available + 1 })
        .eq("id", bookId);

      if (bookError) throw bookError;

      toast({
        title: "Devolução registrada",
        description: "O livro foi devolvido com sucesso",
      });

      fetchLoans();
    } catch (error: any) {
      toast({
        title: "Erro ao registrar devolução",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const filteredLoans = loans.filter((loan) => {
    const userName = loan.profiles?.name?.toLowerCase() || "";
    const bookTitle = loan.books?.title?.toLowerCase() || "";
    const search = searchTerm.toLowerCase();
    const matchesSearch = userName.includes(search) || bookTitle.includes(search);
    
    const daysRemaining = calculateDaysRemaining(loan.due_date);
    const isOverdue = !loan.return_date && daysRemaining < 0;
    const status = loan.return_date ? "returned" : isOverdue ? "overdue" : "active";
    
    if (activeTab === "active") {
      return matchesSearch && status === "active";
    } else if (activeTab === "overdue") {
      return matchesSearch && status === "overdue";
    } else if (activeTab === "returned") {
      return matchesSearch && status === "returned";
    }
    return matchesSearch;
  });

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Empréstimos</h1>
          <p className="text-muted-foreground mt-2">
            Gerencie empréstimos e devoluções
          </p>
        </div>
        <AddLoanDialog onLoanAdded={fetchLoans} />
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

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="active">Ativos</TabsTrigger>
          <TabsTrigger value="overdue">Atrasados</TabsTrigger>
          <TabsTrigger value="returned">Histórico</TabsTrigger>
          <TabsTrigger value="all">Todos</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-4">
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
              filteredLoans.map((loan) => {
                const daysRemaining = calculateDaysRemaining(loan.due_date);
                const isOverdue = !loan.return_date && daysRemaining < 0;
                const status = loan.return_date ? "returned" : isOverdue ? "overdue" : "active";
                
                return (
                  <TableRow key={loan.id}>
                    <TableCell className="font-medium">
                      {loan.profiles?.name || "N/A"}
                      <div className="text-xs text-muted-foreground">
                        {loan.profiles?.registration}
                      </div>
                    </TableCell>
                    <TableCell>{loan.books?.title || "N/A"}</TableCell>
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
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleReturnBook(loan.id, loan.book_id)}
                        >
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
        </TabsContent>
      </Tabs>
    </div>
  );
}
