import { NextRequest, NextResponse } from 'next/server';
import { hadithAPI } from '@/lib/hadith-db';

export async function GET(_req: NextRequest, { params }: { params: { collection: string } }) {
  try {
    const { searchParams } = new URL(_req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = (page - 1) * limit;
    
    // Parse collection parameter - it could be an ID or URN
    const collectionParam = params.collection;
    
    // If it looks like a number, treat as collectionId
    let collectionId: number | undefined;
    if (!isNaN(parseInt(collectionParam))) {
      collectionId = parseInt(collectionParam);
    }
    
    const data = await hadithAPI.getHadiths(collectionId!, { limit, offset });
    
    // Transform to match expected format
    const hadiths = data.arabic.map((arabic, index) => {
      const english = data.english[index] || {};
      return {
        ...arabic,
        ...english,
        collectionId: arabic.collection_id,
        hadithNumber: arabic.display_number ? [parseInt(arabic.display_number)] : undefined,
        bookId: arabic.book_id,
        bookName: `Book ${arabic.book_id || ''}`, // Note: getBooks should be called to get actual book names
        textShamela: arabic.content,
        grades: arabic.grades,
        comments: arabic.comments,
        narrators: arabic.narrators,
        id: index + 1,
      };
    });
    
    return NextResponse.json({ hadiths });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}