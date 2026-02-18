import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET - Fetch all categories
export async function GET() {
  try {
    const categories = await db.category.findMany({
      orderBy: { sortOrder: 'asc' },
      include: {
        _count: {
          select: { items: true }
        }
      }
    })
    return NextResponse.json(categories)
  } catch (error) {
    console.error('Error fetching categories:', error)
    return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 })
  }
}

// POST - Create new category
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, nameAr, icon, sortOrder } = body

    const category = await db.category.create({
      data: {
        name,
        nameAr,
        icon,
        sortOrder: sortOrder || 0,
      }
    })
    return NextResponse.json(category)
  } catch (error) {
    console.error('Error creating category:', error)
    return NextResponse.json({ error: 'Failed to create category' }, { status: 500 })
  }
}

// PUT - Update category
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, name, nameAr, icon, sortOrder, isActive } = body

    const category = await db.category.update({
      where: { id },
      data: {
        name,
        nameAr,
        icon,
        sortOrder,
        isActive,
      }
    })
    return NextResponse.json(category)
  } catch (error) {
    console.error('Error updating category:', error)
    return NextResponse.json({ error: 'Failed to update category' }, { status: 500 })
  }
}

// DELETE - Delete category
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Category ID is required' }, { status: 400 })
    }

    // Check if category has items
    const itemsCount = await db.menuItem.count({
      where: { categoryId: id }
    })

    if (itemsCount > 0) {
      return NextResponse.json({ 
        error: 'Cannot delete category with items. Please delete or move items first.' 
      }, { status: 400 })
    }

    await db.category.delete({
      where: { id }
    })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting category:', error)
    return NextResponse.json({ error: 'Failed to delete category' }, { status: 500 })
  }
}
