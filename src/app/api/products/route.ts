import { prisma } from "../../lib/prisma";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const barcode = url.searchParams.get("barcode");

  // GET ALL
  if (!barcode) {
    const products = await prisma.products.findMany();
    return Response.json(products);
  }

  // GET BY BARCODE
  const product = await prisma.products.findMany({
    where: { barcode },
  });

  if (!product) {
    return new Response(JSON.stringify({ error: "Product not found" }), {
      status: 404,
    });
  }

  return Response.json(product);
}

export async function POST(req: Request) {
  const {
    name,
    category,
    default_unit,
    barcode,
  }: {
    name: string;
    category?: string;
    default_unit?: string;
    barcode?: string;
  } = await req.json();

  if (!name) {
    return new Response(
      JSON.stringify({
        error: "Name is required",
      }),
      { status: 400 },
    );
  }

  // Check if product with the same barcode already exists
  const existingProduct = await prisma.products.findMany({
    where: { barcode },
  });

  if (existingProduct.length > 0) {
    return new Response(
      JSON.stringify({ error: "Product with this barcode already exists" }),
      {
        status: 400,
      },
    );
  }

  try {
    const newProduct = await prisma.products.create({
      data: {
        name,
        category,
        default_unit,
        barcode,
      },
    });
    return Response.json(
      {
        message: "Product created successfully",
        newProduct,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ error: "Error creating product" }), {
      status: 500,
    });
  }
}

export async function DELETE(req: Request) {
  const url = new URL(req.url);
  const id = url.searchParams.get("id");

  if (!id) {
    return new Response(
      JSON.stringify({ error: "Product ID is required for deletion" }),
      { status: 400 },
    );
  }

  try {
    await prisma.products.delete({
      where: { id: Number(id) },
    });
    return new Response(
      JSON.stringify({ message: "Product deleted successfully" }),
      { status: 200 },
    );
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ error: "Error deleting product" }), {
      status: 500,
    });
  }
}

export async function PUT(req: Request) {
  const url = new URL(req.url);
  const id = url.searchParams.get("id");
  const {
    name,
    category,
    default_unit,
    barcode,
  }: {
    name: string;
    category?: string;
    default_unit?: string;
    barcode?: string;
  } = await req.json();

  if (!id) {
    return new Response(
      JSON.stringify({ error: "Product ID is required for update" }),
      { status: 400 },
    );
  }

  try {
    const updatedProduct = await prisma.products.update({
      where: { id: Number(id) },
      data: {
        name,
        category,
        default_unit,
        barcode,
      },
    });
    return Response.json(
      {
        message: "Product updated successfully",
        updatedProduct,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ error: "Error updating product" }), {
      status: 500,
    });
  }
}
