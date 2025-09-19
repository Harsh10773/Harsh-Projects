import { Brand, BrandCategory } from '@/types/brands';

const luxuryBrands: Brand[] = [
  {
    id: 'gucci',
    name: 'Gucci',
    description: 'Italian luxury fashion house known for eclectic, contemporary, romantic products including ready-to-wear, leather goods, and accessories.',
    category: 'luxury',
    priceRange: '$$$$$',
    style: ['Luxury', 'Bold', 'Eclectic'],
    website: 'https://www.gucci.com',
    rating: 4.8,
    popularItems: ['GG Marmont bags', 'Ace sneakers', 'Horsebit loafers']
  },
  {
    id: 'louis-vuitton',
    name: 'Louis Vuitton',
    description: 'French fashion house and luxury retail company founded in 1854. Known for leather goods, ready-to-wear, shoes, watches, jewelry, and accessories.',
    category: 'luxury',
    priceRange: '$$$$$',
    style: ['Luxury', 'Classic', 'Timeless'],
    website: 'https://www.louisvuitton.com',
    rating: 4.9,
    popularItems: ['Neverfull tote', 'Speedy bag', 'Capucines handbag']
  },
  {
    id: 'chanel',
    name: 'Chanel',
    description: 'French luxury fashion house founded by Coco Chanel. Known for haute couture, ready-to-wear clothes, luxury goods, and fashion accessories.',
    category: 'luxury',
    priceRange: '$$$$$',
    style: ['Luxury', 'Elegant', 'Timeless'],
    website: 'https://www.chanel.com',
    rating: 4.9,
    popularItems: ['Classic Flap Bag', 'Tweed jackets', 'Ballet flats']
  },
  {
    id: 'prada',
    name: 'Prada',
    description: 'Italian luxury fashion house specializing in leather handbags, travel accessories, shoes, ready-to-wear, perfumes and other fashion accessories.',
    category: 'luxury',
    priceRange: '$$$$$',
    style: ['Luxury', 'Minimalist', 'Modern'],
    website: 'https://www.prada.com',
    rating: 4.7,
    popularItems: ['Saffiano bags', 'Cloudbust sneakers', 'Nylon re-edition']
  }
];

const premiumBrands: Brand[] = [
  {
    id: 'ralph-lauren',
    name: 'Ralph Lauren',
    description: 'American fashion company best known for Ralph Lauren Collection, Polo Ralph Lauren, and Lauren Ralph Lauren. Classic American style.',
    category: 'premium',
    priceRange: '$$$$',
    style: ['Classic', 'Preppy', 'American'],
    website: 'https://www.ralphlauren.com',
    rating: 4.5,
    popularItems: ['Polo shirts', 'Cable-knit sweaters', 'Blazers']
  },
  {
    id: 'hugo-boss',
    name: 'Hugo Boss',
    description: 'German luxury fashion house known for high-quality menswear and womenswear, including business and formal attire.',
    category: 'premium',
    priceRange: '$$$$',
    style: ['Business', 'Sophisticated', 'Modern'],
    website: 'https://www.hugoboss.com',
    rating: 4.4,
    popularItems: ['Suits', 'Dress shirts', 'Leather shoes']
  },
  {
    id: 'tommy-hilfiger',
    name: 'Tommy Hilfiger',
    description: 'American premium clothing brand known for classic American cool style. Preppy designs with a modern twist.',
    category: 'premium',
    priceRange: '$$$',
    style: ['Preppy', 'American', 'Casual'],
    website: 'https://www.tommy.com',
    rating: 4.3,
    popularItems: ['Flag logo pieces', 'Denim', 'Polo shirts']
  },
  {
    id: 'calvin-klein',
    name: 'Calvin Klein',
    description: 'American fashion brand known for minimalist and sensual aesthetic. Clean lines and modern American style.',
    category: 'premium',
    priceRange: '$$$',
    style: ['Minimalist', 'Modern', 'Clean'],
    website: 'https://www.calvinklein.com',
    rating: 4.2,
    popularItems: ['Underwear', 'Jeans', 'Minimalist dresses']
  }
];

const contemporaryBrands: Brand[] = [
  {
    id: 'zara',
    name: 'Zara',
    description: 'Spanish fast fashion retailer known for trendy, affordable fashion that quickly adapts runway trends for everyday wear.',
    category: 'contemporary',
    priceRange: '$$',
    style: ['Trendy', 'Fast Fashion', 'Modern'],
    website: 'https://www.zara.com',
    rating: 4.1,
    popularItems: ['Blazers', 'Midi dresses', 'Ankle boots']
  },
  {
    id: 'hm',
    name: 'H&M',
    description: 'Swedish multinational clothing-retail company known for fashion and quality at the best price in a sustainable way.',
    category: 'contemporary',
    priceRange: '$$',
    style: ['Trendy', 'Affordable', 'Sustainable'],
    website: 'https://www2.hm.com',
    rating: 4.0,
    popularItems: ['Basic tees', 'Conscious collection', 'Seasonal trends']
  },
  {
    id: 'cos',
    name: 'COS',
    description: 'Collection of Style offering reinvented classics and wardrobe essentials made to last. Modern, functional, considered design.',
    category: 'contemporary',
    priceRange: '$$$',
    style: ['Minimalist', 'Architectural', 'Timeless'],
    website: 'https://www.cosstores.com',
    rating: 4.4,
    popularItems: ['Architectural blazers', 'Midi skirts', 'Knit sweaters']
  },
  {
    id: 'uniqlo',
    name: 'Uniqlo',
    description: 'Japanese casual wear designer and retailer. Known for high-quality basics, innovative fabrics, and functional design.',
    category: 'contemporary',
    priceRange: '$$',
    style: ['Minimalist', 'Functional', 'Basic'],
    website: 'https://www.uniqlo.com',
    rating: 4.3,
    popularItems: ['Heattech', 'Airism', 'Ultra Light Down']
  }
];

const streetwearBrands: Brand[] = [
  {
    id: 'nike',
    name: 'Nike',
    description: 'American multinational corporation engaged in design, development, manufacturing and marketing of footwear, apparel, and accessories.',
    category: 'streetwear',
    priceRange: '$$$',
    style: ['Athletic', 'Streetwear', 'Performance'],
    website: 'https://www.nike.com',
    rating: 4.6,
    popularItems: ['Air Force 1', 'Air Max', 'Tech fleece']
  },
  {
    id: 'adidas',
    name: 'Adidas',
    description: 'German multinational corporation that designs and manufactures shoes, clothing and accessories. Known for three-stripe logo.',
    category: 'streetwear',
    priceRange: '$$$',
    style: ['Athletic', 'Streetwear', 'Retro'],
    website: 'https://www.adidas.com',
    rating: 4.5,
    popularItems: ['Stan Smith', 'Ultraboost', 'Three-stripe tracksuit']
  },
  {
    id: 'supreme',
    name: 'Supreme',
    description: 'American clothing brand established in NYC. Known for streetwear and skateboarding culture-influenced designs.',
    category: 'streetwear',
    priceRange: '$$$$',
    style: ['Streetwear', 'Hype', 'Limited'],
    website: 'https://www.supremenewyork.com',
    rating: 4.7,
    popularItems: ['Box logo hoodie', 'Accessories', 'Limited drops']
  },
  {
    id: 'off-white',
    name: 'Off-White',
    description: 'Italian luxury fashion label founded by Virgil Abloh. Known for streetwear and quotation mark aesthetic.',
    category: 'streetwear',
    priceRange: '$$$$',
    style: ['Streetwear', 'Luxury', 'Deconstructed'],
    website: 'https://www.off---white.com',
    rating: 4.4,
    popularItems: ['Arrow motif', 'Industrial belt', 'Quotation marks']
  }
];

const sustainableBrands: Brand[] = [
  {
    id: 'patagonia',
    name: 'Patagonia',
    description: 'American clothing company that markets outdoor clothing. Known for environmental activism and sustainable practices.',
    category: 'sustainable',
    priceRange: '$$$',
    style: ['Outdoor', 'Sustainable', 'Functional'],
    website: 'https://www.patagonia.com',
    rating: 4.8,
    popularItems: ['Fleece jackets', 'Down sweater', 'Baggies shorts']
  },
  {
    id: 'everlane',
    name: 'Everlane',
    description: 'American clothing retailer that sells primarily online. Known for radical transparency and ethical manufacturing.',
    category: 'sustainable',
    priceRange: '$$$',
    style: ['Minimalist', 'Transparent', 'Ethical'],
    website: 'https://www.everlane.com',
    rating: 4.2,
    popularItems: ['The Modern Point', 'Day Market tote', 'ReNew collection']
  },
  {
    id: 'reformation',
    name: 'Reformation',
    description: 'Sustainable womenswear brand that creates effortless silhouettes that celebrate the feminine figure.',
    category: 'sustainable',
    priceRange: '$$$',
    style: ['Feminine', 'Sustainable', 'Vintage-inspired'],
    website: 'https://www.thereformation.com',
    rating: 4.3,
    popularItems: ['Midi dresses', 'High-waisted jeans', 'Wrap tops']
  },
  {
    id: 'stella-mccartney',
    name: 'Stella McCartney',
    description: 'British luxury fashion house known for vegetarian and sustainable fashion. No leather or fur used in designs.',
    category: 'sustainable',
    priceRange: '$$$$$',
    style: ['Luxury', 'Vegetarian', 'Modern'],
    website: 'https://www.stellamccartney.com',
    rating: 4.6,
    popularItems: ['Falabella bag', 'Tailored blazers', 'Platform shoes']
  }
];

const budgetFriendlyBrands: Brand[] = [
  {
    id: 'target',
    name: 'Target (A New Day)',
    description: 'American big box department store known for affordable, trendy clothing and home goods with designer collaborations.',
    category: 'budget',
    priceRange: '$',
    style: ['Affordable', 'Trendy', 'Accessible'],
    website: 'https://www.target.com',
    rating: 4.0,
    popularItems: ['A New Day basics', 'Wild Fable', 'Designer collaborations']
  },
  {
    id: 'old-navy',
    name: 'Old Navy',
    description: 'American clothing and accessories retailing company owned by Gap Inc. Known for affordable, family-friendly fashion.',
    category: 'budget',
    priceRange: '$',
    style: ['Casual', 'Family', 'Affordable'],
    website: 'https://www.oldnavy.com',
    rating: 3.8,
    popularItems: ['Basic jeans', 'Graphic tees', 'Activewear']
  },
  {
    id: 'forever21',
    name: 'Forever 21',
    description: 'American fast fashion retailer known for trendy clothing at low prices, primarily targeting young women.',
    category: 'budget',
    priceRange: '$',
    style: ['Fast Fashion', 'Trendy', 'Young'],
    website: 'https://www.forever21.com',
    rating: 3.5,
    popularItems: ['Crop tops', 'Mini dresses', 'Statement jewelry']
  }
];

export const brandCategories: BrandCategory[] = [
  {
    id: 'luxury',
    name: 'Luxury Designer',
    description: 'High-end fashion houses with exceptional craftsmanship and exclusive designs',
    icon: '👑',
    brands: luxuryBrands
  },
  {
    id: 'premium',
    name: 'Premium Brands',
    description: 'Quality fashion with sophisticated design and superior materials',
    icon: '⭐',
    brands: premiumBrands
  },
  {
    id: 'contemporary',
    name: 'Contemporary',
    description: 'Modern, accessible fashion with current trends and timeless pieces',
    icon: '🎯',
    brands: contemporaryBrands
  },
  {
    id: 'streetwear',
    name: 'Streetwear & Athletic',
    description: 'Urban fashion, sportswear, and lifestyle brands',
    icon: '🔥',
    brands: streetwearBrands
  },
  {
    id: 'sustainable',
    name: 'Sustainable Fashion',
    description: 'Eco-friendly brands committed to ethical and sustainable practices',
    icon: '🌱',
    brands: sustainableBrands
  },
  {
    id: 'budget',
    name: 'Budget-Friendly',
    description: 'Affordable fashion options without compromising on style',
    icon: '💰',
    brands: budgetFriendlyBrands
  }
];