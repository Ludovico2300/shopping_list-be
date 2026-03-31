import { signToken } from "@/src/app/lib/jwt";
import { prisma } from "@/src/app/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  const body = await req.json();
  const { email, password } = body;

  const user = await prisma.users.findUnique({
    where: { email },
  });

  if (!user) {
    return new Response(JSON.stringify({ error: "User not found" }), {
      status: 404,
    });
  }

  // 🔍 verifica password
  const isValid = await bcrypt.compare(password, user.password);

  if (!isValid) {
    return new Response(JSON.stringify({ error: "Invalid credentials" }), {
      status: 401,
    });
  }

  // 🔑 crea JWT
  const token = signToken({
    userId: user.id,
    email: user.email,
  });

  return Response.json({ token });
}
