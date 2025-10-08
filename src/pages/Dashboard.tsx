import { useState, useEffect } from "react";
import { BookOpen, Users, RefreshCw, AlertCircle } from "lucide-react";
import { StatCard } from "@/components/dashboard/StatCard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { supabaseClient } from "@/lib/supabase-helper";

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalBooks: 0,
    totalUsers: 0,
    activeLoans: 0,
    overdueLoans: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      const { data: books } = await supabaseClient.from("books").select("*");
      const { data: profiles } = await supabaseClient.from("profiles").select("*");
      const { data: loans } = await supabaseClient.from("loans").select("*").eq("status", "active");
      
      const overdueLoans = (loans as any)?.filter((loan: any) => {
        const dueDate = new Date(loan.due_date);
        return dueDate < new Date() && loan.return_date === null;
      }) || [];

      setStats({
        totalBooks: books?.length || 0,
        totalUsers: profiles?.length || 0,
        activeLoans: loans?.length || 0,
        overdueLoans: overdueLoans.length,
      });
    };

    fetchStats();
  }, []);

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
          value={stats.totalBooks}
          icon={BookOpen}
          description="No acervo"
        />
        <StatCard
          title="Usuários Cadastrados"
          value={stats.totalUsers}
          icon={Users}
          description="Ativos no sistema"
        />
        <StatCard
          title="Empréstimos Ativos"
          value={stats.activeLoans}
          icon={RefreshCw}
          description="Em andamento"
        />
        <StatCard
          title="Empréstimos Atrasados"
          value={stats.overdueLoans}
          icon={AlertCircle}
          description="Requer atenção"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="gradient-card">
          <CardHeader>
            <CardTitle>Empréstimos por Mês</CardTitle>
            <CardDescription>Dados serão atualizados conforme o uso</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] flex items-center justify-center text-muted-foreground">
              Dados em tempo real serão exibidos aqui
            </div>
          </CardContent>
        </Card>

        <Card className="gradient-card">
          <CardHeader>
            <CardTitle>Livros Mais Emprestados</CardTitle>
            <CardDescription>Dados serão atualizados conforme o uso</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] flex items-center justify-center text-muted-foreground">
              Dados em tempo real serão exibidos aqui
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
