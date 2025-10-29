import { useState, useEffect } from "react";
import { Pencil, Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
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
import { supabaseClient } from "@/lib/supabase-helper";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Book {
  id: string;
  title: string;
  author: string;
  isbn: string;
  category: string;
  year: number;
  quantity: number;
  available: number;
  cover_url?: string;
}

interface EditBookDialogProps {
  book: Book;
  onBookUpdated: () => void;
}

export function EditBookDialog({ book, onBookUpdated }: EditBookDialogProps) {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: book.title,
    author: book.author,
    isbn: book.isbn,
    category: book.category,
    year: book.year.toString(),
    quantity: book.quantity.toString(),
    available: book.available.toString(),
  });
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(book.cover_url || null);

  useEffect(() => {
    if (open) {
      setFormData({
        title: book.title,
        author: book.author,
        isbn: book.isbn,
        category: book.category,
        year: book.year.toString(),
        quantity: book.quantity.toString(),
        available: book.available.toString(),
      });
      setCoverPreview(book.cover_url || null);
      setCoverFile(null);
    }
  }, [open, book]);

  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("A imagem deve ter no máximo 5MB");
      return;
    }

    if (!file.type.startsWith("image/")) {
      toast.error("Por favor, selecione uma imagem válida");
      return;
    }

    setCoverFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setCoverPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveCover = () => {
    setCoverFile(null);
    setCoverPreview(null);
  };

  const uploadCover = async () => {
    if (!coverFile) return book.cover_url;

    setUploading(true);
    try {
      const fileExt = coverFile.name.split('.').pop();
      const fileName = `${book.id}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('book-covers')
        .upload(filePath, coverFile, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('book-covers')
        .getPublicUrl(filePath);

      return publicUrl;
    } catch (error: any) {
      console.error('Error uploading cover:', error);
      toast.error("Erro ao fazer upload da capa");
      return book.cover_url;
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Upload cover if changed
      let coverUrl = book.cover_url;
      if (coverFile) {
        coverUrl = await uploadCover();
      } else if (!coverPreview) {
        coverUrl = null;
      }

      const { error } = await supabaseClient
        .from("books")
        .update({
          title: formData.title,
          author: formData.author,
          isbn: formData.isbn,
          category: formData.category,
          year: parseInt(formData.year),
          quantity: parseInt(formData.quantity),
          available: parseInt(formData.available),
          cover_url: coverUrl,
        })
        .eq("id", book.id);

      if (error) throw error;

      toast.success("Livro atualizado com sucesso!");
      setOpen(false);
      onBookUpdated();
    } catch (error) {
      toast.error("Erro ao atualizar livro");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm">
          <Pencil className="h-4 w-4 mr-1" />
          Editar
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Editar Livro</DialogTitle>
          <DialogDescription>
            Atualize as informações do livro
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="cover">Capa do Livro</Label>
              <div className="flex flex-col gap-2">
                {coverPreview ? (
                  <div className="relative w-full h-48 rounded-md overflow-hidden border">
                    <img
                      src={coverPreview}
                      alt="Preview da capa"
                      className="w-full h-full object-cover"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute top-2 right-2"
                      onClick={handleRemoveCover}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <label
                    htmlFor="cover-upload"
                    className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-md cursor-pointer hover:bg-muted/50 transition-colors"
                  >
                    <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                    <span className="text-sm text-muted-foreground">
                      Clique para fazer upload da capa
                    </span>
                    <span className="text-xs text-muted-foreground mt-1">
                      PNG, JPG até 5MB
                    </span>
                    <input
                      id="cover-upload"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleCoverChange}
                    />
                  </label>
                )}
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="title">Título</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="author">Autor</Label>
              <Input
                id="author"
                value={formData.author}
                onChange={(e) =>
                  setFormData({ ...formData, author: e.target.value })
                }
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="isbn">ISBN</Label>
              <Input
                id="isbn"
                value={formData.isbn}
                onChange={(e) =>
                  setFormData({ ...formData, isbn: e.target.value })
                }
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="category">Categoria</Label>
              <Select
                value={formData.category}
                onValueChange={(value) =>
                  setFormData({ ...formData, category: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma categoria" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Ficção">Ficção</SelectItem>
                  <SelectItem value="Romance">Romance</SelectItem>
                  <SelectItem value="Infantil">Infantil</SelectItem>
                  <SelectItem value="Fantasia">Fantasia</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="year">Ano</Label>
                <Input
                  id="year"
                  type="number"
                  value={formData.year}
                  onChange={(e) =>
                    setFormData({ ...formData, year: e.target.value })
                  }
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="quantity">Quantidade</Label>
                <Input
                  id="quantity"
                  type="number"
                  min="1"
                  value={formData.quantity}
                  onChange={(e) =>
                    setFormData({ ...formData, quantity: e.target.value })
                  }
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="available">Disponíveis</Label>
                <Input
                  id="available"
                  type="number"
                  min="0"
                  value={formData.available}
                  onChange={(e) =>
                    setFormData({ ...formData, available: e.target.value })
                  }
                  required
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={loading || uploading}>
              {loading || uploading ? "Salvando..." : "Salvar alterações"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
