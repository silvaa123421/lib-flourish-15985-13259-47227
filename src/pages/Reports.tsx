import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function Reports() {
  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Relatórios</h1>
        <p className="text-muted-foreground mt-2">
          Estatísticas e análises da biblioteca
        </p>
      </div>

      <Card className="gradient-card">
        <CardHeader>
          <CardTitle>Relatórios</CardTitle>
          <CardDescription>Estatísticas detalhadas serão geradas conforme o uso do sistema</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[400px] flex items-center justify-center text-muted-foreground">
            Os relatórios serão populados automaticamente com base nos dados reais
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
