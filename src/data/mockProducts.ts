import { Product } from '@/types';

export const mockProducts: Product[] = [
  {
    id: '1',
    name: 'Camiseta Oversized Premium',
    description: 'Camiseta oversized em algodão premium, perfeita para o dia a dia. Modelagem ampla e confortável.',
    price: 89.90,
    category: 'roupas-femininas',
    subcategory: 'camisetas',
    images: [
      'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400',
      'https://images.unsplash.com/photo-1503341504253-dff4815485f1?w=400'
    ],
    stock: 50,
    status: 'ativo',
    featured: true,
    variations: [
      { id: 'v1', sku: 'CAM-OV-P-BRANCA', attributes: { size: 'P', color: 'Branca' }, stock: 15 },
      { id: 'v2', sku: 'CAM-OV-M-BRANCA', attributes: { size: 'M', color: 'Branca' }, stock: 20 },
      { id: 'v3', sku: 'CAM-OV-G-BRANCA', attributes: { size: 'G', color: 'Branca' }, stock: 15 },
    ],
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z'
  },
  {
    id: '2',
    name: 'Moletom Cropped Tie-Dye',
    description: 'Moletom cropped com estampa tie-dye moderna. Material macio e design único.',
    price: 159.90,
    category: 'roupas-femininas',
    subcategory: 'moletons',
    images: [
      'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400',
      'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=400'
    ],
    stock: 30,
    status: 'ativo',
    featured: true,
    variations: [
      { id: 'v4', sku: 'MOL-CR-P-TIE', attributes: { size: 'P', color: 'Tie-Dye' }, stock: 10 },
      { id: 'v5', sku: 'MOL-CR-M-TIE', attributes: { size: 'M', color: 'Tie-Dye' }, stock: 15 },
      { id: 'v6', sku: 'MOL-CR-G-TIE', attributes: { size: 'G', color: 'Tie-Dye' }, stock: 5 },
    ],
    createdAt: '2024-01-16T10:00:00Z',
    updatedAt: '2024-01-16T10:00:00Z'
  },
  {
    id: '3',
    name: 'Camiseta Básica Masculina',
    description: 'Camiseta básica masculina em algodão 100%. Corte reto, ideal para o dia a dia.',
    price: 49.90,
    category: 'roupas-masculinas',
    subcategory: 'camisetas',
    images: [
      'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400',
      'https://images.unsplash.com/photo-1503341504253-dff4815485f1?w=400'
    ],
    stock: 80,
    status: 'ativo',
    featured: false,
    variations: [
      { id: 'v7', sku: 'CAM-BAS-M-PRETA', attributes: { size: 'M', color: 'Preta' }, stock: 25 },
      { id: 'v8', sku: 'CAM-BAS-G-PRETA', attributes: { size: 'G', color: 'Preta' }, stock: 30 },
      { id: 'v9', sku: 'CAM-BAS-GG-PRETA', attributes: { size: 'GG', color: 'Preta' }, stock: 25 },
    ],
    createdAt: '2024-01-17T10:00:00Z',
    updatedAt: '2024-01-17T10:00:00Z'
  },
  {
    id: '4',
    name: 'Copo Stanley 473ml',
    description: 'Copo térmico Stanley original 473ml. Mantém a temperatura por até 12 horas.',
    price: 199.90,
    category: 'utilidades',
    subcategory: 'copos-termicos',
    images: [
      'https://images.unsplash.com/photo-1570913149827-d2ac84ab3f9a?w=400',
      'https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=400'
    ],
    stock: 25,
    status: 'ativo',
    featured: true,
    variations: [
      { id: 'v10', sku: 'STANLEY-473-ROSA', attributes: { capacity: '473ml', color: 'Rosa' }, stock: 8 },
      { id: 'v11', sku: 'STANLEY-473-AZUL', attributes: { capacity: '473ml', color: 'Azul' }, stock: 10 },
      { id: 'v12', sku: 'STANLEY-473-PRETO', attributes: { capacity: '473ml', color: 'Preto' }, stock: 7 },
    ],
    createdAt: '2024-01-18T10:00:00Z',
    updatedAt: '2024-01-18T10:00:00Z'
  },
  {
    id: '5',
    name: 'Óculos Oakley Holbrook Réplica',
    description: 'Óculos de sol estilo Oakley Holbrook. Lentes polarizadas com proteção UV.',
    price: 79.90,
    category: 'utilidades',
    subcategory: 'oculos-sol',
    images: [
      'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=400',
      'https://images.unsplash.com/photo-1473496169904-658ba7c44d8a?w=400'
    ],
    stock: 40,
    status: 'ativo',
    featured: true,
    variations: [
      { id: 'v13', sku: 'OAKLEY-HOL-PRETO', attributes: { frame: 'Preto', lens: 'Polarizada' }, stock: 15 },
      { id: 'v14', sku: 'OAKLEY-HOL-MARROM', attributes: { frame: 'Marrom', lens: 'Degradê' }, stock: 15 },
      { id: 'v15', sku: 'OAKLEY-HOL-AZUL', attributes: { frame: 'Azul', lens: 'Espelhada' }, stock: 10 },
    ],
    createdAt: '2024-01-19T10:00:00Z',
    updatedAt: '2024-01-19T10:00:00Z'
  },
  {
    id: '6',
    name: 'Calça Cargo Feminina',
    description: 'Calça cargo feminina com múltiplos bolsos. Tendência urbana e funcional.',
    price: 129.90,
    category: 'roupas-femininas',
    subcategory: 'calcas',
    images: [
      'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=400',
      'https://images.unsplash.com/photo-1506629905607-c500c6bb5e9a?w=400'
    ],
    stock: 35,
    status: 'ativo',
    featured: false,
    variations: [
      { id: 'v16', sku: 'CARGO-FEM-38-BEGE', attributes: { size: '38', color: 'Bege' }, stock: 12 },
      { id: 'v17', sku: 'CARGO-FEM-40-BEGE', attributes: { size: '40', color: 'Bege' }, stock: 15 },
      { id: 'v18', sku: 'CARGO-FEM-42-BEGE', attributes: { size: '42', color: 'Bege' }, stock: 8 },
    ],
    createdAt: '2024-01-20T10:00:00Z',
    updatedAt: '2024-01-20T10:00:00Z'
  }
];

export const categories = [
  { id: '1', name: 'Roupas Femininas', slug: 'roupas-femininas', description: 'Moda feminina moderna e estilosa' },
  { id: '2', name: 'Roupas Masculinas', slug: 'roupas-masculinas', description: 'Estilo masculino contemporâneo' },
  { id: '3', name: 'Utilidades', slug: 'utilidades', description: 'Acessórios e utilidades modernas' }
];