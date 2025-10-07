import { BookOpen, Users, RefreshCw, AlertCircle } from "lucide-react";
import { StatCard } from "@/components/dashboard/StatCard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const mockData = {
  totalBooks: 1250,
  totalUsers: 320,
  activeLoans: 89,
  overdueLoans: 12,
  monthlyLoans: [
    { month: "Jan", loans: 45 },
    { month: "Fev", loans: 52 },
    { month: "Mar", loans: 48 },
    { month: "Abr", loans: 61 },
    { month: "Mai", loans: 55 },
    { month: "Jun", loans: 67 },
  ],
  topBooks: [
    { title: "1984", author: "George Orwell", loans: 23 },
    { title: "Dom Casmurro", author: "Machado de Assis", loans: 19 },
    { title: "O Pequeno Príncipe", author: "Antoine de Saint-Exupéry", loans: 17 },
    { title: "Harry Potter e a Pedra Filosofal", author: "J.K. Rowling", loans: 15 },
  ],
};

export default function Dashboard() {
  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          Visão geral da biblioteca e estatísticas principais
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total de Livros"
          value={mockData.totalBooks}
          icon={BookOpen}
          description="No acervo"
          trend={{ value: 5, isPositive: true }}
        />
        <StatCard
          title="Usuários Cadastrados"
          value={mockData.totalUsers}
          icon={Users}
          description="Ativos no sistema"
          trend={{ value: 12, isPositive: true }}
        />
        <StatCard
          title="Empréstimos Ativos"
          value={mockData.activeLoans}
          icon={RefreshCw}
          description="Em andamento"
        />
        <StatCard
          title="Empréstimos Atrasados"
          value={mockData.overdueLoans}
          icon={AlertCircle}
          description="Requer atenção"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="gradient-card">
          <CardHeader>
            <CardTitle>Empréstimos por Mês</CardTitle>
            <CardDescription>Últimos 6 meses</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={mockData.monthlyLoans}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="loans" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="gradient-card">
          <CardHeader>
            <CardTitle>Livros Mais Emprestados</CardTitle>
            <CardDescription>Top 4 do período</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockData.topBooks.map((book, index) => (
                <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-primary-light/50">
                  <div>
                    <p className="font-medium">{book.title}</p>
                    <p className="text-sm text-muted-foreground">{book.author}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-primary">{book.loans}</p>
                    <p className="text-xs text-muted-foreground">empréstimos</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
