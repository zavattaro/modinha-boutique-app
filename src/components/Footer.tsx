import { Link } from 'react-router-dom';
import { Instagram, MessageCircle, Mail, Phone, MapPin } from 'lucide-react';
import ubisLogo from '@/assets/ubis-logo.jpg';

export default function Footer() {
  return (
    <footer className="bg-gradient-card border-t border-border mt-20">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <img 
                src={ubisLogo} 
                alt="Ubis Shop Logo" 
                className="w-10 h-10 object-contain rounded-lg shadow-sm"
              />
              <div>
                <h3 className="text-lg font-bold text-foreground">
                  Ubis Shop
                </h3>
                <p className="text-xs text-muted-foreground">Mais que uma carona, uma conveniência</p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              Sua loja de roupas e utilidades modernas. Qualidade, confiança e conveniência em um só lugar.
            </p>
            <div className="flex space-x-4">
              <a
                href="https://instagram.com/ubis_shop"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary transition-colors"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a
                href="https://wa.me/5511999999999"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary transition-colors"
              >
                <MessageCircle className="w-5 h-5" />
              </a>
              <a
                href="mailto:contato@ubisshop.com"
                className="text-muted-foreground hover:text-primary transition-colors"
              >
                <Mail className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Links Rápidos</h3>
            <nav className="space-y-2">
              <Link to="/" className="block text-sm text-muted-foreground hover:text-primary transition-colors">
                Home
              </Link>
              <Link to="/produtos" className="block text-sm text-muted-foreground hover:text-primary transition-colors">
                Produtos
              </Link>
              <Link to="/sobre" className="block text-sm text-muted-foreground hover:text-primary transition-colors">
                Sobre Nós
              </Link>
              <Link to="/contato" className="block text-sm text-muted-foreground hover:text-primary transition-colors">
                Contato
              </Link>
            </nav>
          </div>

          {/* Categories */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Categorias</h3>
            <nav className="space-y-2">
              <Link
                to="/produtos?categoria=roupas-femininas"
                className="block text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                Roupas Femininas
              </Link>
              <Link
                to="/produtos?categoria=roupas-masculinas"
                className="block text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                Roupas Masculinas
              </Link>
              <Link
                to="/produtos?categoria=utilidades"
                className="block text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                Utilidades
              </Link>
            </nav>
          </div>

          {/* Contact */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Contato</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-3 text-sm">
                <Phone className="w-4 h-4 text-primary" />
                <span className="text-muted-foreground">(11) 99999-9999</span>
              </div>
              <div className="flex items-center space-x-3 text-sm">
                <Mail className="w-4 h-4 text-primary" />
                <span className="text-muted-foreground">contato@ubisshop.com</span>
              </div>
              <div className="flex items-start space-x-3 text-sm">
                <MapPin className="w-4 h-4 text-primary mt-0.5" />
                <span className="text-muted-foreground">
                  São Paulo, SP<br />
                  Brasil
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-border pt-8 mt-8">
          <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
            <p className="text-sm text-muted-foreground">
              © 2024 Ubis Shop. Todos os direitos reservados.
            </p>
            <div className="flex items-center space-x-6 text-sm text-muted-foreground">
              <Link to="/privacidade" className="hover:text-primary transition-colors">
                Política de Privacidade
              </Link>
              <Link to="/termos" className="hover:text-primary transition-colors">
                Termos de Uso
              </Link>
              <Link to="/trocas" className="hover:text-primary transition-colors">
                Trocas e Devoluções
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}