import { prisma } from "@/src/app/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  const body = await req.json();
  const { email, password, display_name } = body;

  const existingUser = await prisma.users.findUnique({
    where: { email },
  });

  if (existingUser) {
    return new Response(
      JSON.stringify({ error: "User with this email already exists" }),
      {
        status: 400,
      },
    );
  }

  // 🔒 hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await prisma.users.create({
    data: {
      email,
      password: hashedPassword,
      display_name,
    },
  });

  // ❌ NON mandare password al client
  const { password: _, ...safeUser } = user;

  return Response.json(safeUser);
}
