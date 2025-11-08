import { NextResponse } from 'next/server';
import fetch from 'node-fetch';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const title = searchParams.get('title');
  const year = searchParams.get('year') || '';

  const apiKey = process.env.OMDB_API_KEY;
  if (!apiKey) return NextResponse.json({ error: 'OMDb API key not set' }, { status: 500 });

  const url = `http://www.omdbapi.com/?t=${encodeURIComponent(title!)}${year ? `&y=${year}` : ''}&apikey=${apiKey}`;
  const res = await fetch(url);
  const data = await res.json();

  return NextResponse.json(data);
}
