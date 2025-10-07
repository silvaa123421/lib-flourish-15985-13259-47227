import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

const categoryData = [
  { name: "Ficção", value: 320 },
  { name: "Romance", value: 245 },
  { name: "Infantil", value: 190 },
  { name: "Fantasia", value: 165 },
  { name: "Técnico", value: 130 },
];

const monthlyData = [
  { month: "Jan", emprestimos: 45, devolucoes: 42 },
  { month: "Fev", emprestimos: 52, devolucoes: 48 },
  { month: "Mar", emprestimos: 48, devolucoes: 51 },
  { month: "Abr", emprestimos: 61, devolucoes: 55 },
  { month: "Mai", emprestimos: 55, devolucoes: 58 },
  { month: "Jun", emprestimos: 67, devolucoes: 60 },
];

const COLORS = ['hsl(217, 91%, 60%)', 'hsl(142, 76%, 36%)', 'hsl(38, 92%, 50%)', 'hsl(0, 84%, 60%)', 'hsl(280, 70%, 50%)'];

export default function Reports() {
  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Relatórios</h1>
        <p className="text-muted-foreground mt-2">
          Estatísticas e análises da biblioteca
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="gradient-card">
          <CardHeader>
            <CardTitle>Livros por Categoria</CardTitle>
            <CardDescription>Distribuição do acervo</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="gradient-card">
          <CardHeader>
            <CardTitle>Empréstimos vs Devoluções</CardTitle>
            <CardDescription>Últimos 6 meses</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="emprestimos" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} />
                <Bar dataKey="devolucoes" fill="hsl(var(--success))" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="gradient-card">
          <CardHeader>
            <CardTitle>Taxa de Ocupação</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">72%</div>
            <p className="text-sm text-muted-foreground mt-2">
              do acervo está emprestado
            </p>
          </CardContent>
        </Card>

        <Card className="gradient-card">
          <CardHeader>
            <CardTitle>Taxa de Atraso</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-warning">8%</div>
            <p className="text-sm text-muted-foreground mt-2">
              dos empréstimos estão atrasados
            </p>
          </CardContent>
        </Card>

        <Card className="gradient-card">
          <CardHeader>
            <CardTitle>Média de Empréstimos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-success">2.3</div>
            <p className="text-sm text-muted-foreground mt-2">
              livros por usuário ativo
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
