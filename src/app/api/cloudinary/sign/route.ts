import { createHash } from 'crypto'
import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'nodejs'

export async function GET(req: NextRequest) {
  const secret = process.env.CLOUDINARY_API_SECRET
  if (!secret) {
    return NextResponse.json({ error: 'Cloudinary no configurado' }, { status: 500 })
  }

  const folder = req.nextUrl.searchParams.get('folder') ?? 'cosmere-fanarts'
  const timestamp = Math.round(Date.now() / 1000)

  // Params must be sorted alphabetically before signing
  const paramsStr = `folder=${folder}&timestamp=${timestamp}`
  const signature = createHash('sha1')
    .update(paramsStr + secret)
    .digest('hex')

  return NextResponse.json({
    signature,
    timestamp,
    folder,
    apiKey: process.env.CLOUDINARY_API_KEY,
    cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  })
}
