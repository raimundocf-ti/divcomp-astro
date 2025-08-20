// Garante que o Astro não tente pré-renderizar esta API durante o build.
export const prerender = false;

import FormData from "form-data";
import Mailgun from "mailgun.js";

export const POST = async ({ request, context }) => {
    try {
        const data = await request.json();
        const { nome, email, mensagem } = data;

        if (!nome || !email || !mensagem) {
            return new Response(JSON.stringify({ message: "Todos os campos são obrigatórios." }), {
                status: 400,
                headers: { "Content-Type": "application/json" },
            });
        }

        const { NAME_MAILGUN_DOMAIN, NANME_MAILGUN_API_KEY } = context.env;

        if (!NAME_MAILGUN_DOMAIN || !NANME_MAILGUN_API_KEY) {
            console.error("ERRO: As credenciais NAME_MAILGUN_DOMAIN ou NANME_MAILGUN_API_KEY não foram encontradas nas variáveis de ambiente da Cloudflare.");
            return new Response(JSON.stringify({ message: "Erro de configuração no servidor." }), {
                status: 500,
                headers: { "Content-Type": "application/json" },
            });
        }

        const mailgun = new Mailgun(FormData);
        const mg = mailgun.client({ username: "api", key: NANME_MAILGUN_API_KEY });

        const messageData = {
            from: `Formulário DivComp <contato@${NAME_MAILGUN_DOMAIN}>`,
            to: "ramundo@divcomp.com.br", // Seu e-mail de destino
            subject: `Novo Contato do Site: ${nome}`,
            html: `
        <h1>Nova mensagem do site DivComp</h1>
        <p><strong>Nome:</strong> ${nome}</p>
        <p><strong>E-mail:</strong> <a href="mailto:${email}">${email}</a></p>
        <hr>
        <p><strong>Mensagem:</strong></p>
        <p>${mensagem.replace(/\n/g, "<br>")}</p>
      `,
        };

        await mg.messages.create(NAME_MAILGUN_DOMAIN, messageData);

        return new Response(JSON.stringify({ message: "Mensagem enviada com sucesso! Obrigado pelo contato." }), {
            status: 200,
            headers: { "Content-Type": "application/json" },
        });

    } catch (err) {
        console.error("Erro no servidor ao tentar enviar e-mail:", err);
        return new Response(JSON.stringify({ message: "Ocorreu um erro ao processar sua solicitação." }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
        });
    }
};