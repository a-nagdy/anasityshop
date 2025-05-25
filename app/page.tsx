import { Suspense } from 'react';
import HeroSection from './components/home/HeroSection';
import CategorySlider from './components/home/CategorySlider';
import ProductSlider from './components/home/ProductSlider';
import BackgroundWrapper from './components/home/BackgroundWrapper';

// Import types
import { 
  HomepageSettingsValue, 
  CategorySlider as CategorySliderType, 
  ProductSlider as ProductSliderType 
} from './types/homepageTypes';
// Server component - use fetch API

async function getHomepageSettings(): Promise<HomepageSettingsValue> {
  // Default settings to use if API call fails
  const defaultSettings: HomepageSettingsValue = {
    heroBanners: [],
    categorySliders: [],
    productSliders: [],
    showFeaturedCategories: true,
    showNewArrivals: true,
    showBestsellers: true,
    backgroundColor: '#ffffff',
    accentColor: '#3b82f6',
    animation3dEnabled: true
  };

  try {
    // Make a direct call to the API route
    const response = await fetch('http://localhost:3000/api/settings/homepage', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('Successfully fetched homepage settings:', JSON.stringify(data));

    
    // The settings are in the 'value' property of the response
    if (data && data.value) {
      return data.value as HomepageSettingsValue;
    }
      
    // If no value property, try using the data directly
    if (data.heroBanners || data.categorySliders || data.productSliders) {
      return data;
    }
    
    // If we get here, return default settings
    return defaultSettings;
    
  } catch (error) {
    console.error('Error in getHomepageSettings:', error);
    return defaultSettings;
  }
}

export default async function Home() {
  const settings = await getHomepageSettings();
  
  return (
    <div 
      className="min-h-screen overflow-hidden relative"
      style={{ backgroundColor: settings.backgroundColor }}
    >
      {/* 3D Animated Background */}
      {settings.animation3dEnabled && (
        <Suspense fallback={null}>
          <BackgroundWrapper accentColor={settings.accentColor} />
        </Suspense>
      )}
      
      {/* Hero Banner Section */}
      <section className="relative z-10">
        <HeroSection banners={settings.heroBanners} />
      </section>
      
      {/* Category Sliders */}
      {settings.categorySliders.map((slider: CategorySliderType, index: number) => (
        slider.active && (
          <section key={`category-slider-${index}`} className="py-12 relative z-10">
            <div className="container mx-auto px-4">
              <CategorySlider 
                title={slider.title} 
                subtitle={slider.subtitle} 
                categoryIds={slider.categories} 
              />
            </div>
          </section>
        )
      ))}
      
      {/* Featured Categories Section */}
      {settings.showFeaturedCategories && (
        <section className="py-12 relative z-10">
          <div className="container mx-auto px-4">
            <CategorySlider 
              title="Featured Categories" 
              subtitle="Explore our collections" 
              featured={true} 
            />
          </div>
        </section>
      )}
      
      {/* Product Sliders */}
      {settings.productSliders.map((slider: ProductSliderType, index: number) => (
        slider.active && (
          <section key={`product-slider-${index}`} className="py-12 relative z-10">
            <div className="container mx-auto px-4">
              <ProductSlider 
                title={slider.title} 
                subtitle={slider.subtitle} 
                type={slider.type}
                productIds={slider.type === 'custom' ? slider.products : undefined} 
              />
            </div>
          </section>
        )
      ))}
      
      {/* New Arrivals Section */}
      {settings.showNewArrivals && (
        <section className="py-12 relative z-10">
          <div className="container mx-auto px-4">
            <ProductSlider 
              title="New Arrivals" 
              subtitle="Check out our latest products" 
              type="new" 
            />
          </div>
        </section>
      )}
      
      {/* Bestsellers Section */}
      {settings.showBestsellers && (
        <section className="py-12 relative z-10">
          <div className="container mx-auto px-4">
            <ProductSlider 
              title="Bestsellers" 
              subtitle="Our most popular products" 
              type="bestseller" 
            />
          </div>
        </section>
      )}
    </div>
  );
}
