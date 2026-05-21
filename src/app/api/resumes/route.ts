import { NextResponse } from "next/server";
import { getOrCreateUser } from "@/lib/user";
import { extractPdfText } from "@/lib/pdf";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Vercel serverless functions reject request bodies above ~4.5 MB at the edge,
// so keep our own limit just under that.
const MAX_BYTES = 4 * 1024 * 1024; // 4 MB

export async function POST(req: Request) {
  const user = await getOrCreateUser();
  if (!user) {
    return NextResponse.json({ error: "Не авторизованы." }, { status: 401 });
  }

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json(
      { error: "Ожидался файл (multipart/form-data)." },
      { status: 400 },
    );
  }

  const file = form.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Файл не получен." }, { status: 400 });
  }
  if (file.type !== "application/pdf") {
    return NextResponse.json(
      { error: "Поддерживается только PDF." },
      { status: 415 },
    );
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json(
      { error: "Файл больше 4 МБ." },
      { status: 413 },
    );
  }

  const buffer = Buffer.from(await file.arrayBuffer());

  let text: string;
  try {
    ({ text } = await extractPdfText(buffer));
  } catch {
    return NextResponse.json(
      { error: "Не удалось прочитать PDF. Попробуйте другой файл." },
      { status: 422 },
    );
  }

  if (text.length < 30) {
    return NextResponse.json(
      {
        error:
          "В PDF не нашлось текста. Похоже, это скан — нужен текстовый PDF.",
      },
      { status: 422 },
    );
  }

  const title = file.name.replace(/\.pdf$/i, "").slice(0, 120) || "Моё резюме";

  const resume = await prisma.resume.create({
    data: { userId: user.id, title, originalText: text },
    select: { id: true, title: true, createdAt: true },
  });

  return NextResponse.json({ resume }, { status: 201 });
}
