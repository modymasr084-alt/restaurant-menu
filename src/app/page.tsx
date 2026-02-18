"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "@/hooks/use-toast";
import { 
  UtensilsCrossed, 
  Search, 
  ChefHat, 
  RefreshCw
} from "lucide-react";

// Types
interface Category {
  id: string;
  name: string;
  nameAr: string;
  icon: string | null;
  sortOrder: number;
  isActive: boolean;
}

interface MenuItem {
  id: string;
  name: string;
  nameAr: string;
  description: string | null;
  descriptionAr: string | null;
  price: number;
  image: string | null;
  categoryId: string;
  category?: Category;
  isActive: boolean;
  isAvailable: boolean;
  sortOrder: number;
}

interface Settings {
  id: string;
  restaurantName: string;
  restaurantNameEn: string;
  logo: string | null;
}

export default function MenuPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [settings, setSettings] = useState<Settings | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSeeding, setIsSeeding] = useState(false);

  // Fetch data
  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [categoriesRes, itemsRes, settingsRes] = await Promise.all([
        fetch("/api/categories"),
        fetch("/api/menu-items"),
        fetch("/api/settings"),
      ]);
      const categoriesData = await categoriesRes.json();
      const itemsData = await itemsRes.json();
      const settingsData = await settingsRes.json();
      setCategories(categoriesData);
      setMenuItems(itemsData);
      setSettings(settingsData);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast({ title: "خطأ في تحميل البيانات", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Seed database
  const handleSeed = async () => {
    setIsSeeding(true);
    try {
      const res = await fetch("/api/seed");
      const data = await res.json();
      toast({ title: data.message || "تم إضافة البيانات بنجاح" });
      fetchData();
    } catch (error) {
      toast({ title: "خطأ في إضافة البيانات", variant: "destructive" });
    } finally {
      setIsSeeding(false);
    }
  };

  // Filter items for display
  const filteredItems = menuItems.filter((item) => {
    const matchesCategory = selectedCategory === "all" || item.categoryId === selectedCategory;
    const matchesSearch = !searchQuery || 
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.nameAr.includes(searchQuery) ||
      item.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.descriptionAr?.includes(searchQuery);
    return matchesCategory && matchesSearch && item.isActive && item.isAvailable;
  });

  const activeCategories = categories.filter(c => c.isActive);

  const restaurantName = settings?.restaurantName || "مطعم الذواقة";
  const restaurantLogo = settings?.logo;

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white dark:from-gray-900 dark:to-gray-950">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-b border-orange-100 dark:border-gray-800">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {restaurantLogo ? (
                <img 
                  src={restaurantLogo} 
                  alt={restaurantName}
                  className="w-12 h-12 rounded-xl object-cover shadow-lg"
                />
              ) : (
                <div className="bg-gradient-to-br from-orange-500 to-red-600 p-2 rounded-xl shadow-lg">
                  <ChefHat className="w-8 h-8 text-white" />
                </div>
              )}
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                  {restaurantName}
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">قائمة الطعام</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        {/* Search and Categories */}
        <div className="mb-6 space-y-4">
          {/* Search */}
          <div className="relative max-w-md mx-auto">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              placeholder="ابحث عن صنف..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pr-10 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"
            />
          </div>

          {/* Category Tabs */}
          <ScrollArea className="w-full whitespace-nowrap">
            <div className="flex gap-2 pb-2 justify-center flex-wrap">
              <Button
                variant={selectedCategory === "all" ? "default" : "outline"}
                onClick={() => setSelectedCategory("all")}
                className={`rounded-full ${
                  selectedCategory === "all" 
                    ? "bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600" 
                    : ""
                }`}
              >
                الكل
              </Button>
              {activeCategories.map((category) => (
                <Button
                  key={category.id}
                  variant={selectedCategory === category.id ? "default" : "outline"}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`rounded-full gap-2 ${
                    selectedCategory === category.id 
                      ? "bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600" 
                      : ""
                  }`}
                >
                  <span>{category.icon}</span>
                  {category.nameAr}
                </Button>
              ))}
            </div>
          </ScrollArea>
        </div>

        {/* Menu Items Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <Card key={i} className="overflow-hidden animate-pulse">
                <div className="h-48 bg-gray-200 dark:bg-gray-700" />
                <CardContent className="p-4">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2" />
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🍽️</div>
            <h3 className="text-xl font-semibold text-gray-600 dark:text-gray-300 mb-2">
              لا توجد أصناف
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              {menuItems.length === 0 
                ? "لم يتم إضافة أصناف بعد" 
                : "لا توجد نتائج مطابقة للبحث"}
            </p>
            {menuItems.length === 0 && (
              <Button onClick={handleSeed} disabled={isSeeding}>
                <RefreshCw className={`w-4 h-4 ml-2 ${isSeeding ? "animate-spin" : ""}`} />
                إضافة بيانات تجريبية
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredItems.map((item) => (
              <Card 
                key={item.id} 
                className="overflow-hidden group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"
              >
                <div className="relative h-48 overflow-hidden">
                  {item.image ? (
                    <img
                      src={item.image}
                      alt={item.nameAr}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-orange-100 to-red-100 dark:from-orange-900/20 dark:to-red-900/20 flex items-center justify-center">
                      <UtensilsCrossed className="w-16 h-16 text-orange-300 dark:text-orange-700" />
                    </div>
                  )}
                  <div className="absolute top-3 left-3">
                    <Badge className="bg-gradient-to-r from-orange-500 to-red-500 text-white border-0">
                      {item.price.toFixed(2)} ر.س
                    </Badge>
                  </div>
                </div>
                <CardContent className="p-4">
                  <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-1">
                    {item.nameAr}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                    {item.name}
                  </p>
                  {item.descriptionAr && (
                    <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
                      {item.descriptionAr}
                    </p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 dark:border-gray-800 py-6 mt-12">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm text-gray-500">© 2024 {restaurantName} - جميع الحقوق محفوظة</p>
        </div>
      </footer>
    </div>
  );
}
