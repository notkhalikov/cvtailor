import { NextResponse } from "next/server";
import { getOrCreateUser } from "@/lib/user";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Returns the best resume data for export: the adapted version if present,
// otherwise the master resume.
export async function GET(
  _req: Request,
  { params }: { params: { id: string } },
) {
  const user = await getOrCreateUser();
  if (!user) {
    return NextResponse.json({ error: "Не авторизованы." }, { status: 401 });
  }

  const adaptation = await prisma.adaptation.findFirst({
    where: { id: params.id, userId: user.id },
    select: { adaptedData: true, resume: { select: { data: true } } },
  });
  if (!adaptation) {
    return NextResponse.json({ error: "Адаптация не найдена." }, { status: 404 });
  }

  const data = adaptation.adaptedData ?? adaptation.resume.data ?? null;
  if (!data) {
    return NextResponse.json(
      { error: "Резюме ещё не разобрано." },
      { status: 422 },
    );
  }
  return NextResponse.json({ data });
}
