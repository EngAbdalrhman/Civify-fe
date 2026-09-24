import { llmsFull } from "@/lib/llms";

export function GET() {
  const baseUrl = (process.env.NEXT_PUBLIC_BASE_URL || "https://civify.cv").replace(/\/$/, "");
  return new Response(llmsFull(baseUrl), {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
