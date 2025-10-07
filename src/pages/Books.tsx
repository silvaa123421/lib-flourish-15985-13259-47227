import { useState, useEffect } from "react";
import { Search, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { AddBookDialog } from "@/components/books/AddBookDialog";
import { Button } from "@/components/ui/button";

interface Book {
  id: string;
  title: string;
  author: string;
  isbn: string;
  category: string;
  year: number;
  quantity: number;
  available: number;
}

export default function Books() {
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchBooks = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("books")
      .select("*")
      .order("title");
    
    if (!error && data) {
      setBooks(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchBooks();
  }, []);

  const filteredBooks = books.filter((book) => {
    const matchesSearch =
      book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      book.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
      book.isbn.includes(searchTerm);
    const matchesCategory =
      categoryFilter === "all" || book.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Livros</h1>
          <p className="text-muted-foreground mt-2">
            Gerencie o acervo da biblioteca
          </p>
        </div>
        <AddBookDialog onBookAdded={fetchBooks} />
      </div>

      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por título, autor ou ISBN..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-[200px]">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Categoria" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas</SelectItem>
            <SelectItem value="Ficção">Ficção</SelectItem>
            <SelectItem value="Romance">Romance</SelectItem>
            <SelectItem value="Infantil">Infantil</SelectItem>
            <SelectItem value="Fantasia">Fantasia</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Título</TableHead>
              <TableHead>Autor</TableHead>
              <TableHead>ISBN</TableHead>
              <TableHead>Categoria</TableHead>
              <TableHead>Ano</TableHead>
              <TableHead>Disponibilidade</TableHead>
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
            ) : filteredBooks.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  Nenhum livro encontrado
                </TableCell>
              </TableRow>
            ) : (
              filteredBooks.map((book) => (
                <TableRow key={book.id}>
                  <TableCell className="font-medium">{book.title}</TableCell>
                  <TableCell>{book.author}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {book.isbn}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{book.category}</Badge>
                  </TableCell>
                  <TableCell>{book.year}</TableCell>
                  <TableCell>
                    <span
                      className={`font-medium ${
                        book.available === 0
                          ? "text-destructive"
                          : book.available <= 2
                          ? "text-warning"
                          : "text-success"
                      }`}
                    >
                      {book.available}/{book.quantity}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm">
                      Editar
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
