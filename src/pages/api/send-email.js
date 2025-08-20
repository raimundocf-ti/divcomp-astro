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

        const { MAILGUN_DOMAIN, MAILGUN_API_KEY } = context.env;

        if (!MAILGUN_DOMAIN || !MAILGUN_API_KEY) {
            console.error("Credenciais do Mailgun não encontradas no ambiente do servidor.");
            return new Response(JSON.stringify({ message: "Erro de configuração no servidor." }), {
                status: 500,
                headers: { "Content-Type": "application/json" },
            });
        }

        const mailgun = new Mailgun(FormData);
        const mg = mailgun.client({ username: "api", key: MAILGUN_API_KEY });

        await mg.messages.create(MAILGUN_DOMAIN, {
            from: `Formulário DivComp <contato@${MAILGUN_DOMAIN}>`,
            to: "ramundo@divcomp.com.br", // SEU E-MAIL
            subject: `Novo Contato do Site: ${nome}`,
            html: `
        <h1>Nova mensagem do site DivComp</h1>
        <p><strong>Nome:</strong> ${nome}</p>
        <p><strong>E-mail:</strong> <a href="mailto:${email}">${email}</a></p>
        <hr>
        <p><strong>Mensagem:</strong></p>
        <p>${mensagem.replace(/\n/g, "<br>")}</p>
      `,
        });

        return new Response(JSON.stringify({ message: "Mensagem enviada com sucesso!" }), {
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