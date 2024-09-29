import OpenAI from "openai";
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const body = await request.json();
    const { prompt, quality, style, size } = body;

    const openai = new OpenAI();
    const image = await openai.images.generate({
      model: "dall-e-3",
      n: 1,
      quality: quality || "hd", // default to "standard" if not provided
      style: style || "vivid", // default to "natural" if not provided
      size: size || "1024x1024", // default to "1024x1024" if not provided
      prompt: prompt,
    });

    return new NextResponse(JSON.stringify({ image: image.data[0].url }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (serverError) {
    console.error(serverError);
    return new NextResponse(
      JSON.stringify({ error: serverError.error.message }),
      {
        status: serverError.status,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }
}
