"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface MenuGroup {
  name: string;
  items: {
    name: string;
    href: string;
    icon: string;
  }[];
}

const menuGroups: MenuGroup[] = [
  {
    name: "Catalog",
    items: [
      { name: "Products", href: "/admin/products", icon: "cube" },
      { name: "Categories", href: "/admin/categories", icon: "folder" },
    ],
  },
  {
    name: "Sales",
    items: [{ name: "Orders", href: "/admin/orders", icon: "shopping-bag" }],
  },
  {
    name: "Users",
    items: [{ name: "Customers", href: "/admin/customers", icon: "users" }],
  },
  {
    name: "Settings",
    items: [
      { name: "Settings", href: "/admin/settings", icon: "cog" },
    ],
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(true);
  const [expandedGroups, setExpandedGroups] = useState<string[]>([]);

  // Automatically expand the group based on current pathname
  useEffect(() => {
    const currentGroup = menuGroups.find((group) =>
      group.items.some((item) => item.href === pathname)
    );
    if (currentGroup) {
      setExpandedGroups([currentGroup.name]);
    }
  }, [pathname]);

  const toggleGroup = (groupName: string) => {
    setExpandedGroups((prev) =>
      prev.includes(groupName)
        ? prev.filter((name) => name !== groupName)
        : [...prev, groupName]
    );
  };

  const handleNavigation = (href: string) => {
    router.push(href);
  };

  return (
    <>
      {/* Mobile sidebar backdrop */}
      {!isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
          onClick={() => setIsOpen(true)}
        ></div>
      )}

      {/* Sidebar */}
      <motion.aside
        initial={{ x: -280 }}
        animate={{ x: isOpen ? 0 : -280 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="fixed inset-y-0 left-0 z-50 w-72 bg-gray-900 shadow-xl transform lg:translate-x-0 lg:static lg:inset-auto lg:h-full"
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between h-16 px-6 border-b border-gray-800">
            <Link
              href="/admin"
              className="flex items-center space-x-2"
              onClick={() => handleNavigation("/admin")}
            >
              <span className="text-xl font-bold text-white">Anasity</span>
            </Link>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 text-gray-400 hover:text-white lg:hidden"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-3 py-4 space-y-6 overflow-y-auto">
            {/* Dashboard Link */}
            <Link
              href="/admin"
              onClick={() => handleNavigation("/admin")}
              className={`group relative flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                pathname === "/admin"
                  ? "bg-blue-600 text-white"
                  : "text-gray-400 hover:bg-gray-800 hover:text-white"
              }`}
            >
              <span className="flex items-center justify-center w-5 h-5 mr-3">
                {getIcon("home")}
              </span>
              <span>Dashboard</span>
              {pathname === "/admin" && (
                <motion.div
                  layoutId="activeNav"
                  className="absolute inset-y-0 left-0 w-1 bg-blue-400 rounded-r-md"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                />
              )}
            </Link>

            {/* Menu Groups */}
            {menuGroups.map((group) => (
              <div key={group.name} className="space-y-1">
                <button
                  onClick={() => toggleGroup(group.name)}
                  className="flex items-center justify-between w-full px-2 py-2 text-sm font-medium text-gray-400 hover:text-white transition-colors"
                >
                  <span className="uppercase tracking-wider">{group.name}</span>
                  <svg
                    className={`w-4 h-4 transform transition-transform ${
                      expandedGroups.includes(group.name) ? "rotate-180" : ""
                    }`}
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
                </button>
                {expandedGroups.includes(group.name) && (
                  <div className="space-y-1 pl-4">
                    {group.items.map((item) => {
                      const isActive = pathname === item.href;
                      return (
                        <Link
                          key={item.name}
                          href={item.href}
                          onClick={() => handleNavigation(item.href)}
                          className={`group relative flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                            isActive
                              ? "bg-blue-600 text-white"
                              : "text-gray-400 hover:bg-gray-800 hover:text-white"
                          }`}
                        >
                          <span className="flex items-center justify-center w-5 h-5 mr-3">
                            {getIcon(item.icon)}
                          </span>
                          <span>{item.name}</span>
                          {isActive && (
                            <motion.div
                              layoutId="activeNav"
                              className="absolute inset-y-0 left-0 w-1 bg-blue-400 rounded-r-md"
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              exit={{ opacity: 0 }}
                              transition={{ duration: 0.2 }}
                            />
                          )}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            ))}
          </nav>

          {/* User Profile */}
          <div className="p-4 border-t border-gray-800">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-medium">
                  A
                </div>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-white">Admin User</p>
                <p className="text-xs text-gray-400">admin@anasity.com</p>
              </div>
            </div>
          </div>
        </div>
      </motion.aside>

      {/* Toggle button for mobile */}
      <div className="lg:hidden fixed bottom-4 right-4 z-40">
        <button
          onClick={() => setIsOpen(true)}
          className="p-3 text-white bg-blue-600 rounded-full shadow-lg hover:bg-blue-700 focus:outline-none transition-colors"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>
      </div>
    </>
  );
}

function getIcon(name: string) {
  switch (name) {
    case "home":
      return (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
          />
        </svg>
      );
    case "cube":
      return (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
          />
        </svg>
      );
    case "shopping-bag":
      return (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
          />
        </svg>
      );
    case "users":
      return (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
          />
        </svg>
      );
    case "folder":
      return (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
          />
        </svg>
      );
    case "cog":
      return (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
          />
        </svg>
      );
    default:
      return null;
  }
}
