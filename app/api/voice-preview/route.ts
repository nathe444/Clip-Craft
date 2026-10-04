import { NextRequest, NextResponse } from "next/server";

const DEEPGRAM_API_URL = "https://api.deepgram.com/v1/speak";

// Short preview sentence that works well for any voice
const PREVIEW_TEXTS: Record<string, string> = {
  "en-us": "Hey there! This is how I sound — let me narrate your story.",
  "en-gb": "Hello there. This is how I sound — crisp, calm, and professional.",
  "en-au": "G'day! This is how I sound for your video series.",
  "en-ie": "Hello there! This is how I sound — warm and friendly.",
  "en-ph": "Hi! This is how I sound — cheerful and engaging.",
  "es-mx": "Hola, así es como sueno. Perfecto para tu serie de videos.",
  "es-es": "Hola, así es como sueno — claro y profesional.",
  "es-co": "Hola, así es cómo sueno — amigable y energético.",
  "es-419": "Hola, así es como sueno para tu serie de videos.",
  "es-ar": "Hola, así es como sueno — natural y cercano.",
  "de-de": "Hallo! So klinge ich — professionell und klar.",
  "fr-fr": "Bonjour ! C'est comme ça que je sonne — naturel et expressif.",
  "nl-nl": "Hallo! Zo klink ik — vriendelijk en professioneel.",
  "it-it": "Ciao! Ecco come suono — chiaro e coinvolgente.",
  "ja-jp": "こんにちは！これが私の声です。",
};

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const model = searchParams.get("model");
  const langCode = searchParams.get("lang") ?? "en-us";

  if (!model) {
    return NextResponse.json({ error: "Missing model parameter" }, { status: 400 });
  }

  const apiKey = process.env.DEEPGRAM_API_KEY;
  if (!apiKey || apiKey === "your_deepgram_api_key_here") {
    return NextResponse.json(
      { error: "Deepgram API key not configured. Add DEEPGRAM_API_KEY to .env.local" },
      { status: 503 }
    );
  }

  const previewText =
    PREVIEW_TEXTS[langCode.toLowerCase()] ??
    PREVIEW_TEXTS["en-us"];

  try {
    const response = await fetch(`${DEEPGRAM_API_URL}?model=${model}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Token ${apiKey}`,
      },
      body: JSON.stringify({ text: previewText }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Deepgram TTS error:", response.status, errorText);
      return NextResponse.json(
        { error: `Deepgram API error: ${response.status}` },
        { status: response.status }
      );
    }

    const audioBuffer = await response.arrayBuffer();

    return new NextResponse(audioBuffer, {
      status: 200,
      headers: {
        "Content-Type": "audio/mpeg",
        "Cache-Control": "public, max-age=86400",
      },
    });
  } catch (err) {
    console.error("Voice preview error:", err);
    return NextResponse.json({ error: "Failed to fetch voice preview" }, { status: 500 });
  }
}
