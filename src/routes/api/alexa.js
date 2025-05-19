// pages/api/alexa.js
export default async function handler(req, res) {
  if (req.method === 'POST') {
    console.log('Requisição da Alexa:', req.body);

    const response = {
      version: '1.0',
      response: {
        outputSpeech: {
          type: 'PlainText',
          text: 'Olá do seu backend Next.js!'
        },
        shouldEndSession: true,
      },
    };

    res.status(200).json(response);
  } else {
    res.status(405).json({ message: 'Método não permitido' });
  }
}