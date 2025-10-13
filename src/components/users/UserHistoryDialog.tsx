import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface UserHistoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
  userName: string;
}

interface LoanHistory {
  id: string;
  loan_date: string;
  due_date: string;
  return_date: string | null;
  status: string;
  book: {
    title: string;
    author: string;
  };
}

export default function UserHistoryDialog({
  open,
  onOpenChange,
  userId,
  userName,
}: UserHistoryDialogProps) {
  const [history, setHistory] = useState<LoanHistory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (open) {
      fetchHistory();
    }
  }, [open, userId]);

  const fetchHistory = async () => {
    setLoading(true);
    
    const { data: loans } = await supabaseClient
      .from("loans")
      .select(`
        id,
        loan_date,
        due_date,
        return_date,
        status,
        book_id
      `)
      .eq("user_id", userId)
      .order("loan_date", { ascending: false });

    if (loans) {
      // Fetch book details for each loan
      const loansWithBooks = await Promise.all(
        loans.map(async (loan) => {
          const { data: book } = await supabaseClient
            .from("books")
            .select("title, author")
            .eq("id", loan.book_id)
            .single();

          return {
            ...loan,
            book: book || { title: "Desconhecido", author: "Desconhecido" },
          };
        })
      );

      setHistory(loansWithBooks as any);
    }
    
    setLoading(false);
  };

  const getStatusBadge = (loan: LoanHistory) => {
    if (loan.return_date) {
      return <Badge variant="secondary">Devolvido</Badge>;
    }
    const today = new Date();
    const dueDate = new Date(loan.due_date);
    if (dueDate < today) {
      return <Badge variant="destructive">Atrasado</Badge>;
    }
    return <Badge>Ativo</Badge>;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Histórico de Empréstimos</DialogTitle>
          <DialogDescription>{userName}</DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="text-center py-8">Carregando...</div>
        ) : history.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            Nenhum empréstimo encontrado
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Livro</TableHead>
                <TableHead>Autor</TableHead>
                <TableHead>Data do Empréstimo</TableHead>
                <TableHead>Data de Devolução</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {history.map((loan) => (
                <TableRow key={loan.id}>
                  <TableCell className="font-medium">{loan.book.title}</TableCell>
                  <TableCell>{loan.book.author}</TableCell>
                  <TableCell>
                    {format(new Date(loan.loan_date), "dd/MM/yyyy", { locale: ptBR })}
                  </TableCell>
                  <TableCell>
                    {loan.return_date
                      ? format(new Date(loan.return_date), "dd/MM/yyyy", { locale: ptBR })
                      : format(new Date(loan.due_date), "dd/MM/yyyy", { locale: ptBR })}
                  </TableCell>
                  <TableCell>{getStatusBadge(loan)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </DialogContent>
    </Dialog>
  );
}
