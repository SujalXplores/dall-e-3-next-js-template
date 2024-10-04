import OpenAI from 'openai';
import { NextResponse } from 'next/server';

const POST = async (request) => {
  try {
    const body = await request.json();
    const {
      prompt, quality, style, size,
    } = body;

    const openai = new OpenAI();
    const image = await openai.images.generate({
      model: 'dall-e-3',
      n: 1,
      quality: quality || 'hd',
      style: style || 'vivid',
      size: size || '1024x1024',
      prompt,
    });

    return new NextResponse(JSON.stringify({ image: image.data[0].url }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
  catch (serverError) {
    return new NextResponse(
      JSON.stringify({ error: serverError.error.message }),
      {
        status: serverError.status,
        headers: {
          'Content-Type': 'application/json',
        },
      },
    );
  }
};

export { POST };
