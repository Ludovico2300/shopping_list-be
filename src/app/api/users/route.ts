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

export async function POST(req: Request) {
  const {
    email,
    display_name,
    password,
  }: {
    email: string;
    display_name?: string;
    password: string;
  } = await req.json();

  if (!email || !password) {
    return new Response(
      JSON.stringify({
        error: "Email and password are required",
      }),
      { status: 400 },
    );
  }

  // Check if user with the same email already exists
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

  try {
    const newUser = await prisma.users.create({
      data: {
        email,
        display_name,
        password,
      },
    });
    return Response.json(
      {
        message: "User created successfully",
        newUser,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ error: "Error creating user" }), {
      status: 500,
    });
  }
}
