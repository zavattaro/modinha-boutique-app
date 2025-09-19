import { useState, useEffect } from 'react';
import { Plus, Users, Tag, TrendingUp, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface Affiliate {
  id: string;
  name: string;
  email: string;
  phone?: string;
  balance: number;
  commission_rate: number;
  status: string;
  created_at: string;
  coupons?: {
    id: string;
    code: string;
    usage_count: number;
    max_usage?: number;
  }[];
}

interface CouponTransaction {
  id: string;
  order_reference: string;
  original_amount: number;
  discount_amount: number;
  commission_amount: number;
  final_amount: number;
  created_at: string;
  customer_info: any;
  coupon: {
    code: string;
  };
  affiliate: {
    name: string;
  };
}

export default function AdminAffiliates() {
  const [affiliates, setAffiliates] = useState<Affiliate[]>([]);
  const [transactions, setTransactions] = useState<CouponTransaction[]>([]);
  const [selectedAffiliate, setSelectedAffiliate] = useState<string | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isTransactionsDialogOpen, setIsTransactionsDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [newAffiliate, setNewAffiliate] = useState({
    name: '',
    email: '',
    phone: '',
    commission_rate: 10
  });

  useEffect(() => {
    fetchAffiliates();
  }, []);

  const fetchAffiliates = async () => {
    try {
      const { data, error } = await supabase
        .from('affiliates')
        .select(`
          *,
          coupons (
            id,
            code,
            usage_count,
            max_usage
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAffiliates(data || []);
    } catch (error) {
      console.error('Error fetching affiliates:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os afiliados",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchTransactions = async (affiliateId: string) => {
    try {
      const { data, error } = await supabase
        .from('coupon_transactions')
        .select(`
          *,
          coupon:coupons(code),
          affiliate:affiliates(name)
        `)
        .eq('affiliate_id', affiliateId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTransactions(data || []);
    } catch (error) {
      console.error('Error fetching transactions:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as transações",
        variant: "destructive"
      });
    }
  };

  const createAffiliate = async () => {
    if (!newAffiliate.name || !newAffiliate.email) {
      toast({
        title: "Campos obrigatórios",
        description: "Nome e email são obrigatórios",
        variant: "destructive"
      });
      return;
    }

    try {
      // Create affiliate
      const { data: affiliate, error: affiliateError } = await supabase
        .from('affiliates')
        .insert({
          name: newAffiliate.name,
          email: newAffiliate.email,
          phone: newAffiliate.phone || null,
          commission_rate: newAffiliate.commission_rate
        })
        .select()
        .single();

      if (affiliateError) throw affiliateError;

      // Create coupon for affiliate
      const couponCode = `${newAffiliate.name.toUpperCase().replace(/\s+/g, '').slice(0, 8)}${Math.random().toString(36).substr(2, 4).toUpperCase()}`;
      
      const { error: couponError } = await supabase
        .from('coupons')
        .insert({
          code: couponCode,
          affiliate_id: affiliate.id,
          discount_rate: newAffiliate.commission_rate
        });

      if (couponError) throw couponError;

      toast({
        title: "Afiliado criado com sucesso!",
        description: `Cupom ${couponCode} gerado automaticamente`
      });

      setIsCreateDialogOpen(false);
      setNewAffiliate({ name: '', email: '', phone: '', commission_rate: 10 });
      fetchAffiliates();
    } catch (error) {
      console.error('Error creating affiliate:', error);
      toast({
        title: "Erro",
        description: "Não foi possível criar o afiliado",
        variant: "destructive"
      });
    }
  };

  const openTransactions = (affiliateId: string) => {
    setSelectedAffiliate(affiliateId);
    fetchTransactions(affiliateId);
    setIsTransactionsDialogOpen(true);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-secondary flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Carregando afiliados...</p>
        </div>
      </div>
    );
  }

  const totalCommissions = affiliates.reduce((sum, affiliate) => sum + (affiliate.balance || 0), 0);
  const totalAffiliates = affiliates.length;
  const activeAffiliates = affiliates.filter(a => a.status === 'active').length;

  return (
    <div className="min-h-screen bg-gradient-secondary p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Gestão de Afiliados</h1>
            <p className="text-muted-foreground">Gerencie afiliados, cupons e comissões</p>
          </div>
          
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Novo Afiliado
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Criar Novo Afiliado</DialogTitle>
                <DialogDescription>
                  Um cupom será gerado automaticamente para este afiliado
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Nome *</Label>
                  <Input
                    id="name"
                    value={newAffiliate.name}
                    onChange={(e) => setNewAffiliate({ ...newAffiliate, name: e.target.value })}
                    placeholder="Nome do afiliado"
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={newAffiliate.email}
                    onChange={(e) => setNewAffiliate({ ...newAffiliate, email: e.target.value })}
                    placeholder="email@exemplo.com"
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Telefone</Label>
                  <Input
                    id="phone"
                    value={newAffiliate.phone}
                    onChange={(e) => setNewAffiliate({ ...newAffiliate, phone: e.target.value })}
                    placeholder="(11) 99999-9999"
                  />
                </div>
                <div>
                  <Label htmlFor="commission">Taxa de Comissão (%)</Label>
                  <Input
                    id="commission"
                    type="number"
                    min="1"
                    max="50"
                    value={newAffiliate.commission_rate}
                    onChange={(e) => setNewAffiliate({ ...newAffiliate, commission_rate: parseFloat(e.target.value) || 10 })}
                  />
                </div>
                <Button onClick={createAffiliate} className="w-full">
                  Criar Afiliado
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total de Afiliados</CardTitle>
              <Users className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalAffiliates}</div>
              <p className="text-xs text-muted-foreground">
                {activeAffiliates} ativos
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Comissões Totais</CardTitle>
              <TrendingUp className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(totalCommissions)}</div>
              <p className="text-xs text-muted-foreground">
                A pagar aos afiliados
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Cupons Ativos</CardTitle>
              <Tag className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {affiliates.reduce((sum, affiliate) => sum + (affiliate.coupons?.length || 0), 0)}
              </div>
              <p className="text-xs text-muted-foreground">
                Em circulação
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Affiliates Table */}
        <Card>
          <CardHeader>
            <CardTitle>Afiliados Cadastrados</CardTitle>
            <CardDescription>
              Gerencie todos os afiliados e seus cupons de desconto
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Cupons</TableHead>
                  <TableHead>Saldo</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {affiliates.map((affiliate) => (
                  <TableRow key={affiliate.id}>
                    <TableCell className="font-medium">{affiliate.name}</TableCell>
                    <TableCell>{affiliate.email}</TableCell>
                    <TableCell>
                      {affiliate.coupons?.map((coupon) => (
                        <Badge key={coupon.id} variant="outline" className="mr-1">
                          {coupon.code}
                          {coupon.max_usage && (
                            <span className="ml-1 text-xs">
                              ({coupon.usage_count}/{coupon.max_usage})
                            </span>
                          )}
                        </Badge>
                      ))}
                    </TableCell>
                    <TableCell>
                      <span className="font-medium text-green-600">
                        {formatCurrency(affiliate.balance || 0)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge variant={affiliate.status === 'active' ? 'default' : 'secondary'}>
                        {affiliate.status === 'active' ? 'Ativo' : 'Inativo'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openTransactions(affiliate.id)}
                        className="flex items-center gap-1"
                      >
                        <Eye className="w-4 h-4" />
                        Ver Vendas
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Transactions Dialog */}
        <Dialog open={isTransactionsDialogOpen} onOpenChange={setIsTransactionsDialogOpen}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>Histórico de Vendas do Afiliado</DialogTitle>
              <DialogDescription>
                Todas as vendas realizadas com os cupons deste afiliado
              </DialogDescription>
            </DialogHeader>
            <div className="max-h-96 overflow-y-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data</TableHead>
                    <TableHead>Cupom</TableHead>
                    <TableHead>Valor Original</TableHead>
                    <TableHead>Desconto</TableHead>
                    <TableHead>Comissão</TableHead>
                    <TableHead>Cliente</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell>{formatDate(transaction.created_at)}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{transaction.coupon?.code}</Badge>
                      </TableCell>
                      <TableCell>{formatCurrency(transaction.original_amount)}</TableCell>
                      <TableCell className="text-red-600">
                        -{formatCurrency(transaction.discount_amount)}
                      </TableCell>
                      <TableCell className="text-green-600 font-medium">
                        +{formatCurrency(transaction.commission_amount)}
                      </TableCell>
                      <TableCell>
                        {transaction.customer_info?.name || 'N/A'}
                      </TableCell>
                    </TableRow>
                  ))}
                  {transactions.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-muted-foreground">
                        Nenhuma venda registrada ainda
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}