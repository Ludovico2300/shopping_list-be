import { requireAuth } from "../../lib/auth";
import { prisma } from "../../lib/prisma";

// --- GET ---
export async function GET(req: Request) {
  const payload = requireAuth(req);
  if (!payload) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
    });
  }
  const userId = payload.id;

  const url = new URL(req.url);
  const id = url.searchParams.get("id");

  try {
    // GET single list by ID
    if (id) {
      const list = await prisma.grocery_lists.findUnique({
        where: { id: Number(id) },
        include: {
          users: true,
          list_items: { include: { products: true } },
        },
      });
      if (!list || list.user_id !== userId) {
        return new Response(JSON.stringify({ error: "Not found" }), {
          status: 404,
        });
      }
      return new Response(JSON.stringify(list), { status: 200 });
    }

    // GET all lists for logged-in user
    const lists = await prisma.grocery_lists.findMany({
      where: { user_id: userId },
      include: {
        users: true,
        list_items: { include: { products: true } },
      },
    });

    return new Response(JSON.stringify(lists), { status: 200 });
  } catch (error) {
    console.error(error);
    return new Response(
      JSON.stringify({ error: "Errore fetching grocery lists" }),
      { status: 500 },
    );
  }
}

// --- POST ---
export async function POST(req: Request) {
  const payload = requireAuth(req);
  if (!payload)
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
    });
  const userId = payload.id;

  const { name, description }: { name: string; description?: string } =
    await req.json();

  if (!name) {
    return new Response(JSON.stringify({ error: "Name is required" }), {
      status: 400,
    });
  }

  // Check if list with same name exists for this user
  const existingList = await prisma.grocery_lists.findFirst({
    where: { user_id: userId, name },
  });
  if (existingList) {
    return new Response(
      JSON.stringify({ error: "Grocery list with this name already exists" }),
      { status: 400 },
    );
  }

  try {
    const newGL = await prisma.grocery_lists.create({
      data: { user_id: userId, name, description },
    });
    return new Response(
      JSON.stringify({ message: "Grocery list created", newGL }),
      { status: 201 },
    );
  } catch (error) {
    console.error(error);
    return new Response(
      JSON.stringify({ error: "Error creating grocery list" }),
      { status: 500 },
    );
  }
}

// --- PUT ---
export async function PUT(req: Request) {
  const payload = requireAuth(req);
  if (!payload)
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
    });
  const userId = payload.id;

  const { name, description }: { name?: string; description?: string } =
    await req.json();
  const url = new URL(req.url);
  const id = url.searchParams.get("id");

  if (!id)
    return new Response(JSON.stringify({ error: "ID is required" }), {
      status: 400,
    });

  try {
    // Make sure user owns the list
    const list = await prisma.grocery_lists.findUnique({
      where: { id: Number(id) },
    });
    if (!list || list.user_id !== userId) {
      return new Response(
        JSON.stringify({ error: "Not found or unauthorized" }),
        { status: 404 },
      );
    }

    const updatedGL = await prisma.grocery_lists.update({
      where: { id: Number(id) },
      data: { name, description },
    });
    return new Response(
      JSON.stringify({ message: "Grocery list updated", updatedGL }),
      { status: 200 },
    );
  } catch (error) {
    console.error(error);
    return new Response(
      JSON.stringify({ error: "Error updating grocery list" }),
      { status: 500 },
    );
  }
}

// --- DELETE ---
export async function DELETE(req: Request) {
  const payload = requireAuth(req);
  if (!payload)
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
    });
  const userId = payload.id;

  const url = new URL(req.url);
  const id = url.searchParams.get("id");
  if (!id)
    return new Response(JSON.stringify({ error: "ID is required" }), {
      status: 400,
    });

  try {
    const list = await prisma.grocery_lists.findUnique({
      where: { id: Number(id) },
    });
    if (!list || list.user_id !== userId) {
      return new Response(
        JSON.stringify({ error: "Not found or unauthorized" }),
        { status: 404 },
      );
    }

    await prisma.grocery_lists.delete({ where: { id: Number(id) } });
    return new Response(JSON.stringify({ message: "Grocery list deleted" }), {
      status: 200,
    });
  } catch (error) {
    console.error(error);
    return new Response(
      JSON.stringify({ error: "Error deleting grocery list" }),
      { status: 500 },
    );
  }
}
