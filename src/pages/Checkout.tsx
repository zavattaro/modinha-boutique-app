import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CreditCard, Truck, MapPin, User, Phone, Mail, MessageCircle, Smartphone, Tag, Check, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/components/ui/use-toast';
import { MercadoPagoService } from '@/services/mercadoPagoService';
import { CouponService, type CouponValidationResult } from '@/services/couponService';

export default function Checkout() {
  const { items, total, clearCart } = useCart();
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('whatsapp');
  const [paymentMethodId, setPaymentMethodId] = useState('');
  
  // Coupon states
  const [couponCode, setCouponCode] = useState('');
  const [couponValidation, setCouponValidation] = useState<CouponValidationResult | null>(null);
  const [isValidatingCoupon, setIsValidatingCoupon] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState<CouponValidationResult | null>(null);
  
  const [customerInfo, setCustomerInfo] = useState({
    name: profile?.name || '',
    email: user?.email || '',
    phone: profile?.phone || '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    notes: ''
  });

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price);
  };

  const shipping = total >= 299 ? 0 : 29.90;
  const subtotalWithShipping = total + shipping;
  
  // Calculate final amounts with coupon
  const discountAmount = appliedCoupon?.discountAmount || 0;
  const finalTotal = appliedCoupon ? Math.max(subtotalWithShipping - discountAmount, 0) : subtotalWithShipping;

  const handleInputChange = (field: string, value: string) => {
    setCustomerInfo(prev => ({ ...prev, [field]: value }));
  };

  const handleValidateCoupon = async () => {
    if (!couponCode.trim()) return;
    
    setIsValidatingCoupon(true);
    try {
      const result = await CouponService.validateCoupon(couponCode.trim(), subtotalWithShipping);
      setCouponValidation(result);
      
      if (result.valid) {
        toast({
          title: "Cupom válido!",
          description: `Desconto de ${formatPrice(result.discountAmount || 0)} aplicado`,
        });
      } else {
        toast({
          title: "Cupom inválido",
          description: result.error,
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error validating coupon:', error);
      toast({
        title: "Erro",
        description: "Erro ao validar cupom. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsValidatingCoupon(false);
    }
  };

  const handleApplyCoupon = () => {
    if (couponValidation?.valid) {
      setAppliedCoupon(couponValidation);
      setCouponCode('');
      setCouponValidation(null);
      toast({
        title: "Cupom aplicado!",
        description: `Desconto de ${formatPrice(couponValidation.discountAmount || 0)} aplicado com sucesso`,
      });
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode('');
    setCouponValidation(null);
    toast({
      title: "Cupom removido",
      description: "O cupom foi removido do pedido",
    });
  };

  const generateWhatsAppMessage = () => {
    let message = `🛍️ *Novo Pedido - Ubis Shop*\n\n`;
    message += `👤 *Cliente:* ${customerInfo.name}\n`;
    message += `📧 *Email:* ${customerInfo.email}\n`;
    message += `📱 *Telefone:* ${customerInfo.phone}\n`;
    message += `📍 *Endereço:* ${customerInfo.address}, ${customerInfo.city}/${customerInfo.state} - ${customerInfo.zipCode}\n\n`;
    
    message += `🛒 *Itens do Pedido:*\n`;
    items.forEach((item, index) => {
      message += `${index + 1}. *${item.name}*\n`;
      if (item.attributes && Object.keys(item.attributes).length > 0) {
        const attrs = Object.entries(item.attributes).map(([k, v]) => `${k}: ${v}`).join(', ');
        message += `   Opções: ${attrs}\n`;
      }
      message += `   Qtd: ${item.quantity} | Preço: ${formatPrice(item.price)}\n`;
      message += `   Subtotal: ${formatPrice(item.price * item.quantity)}\n\n`;
    });
    
    message += `💰 *Resumo Financeiro:*\n`;
    message += `• Subtotal: ${formatPrice(total)}\n`;
    message += `• Frete: ${shipping === 0 ? 'GRÁTIS' : formatPrice(shipping)}\n`;
    if (appliedCoupon) {
      message += `• Desconto (${appliedCoupon.coupon?.code}): -${formatPrice(discountAmount)}\n`;
    }
    message += `• *Total: ${formatPrice(finalTotal)}*\n\n`;
    
    if (customerInfo.notes) {
      message += `📝 *Observações:* ${customerInfo.notes}\n\n`;
    }
    
    message += `✅ Pedido confirmado pelo site!\n`;
    message += `🕐 ${new Date().toLocaleString('pt-BR')}`;
    
    return encodeURIComponent(message);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!customerInfo.name || !customerInfo.email || !customerInfo.phone || !customerInfo.address) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha todos os campos obrigatórios",
        variant: "destructive"
      });
      return;
    }

    // Validate payment method selection for Mercado Pago
    if ((paymentMethod === 'pix' || paymentMethod === 'credit') && !paymentMethodId) {
      toast({
        title: "Selecione uma forma de pagamento",
        description: "Por favor, selecione uma forma de pagamento válida",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);

    try {
      // Simulate processing
      await new Promise(resolve => setTimeout(resolve, 2000));

      if (paymentMethod === 'whatsapp') {
        // Generate WhatsApp message and redirect
        const message = generateWhatsAppMessage();
        const whatsappUrl = `https://wa.me/5511999999999?text=${message}`;
        
        // Clear cart
        clearCart();
        
        toast({
          title: "Pedido enviado!",
          description: "Você será redirecionado para o WhatsApp para finalizar",
        });
        
        // Open WhatsApp
        window.open(whatsappUrl, '_blank');
        
        // Redirect to success page
        navigate('/pedido-enviado');
      } else if (paymentMethod === 'pix' || paymentMethod === 'credit') {
        // Process Mercado Pago payment
        const [firstName, ...lastNameParts] = customerInfo.name.split(' ');
        const lastName = lastNameParts.join(' ') || firstName;

        const paymentData = {
          transaction_amount: finalTotal,
          description: `Pedido Ubis Shop - ${items.length} item(s)`,
          payment_method_id: paymentMethodId,
          payer: {
            email: customerInfo.email,
            first_name: firstName,
            last_name: lastName,
          },
          items: items.map(item => ({
            title: item.name,
            quantity: item.quantity,
            unit_price: item.price
          })),
          external_reference: `ORDER-${Date.now()}`
        };

        const result = await MercadoPagoService.createPayment(paymentData);

        if (result.success && result.payment) {
          // Clear cart
          clearCart();

          if (result.payment.status === 'approved') {
            toast({
              title: "Pagamento aprovado!",
              description: "Seu pedido foi confirmado com sucesso",
            });
            navigate('/pedido-enviado');
          } else if (result.payment.status === 'pending') {
            if (paymentMethodId === 'pix') {
              toast({
                title: "PIX gerado!",
                description: "Use o código PIX para finalizar o pagamento",
              });
              // Here you could show PIX QR code or copy-paste code
            } else {
              toast({
                title: "Pagamento pendente",
                description: "Aguardando confirmação do pagamento",
              });
            }
            navigate('/pedido-enviado');
          } else if (result.payment.status === 'rejected') {
            toast({
              title: "Pagamento rejeitado",
              description: "Tente novamente ou use outro método de pagamento",
              variant: "destructive"
            });
          }
        } else {
          throw new Error(result.error || 'Erro no processamento do pagamento');
        }
      } else {
        // For future payment integrations
        toast({
          title: "Método de pagamento em breve",
          description: "Esta opção estará disponível em breve. Use o WhatsApp por enquanto.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Payment error:', error);
      toast({
        title: "Erro ao processar pedido",
        description: "Tente novamente ou entre em contato conosco",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (items.length === 0) {
    navigate('/carrinho');
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Finalizar Compra</h1>
        <p className="text-muted-foreground">Complete suas informações para finalizar o pedido</p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Customer Information */}
          <div className="lg:col-span-2 space-y-6">
            {/* Personal Info */}
            <Card className="bg-gradient-card border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Informações Pessoais
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Nome completo *</Label>
                    <Input
                      id="name"
                      value={customerInfo.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      placeholder="Seu nome completo"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Telefone *</Label>
                    <Input
                      id="phone"
                      value={customerInfo.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      placeholder="(11) 99999-9999"
                      required
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={customerInfo.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="seu@email.com"
                    required
                  />
                </div>
              </CardContent>
            </Card>

            {/* Shipping Address */}
            <Card className="bg-gradient-card border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  Endereço de Entrega
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="address">Endereço completo *</Label>
                  <Input
                    id="address"
                    value={customerInfo.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    placeholder="Rua, número, complemento"
                    required
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="city">Cidade *</Label>
                    <Input
                      id="city"
                      value={customerInfo.city}
                      onChange={(e) => handleInputChange('city', e.target.value)}
                      placeholder="Cidade"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="state">Estado *</Label>
                    <Input
                      id="state"
                      value={customerInfo.state}
                      onChange={(e) => handleInputChange('state', e.target.value)}
                      placeholder="SP"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="zipCode">CEP *</Label>
                    <Input
                      id="zipCode"
                      value={customerInfo.zipCode}
                      onChange={(e) => handleInputChange('zipCode', e.target.value)}
                      placeholder="00000-000"
                      required
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Payment Method */}
            <Card className="bg-gradient-card border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5" />
                  Forma de Pagamento
                </CardTitle>
              </CardHeader>
              <CardContent>
                <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod} className="space-y-3">
                  <div className="flex items-center space-x-2 p-4 border rounded-lg">
                    <RadioGroupItem value="whatsapp" id="whatsapp" />
                    <Label htmlFor="whatsapp" className="flex-1 cursor-pointer">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <MessageCircle className="w-5 h-5 text-green-600" />
                          <div>
                            <p className="font-medium">WhatsApp</p>
                            <p className="text-sm text-muted-foreground">
                              Finalize via WhatsApp com nosso atendente
                            </p>
                          </div>
                        </div>
                        <div className="text-green-600 font-bold">Recomendado</div>
                      </div>
                    </Label>
                  </div>
                  
                  <div className="flex items-center space-x-2 p-4 border rounded-lg">
                    <RadioGroupItem value="pix" id="pix" />
                    <Label htmlFor="pix" className="flex-1 cursor-pointer">
                      <div className="flex items-center gap-2">
                        <Smartphone className="w-5 h-5 text-blue-600" />
                        <div>
                          <p className="font-medium">PIX</p>
                          <p className="text-sm text-muted-foreground">
                            Pagamento instantâneo via PIX
                          </p>
                        </div>
                      </div>
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2 p-4 border rounded-lg">
                    <RadioGroupItem value="credit" id="credit" />
                    <Label htmlFor="credit" className="flex-1 cursor-pointer">
                      <div className="flex items-center gap-2">
                        <CreditCard className="w-5 h-5 text-purple-600" />
                        <div>
                          <p className="font-medium">Cartão de Crédito</p>
                          <p className="text-sm text-muted-foreground">
                            Pagamento via Mercado Pago
                          </p>
                        </div>
                      </div>
                    </Label>
                  </div>
                </RadioGroup>

                {/* Payment Method Selection for Mercado Pago */}
                {(paymentMethod === 'pix' || paymentMethod === 'credit') && (
                  <div className="mt-4 p-4 bg-muted/30 rounded-lg">
                    <Label htmlFor="paymentMethodSelect" className="text-sm font-medium">
                      {paymentMethod === 'pix' ? 'Confirme o PIX:' : 'Selecione o cartão:'}
                    </Label>
                    <Select value={paymentMethodId} onValueChange={setPaymentMethodId}>
                      <SelectTrigger className="mt-2">
                        <SelectValue placeholder={
                          paymentMethod === 'pix' 
                            ? 'Selecionar PIX' 
                            : 'Selecione seu cartão'
                        } />
                      </SelectTrigger>
                      <SelectContent>
                        {paymentMethod === 'pix' ? (
                          <SelectItem value="pix">PIX - Pagamento Instantâneo</SelectItem>
                        ) : (
                          MercadoPagoService.getPaymentMethods()
                            .filter(method => method.type === 'credit_card')
                            .map(method => (
                              <SelectItem key={method.id} value={method.id}>
                                {method.name}
                              </SelectItem>
                            ))
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Coupon Section */}
            <Card className="bg-gradient-card border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Tag className="w-5 h-5" />
                  Cupom de Desconto
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {!appliedCoupon ? (
                  <div className="space-y-3">
                    <div className="flex gap-2">
                      <Input
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                        placeholder="Digite o código do cupom"
                        disabled={isValidatingCoupon}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleValidateCoupon}
                        disabled={!couponCode.trim() || isValidatingCoupon}
                      >
                        {isValidatingCoupon ? 'Validando...' : 'Validar'}
                      </Button>
                    </div>
                    
                    {couponValidation && (
                      <div className={`p-3 rounded-lg border ${
                        couponValidation.valid 
                          ? 'bg-green-50 border-green-200 text-green-800' 
                          : 'bg-red-50 border-red-200 text-red-800'
                      }`}>
                        <div className="flex items-center gap-2">
                          {couponValidation.valid ? (
                            <Check className="w-4 h-4" />
                          ) : (
                            <AlertCircle className="w-4 h-4" />
                          )}
                          <span className="text-sm font-medium">
                            {couponValidation.valid ? 'Cupom válido!' : 'Cupom inválido'}
                          </span>
                        </div>
                        {couponValidation.valid ? (
                          <div className="mt-2 space-y-1 text-xs">
                            <p>Desconto: {formatPrice(couponValidation.discountAmount || 0)}</p>
                            <p className="font-medium">Você pagará: {formatPrice(couponValidation.finalAmount || 0)}</p>
                            <Button
                              type="button"
                              size="sm"
                              className="mt-2"
                              onClick={handleApplyCoupon}
                            >
                              Aplicar Cupom
                            </Button>
                          </div>
                        ) : (
                          <p className="mt-1 text-xs">{couponValidation.error}</p>
                        )}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="p-3 rounded-lg border bg-green-50 border-green-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-green-800">
                        <Check className="w-4 h-4" />
                        <span className="font-medium">Cupom {appliedCoupon.coupon?.code} aplicado</span>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={handleRemoveCoupon}
                        className="text-red-600 hover:text-red-700"
                      >
                        Remover
                      </Button>
                    </div>
                    <div className="mt-2 space-y-1 text-xs text-green-700">
                      <p>Desconto aplicado: {formatPrice(discountAmount)}</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Notes */}
            <Card className="bg-gradient-card border-border/50">
              <CardHeader>
                <CardTitle>Observações</CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={customerInfo.notes}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                  placeholder="Alguma observação sobre o pedido? (opcional)"
                  rows={3}
                />
              </CardContent>
            </Card>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-8 bg-gradient-card border-border/50 shadow-elegant">
              <CardHeader>
                <CardTitle>Resumo do Pedido</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Items */}
                <div className="space-y-3">
                  {items.map((item) => (
                    <div key={item.id} className="flex gap-3">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-12 h-12 rounded object-cover bg-muted"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{item.name}</p>
                        {item.attributes && (
                          <p className="text-xs text-muted-foreground">
                            {Object.entries(item.attributes).map(([k, v]) => `${k}: ${v}`).join(', ')}
                          </p>
                        )}
                        <p className="text-sm">
                          {item.quantity}x {formatPrice(item.price)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <Separator />

                {/* Totals */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Subtotal</span>
                    <span>{formatPrice(total)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Frete</span>
                    <span className={shipping === 0 ? 'text-green-600' : ''}>
                      {shipping === 0 ? 'GRÁTIS' : formatPrice(shipping)}
                    </span>
                  </div>
                  {appliedCoupon && (
                    <div className="flex justify-between text-sm text-green-600">
                      <span>Desconto ({appliedCoupon.coupon?.code})</span>
                      <span>-{formatPrice(discountAmount)}</span>
                    </div>
                  )}
                  <Separator />
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span className="text-primary">{formatPrice(finalTotal)}</span>
                  </div>
                  {appliedCoupon && (
                    <div className="text-xs text-green-600 text-center">
                      Você economizou {formatPrice(discountAmount)}!
                    </div>
                  )}
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  className="w-full"
                  variant="gradient"
                  size="lg"
                  disabled={isLoading}
                >
                  {isLoading ? 'Processando...' : (
                    paymentMethod === 'whatsapp' 
                      ? 'Enviar para WhatsApp' 
                      : paymentMethod === 'pix'
                      ? 'Pagar com PIX'
                      : paymentMethod === 'credit'
                      ? 'Pagar com Cartão'
                      : 'Finalizar Compra'
                  )}
                </Button>

                {/* Security */}
                <div className="text-center text-xs text-muted-foreground">
                  🔒 Seus dados estão protegidos
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </div>
  );
}