import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShoppingBag, User, Search, Menu, X, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import ubisLogo from '@/assets/ubis-logo.jpg';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { user, profile, logout } = useAuth();
  const { itemCount } = useCart();
  const location = useLocation();

  const navigation = [
    { name: 'Home', href: '/' },
    { name: 'Roupas Femininas', href: '/produtos?categoria=roupas-femininas' },
    { name: 'Roupas Masculinas', href: '/produtos?categoria=roupas-masculinas' },
    { name: 'Utilidades', href: '/produtos?categoria=utilidades' },
  ];

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path.split('?')[0]);
  };

  return (
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-md border-b border-border shadow-card">
      {/* Top Bar */}
      <div className="bg-gradient-primary text-white text-center py-2 text-sm font-medium">
        📦 Frete grátis para compras acima de R$ 299 | 🏆 Loja oficial Ubis Shop - Sua confiança, nossa prioridade
      </div>

      {/* Main Header */}
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3 hover:opacity-90 transition-opacity">
            <img 
              src={ubisLogo} 
              alt="Ubis Shop Logo" 
              className="w-12 h-12 object-contain rounded-lg shadow-sm"
            />
            <div>
              <h1 className="text-xl font-bold text-foreground">
                Ubis Shop
              </h1>
              <p className="text-xs text-muted-foreground">Mais que uma carona, uma conveniência</p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex space-x-8">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`text-sm font-medium transition-colors hover:text-primary relative py-2 ${
                  isActive(item.href) 
                    ? 'text-primary after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-primary' 
                    : 'text-foreground hover:text-primary'
                }`}
              >
                {item.name}
              </Link>
            ))}
          </nav>

          {/* Search Bar */}
          <div className="hidden md:flex items-center space-x-2 flex-1 max-w-md mx-8">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Buscar produtos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-muted/30 border border-input focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              />
            </div>
          </div>

          {/* Right Actions */}
          <div className="flex items-center space-x-4">
            {/* User Menu */}
            {user ? (
              <div className="hidden md:flex items-center space-x-2">
                <span className="text-sm text-muted-foreground">Olá, {profile?.name?.split(' ')[0]}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={logout}
                  className="text-sm"
                >
                  Sair
                </Button>
              </div>
            ) : (
              <div className="hidden md:flex items-center space-x-2">
                <Link to="/login">
                  <Button variant="ghost" size="sm" className="flex items-center space-x-2">
                    <User className="w-4 h-4" />
                    <span>Entrar</span>
                  </Button>
                </Link>
              </div>
            )}

            {/* Wishlist */}
            <Button variant="ghost" size="icon" className="hidden md:flex">
              <Heart className="w-5 h-5" />
            </Button>

            {/* Cart */}
            <Link to="/carrinho">
              <Button variant="ghost" size="icon" className="relative">
                <ShoppingBag className="w-5 h-5" />
                {itemCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-primary text-primary-foreground rounded-full w-6 h-6 text-xs flex items-center justify-center font-medium">
                    {itemCount}
                  </span>
                )}
              </Button>
            </Link>

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Search */}
        <div className="md:hidden pb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Buscar produtos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-muted/30 border border-input"
            />
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="lg:hidden border-t border-border bg-background">
          <div className="container mx-auto px-4 py-4 space-y-4">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`block py-2 text-sm font-medium transition-colors hover:text-primary ${
                  isActive(item.href) ? 'text-primary' : 'text-foreground'
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                {item.name}
              </Link>
            ))}
            <div className="border-t border-border pt-4">
              {user ? (
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Olá, {profile?.name}</p>
                  <Button variant="ghost" onClick={logout} className="w-full justify-start">
                    Sair
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  <Link to="/login" onClick={() => setIsMenuOpen(false)}>
                    <Button variant="ghost" className="w-full justify-start">
                      <User className="w-4 h-4 mr-2" />
                      Entrar
                    </Button>
                  </Link>
                  <Link to="/cadastro" onClick={() => setIsMenuOpen(false)}>
                    <Button variant="outline" className="w-full">
                      Cadastrar
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}