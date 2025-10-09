import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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

interface MobileLoanDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  preSelectedBookId?: string;
  onLoanAdded: () => void;
}

export function MobileLoanDialog({
  open,
  onOpenChange,
  preSelectedBookId,
  onLoanAdded,
}: MobileLoanDialogProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    user_id: "",
    book_id: preSelectedBookId || "",
    due_date: "",
  });

  useEffect(() => {
    if (open) {
      fetchUsers();
      const defaultDueDate = new Date();
      defaultDueDate.setDate(defaultDueDate.getDate() + 7);
      setFormData((prev) => ({
        ...prev,
        book_id: preSelectedBookId || prev.book_id,
        due_date: defaultDueDate.toISOString().split("T")[0],
      }));
    }
  }, [open, preSelectedBookId]);

  const fetchUsers = async () => {
    const { data } = await supabaseClient
      .from("profiles")
      .select("id, name, registration")
      .order("name");
    if (data) setUsers(data);
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

      const { error: loanError } = await supabaseClient.from("loans").insert({
        user_id: formData.user_id,
        book_id: formData.book_id,
        loan_date: new Date().toISOString(),
        due_date: new Date(formData.due_date).toISOString(),
        status: "active",
      });

      if (loanError) throw loanError;

      const { error: bookError } = await supabaseClient
        .from("books")
        .update({ available: book.available - 1 })
        .eq("id", formData.book_id);

      if (bookError) throw bookError;

      toast({
        title: "Empréstimo criado",
        description: "O empréstimo foi registrado com sucesso",
      });

      onOpenChange(false);
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
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Novo Empréstimo</DrawerTitle>
          <DrawerDescription>
            Preencha os dados para realizar o empréstimo
          </DrawerDescription>
        </DrawerHeader>
        <form onSubmit={handleSubmit} className="px-4 space-y-4">
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

          <DrawerFooter className="px-0">
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? "Criando..." : "Criar Empréstimo"}
            </Button>
            <DrawerClose asChild>
              <Button variant="outline" className="w-full">
                Cancelar
              </Button>
            </DrawerClose>
          </DrawerFooter>
        </form>
      </DrawerContent>
    </Drawer>
  );
}
