import { NextResponse } from 'next/server';
import { hadithAPI } from '@/lib/hadith-db';

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  try {
    const collection = await hadithAPI.getCollection(parseInt(params.id));
    if (!collection) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json(collection);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
