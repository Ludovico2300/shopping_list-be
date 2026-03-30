import { prisma } from "../../lib/prisma";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const id = url.searchParams.get("id");

  // GET ALL
  if (!id) {
    const users = await prisma.users.findMany();
    return Response.json(users);
  }

  // GET BY ID
  const user = await prisma.users.findUnique({
    where: { id: Number(id) },
  });

  if (!user) {
    return new Response(JSON.stringify({ error: "User not found" }), {
      status: 404,
    });
  }

  return Response.json(user);
}
