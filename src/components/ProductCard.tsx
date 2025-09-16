import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingCart, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Product } from '@/types';
import { useCart } from '@/contexts/CartContext';
import { cn } from '@/lib/utils';

interface ProductCardProps {
  product: Product;
  className?: string;
}

export default function ProductCard({ product, className }: ProductCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const { addToCart } = useCart();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product, 1);
  };

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsWishlisted(!isWishlisted);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price);
  };

  const getCategoryBadge = (category: string) => {
    const badges = {
      'roupas-femininas': { text: 'Feminino', variant: 'secondary' as const },
      'roupas-masculinas': { text: 'Masculino', variant: 'outline' as const },
      'utilidades': { text: 'Utilidade', variant: 'default' as const }
    };
    return badges[category as keyof typeof badges] || { text: 'Produto', variant: 'default' as const };
  };

  return (
    <Card 
      className={cn(
        "group cursor-pointer transition-all duration-300 hover:shadow-elegant hover:-translate-y-1 bg-gradient-card border-border/50",
        className
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Link to={`/produto/${product.id}`}>
        <CardContent className="p-0">
          {/* Image Container */}
          <div className="relative overflow-hidden rounded-t-lg aspect-square bg-muted/50">
            <img
              src={product.images[0]}
              alt={product.name}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            />
            
            {/* Overlay Actions */}
            <div className={cn(
              "absolute inset-0 bg-black/40 transition-opacity duration-300 flex items-center justify-center gap-2",
              isHovered ? "opacity-100" : "opacity-0"
            )}>
              <Button
                size="icon"
                variant="secondary"
                onClick={handleAddToCart}
                className="shadow-lg hover:scale-110 transition-transform"
              >
                <ShoppingCart className="w-4 h-4" />
              </Button>
              <Button
                size="icon"
                variant="secondary"
                onClick={handleWishlist}
                className="shadow-lg hover:scale-110 transition-transform"
              >
                <Heart className={cn("w-4 h-4", isWishlisted && "fill-red-500 text-red-500")} />
              </Button>
              <Button
                size="icon"
                variant="secondary"
                asChild
                className="shadow-lg hover:scale-110 transition-transform"
              >
                <Link to={`/produto/${product.id}`}>
                  <Eye className="w-4 h-4" />
                </Link>
              </Button>
            </div>

            {/* Badges */}
            <div className="absolute top-3 left-3 flex flex-col gap-2">
              {product.featured && (
                <Badge variant="default" className="bg-gradient-primary text-white shadow-glow">
                  Destaque
                </Badge>
              )}
              <Badge variant={getCategoryBadge(product.category).variant}>
                {getCategoryBadge(product.category).text}
              </Badge>
            </div>

            {/* Stock Badge */}
            {product.stock < 10 && product.stock > 0 && (
              <div className="absolute top-3 right-3">
                <Badge variant="destructive">
                  Últimas {product.stock}
                </Badge>
              </div>
            )}
            
            {product.stock === 0 && (
              <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                <Badge variant="destructive" className="text-lg px-4 py-2">
                  Esgotado
                </Badge>
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="p-4">
            <div className="space-y-2">
              {/* Product Name */}
              <h3 className="font-semibold text-sm leading-tight group-hover:text-primary transition-colors line-clamp-2">
                {product.name}
              </h3>

              {/* Price */}
              <div className="flex items-center justify-between">
                <span className="text-lg font-bold text-primary">
                  {formatPrice(product.price)}
                </span>
                {product.variations && product.variations.length > 1 && (
                  <span className="text-xs text-muted-foreground">
                    +{product.variations.length - 1} variações
                  </span>
                )}
              </div>

              {/* Quick Add to Cart */}
              <Button
                onClick={handleAddToCart}
                disabled={product.stock === 0}
                className="w-full transition-all duration-200 hover:shadow-elegant"
                variant="gradient"
                size="sm"
              >
                {product.stock === 0 ? 'Indisponível' : 'Adicionar ao Carrinho'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Link>
    </Card>
  );
}