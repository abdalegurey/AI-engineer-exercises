import { connectDB } from "@/lib/mongodb";
import { User } from "@/models/User";

export async function POST(req: Request) {
  try {
    await connectDB();
    const data = await req.json();
    const user = await User.create(data);
    return Response.json(user);
  } catch (err: any) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}

export async function GET() {
  await connectDB();
  const users = await User.find();
  return Response.json(users);
}
