"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/hooks/use-toast";
import { 
  UtensilsCrossed, 
  Plus, 
  Pencil, 
  Trash2, 
  Search, 
  ChefHat, 
  Coffee, 
  Cake, 
  Flame, 
  Salad,
  RefreshCw,
  Eye,
  EyeOff,
  LogOut,
  Lock,
  X,
  Check,
  Settings as SettingsIcon,
  Store,
  Image as ImageIcon
} from "lucide-react";

// Admin password
const ADMIN_PASSWORD = "admin123";

// Types
interface Category {
  id: string;
  name: string;
  nameAr: string;
  icon: string | null;
  sortOrder: number;
  isActive: boolean;
  _count?: { items: number };
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

export default function AdminPage() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const [categories, setCategories] = useState<Category[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [settings, setSettings] = useState<Settings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSeeding, setIsSeeding] = useState(false);
  
  // Admin states
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [isItemDialogOpen, setIsItemDialogOpen] = useState(false);
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);
  const [adminSearchQuery, setAdminSearchQuery] = useState("");

  // Settings form
  const [settingsForm, setSettingsForm] = useState({
    restaurantName: "",
    restaurantNameEn: "",
    logo: "",
  });

  // Form states for item
  const [itemForm, setItemForm] = useState({
    name: "",
    nameAr: "",
    description: "",
    descriptionAr: "",
    price: "",
    image: "",
    categoryId: "",
    sortOrder: 0,
    isActive: true,
    isAvailable: true,
  });

  // Form states for category
  const [categoryForm, setCategoryForm] = useState({
    name: "",
    nameAr: "",
    icon: "🍽️",
    sortOrder: 0,
    isActive: true,
  });

  // Check if already logged in
  useEffect(() => {
    const auth = sessionStorage.getItem("adminAuth");
    if (auth === "true") {
      setIsAuthenticated(true);
    }
  }, []);

  // Login handler
  const handleLogin = () => {
    if (password === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      sessionStorage.setItem("adminAuth", "true");
      setPasswordError("");
    } else {
      setPasswordError("كلمة السر غير صحيحة");
    }
  };

  // Logout handler
  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem("adminAuth");
    router.push("/");
  };

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
      setSettingsForm({
        restaurantName: settingsData?.restaurantName || "مطعم الذواقة",
        restaurantNameEn: settingsData?.restaurantNameEn || "Restaurant",
        logo: settingsData?.logo || "",
      });
    } catch (error) {
      console.error("Error fetching data:", error);
      toast({ title: "خطأ في تحميل البيانات", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      fetchData();
    }
  }, [fetchData, isAuthenticated]);

  // Save settings
  const handleSaveSettings = async () => {
    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settingsForm),
      });
      if (res.ok) {
        const data = await res.json();
        setSettings(data);
        toast({ title: "تم حفظ الإعدادات" });
      }
    } catch (error) {
      toast({ title: "خطأ في حفظ الإعدادات", variant: "destructive" });
    }
  };

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

  // Filter items for admin
  const adminFilteredItems = menuItems.filter((item) => {
    return !adminSearchQuery || 
      item.name.toLowerCase().includes(adminSearchQuery.toLowerCase()) ||
      item.nameAr.includes(adminSearchQuery);
  });

  // Item CRUD operations
  const handleSaveItem = async () => {
    try {
      const url = editingItem ? "/api/menu-items" : "/api/menu-items";
      const method = editingItem ? "PUT" : "POST";
      
      const body = editingItem 
        ? { ...itemForm, id: editingItem.id }
        : itemForm;

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        toast({ title: editingItem ? "تم تحديث الصنف" : "تم إضافة الصنف" });
        setIsItemDialogOpen(false);
        resetItemForm();
        fetchData();
      } else {
        const error = await res.json();
        toast({ title: error.error || "خطأ في الحفظ", variant: "destructive" });
      }
    } catch (error) {
      toast({ title: "خطأ في الحفظ", variant: "destructive" });
    }
  };

  const handleDeleteItem = async (id: string) => {
    try {
      const res = await fetch(`/api/menu-items?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        toast({ title: "تم حذف الصنف" });
        fetchData();
      }
    } catch (error) {
      toast({ title: "خطأ في الحذف", variant: "destructive" });
    }
  };

  const handleToggleItemActive = async (item: MenuItem) => {
    try {
      const res = await fetch("/api/menu-items", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...item,
          isActive: !item.isActive,
        }),
      });
      if (res.ok) {
        toast({ title: item.isActive ? "تم تعطيل الصنف" : "تم تفعيل الصنف" });
        fetchData();
      }
    } catch (error) {
      toast({ title: "خطأ في التحديث", variant: "destructive" });
    }
  };

  // Category CRUD operations
  const handleSaveCategory = async () => {
    try {
      const url = editingCategory ? "/api/categories" : "/api/categories";
      const method = editingCategory ? "PUT" : "POST";
      
      const body = editingCategory 
        ? { ...categoryForm, id: editingCategory.id }
        : categoryForm;

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        toast({ title: editingCategory ? "تم تحديث التصنيف" : "تم إضافة التصنيف" });
        setIsCategoryDialogOpen(false);
        resetCategoryForm();
        fetchData();
      } else {
        const error = await res.json();
        toast({ title: error.error || "خطأ في الحفظ", variant: "destructive" });
      }
    } catch (error) {
      toast({ title: "خطأ في الحفظ", variant: "destructive" });
    }
  };

  const handleDeleteCategory = async (id: string) => {
    try {
      const res = await fetch(`/api/categories?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        toast({ title: "تم حذف التصنيف" });
        fetchData();
      } else {
        const error = await res.json();
        toast({ title: error.error || "خطأ في الحذف", variant: "destructive" });
      }
    } catch (error) {
      toast({ title: "خطأ في الحذف", variant: "destructive" });
    }
  };

  // Reset forms
  const resetItemForm = () => {
    setItemForm({
      name: "",
      nameAr: "",
      description: "",
      descriptionAr: "",
      price: "",
      image: "",
      categoryId: categories[0]?.id || "",
      sortOrder: 0,
      isActive: true,
      isAvailable: true,
    });
    setEditingItem(null);
  };

  const resetCategoryForm = () => {
    setCategoryForm({
      name: "",
      nameAr: "",
      icon: "🍽️",
      sortOrder: 0,
      isActive: true,
    });
    setEditingCategory(null);
  };

  // Open edit dialogs
  const openEditItem = (item: MenuItem) => {
    setEditingItem(item);
    setItemForm({
      name: item.name,
      nameAr: item.nameAr,
      description: item.description || "",
      descriptionAr: item.descriptionAr || "",
      price: item.price.toString(),
      image: item.image || "",
      categoryId: item.categoryId,
      sortOrder: item.sortOrder,
      isActive: item.isActive,
      isAvailable: item.isAvailable,
    });
    setIsItemDialogOpen(true);
  };

  const openEditCategory = (category: Category) => {
    setEditingCategory(category);
    setCategoryForm({
      name: category.name,
      nameAr: category.nameAr,
      icon: category.icon || "🍽️",
      sortOrder: category.sortOrder,
      isActive: category.isActive,
    });
    setIsCategoryDialogOpen(true);
  };

  // Login Screen
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-950 flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-gray-800 border-gray-700">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 bg-gradient-to-br from-orange-500 to-red-600 p-3 rounded-xl">
              <Lock className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-2xl text-white">لوحة تحكم الأدمن</CardTitle>
            <CardDescription className="text-gray-400">
              أدخل كلمة السر للدخول
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-gray-300">كلمة السر</Label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                placeholder="••••••••"
                className="bg-gray-700 border-gray-600 text-white"
              />
              {passwordError && (
                <p className="text-red-400 text-sm mt-1">{passwordError}</p>
              )}
            </div>
            <Button onClick={handleLogin} className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600">
              دخول
            </Button>
            <Button variant="outline" onClick={() => router.push("/")} className="w-full border-gray-600 text-gray-300">
              العودة للمنيو
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Admin Dashboard
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-950">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-gray-900/95 backdrop-blur-sm border-b border-gray-800">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {settings?.logo ? (
                <img src={settings.logo} alt="Logo" className="w-12 h-12 rounded-xl object-cover" />
              ) : (
                <div className="bg-gradient-to-br from-orange-500 to-red-600 p-2 rounded-xl shadow-lg">
                  <ChefHat className="w-8 h-8 text-white" />
                </div>
              )}
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent">
                  {settings?.restaurantName || "لوحة التحكم"}
                </h1>
                <p className="text-sm text-gray-500">إدارة المنيو</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button 
                variant="outline" 
                onClick={() => router.push("/")}
                className="border-gray-700 text-gray-300"
              >
                <Eye className="w-4 h-4 ml-2" />
                عرض المنيو
              </Button>
              <Button 
                variant="destructive" 
                onClick={handleLogout}
              >
                <LogOut className="w-4 h-4 ml-2" />
                خروج
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        <Tabs defaultValue="items" className="w-full">
          <TabsList className="mb-6 bg-gray-800 border-gray-700">
            <TabsTrigger value="items" className="gap-2 data-[state=active]:bg-orange-500">
              <UtensilsCrossed className="w-4 h-4" />
              الأصناف
            </TabsTrigger>
            <TabsTrigger value="categories" className="gap-2 data-[state=active]:bg-orange-500">
              <Salad className="w-4 h-4" />
              التصنيفات
            </TabsTrigger>
            <TabsTrigger value="settings" className="gap-2 data-[state=active]:bg-orange-500">
              <SettingsIcon className="w-4 h-4" />
              الإعدادات
            </TabsTrigger>
          </TabsList>

          {/* Settings Tab */}
          <TabsContent value="settings">
            <Card className="bg-gray-800 border-gray-700 max-w-2xl mx-auto">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Store className="w-5 h-5" />
                  إعدادات المطعم
                </CardTitle>
                <CardDescription className="text-gray-400">
                  تغيير اسم المطعم واللوجو
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Logo Preview */}
                <div className="flex items-center justify-center">
                  <div className="relative">
                    {settingsForm.logo ? (
                      <img 
                        src={settingsForm.logo} 
                        alt="Logo Preview" 
                        className="w-24 h-24 rounded-xl object-cover border-2 border-orange-500"
                      />
                    ) : (
                      <div className="w-24 h-24 rounded-xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center">
                        <ChefHat className="w-12 h-12 text-white" />
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <Label className="text-gray-300">اسم المطعم (عربي)</Label>
                  <Input
                    value={settingsForm.restaurantName}
                    onChange={(e) => setSettingsForm({ ...settingsForm, restaurantName: e.target.value })}
                    placeholder="اسم المطعم بالعربي"
                    className="bg-gray-700 border-gray-600 text-white mt-1"
                  />
                </div>

                <div>
                  <Label className="text-gray-300">اسم المطعم (إنجليزي)</Label>
                  <Input
                    value={settingsForm.restaurantNameEn}
                    onChange={(e) => setSettingsForm({ ...settingsForm, restaurantNameEn: e.target.value })}
                    placeholder="Restaurant Name"
                    className="bg-gray-700 border-gray-600 text-white mt-1"
                  />
                </div>

                <div>
                  <Label className="text-gray-300 flex items-center gap-2">
                    <ImageIcon className="w-4 h-4" />
                    رابط اللوجو
                  </Label>
                  <Input
                    value={settingsForm.logo}
                    onChange={(e) => setSettingsForm({ ...settingsForm, logo: e.target.value })}
                    placeholder="https://example.com/logo.png"
                    className="bg-gray-700 border-gray-600 text-white mt-1"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    ارفع اللوجو على موقع مثل imgbb.com أو imgur.com وانسخ الرابط
                  </p>
                </div>

                <Button 
                  onClick={handleSaveSettings} 
                  className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
                >
                  <Check className="w-4 h-4 ml-2" />
                  حفظ الإعدادات
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Categories Tab */}
          <TabsContent value="categories">
            <Card className="bg-gray-800 border-gray-700 max-w-2xl mx-auto">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg text-white">التصنيفات</CardTitle>
                <Dialog open={isCategoryDialogOpen} onOpenChange={setIsCategoryDialogOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm" onClick={resetCategoryForm} className="bg-orange-500 hover:bg-orange-600">
                      <Plus className="w-4 h-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-gray-800 border-gray-700">
                    <DialogHeader>
                      <DialogTitle className="text-white">
                        {editingCategory ? "تعديل التصنيف" : "إضافة تصنيف جديد"}
                      </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label className="text-gray-300">اسم التصنيف (عربي)</Label>
                        <Input
                          value={categoryForm.nameAr}
                          onChange={(e) => setCategoryForm({ ...categoryForm, nameAr: e.target.value })}
                          placeholder="مثال: المشروبات"
                          className="bg-gray-700 border-gray-600 text-white"
                        />
                      </div>
                      <div>
                        <Label className="text-gray-300">اسم التصنيف (إنجليزي)</Label>
                        <Input
                          value={categoryForm.name}
                          onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                          placeholder="Example: Drinks"
                          className="bg-gray-700 border-gray-600 text-white"
                        />
                      </div>
                      <div>
                        <Label className="text-gray-300">الأيقونة</Label>
                        <Select
                          value={categoryForm.icon}
                          onValueChange={(value) => setCategoryForm({ ...categoryForm, icon: value })}
                        >
                          <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-gray-700 border-gray-600">
                            <SelectItem value="🍽️">🍽️ أطباق</SelectItem>
                            <SelectItem value="🥗">🥗 سلطات</SelectItem>
                            <SelectItem value="🥤">🥤 مشروبات</SelectItem>
                            <SelectItem value="🍰">🍰 حلويات</SelectItem>
                            <SelectItem value="🍢">🍢 مشاوي</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label className="text-gray-300">ترتيب العرض</Label>
                        <Input
                          type="number"
                          value={categoryForm.sortOrder}
                          onChange={(e) => setCategoryForm({ ...categoryForm, sortOrder: parseInt(e.target.value) || 0 })}
                          className="bg-gray-700 border-gray-600 text-white"
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={categoryForm.isActive}
                          onCheckedChange={(checked) => setCategoryForm({ ...categoryForm, isActive: checked })}
                        />
                        <Label className="text-gray-300">تفعيل</Label>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setIsCategoryDialogOpen(false)} className="border-gray-600 text-gray-300">
                        إلغاء
                      </Button>
                      <Button onClick={handleSaveCategory} className="bg-orange-500 hover:bg-orange-600">
                        {editingCategory ? "تحديث" : "إضافة"}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent className="p-0">
                <ScrollArea className="h-[500px]">
                  {categories.map((category) => (
                    <div
                      key={category.id}
                      className="flex items-center justify-between p-3 border-b border-gray-700 last:border-0 hover:bg-gray-700/50"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{category.icon}</span>
                        <div>
                          <p className="font-medium text-sm text-white">{category.nameAr}</p>
                          <p className="text-xs text-gray-500">
                            {category._count?.items || 0} صنف
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <Badge variant={category.isActive ? "default" : "secondary"} className="text-xs">
                          {category.isActive ? "مفعّل" : "معطّل"}
                        </Badge>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 text-gray-400 hover:text-white"
                          onClick={() => openEditCategory(category)}
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button size="icon" variant="ghost" className="h-8 w-8 text-red-400 hover:text-red-300">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent className="bg-gray-800 border-gray-700">
                            <AlertDialogHeader>
                              <AlertDialogTitle className="text-white">حذف التصنيف</AlertDialogTitle>
                              <AlertDialogDescription className="text-gray-400">
                                هل أنت متأكد من حذف هذا التصنيف؟
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel className="border-gray-600 text-gray-300">إلغاء</AlertDialogCancel>
                              <AlertDialogAction
                                className="bg-red-500 hover:bg-red-600"
                                onClick={() => handleDeleteCategory(category.id)}
                              >
                                حذف
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  ))}
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Menu Items Tab */}
          <TabsContent value="items">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Categories Sidebar */}
              <div className="lg:col-span-1">
                <Card className="bg-gray-800 border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-white text-sm">التصنيفات</CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <ScrollArea className="h-[400px]">
                      {categories.map((category) => (
                        <div
                          key={category.id}
                          className="flex items-center justify-between p-2 border-b border-gray-700"
                        >
                          <div className="flex items-center gap-2">
                            <span>{category.icon}</span>
                            <span className="text-sm text-gray-300">{category.nameAr}</span>
                          </div>
                          <Badge variant="outline" className="text-xs">
                            {category._count?.items || 0}
                          </Badge>
                        </div>
                      ))}
                    </ScrollArea>
                  </CardContent>
                </Card>
              </div>

              {/* Menu Items */}
              <div className="lg:col-span-3">
                <Card className="bg-gray-800 border-gray-700">
                  <CardHeader>
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      <div>
                        <CardTitle className="text-white">الأصناف</CardTitle>
                        <CardDescription className="text-gray-400">
                          إدارة أصناف القائمة
                        </CardDescription>
                      </div>
                      <div className="flex items-center gap-2 w-full sm:w-auto">
                        <div className="relative flex-1 sm:flex-initial">
                          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                          <Input
                            placeholder="بحث..."
                            value={adminSearchQuery}
                            onChange={(e) => setAdminSearchQuery(e.target.value)}
                            className="pr-9 w-full sm:w-48 bg-gray-700 border-gray-600 text-white"
                          />
                        </div>
                        <Dialog open={isItemDialogOpen} onOpenChange={setIsItemDialogOpen}>
                          <DialogTrigger asChild>
                            <Button onClick={resetItemForm} className="bg-orange-500 hover:bg-orange-600">
                              <Plus className="w-4 h-4 ml-2" />
                              إضافة صنف
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-md bg-gray-800 border-gray-700 max-h-[90vh] overflow-y-auto">
                            <DialogHeader>
                              <DialogTitle className="text-white">
                                {editingItem ? "تعديل الصنف" : "إضافة صنف جديد"}
                              </DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div className="grid grid-cols-2 gap-3">
                                <div>
                                  <Label className="text-gray-300">الاسم (عربي)</Label>
                                  <Input
                                    value={itemForm.nameAr}
                                    onChange={(e) => setItemForm({ ...itemForm, nameAr: e.target.value })}
                                    placeholder="اسم الصنف"
                                    className="bg-gray-700 border-gray-600 text-white"
                                  />
                                </div>
                                <div>
                                  <Label className="text-gray-300">الاسم (إنجليزي)</Label>
                                  <Input
                                    value={itemForm.name}
                                    onChange={(e) => setItemForm({ ...itemForm, name: e.target.value })}
                                    placeholder="Item Name"
                                    className="bg-gray-700 border-gray-600 text-white"
                                  />
                                </div>
                              </div>
                              <div className="grid grid-cols-2 gap-3">
                                <div>
                                  <Label className="text-gray-300">الوصف (عربي)</Label>
                                  <Textarea
                                    value={itemForm.descriptionAr}
                                    onChange={(e) => setItemForm({ ...itemForm, descriptionAr: e.target.value })}
                                    placeholder="وصف الصنف"
                                    rows={2}
                                    className="bg-gray-700 border-gray-600 text-white"
                                  />
                                </div>
                                <div>
                                  <Label className="text-gray-300">الوصف (إنجليزي)</Label>
                                  <Textarea
                                    value={itemForm.description}
                                    onChange={(e) => setItemForm({ ...itemForm, description: e.target.value })}
                                    placeholder="Description"
                                    rows={2}
                                    className="bg-gray-700 border-gray-600 text-white"
                                  />
                                </div>
                              </div>
                              <div className="grid grid-cols-2 gap-3">
                                <div>
                                  <Label className="text-gray-300">السعر (ر.س)</Label>
                                  <Input
                                    type="number"
                                    step="0.01"
                                    value={itemForm.price}
                                    onChange={(e) => setItemForm({ ...itemForm, price: e.target.value })}
                                    placeholder="0.00"
                                    className="bg-gray-700 border-gray-600 text-white"
                                  />
                                </div>
                                <div>
                                  <Label className="text-gray-300">التصنيف</Label>
                                  <Select
                                    value={itemForm.categoryId}
                                    onValueChange={(value) => setItemForm({ ...itemForm, categoryId: value })}
                                  >
                                    <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                                      <SelectValue placeholder="اختر التصنيف" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-gray-700 border-gray-600">
                                      {categories.map((cat) => (
                                        <SelectItem key={cat.id} value={cat.id}>
                                          {cat.icon} {cat.nameAr}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </div>
                              </div>
                              <div>
                                <Label className="text-gray-300">رابط الصورة</Label>
                                <Input
                                  value={itemForm.image}
                                  onChange={(e) => setItemForm({ ...itemForm, image: e.target.value })}
                                  placeholder="https://..."
                                  className="bg-gray-700 border-gray-600 text-white"
                                />
                              </div>
                              <div>
                                <Label className="text-gray-300">ترتيب العرض</Label>
                                <Input
                                  type="number"
                                  value={itemForm.sortOrder}
                                  onChange={(e) => setItemForm({ ...itemForm, sortOrder: parseInt(e.target.value) || 0 })}
                                  className="bg-gray-700 border-gray-600 text-white"
                                />
                              </div>
                              <div className="flex items-center gap-6">
                                <div className="flex items-center gap-2">
                                  <Switch
                                    checked={itemForm.isActive}
                                    onCheckedChange={(checked) => setItemForm({ ...itemForm, isActive: checked })}
                                  />
                                  <Label className="text-gray-300">تفعيل</Label>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Switch
                                    checked={itemForm.isAvailable}
                                    onCheckedChange={(checked) => setItemForm({ ...itemForm, isAvailable: checked })}
                                  />
                                  <Label className="text-gray-300">متوفر</Label>
                                </div>
                              </div>
                            </div>
                            <DialogFooter>
                              <Button variant="outline" onClick={() => setIsItemDialogOpen(false)} className="border-gray-600 text-gray-300">
                                إلغاء
                              </Button>
                              <Button onClick={handleSaveItem} className="bg-orange-500 hover:bg-orange-600">
                                {editingItem ? "تحديث" : "إضافة"}
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {menuItems.length === 0 ? (
                      <div className="text-center py-8">
                        <p className="text-gray-400 mb-4">لا توجد أصناف</p>
                        <Button onClick={handleSeed} disabled={isSeeding} className="bg-orange-500 hover:bg-orange-600">
                          <RefreshCw className={`w-4 h-4 ml-2 ${isSeeding ? "animate-spin" : ""}`} />
                          إضافة بيانات تجريبية
                        </Button>
                      </div>
                    ) : (
                      <ScrollArea className="h-[500px]">
                        <div className="space-y-2">
                          {adminFilteredItems.map((item) => (
                            <div
                              key={item.id}
                              className="flex items-center gap-4 p-3 rounded-lg border border-gray-700 hover:bg-gray-700/50"
                            >
                              <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-gray-700">
                                {item.image ? (
                                  <img
                                    src={item.image}
                                    alt={item.nameAr}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center">
                                    <UtensilsCrossed className="w-6 h-6 text-gray-500" />
                                  </div>
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <h4 className="font-medium text-white truncate">{item.nameAr}</h4>
                                  <Badge variant="outline" className="text-xs border-gray-600 text-gray-300">
                                    {item.category?.icon} {item.category?.nameAr}
                                  </Badge>
                                </div>
                                <p className="text-sm text-gray-500 truncate">{item.name}</p>
                              </div>
                              <div className="text-left">
                                <p className="font-bold text-orange-400">{item.price.toFixed(2)}</p>
                                <p className="text-xs text-gray-500">ر.س</p>
                              </div>
                              <div className="flex flex-col gap-1">
                                <Badge
                                  variant={item.isActive ? "default" : "secondary"}
                                  className="text-xs justify-center"
                                >
                                  {item.isActive ? (
                                    <><Check className="w-3 h-3 ml-1" /> مفعّل</>
                                  ) : (
                                    <><X className="w-3 h-3 ml-1" /> معطّل</>
                                  )}
                                </Badge>
                                <Badge
                                  variant={item.isAvailable ? "default" : "secondary"}
                                  className="text-xs justify-center"
                                >
                                  {item.isAvailable ? "متوفر" : "غير متوفر"}
                                </Badge>
                              </div>
                              <div className="flex items-center gap-1">
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  className="text-gray-400 hover:text-white"
                                  onClick={() => handleToggleItemActive(item)}
                                  title={item.isActive ? "تعطيل" : "تفعيل"}
                                >
                                  {item.isActive ? (
                                    <EyeOff className="w-4 h-4" />
                                  ) : (
                                    <Eye className="w-4 h-4" />
                                  )}
                                </Button>
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  className="text-gray-400 hover:text-white"
                                  onClick={() => openEditItem(item)}
                                >
                                  <Pencil className="w-4 h-4" />
                                </Button>
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button size="icon" variant="ghost" className="text-red-400 hover:text-red-300">
                                      <Trash2 className="w-4 h-4" />
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent className="bg-gray-800 border-gray-700">
                                    <AlertDialogHeader>
                                      <AlertDialogTitle className="text-white">حذف الصنف</AlertDialogTitle>
                                      <AlertDialogDescription className="text-gray-400">
                                        هل أنت متأكد من حذف &quot;{item.nameAr}&quot;؟
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel className="border-gray-600 text-gray-300">إلغاء</AlertDialogCancel>
                                      <AlertDialogAction
                                        className="bg-red-500 hover:bg-red-600"
                                        onClick={() => handleDeleteItem(item.id)}
                                      >
                                        حذف
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              </div>
                            </div>
                          ))}
                        </div>
                      </ScrollArea>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
