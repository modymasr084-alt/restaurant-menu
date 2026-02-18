import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET - Fetch settings
export async function GET() {
  try {
    let settings = await db.settings.findFirst()
    
    // Create default settings if not exists
    if (!settings) {
      settings = await db.settings.create({
        data: {
          restaurantName: 'مطعم الذواقة',
          restaurantNameEn: 'Restaurant',
        }
      })
    }
    
    return NextResponse.json(settings)
  } catch (error) {
    console.error('Error fetching settings:', error)
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 })
  }
}

// PUT - Update settings
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { restaurantName, restaurantNameEn, logo } = body

    let settings = await db.settings.findFirst()

    if (settings) {
      settings = await db.settings.update({
        where: { id: settings.id },
        data: {
          restaurantName,
          restaurantNameEn,
          logo,
        }
      })
    } else {
      settings = await db.settings.create({
        data: {
          restaurantName,
          restaurantNameEn,
          logo,
        }
      })
    }

    return NextResponse.json(settings)
  } catch (error) {
    console.error('Error updating settings:', error)
    return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 })
  }
}
