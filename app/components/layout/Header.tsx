"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { CartButton, useCart } from "../ui";

interface Category {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  active: boolean;
}

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(false);
  const pathname = usePathname();
  const { openCart } = useCart();

  const isActive = (path: string) => pathname === path;

  const navigation = [
    { name: "Home", href: "/" },
    { name: "Categories", href: "/categories", isDropdown: true },
    { name: "About", href: "/about" },
    { name: "Contact", href: "/contact" },
  ];

  // Fetch categories using CategoryService
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setCategoriesLoading(true);

        // Import and use CategoryService
        const { CategoryService } = await import(
          "../../services/categoryService"
        );
        const activeCategories = await CategoryService.getNavigationCategories(
          1
        ); // Only parent categories for navigation

        setCategories(activeCategories);
      } catch (error) {
        // Improved error handling
        const errorMessage =
          error instanceof Error ? error.message : "Failed to load categories";
        console.error("Error fetching categories:", errorMessage);
        setCategories([]); // Set empty array as fallback
      } finally {
        setCategoriesLoading(false);
      }
    };

    fetchCategories();
  }, []);

  return (
    <header className="nav-theme shadow-sm fixed w-full top-0 z-50">
      <nav className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <Link href="/" className="text-2xl font-bold text-theme-gradient">
              Anasity
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden sm:flex sm:space-x-8 items-center">
            {navigation.map((item) => (
              <div key={item.name}>
                {item.isDropdown ? (
                  /* Categories Dropdown */
                  <div className="relative group">
                    <div
                      className={`inline-flex items-center px-1 pt-1 text-sm font-medium cursor-pointer nav-link-theme ${
                        pathname.startsWith("/categories") ? "active" : ""
                      }`}
                    >
                      {item.name}
                      <svg
                        className="ml-1 h-4 w-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </div>

                    {/* Dropdown Menu */}
                    <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-20">
                      <div className="py-2">
                        {/* Loading State */}
                        {categoriesLoading && (
                          <div className="px-4 py-2 text-sm text-gray-500 dark:text-gray-400">
                            Loading categories...
                          </div>
                        )}

                        {/* Category Links */}
                        {categories.map((category) => (
                          <Link
                            key={category._id}
                            href={`/categories/${category.slug}`}
                            className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                          >
                            <span className="truncate">{category.name}</span>
                          </Link>
                        ))}

                        {/* Empty State */}
                        {!categoriesLoading && categories.length === 0 && (
                          <div className="px-4 py-2 text-sm text-gray-500 dark:text-gray-400">
                            No categories available
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Regular Navigation Link */
                  <Link
                    href={item.href}
                    className={`inline-flex items-center px-1 pt-1 text-sm font-medium nav-link-theme ${
                      isActive(item.href) ? "active" : ""
                    }`}
                  >
                    {item.name}
                  </Link>
                )}
              </div>
            ))}
          </div>

          {/* User Menu */}
          <div className="hidden sm:flex sm:items-center sm:space-x-4">
            <CartButton
              onClick={openCart}
              className="text-gray-500 dark:text-gray-300 hover:text-gray-700 dark:hover:text-white p-2"
            />
            <Link
              href="/account"
              className="text-gray-500 dark:text-gray-300 hover:text-gray-700 dark:hover:text-white p-2"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
            </Link>
          </div>

          {/* Mobile menu button & cart */}
          <div className="sm:hidden flex items-center space-x-2">
            <CartButton onClick={openCart} />
            <button
              type="button"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-500 dark:text-gray-300 hover:text-gray-700 dark:hover:text-white p-2"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                {isMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="sm:hidden py-2">
            <div className="space-y-1">
              {navigation.map((item) => (
                <div key={item.name}>
                  {item.isDropdown ? (
                    /* Mobile Categories Section */
                    <div>
                      <div className="px-3 py-2 text-base font-medium text-gray-700 dark:text-gray-200">
                        {item.name}
                      </div>

                      {categories.map((category) => (
                        <Link
                          key={category._id}
                          href={`/categories/${category.slug}`}
                          className="block px-6 py-2 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-800"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          {category.name}
                        </Link>
                      ))}
                    </div>
                  ) : (
                    /* Regular Mobile Link */
                    <Link
                      href={item.href}
                      className={`block px-3 py-2 text-base font-medium ${
                        isActive(item.href)
                          ? "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/50"
                          : "text-gray-500 dark:text-gray-300 hover:text-gray-700 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-800"
                      }`}
                      onClick={() => setIsMenuOpen(false)}
                    >
                      {item.name}
                    </Link>
                  )}
                </div>
              ))}

              <div className="border-t border-gray-200 dark:border-gray-700 mt-4 pt-4">
                <button
                  onClick={() => {
                    openCart();
                    setIsMenuOpen(false);
                  }}
                  className="block w-full text-left px-3 py-2 text-base font-medium text-gray-500 dark:text-gray-300 hover:text-gray-700 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  Cart
                </button>
                <Link
                  href="/account"
                  className="block px-3 py-2 text-base font-medium text-gray-500 dark:text-gray-300 hover:text-gray-700 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-800"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Account
                </Link>
              </div>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
