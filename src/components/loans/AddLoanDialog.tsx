import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus } from "lucide-react";
import { supabaseClient } from "@/lib/supabase-helper";
import { toast } from "@/hooks/use-toast";
import { z } from "zod";

const loanSchema = z.object({
  user_id: z.string().min(1, "Selecione um usuário"),
  book_id: z.string().min(1, "Selecione um livro"),
  due_date: z.string().min(1, "Informe a data de devolução"),
});

interface User {
  id: string;
  name: string;
  registration: string;
}

interface Book {
  id: string;
  title: string;
  available: number;
}

export function AddLoanDialog({ onLoanAdded }: { onLoanAdded: () => void }) {
  const [open, setOpen] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    user_id: "",
    book_id: "",
    due_date: "",
  });

  useEffect(() => {
    if (open) {
      fetchUsers();
      fetchAvailableBooks();
      // Set default due date to 7 days from now
      const defaultDueDate = new Date();
      defaultDueDate.setDate(defaultDueDate.getDate() + 7);
      setFormData((prev) => ({
        ...prev,
        due_date: defaultDueDate.toISOString().split("T")[0],
      }));
    }
  }, [open]);

  const fetchUsers = async () => {
    const { data } = await supabaseClient
      .from("profiles")
      .select("id, name, registration")
      .order("name");
    if (data) setUsers(data);
  };

  const fetchAvailableBooks = async () => {
    const { data } = await supabaseClient
      .from("books")
      .select("id, title, available")
      .gt("available", 0)
      .order("title");
    if (data) setBooks(data);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const result = loanSchema.safeParse(formData);
    if (!result.success) {
      toast({
        title: "Erro de validação",
        description: result.error.errors[0].message,
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      // Get book to check availability
      const { data: book } = await supabaseClient
        .from("books")
        .select("available")
        .eq("id", formData.book_id)
        .single();

      if (!book || book.available < 1) {
        toast({
          title: "Livro indisponível",
          description: "Este livro não está disponível para empréstimo",
          variant: "destructive",
        });
        return;
      }

      // Create loan
      const { error: loanError } = await supabaseClient.from("loans").insert({
        user_id: formData.user_id,
        book_id: formData.book_id,
        loan_date: new Date().toISOString(),
        due_date: new Date(formData.due_date).toISOString(),
        status: "active",
      });

      if (loanError) throw loanError;

      // Update book availability
      const { error: bookError } = await supabaseClient
        .from("books")
        .update({ available: book.available - 1 })
        .eq("id", formData.book_id);

      if (bookError) throw bookError;

      toast({
        title: "Empréstimo criado",
        description: "O empréstimo foi registrado com sucesso",
      });

      setOpen(false);
      setFormData({ user_id: "", book_id: "", due_date: "" });
      onLoanAdded();
    } catch (error: any) {
      toast({
        title: "Erro ao criar empréstimo",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gradient-primary">
          <Plus className="h-4 w-4 mr-2" />
          Novo Empréstimo
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Novo Empréstimo</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="user_id">Usuário</Label>
            <Select
              value={formData.user_id}
              onValueChange={(value) =>
                setFormData({ ...formData, user_id: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione um usuário" />
              </SelectTrigger>
              <SelectContent>
                {users.map((user) => (
                  <SelectItem key={user.id} value={user.id}>
                    {user.name} ({user.registration})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="book_id">Livro</Label>
            <Select
              value={formData.book_id}
              onValueChange={(value) =>
                setFormData({ ...formData, book_id: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione um livro" />
              </SelectTrigger>
              <SelectContent>
                {books.map((book) => (
                  <SelectItem key={book.id} value={book.id}>
                    {book.title} ({book.available} disponível)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="due_date">Data de Devolução</Label>
            <Input
              id="due_date"
              type="date"
              value={formData.due_date}
              onChange={(e) =>
                setFormData({ ...formData, due_date: e.target.value })
              }
              min={new Date().toISOString().split("T")[0]}
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Criando..." : "Criar Empréstimo"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
