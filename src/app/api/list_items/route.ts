import { prisma } from "../../lib/prisma";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const id = url.searchParams.get("id");
  const userId = url.searchParams.get("userId");

  // GET ALL
  if (!id && !userId) {
    try {
      const lists = await prisma.list_items.findMany({
        include: {
          grocery_lists: {
            include: {
              users: true, // include info utente della lista
            },
          }, // include info utente della lista
        },
      });

      return new Response(JSON.stringify(lists), { status: 200 });
    } catch (error) {
      console.error(error);
      return new Response(
        JSON.stringify({ error: "Errore fetching list items" }),
        { status: 500 },
      );
    }
  }

  // GET BY ID
  if (id) {
    try {
      const list = await prisma.list_items.findUnique({
        where: { id: Number(id) },
        include: {
          grocery_lists: {
            include: {
              users: true, // include info utente della lista
            },
          },
        },
      });
      return new Response(JSON.stringify(list), { status: 200 });
    } catch (error) {
      console.error(error);
      return new Response(
        JSON.stringify({ error: "Errore fetching list item" }),
        { status: 500 },
      );
    }
  }

  // GET BY USER ID
  if (userId) {
    try {
      const lists = await prisma.list_items.findMany({
        where: {
          grocery_lists: {
            user_id: Number(userId),
          },
        },
      });
      return new Response(JSON.stringify(lists), { status: 200 });
    } catch (error) {
      console.error(error);
      return new Response(
        JSON.stringify({ error: "Errore fetching list items" }),
        { status: 500 },
      );
    }
  }
}

export async function POST(req: Request) {
  const {
    grocery_list_id,
    product_id,
    quantity,
    notes,
    is_bought = false,
  }: {
    grocery_list_id: number;
    product_id: number;
    quantity: number;
    notes?: string;
    is_bought?: boolean;
  } = await req.json();

  if (!grocery_list_id || !product_id || !quantity) {
    return new Response(
      JSON.stringify({
        error: "Grocery list ID, product ID, and quantity are required",
      }),
      { status: 400 },
    );
  }

  // Check if user with the same email already exists
  const productNotFound = await prisma.products.findMany({
    where: { id: product_id },
  });

  if (productNotFound.length === 0) {
    return new Response(
      JSON.stringify({
        error: "Product not found",
      }),
      {
        status: 400,
      },
    );
  }

  try {
    const newListItem = await prisma.list_items.create({
      data: {
        grocery_list_id,
        product_id,
        quantity,
        notes,
        is_bought,
      },
    });
    return Response.json(
      {
        message: "List item created successfully",
        newListItem,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ error: "Error creating list item" }), {
      status: 500,
    });
  }
}

export async function PUT(req: Request) {
  const {
    grocery_list_id,
    product_id,
    quantity,
    notes,
    is_bought = false,
  }: {
    id: number;
    grocery_list_id: number;
    product_id: number;
    quantity: number;
    notes?: string;
    is_bought?: boolean;
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
    const updatedListItem = await prisma.list_items.update({
      where: { id: Number(id) },
      data: {
        grocery_list_id,
        product_id,
        quantity,
        notes,
        is_bought,
      },
    });
    return Response.json(
      {
        message: "List item updated successfully",
        updatedListItem,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ error: "Error updating list item" }), {
      status: 500,
    });
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
    await prisma.list_items.delete({
      where: { id: Number(id) },
    });
    return new Response(
      JSON.stringify({ message: "List item deleted successfully" }),
      { status: 200 },
    );
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ error: "Error deleting list item" }), {
      status: 500,
    });
  }
}
