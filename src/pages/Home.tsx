import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles, TrendingUp, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import ProductCard from '@/components/ProductCard';
import { mockProducts, categories } from '@/data/mockProducts';
import { Product } from '@/types';

export default function Home() {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [newProducts, setNewProducts] = useState<Product[]>([]);

  useEffect(() => {
    // Filter featured products
    const featured = mockProducts.filter(p => p.featured).slice(0, 4);
    setFeaturedProducts(featured);

    // Get newest products (sort by creation date)
    const newest = [...mockProducts]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 4);
    setNewProducts(newest);
  }, []);

  return (
    <div className="min-h-screen">
        {/* Hero Section */}
        <section className="relative py-20 px-4 bg-gradient-hero overflow-hidden">
          <div className="absolute inset-0 bg-black/30"></div>
          <div className="relative container mx-auto text-center text-white">
            <div className="max-w-4xl mx-auto space-y-8">
              <div className="space-y-4">
                <h1 className="text-5xl md:text-7xl font-bold leading-tight">
                  Ubis Shop
                  <span className="block bg-gradient-to-r from-orange-400 to-orange-200 bg-clip-text text-transparent">
                    Mais que uma carona
                  </span>
                </h1>
                <p className="text-xl md:text-2xl text-white/90 max-w-2xl mx-auto">
                  Sua loja de confiança para roupas e utilidades modernas. Qualidade e conveniência em um só lugar.
                </p>
              </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link to="/produtos">
                <Button variant="hero" size="xl" className="min-w-48">
                  Explorar Produtos
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>
              <Link to="/produtos?categoria=utilidades">
                <Button variant="outline" size="xl" className="min-w-48 bg-white/10 border-white text-white hover:bg-white hover:text-gray-900">
                  Ver Utilidades
                  <Sparkles className="w-5 h-5" />
                </Button>
              </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
              <div className="text-center">
                <div className="text-3xl font-bold">500+</div>
                <div className="text-white/80">Produtos</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold">50k+</div>
                <div className="text-white/80">Clientes</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold">4.9★</div>
                <div className="text-white/80">Avaliação</div>
              </div>
            </div>
          </div>
        </div>

        {/* Floating Elements */}
        <div className="absolute top-20 left-10 w-20 h-20 bg-white/10 rounded-full blur-xl animate-pulse"></div>
        <div className="absolute bottom-32 right-16 w-32 h-32 bg-white/5 rounded-full blur-2xl animate-pulse delay-700"></div>
      </section>

      {/* Categories Section */}
      <section className="py-20 px-4 bg-gradient-secondary">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">Categorias</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Explore nossas categorias de produtos e encontre exatamente o que você procura
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {categories.map((category) => (
              <Link key={category.id} to={`/produtos?categoria=${category.slug}`}>
                <Card className="group cursor-pointer transition-all duration-300 hover:shadow-elegant hover:-translate-y-2 bg-gradient-card border-border/50">
                  <CardContent className="p-8 text-center">
                    <div className="space-y-4">
                      <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
                        {category.slug === 'roupas-femininas' && <Users className="w-8 h-8 text-white" />}
                        {category.slug === 'roupas-masculinas' && <TrendingUp className="w-8 h-8 text-white" />}
                        {category.slug === 'utilidades' && <Sparkles className="w-8 h-8 text-white" />}
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold mb-2 group-hover:text-primary transition-colors">
                          {category.name}
                        </h3>
                        <p className="text-muted-foreground">
                          {category.description}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">Produtos em Destaque</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Os produtos mais amados pelos nossos clientes
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          <div className="text-center">
            <Link to="/produtos">
              <Button variant="gradient" size="lg">
                Ver Todos os Produtos
                <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* New Products */}
      <section className="py-20 px-4 bg-gradient-secondary">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">Lançamentos</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              As últimas novidades que chegaram na nossa loja
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {newProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-primary text-white">
        <div className="container mx-auto text-center">
          <div className="max-w-3xl mx-auto space-y-8">
            <h2 className="text-4xl md:text-5xl font-bold">
              Pronto para renovar seu estilo?
            </h2>
            <p className="text-xl text-white/90">
              Cadastre-se agora e receba 10% de desconto na primeira compra
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/cadastro">
                <Button variant="secondary" size="xl" className="min-w-48">
                  Criar Conta
                </Button>
              </Link>
              <Link to="/produtos">
                <Button variant="outline" size="xl" className="min-w-48 border-white text-white hover:bg-white hover:text-gray-900">
                  Continuar Navegando
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}