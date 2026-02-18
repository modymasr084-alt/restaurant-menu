import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET - Fetch all menu items
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const categoryId = searchParams.get('categoryId')
    const search = searchParams.get('search')
    const activeOnly = searchParams.get('activeOnly') === 'true'

    const where: any = {}
    
    if (categoryId) {
      where.categoryId = categoryId
    }
    
    if (activeOnly) {
      where.isActive = true
      where.isAvailable = true
    }

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { nameAr: { contains: search } },
        { description: { contains: search } },
        { descriptionAr: { contains: search } },
      ]
    }

    const items = await db.menuItem.findMany({
      where,
      include: {
        category: true
      },
      orderBy: [
        { sortOrder: 'asc' },
        { createdAt: 'desc' }
      ]
    })
    return NextResponse.json(items)
  } catch (error) {
    console.error('Error fetching menu items:', error)
    return NextResponse.json({ error: 'Failed to fetch menu items' }, { status: 500 })
  }
}

// POST - Create new menu item
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, nameAr, description, descriptionAr, price, image, categoryId, sortOrder } = body

    const item = await db.menuItem.create({
      data: {
        name,
        nameAr,
        description,
        descriptionAr,
        price: parseFloat(price),
        image,
        categoryId,
        sortOrder: sortOrder || 0,
      },
      include: {
        category: true
      }
    })
    return NextResponse.json(item)
  } catch (error) {
    console.error('Error creating menu item:', error)
    return NextResponse.json({ error: 'Failed to create menu item' }, { status: 500 })
  }
}

// PUT - Update menu item
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, name, nameAr, description, descriptionAr, price, image, categoryId, sortOrder, isActive, isAvailable } = body

    const item = await db.menuItem.update({
      where: { id },
      data: {
        name,
        nameAr,
        description,
        descriptionAr,
        price: parseFloat(price),
        image,
        categoryId,
        sortOrder,
        isActive,
        isAvailable,
      },
      include: {
        category: true
      }
    })
    return NextResponse.json(item)
  } catch (error) {
    console.error('Error updating menu item:', error)
    return NextResponse.json({ error: 'Failed to update menu item' }, { status: 500 })
  }
}

// DELETE - Delete menu item
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Menu item ID is required' }, { status: 400 })
    }

    await db.menuItem.delete({
      where: { id }
    })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting menu item:', error)
    return NextResponse.json({ error: 'Failed to delete menu item' }, { status: 500 })
  }
}
