import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabaseClient } from "@/lib/supabase-helper";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { BookOpen, Users, TrendingUp, Clock } from "lucide-react";

const COLORS = ["hsl(var(--primary))", "hsl(var(--success))", "hsl(var(--warning))", "hsl(var(--destructive))"];

export default function Reports() {
  const [stats, setStats] = useState({
    totalBooks: 0,
    totalUsers: 0,
    activeLoans: 0,
    overdueLoans: 0
  });
  const [loansByMonth, setLoansByMonth] = useState<any[]>([]);
  const [topBooks, setTopBooks] = useState<any[]>([]);
  const [loanStatus, setLoanStatus] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReportData();
  }, []);

  const fetchReportData = async () => {
    setLoading(true);

    // Fetch basic stats
    const { data: books } = await supabaseClient.from("books").select("*");
    const { data: users } = await supabaseClient.from("profiles").select("*");
    const { data: loans } = await supabaseClient.from("loans").select("*");

    if (books && users && loans) {
      const today = new Date();
      const activeLoans = loans.filter(l => !l.return_date).length;
      const overdueLoans = loans.filter(l => {
        if (l.return_date) return false;
        const dueDate = new Date(l.due_date);
        return dueDate < today;
      }).length;

      setStats({
        totalBooks: books.length,
        totalUsers: users.length,
        activeLoans,
        overdueLoans
      });

      // Loans by month
      const monthlyLoans: { [key: string]: number } = {};
      loans.forEach(loan => {
        const date = new Date(loan.loan_date);
        const monthYear = `${date.toLocaleDateString('pt-BR', { month: 'short' })}/${date.getFullYear()}`;
        monthlyLoans[monthYear] = (monthlyLoans[monthYear] || 0) + 1;
      });

      const sortedMonths = Object.entries(monthlyLoans)
        .sort((a, b) => {
          const [monthA, yearA] = a[0].split('/');
          const [monthB, yearB] = b[0].split('/');
          return new Date(`${monthA} 1, ${yearA}`).getTime() - new Date(`${monthB} 1, ${yearB}`).getTime();
        })
        .slice(-6);

      setLoansByMonth(sortedMonths.map(([month, count]) => ({ month, empréstimos: count })));

      // Top books
      const { data: loansWithBooks } = await supabaseClient
        .from("loans")
        .select("book_id, books(title)");

      if (loansWithBooks) {
        const bookCounts: { [key: string]: { title: string; count: number } } = {};
        loansWithBooks.forEach((loan: any) => {
          const bookId = loan.book_id;
          const title = loan.books?.title || "Desconhecido";
          if (!bookCounts[bookId]) {
            bookCounts[bookId] = { title, count: 0 };
          }
          bookCounts[bookId].count++;
        });

        const topBooksList = Object.values(bookCounts)
          .sort((a, b) => b.count - a.count)
          .slice(0, 5)
          .map(book => ({ nome: book.title, empréstimos: book.count }));

        setTopBooks(topBooksList);
      }

      // Loan status distribution
      const returnedCount = loans.filter(l => l.return_date).length;
      setLoanStatus([
        { name: "Ativos", value: activeLoans },
        { name: "Atrasados", value: overdueLoans },
        { name: "Devolvidos", value: returnedCount }
      ]);
    }

    setLoading(false);
  };

  if (loading) {
    return (
      <div className="p-8 space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Relatórios</h1>
          <p className="text-muted-foreground mt-2">
            Estatísticas e análises da biblioteca
          </p>
        </div>
        <div className="text-center py-8">Carregando relatórios...</div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Relatórios</h1>
        <p className="text-muted-foreground mt-2">
          Estatísticas e análises da biblioteca
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Livros</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalBooks}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Usuários</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Empréstimos Ativos</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeLoans}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Atrasados</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{stats.overdueLoans}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Empréstimos por Mês</CardTitle>
            <CardDescription>Últimos 6 meses</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={loansByMonth}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="empréstimos" fill="hsl(var(--primary))" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Status dos Empréstimos</CardTitle>
            <CardDescription>Distribuição atual</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={loanStatus}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {loanStatus.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Livros Mais Emprestados</CardTitle>
          <CardDescription>Top 5 livros</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={topBooks} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="nome" type="category" width={150} />
              <Tooltip />
              <Legend />
              <Bar dataKey="empréstimos" fill="hsl(var(--success))" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
