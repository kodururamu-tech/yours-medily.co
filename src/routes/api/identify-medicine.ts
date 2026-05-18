import "@tanstack/react-start";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/identify-medicine")({
  server: {
    handlers: {
      POST: async ({ request }: { request: Request }) => {
        try {
          const { imageBase64, mimeType } = (await request.json()) as {
            imageBase64?: string;
            mimeType?: string;
          };
          if (!imageBase64) {
            return new Response(JSON.stringify({ error: "imageBase64 required" }), {
              status: 400,
              headers: { "Content-Type": "application/json" },
            });
          }

          const apiKey = process.env.LOVABLE_API_KEY;
          if (!apiKey) {
            return new Response(JSON.stringify({ error: "AI not configured" }), {
              status: 500,
              headers: { "Content-Type": "application/json" },
            });
          }

          const dataUrl = `data:${mimeType || "image/jpeg"};base64,${imageBase64}`;

          const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Lovable-API-Key": apiKey,
            },
            body: JSON.stringify({
              model: "google/gemini-3-flash-preview",
              messages: [
                {
                  role: "system",
                  content:
                    "You identify medicines from photos of packaging, strips, or bottles. Reply ONLY with the medicine's primary brand or generic name (1-3 words). No punctuation, no explanation. If unclear, reply: UNKNOWN.",
                },
                {
                  role: "user",
                  content: [
                    { type: "text", text: "What medicine is shown in this image?" },
                    { type: "image_url", image_url: { url: dataUrl } },
                  ],
                },
              ],
            }),
          });

          if (!res.ok) {
            const text = await res.text();
            return new Response(JSON.stringify({ error: text }), {
              status: res.status,
              headers: { "Content-Type": "application/json" },
            });
          }

          const data = (await res.json()) as {
            choices?: Array<{ message?: { content?: string } }>;
          };
          const raw = data.choices?.[0]?.message?.content?.trim() ?? "";
          const name = raw.replace(/[."'`*]/g, "").trim();
          const ok = name && name.toUpperCase() !== "UNKNOWN";

          return new Response(
            JSON.stringify(ok ? { name } : { error: "Could not identify medicine" }),
            { status: ok ? 200 : 422, headers: { "Content-Type": "application/json" } },
          );
        } catch (e) {
          return new Response(JSON.stringify({ error: (e as Error).message }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
          });
        }
      },
    },
  },
});
