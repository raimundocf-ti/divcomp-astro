import FormData from "form-data";
import Mailgun from "mailgun.js";
import worker from "./dist/_worker.js/index.js"; // 👈 importa o worker que Astro já gera

export default {
    async fetch(request, env, ctx) {
        const url = new URL(request.url);

        // 👉 trata sua API
        if (url.pathname === "/api/send-email" && request.method === "POST") {
            try {
                const data = await request.json();
                const { nome, email, mensagem } = data;

                if (!nome || !email || !mensagem) {
                    return new Response(JSON.stringify({ message: "Todos os campos são obrigatórios." }), {
                        status: 400,
                        headers: { "Content-Type": "application/json" }
                    });
                }

                const mailgun = new Mailgun(FormData);
                const mg = mailgun.client({ username: "api", key: env.MAILGUN_API_KEY });

                await mg.messages.create(env.MAILGUN_DOMAIN, {
                    from: `Formulário DivComp <contato@${env.MAILGUN_DOMAIN}>`,
                    to: "ramundo@divcomp.com.br",
                    subject: `Novo Contato do Site: ${nome}`,
                    html: `
            <h1>Nova mensagem do site DivComp</h1>
            <p><strong>Nome:</strong> ${nome}</p>
            <p><strong>E-mail:</strong> <a href="mailto:${email}">${email}</a></p>
            <hr>
            <p><strong>Mensagem:</strong></p>
            <p>${mensagem.replace(/\n/g, "<br>")}</p>
          `
                });

                return new Response(JSON.stringify({ message: "Mensagem enviada com sucesso!" }), {
                    status: 200,
                    headers: { "Content-Type": "application/json" }
                });
            } catch (err) {
                console.error("Erro:", err);
                return new Response(JSON.stringify({ message: "Erro ao enviar sua mensagem." }), {
                    status: 500,
                    headers: { "Content-Type": "application/json" }
                });
            }
        }

        // 👉 fallback pro Astro
        return worker.fetch(request, env, ctx);
    },
};
