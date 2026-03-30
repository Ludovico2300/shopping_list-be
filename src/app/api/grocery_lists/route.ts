import { prisma } from "../../lib/prisma";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const id = url.searchParams.get("id");
  const userId = url.searchParams.get("userId");

  // GET ALL
  if (!id && !userId) {
    try {
      const lists = await prisma.grocery_lists.findMany({
        include: {
          users: true, // include info utente della lista
          list_items: {
            include: {
              products: true, // include info dell'item
            },
          },
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

  // GET BY ID
  if (id) {
    try {
      const list = await prisma.grocery_lists.findUnique({
        where: { id: Number(id) },
        include: {
          users: true, // include info utente della lista
          list_items: {
            include: {
              products: true, // include info dell'item
            },
          },
        },
      });
      return new Response(JSON.stringify(list), { status: 200 });
    } catch (error) {
      console.error(error);
      return new Response(
        JSON.stringify({ error: "Errore fetching grocery list" }),
        { status: 500 },
      );
    }
  }

  // GET BY USER ID
  if (userId) {
    try {
      const lists = await prisma.grocery_lists.findMany({
        where: {
          users: {
            id: Number(userId),
          },
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
}

export async function POST(req: Request) {
  const {
    user_id,
    name,
    description,
  }: {
    user_id: number;
    name: string;
    description?: string;
  } = await req.json();

  if (!user_id || !name) {
    return new Response(
      JSON.stringify({
        error: "User and name are required",
      }),
      { status: 400 },
    );
  }

  // Check if user with the same email already exists
  const existingList = await prisma.grocery_lists.findMany({
    where: { user_id, name },
  });

  if (existingList.length > 0) {
    return new Response(
      JSON.stringify({
        error: "Grocery list with this name already exists for the user",
      }),
      {
        status: 400,
      },
    );
  }

  try {
    const newGL = await prisma.grocery_lists.create({
      data: {
        user_id,
        name,
        description,
      },
    });
    return Response.json(
      {
        message: "Grocery list created successfully",
        newGL,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error(error);
    return new Response(
      JSON.stringify({ error: "Error creating grocery list" }),
      {
        status: 500,
      },
    );
  }
}

export async function PUT(req: Request) {
  const {
    name,
    description,
  }: {
    name?: string;
    description?: string;
  } = await req.json();
  const url = new URL(req.url);
  const id = url.searchParams.get("id");

  if (!id) {
    return new Response(
      JSON.stringify({
        error: "ID is required",
      }),
      { status: 400 },
    );
  }

  try {
    const updatedGL = await prisma.grocery_lists.update({
      where: { id: Number(id) },
      data: {
        name,
        description,
      },
    });
    return Response.json(
      {
        message: "Grocery list updated successfully",
        updatedGL,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error(error);
    return new Response(
      JSON.stringify({ error: "Error updating grocery list" }),
      {
        status: 500,
      },
    );
  }
}

export async function DELETE(req: Request) {
  const url = new URL(req.url);
  const id = url.searchParams.get("id");

  if (!id) {
    return new Response(
      JSON.stringify({
        error: "ID is required",
      }),
      { status: 400 },
    );
  }

  try {
    await prisma.grocery_lists.delete({
      where: { id: Number(id) },
    });
    return new Response(
      JSON.stringify({ message: "Grocery list deleted successfully" }),
      { status: 200 },
    );
  } catch (error) {
    console.error(error);
    return new Response(
      JSON.stringify({ error: "Error deleting grocery list" }),
      {
        status: 500,
      },
    );
  }
}
