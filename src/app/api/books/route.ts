import { NextResponse } from 'next/server';
import { hadithAPI } from '@/lib/hadith-db';

export async function GET() {
  try {
    const collections = await hadithAPI.getCollections();
    return NextResponse.json(collections);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}