import { connectDB } from "@/lib/mongodb";
import { Review } from "@/models/Review";

export async function POST(req: Request) {
  try {
    await connectDB();
    const data = await req.json();
    const review = await Review.create(data);
    return Response.json(review);
  } catch (err: any) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}

export async function GET() {
  await connectDB();
  const reviews = await Review.find().populate("movieId").populate("userId");
  return Response.json(reviews);
}
