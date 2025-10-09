import { Book } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface BookShelfProps {
  books: Array<{
    id: string;
    title: string;
    author: string;
    category: string;
    available: number;
    quantity: number;
  }>;
  onLoanBook: (bookId: string) => void;
}

export function BookShelf({ books, onLoanBook }: BookShelfProps) {
  return (
    <div className="grid grid-cols-2 gap-3 p-4">
      {books.map((book) => (
        <Card
          key={book.id}
          className="overflow-hidden hover:shadow-md transition-smooth"
        >
          <CardContent className="p-0">
            <div className="aspect-[2/3] bg-gradient-primary flex items-center justify-center relative">
              <Book className="h-16 w-16 text-primary-foreground opacity-80" />
              <div className="absolute top-2 right-2">
                <Badge
                  variant={book.available > 0 ? "default" : "destructive"}
                  className="text-xs"
                >
                  {book.available > 0 ? "Disponível" : "Indisponível"}
                </Badge>
              </div>
            </div>
            <div className="p-3 space-y-2">
              <h3 className="font-semibold text-sm line-clamp-2 leading-tight">
                {book.title}
              </h3>
              <p className="text-xs text-muted-foreground line-clamp-1">
                {book.author}
              </p>
              <Badge variant="outline" className="text-xs">
                {book.category}
              </Badge>
              <Button
                className="w-full mt-2"
                size="sm"
                disabled={book.available === 0}
                onClick={() => onLoanBook(book.id)}
              >
                {book.available > 0 ? "Emprestar" : "Esgotado"}
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
