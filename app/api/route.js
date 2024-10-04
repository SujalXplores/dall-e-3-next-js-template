import OpenAI from 'openai';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';

const POST = async (request) => {
  const session = await getServerSession();

  if (!session) {
    return new NextResponse(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

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
