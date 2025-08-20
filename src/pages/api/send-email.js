export const prerender = false;

import FormData from "form-data";
import Mailgun from "mailgun.js";

// Impede que o Astro tente pré-renderizar esta API durante o build
export const prerender = false;

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

        // Pega as credenciais do ambiente da Cloudflare
        const { MAILGUN_DOMAIN, MAILGUN_API_KEY } = context.env;

        // Verificação crucial: garante que as variáveis foram carregadas
        if (!MAILGUN_DOMAIN || !MAILGUN_API_KEY) {
            console.error("ERRO FATAL: As variáveis de ambiente MAILGUN_DOMAIN ou MAILGUN_API_KEY não foram encontradas!");
            return new Response(JSON.stringify({ message: "Erro de configuração no servidor." }), {
                status: 500,
                headers: { "Content-Type": "application/json" },
            });
        }

        const mailgun = new Mailgun(FormData);
        const mg = mailgun.client({ username: "api", key: MAILGUN_API_KEY });

        const messageData = {
            from: `Formulário DivComp <contato@${MAILGUN_DOMAIN}>`,
            to: "ramundo@divcomp.com.br", // O seu e-mail de destino
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

        const result = await mg.messages.create(MAILGUN_DOMAIN, messageData);
        console.log("E-mail enviado com sucesso via Mailgun:", result);

        return new Response(JSON.stringify({ message: "Mensagem enviada com sucesso! Obrigado pelo contato." }), {
            status: 200,
            headers: { "Content-Type": "application/json" },
        });

    } catch (err) {
        // Regista o erro detalhado nos logs da Cloudflare
        console.error("Erro detalhado ao processar o pedido:", err);
        return new Response(JSON.stringify({ message: "Ocorreu um erro ao processar sua solicitação." }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
        });
    }
};