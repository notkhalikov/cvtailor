import { getOrCreateUser } from "@/lib/user";
import { streamBlock, type BlockKind, type BlockContext } from "@/lib/llm";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function POST(req: Request) {
  const user = await getOrCreateUser();
  if (!user) {
    return Response.json({ error: "Не авторизованы." }, { status: 401 });
  }
  if (!process.env.GEMINI_API_KEY) {
    return Response.json(
      { error: "ИИ-сервис не настроен (нет ключа GEMINI_API_KEY)." },
      { status: 503 },
    );
  }

  let body: { kind?: BlockKind; instruction?: string; context?: BlockContext };
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Некорректный JSON." }, { status: 400 });
  }

  const { kind, instruction, context } = body;
  if (
    (kind !== "summary" && kind !== "bullets") ||
    !instruction?.trim() ||
    !context
  ) {
    return Response.json({ error: "Неполный запрос." }, { status: 400 });
  }

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      try {
        for await (const chunk of streamBlock(kind, instruction, context)) {
          controller.enqueue(encoder.encode(chunk));
        }
      } catch (err) {
        console.error("[ai/block] stream failed:", err);
        controller.enqueue(
          encoder.encode("\n[Ошибка ИИ. Попробуйте ещё раз.]"),
        );
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-store",
      "X-Accel-Buffering": "no",
    },
  });
}
