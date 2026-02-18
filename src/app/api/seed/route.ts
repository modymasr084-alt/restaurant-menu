import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    // Check if data already exists
    const existingCategories = await db.category.count()
    if (existingCategories > 0) {
      return NextResponse.json({ message: 'Database already seeded' })
    }

    // Create categories
    const categories = await Promise.all([
      db.category.create({
        data: {
          name: 'Main Dishes',
          nameAr: 'الأطباق الرئيسية',
          icon: '🍽️',
          sortOrder: 1,
        }
      }),
      db.category.create({
        data: {
          name: 'Appetizers',
          nameAr: 'المقبلات',
          icon: '🥗',
          sortOrder: 2,
        }
      }),
      db.category.create({
        data: {
          name: 'Drinks',
          nameAr: 'المشروبات',
          icon: '🥤',
          sortOrder: 3,
        }
      }),
      db.category.create({
        data: {
          name: 'Desserts',
          nameAr: 'الحلويات',
          icon: '🍰',
          sortOrder: 4,
        }
      }),
      db.category.create({
        data: {
          name: 'Grills',
          nameAr: 'المشاوي',
          icon: '🍢',
          sortOrder: 5,
        }
      }),
    ])

    // Create menu items with Unsplash images
    const menuItems = [
      // Main Dishes
      {
        name: 'Grilled Chicken',
        nameAr: 'دجاج مشوي',
        description: 'Tender grilled chicken served with rice and vegetables',
        descriptionAr: 'دجاج طري مشوي يقدم مع الأرز والخضروات',
        price: 45.00,
        image: 'https://images.unsplash.com/photo-1598103442097-8b74394b95c6?w=400&h=300&fit=crop',
        categoryId: categories[0].id,
        sortOrder: 1,
      },
      {
        name: 'Lamb Mandi',
        nameAr: 'مندي لحم ضأن',
        description: 'Traditional Yemeni lamb dish with fragrant rice',
        descriptionAr: 'طبق يمني تقليدي من لحم الضأن مع أرز عطري',
        price: 65.00,
        image: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=400&h=300&fit=crop',
        categoryId: categories[0].id,
        sortOrder: 2,
      },
      {
        name: 'Fish Fillet',
        nameAr: 'فيليه سمك',
        description: 'Fresh fish fillet with lemon butter sauce',
        descriptionAr: 'فيليه سمك طازج مع صلصة الليمون والزبدة',
        price: 55.00,
        image: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=400&h=300&fit=crop',
        categoryId: categories[0].id,
        sortOrder: 3,
      },
      {
        name: 'Kabsa',
        nameAr: 'كبسة',
        description: 'Saudi traditional rice dish with meat',
        descriptionAr: 'طبق أرز سعودي تقليدي مع اللحم',
        price: 50.00,
        image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=400&h=300&fit=crop',
        categoryId: categories[0].id,
        sortOrder: 4,
      },

      // Appetizers
      {
        name: 'Hummus',
        nameAr: 'حمص',
        description: 'Creamy chickpea dip with olive oil and pita bread',
        descriptionAr: 'غمس الحمص الكريمي مع زيت الزيتون والخبز',
        price: 15.00,
        image: 'https://images.unsplash.com/photo-1577805947697-89340a0c4d75?w=400&h=300&fit=crop',
        categoryId: categories[1].id,
        sortOrder: 1,
      },
      {
        name: 'Tabbouleh',
        nameAr: 'تبولة',
        description: 'Fresh parsley salad with tomatoes and bulgur',
        descriptionAr: 'سلطة بقدونس طازجة مع الطماطم والبرغل',
        price: 18.00,
        image: 'https://images.unsplash.com/photo-1546793665-c74683f339c1?w=400&h=300&fit=crop',
        categoryId: categories[1].id,
        sortOrder: 2,
      },
      {
        name: 'Fattoush',
        nameAr: 'فتوش',
        description: 'Lebanese bread salad with fresh vegetables',
        descriptionAr: 'سلطة خبز لبنانية مع الخضروات الطازجة',
        price: 16.00,
        image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&h=300&fit=crop',
        categoryId: categories[1].id,
        sortOrder: 3,
      },
      {
        name: 'Moutabal',
        nameAr: 'متبل',
        description: 'Smoky eggplant dip with tahini',
        descriptionAr: 'غمس باذنجان مدخن مع الطحينة',
        price: 17.00,
        image: 'https://images.unsplash.com/photo-1623428187969-5da2dcea5ebf?w=400&h=300&fit=crop',
        categoryId: categories[1].id,
        sortOrder: 4,
      },

      // Drinks
      {
        name: 'Fresh Orange Juice',
        nameAr: 'عصير برتقال طازج',
        description: 'Freshly squeezed orange juice',
        descriptionAr: 'عصير برتقال معصور طازج',
        price: 12.00,
        image: 'https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?w=400&h=300&fit=crop',
        categoryId: categories[2].id,
        sortOrder: 1,
      },
      {
        name: 'Mango Smoothie',
        nameAr: 'سموذي مانجو',
        description: 'Creamy mango smoothie with yogurt',
        descriptionAr: 'سموذي مانجو كريمي مع الزبادي',
        price: 18.00,
        image: 'https://images.unsplash.com/photo-1546173159-315724a31696?w=400&h=300&fit=crop',
        categoryId: categories[2].id,
        sortOrder: 2,
      },
      {
        name: 'Arabic Coffee',
        nameAr: 'قهوة عربية',
        description: 'Traditional Arabic coffee with cardamom',
        descriptionAr: 'قهوة عربية تقليدية مع الهيل',
        price: 8.00,
        image: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=400&h=300&fit=crop',
        categoryId: categories[2].id,
        sortOrder: 3,
      },
      {
        name: 'Iced Latte',
        nameAr: 'لاتيه مثلج',
        description: 'Cold coffee latte with milk',
        descriptionAr: 'قهوة لاتيه باردة مع الحليب',
        price: 15.00,
        image: 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=400&h=300&fit=crop',
        categoryId: categories[2].id,
        sortOrder: 4,
      },

      // Desserts
      {
        name: 'Kunafa',
        nameAr: 'كنافة',
        description: 'Sweet cheese pastry with syrup',
        descriptionAr: 'معجنات جبن حلوة مع القطر',
        price: 25.00,
        image: 'https://images.unsplash.com/photo-1579888944880-d98341245702?w=400&h=300&fit=crop',
        categoryId: categories[3].id,
        sortOrder: 1,
      },
      {
        name: 'Baklava',
        nameAr: 'بقلاوة',
        description: 'Layers of phyllo pastry with nuts and honey',
        descriptionAr: 'طبقات من العجين مع المكسرات والعسل',
        price: 20.00,
        image: 'https://images.unsplash.com/photo-1519676867240-f03562e64548?w=400&h=300&fit=crop',
        categoryId: categories[3].id,
        sortOrder: 2,
      },
      {
        name: 'Chocolate Cake',
        nameAr: 'كيكة شوكولاتة',
        description: 'Rich chocolate layer cake',
        descriptionAr: 'كيكة شوكولاتة غنية بالطبقات',
        price: 22.00,
        image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400&h=300&fit=crop',
        categoryId: categories[3].id,
        sortOrder: 3,
      },
      {
        name: 'Ice Cream',
        nameAr: 'آيس كريم',
        description: 'Assorted flavors of premium ice cream',
        descriptionAr: 'نكهات متنوعة من الآيس كريم الفاخر',
        price: 15.00,
        image: 'https://images.unsplash.com/photo-1497034825429-c343d7c6a68f?w=400&h=300&fit=crop',
        categoryId: categories[3].id,
        sortOrder: 4,
      },

      // Grills
      {
        name: 'Mixed Grill',
        nameAr: 'مشكل مشاوي',
        description: 'Assorted grilled meats with rice',
        descriptionAr: 'مجموعة مشاوي متنوعة مع الأرز',
        price: 75.00,
        image: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=400&h=300&fit=crop',
        categoryId: categories[4].id,
        sortOrder: 1,
      },
      {
        name: 'Lamb Chops',
        nameAr: 'ريش لحم',
        description: 'Grilled lamb chops with herbs',
        descriptionAr: 'ريش لحم ضأن مشوية مع الأعشاب',
        price: 85.00,
        image: 'https://images.unsplash.com/photo-1432139555190-58524dae6a55?w=400&h=300&fit=crop',
        categoryId: categories[4].id,
        sortOrder: 2,
      },
      {
        name: 'Shish Tawook',
        nameAr: 'شيش طاووق',
        description: 'Grilled marinated chicken skewers',
        descriptionAr: 'أسياخ دجاج متبل مشوية',
        price: 45.00,
        image: 'https://images.unsplash.com/photo-1603360946369-dc9bb6258143?w=400&h=300&fit=crop',
        categoryId: categories[4].id,
        sortOrder: 3,
      },
      {
        name: 'Kebab',
        nameAr: 'كباب',
        description: 'Grilled minced meat skewers',
        descriptionAr: 'أسياخ لحم مفروم مشوية',
        price: 50.00,
        image: 'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=400&h=300&fit=crop',
        categoryId: categories[4].id,
        sortOrder: 4,
      },
    ]

    await Promise.all(
      menuItems.map(item => 
        db.menuItem.create({
          data: item
        })
      )
    )

    return NextResponse.json({ 
      message: 'Database seeded successfully',
      categories: categories.length,
      items: menuItems.length
    })
  } catch (error) {
    console.error('Error seeding database:', error)
    return NextResponse.json({ error: 'Failed to seed database' }, { status: 500 })
  }
}
