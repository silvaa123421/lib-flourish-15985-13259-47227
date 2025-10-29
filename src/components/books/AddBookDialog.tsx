import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Upload, X } from "lucide-react";
import { supabaseClient } from "@/lib/supabase-helper";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { z } from "zod";

const bookSchema = z.object({
  title: z.string().trim().min(1, "Título é obrigatório").max(200),
  author: z.string().trim().min(1, "Autor é obrigatório").max(200),
  isbn: z.string().trim().min(10, "ISBN inválido").max(20),
  category: z.string().min(1, "Categoria é obrigatória"),
  year: z.number().min(1800, "Ano inválido").max(new Date().getFullYear() + 1),
  quantity: z.number().min(1, "Quantidade deve ser no mínimo 1")
});

interface AddBookDialogProps {
  onBookAdded: () => void;
}

export function AddBookDialog({ onBookAdded }: AddBookDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    author: "",
    isbn: "",
    category: "",
    year: new Date().getFullYear(),
    quantity: 1
  });

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

  const uploadCover = async (bookId: string) => {
    if (!coverFile) return null;

    setUploading(true);
    try {
      const fileExt = coverFile.name.split('.').pop();
      const fileName = `${bookId}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError, data } = await supabase.storage
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
      return null;
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const validated = bookSchema.parse(formData);
      setLoading(true);

      const bookData = {
        title: validated.title,
        author: validated.author,
        isbn: validated.isbn,
        category: validated.category,
        year: validated.year,
        quantity: validated.quantity
      };

      const { data: newBook, error } = await supabaseClient
        .from("books")
        .insert([bookData])
        .select()
        .single();

      if (error) throw error;

      // Upload cover if provided
      if (coverFile && newBook) {
        const coverUrl = await uploadCover(newBook.id);
        if (coverUrl) {
          await supabaseClient
            .from("books")
            .update({ cover_url: coverUrl })
            .eq("id", newBook.id);
        }
      }

      toast.success("Livro cadastrado com sucesso!");
      setOpen(false);
      setFormData({
        title: "",
        author: "",
        isbn: "",
        category: "",
        year: new Date().getFullYear(),
        quantity: 1
      });
      setCoverFile(null);
      setCoverPreview(null);
      onBookAdded();
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        toast.error(error.errors[0].message);
      } else {
        toast.error(error.message || "Erro ao cadastrar livro");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Adicionar Livro
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Adicionar Novo Livro</DialogTitle>
          <DialogDescription>
            Preencha os dados do livro para cadastrá-lo no sistema
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
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
          <div className="space-y-2">
            <Label htmlFor="title">Título</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="author">Autor</Label>
            <Input
              id="author"
              value={formData.author}
              onChange={(e) => setFormData({ ...formData, author: e.target.value })}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="isbn">ISBN</Label>
            <Input
              id="isbn"
              value={formData.isbn}
              onChange={(e) => setFormData({ ...formData, isbn: e.target.value })}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="category">Categoria</Label>
            <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
              <SelectTrigger id="category">
                <SelectValue placeholder="Selecione uma categoria" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="fiction">Ficção</SelectItem>
                <SelectItem value="science">Ciência</SelectItem>
                <SelectItem value="history">História</SelectItem>
                <SelectItem value="technology">Tecnologia</SelectItem>
                <SelectItem value="arts">Artes</SelectItem>
                <SelectItem value="other">Outros</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="year">Ano</Label>
              <Input
                id="year"
                type="number"
                value={formData.year}
                onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="quantity">Quantidade</Label>
              <Input
                id="quantity"
                type="number"
                min="1"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) })}
                required
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading || uploading}>
              {loading || uploading ? "Cadastrando..." : "Cadastrar"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
