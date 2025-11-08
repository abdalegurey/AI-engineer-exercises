// import { connectDB } from "@/lib/mongodb";
// import { Movie } from "@/models/Movie";

// export async function POST(req: Request) {
//   try {
//     await connectDB();
//     const data = await req.json();
//     const movie = await Movie.create(data);
//     return Response.json(movie);
//   } catch (err: any) {
//     return Response.json({ error: err.message }, { status: 500 });
//   }
// }

// export async function GET() {
//   await connectDB();
//   const movies = await Movie.find();
//   return Response.json(movies);
// }


// app/api/movies/route.ts
import { connectDB } from "@/lib/mongodb";
import { Movie } from "@/models/Movie";

export async function POST(req: Request) {
  try {
    await connectDB();
    const data = await req.json();

    // Optional: check required fields
    if (!data.title) {
      return new Response(JSON.stringify({ error: "Title is required" }), { status: 400 });
    }

    const movie = await Movie.create(data);
    return new Response(JSON.stringify(movie), { status: 201 });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}

export async function GET() {
  try {
    await connectDB();
    const movies = await Movie.find().sort({ createdAt: -1 }); // latest first
    return new Response(JSON.stringify(movies), { status: 200 });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}
