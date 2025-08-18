import FormData from "form-data";
import Mailgun from "mailgun.js";

export const POST = async ({ request, context }) => {
    // 1. Pega os dados enviados como JSON
    const data = await request.json();
    const { nome, email, mensagem } = data;

    // Validação
    if (!nome || !email || !mensagem) {
        return new Response(JSON.stringify({ message: "Todos os campos são obrigatórios." }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }

    // 2. Pega as credenciais seguras do ambiente da Cloudflare
    const MAILGUN_DOMAIN = context.env.MAILGUN_DOMAIN;
    const MAILGUN_API_KEY = context.env.MAILGUN_API_KEY;

    if (!MAILGUN_DOMAIN || !MAILGUN_API_KEY) {
        console.error("Credenciais do Mailgun não encontradas no ambiente.");
        return new Response(JSON.stringify({ message: "Erro de configuração no servidor." }), { status: 500, headers: { 'Content-Type': 'application/json' } });
    }

    // 3. Inicializa o cliente do Mailgun
    const mailgun = new Mailgun(FormData);
    const mg = mailgun.client({
        username: "api",
        key: MAILGUN_API_KEY,
    });

    // 4. Monta a mensagem
    const messageData = {
        from: `Formulário DivComp <contato@${MAILGUN_DOMAIN}>`,
        to: "ramundo@divcomp.com", // Seu e-mail de destino
        subject: `Novo Contato do Site: ${nome}`,
        html: `
      <h1>Nova mensagem do site DivComp</h1>
      <p><strong>Nome:</strong> ${nome}</p>
      <p><strong>E-mail:</strong> <a href="mailto:${email}">${email}</a></p>
      <hr>
      <p><strong>Mensagem:</strong></p>
      <p>${mensagem.replace(/\n/g, '<br>')}</p>
    `,
    };

    // 5. Envia o e-mail
    try {
        const result = await mg.messages.create(MAILGUN_DOMAIN, messageData);
        console.log('E-mail enviado com sucesso:', result);
        return new Response(JSON.stringify({ message: "Mensagem enviada com sucesso! Obrigado pelo contato." }), { status: 200, headers: { 'Content-Type': 'application/json' } });
    } catch (error) {
        console.error('Erro ao enviar o e-mail:', error);
        return new Response(JSON.stringify({ message: "Ocorreu um erro ao enviar sua mensagem. Tente novamente mais tarde." }), { status: 500, headers: { 'Content-Type': 'application/json' } });
    }
};