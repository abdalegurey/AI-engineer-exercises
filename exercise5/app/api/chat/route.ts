import { openai } from '@ai-sdk/openai';
import { streamText, UIMessage, convertToModelMessages, tool, stepCountIs } from 'ai';
import { z } from 'zod';
import { connectDB, Movie, User, Review } from '@/lib/mongodb';
import fetch from 'node-fetch';

export const maxDuration = 30;

// Fetch movie from OMDb or MongoDB cache
async function searchMovies(keyword: string) {
  const apiKey = process.env.OMDB_API_KEY;
  const url = `http://www.omdbapi.com/?s=${encodeURIComponent(keyword)}&apikey=${apiKey}`;

  const res = await fetch(url);
  const data = await res.json();

  if (data.Response === 'False') throw new Error(data.Error || 'No results found');
  return data.Search; // returns array of short movie objects
}


async function getRecommendations(genre: string, year?: string) {
  await connectDB();
  const query: any = { genre: new RegExp(genre.split(',')[0], 'i') };
  if (year) query.year = year;

  // Try MongoDB cache first
  const cached = await Movie.find(query).limit(5);
  if (cached.length > 0) return cached;

  // If not cached, fetch by genre keyword
  const apiKey = process.env.OMDB_API_KEY;
  const url = `http://www.omdbapi.com/?s=${encodeURIComponent(genre)}&apikey=${apiKey}`;
  const res = await fetch(url);
  const data = await res.json();

  if (data.Response === 'False') return [];
  return data.Search.slice(0, 5);
}

async function getOrFetchMovie(title: string, year?: string) {
  await connectDB();

  const existing = await Movie.findOne({ title: new RegExp(`^${title}$`, 'i'), year });
  if (existing) return existing;

  const apiKey = process.env.OMDB_API_KEY;
  const url = `http://www.omdbapi.com/?t=${encodeURIComponent(title)}${year ? `&y=${year}` : ''}&apikey=${apiKey}`;

  try {
    const res = await fetch(url);
    const data = await res.json();

    if (data.Response === 'False') throw new Error(data.Error || 'Movie not found');

    const movieData = {
      title: data.Title,
      year: data.Year,
      genre: data.Genre,
      director: data.Director,
      actors: data.Actors,
      plot: data.Plot,
      runtime: data.Runtime,
      poster: data.Poster,
      ratings: data.Ratings,
    };

    await Movie.create(movieData);
    return movieData;
  } catch (err: any) {
    console.warn('OMDb fetch failed, returning cached data if any');
    const fallback = await Movie.findOne({ title: new RegExp(title, 'i') });
    return fallback || { error: 'Unable to fetch movie. Try again later.' };
  }
}




async function fetchDadJokeAPI(category?: string) {
  try {
    const res = await fetch('https://icanhazdadjoke.com/', {
      headers: { Accept: 'application/json' },
    });
    const data = await res.json();
    return data.joke;
  } catch (err) {
    return 'Oops! Could not fetch a joke right now 😅';
  }
}





export async function POST(req: Request) {
  const { messages }: { messages: UIMessage[] } = await req.json();

  const result = streamText({
    model: openai('gpt-4o'),
    messages: convertToModelMessages(messages),
    stopWhen: stepCountIs(5),
   tools: {
  queryMongoDB: tool({
    description: 'Query local MongoDB collections',
    inputSchema: z.object({ collection: z.enum(['movies','users','reviews']), query: z.any() }),
    execute: async ({ collection, query }) => {
      switch (collection) {
        case 'movies': return await Movie.find(query).limit(10);
        case 'users': return await User.find(query).limit(10);
        case 'reviews': return await Review.find(query).limit(10);
        default: return { error: 'Invalid collection' };
      }
    },
  }),
  queryOMDb: tool({
    description: 'Fetch detailed movie info from OMDb',
    inputSchema: z.object({ title: z.string(), year: z.string().optional() }),
    execute: async ({ title, year }) => {
      try {
        return await getOrFetchMovie(title, year);
      } catch(err:any) {
        return { error: err.message || 'Movie not found' };
      }
    }
  }),
  searchMovies: tool({
    description: 'Search movies by partial title using OMDb API',
    inputSchema: z.object({ keyword: z.string() }),
    execute: async ({ keyword }) => {
      try {
        return await searchMovies(keyword);
      } catch (err:any) {
        return { error: err.message };
      }
    },
  }),
  recommendMovies: tool({
    description: 'Get recommended movies based on genre and year',
    inputSchema: z.object({ genre: z.string(), year: z.string().optional() }),
    execute: async ({ genre, year }) => {
      return await getRecommendations(genre, year);
    },
  }),
 
 getDadJoke: tool({
  description: 'Fetch a random dad joke from icanhazdadjoke API',
  inputSchema: z.object({ category: z.string().optional() }),
  execute: async ({ category }) => await fetchDadJokeAPI(category),
}),


  
},

    system: 'You are a smart assistant. Use queryMongoDB for local data and queryOMDb for OMDb API.',
  });

  return result.toUIMessageStreamResponse();
}
