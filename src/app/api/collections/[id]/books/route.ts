import { NextResponse } from 'next/server';
import { hadithAPI } from '@/lib/hadith-db';

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  try {
    const books = await hadithAPI.getBooks(parseInt(params.id));
    return NextResponse.json(books);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
