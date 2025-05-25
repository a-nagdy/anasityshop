// Types for Homepage Settings
export interface HeroBanner {
  _id?: string;
  title: string;
  subtitle: string;
  buttonText: string;
  buttonLink: string;
  image: string;
  imageId?: string;
  active: boolean;
}

export interface CategorySlider {
  _id?: string;
  title: string;
  subtitle?: string;
  categories: string[];
  active: boolean;
}

export interface ProductSlider {
  _id?: string;
  title: string;
  subtitle?: string;
  products: string[];
  type: 'featured' | 'bestseller' | 'new' | 'sale' | 'custom';
  active: boolean;
}

export interface HomepageSettingsValue {
  heroBanners: HeroBanner[];
  categorySliders: CategorySlider[];
  productSliders: ProductSlider[];
  showFeaturedCategories: boolean;
  showNewArrivals: boolean;
  showBestsellers: boolean;
  backgroundColor: string;
  accentColor: string;
  animation3dEnabled: boolean;
}
