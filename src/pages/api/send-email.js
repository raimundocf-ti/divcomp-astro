export const POST = async ({ request, context }) => {
    const formData = await request.formData();
    const nome = formData.get('nome');
    const email = formData.get('email');
    const mensagem = formData.get('mensagem');

    // Validação simples dos dados
    if (!nome || !email || !mensagem) {
        return new Response(JSON.stringify({ message: "Todos os campos são obrigatórios." }), { status: 400 });
    }

    // Pega as credenciais do ambiente da Cloudflare
    const MAILGUN_DOMAIN = context.env.MAILGUN_DOMAIN;
    const MAILGUN_API_KEY = context.env.MAILGUN_API_KEY;

    if (!MAILGUN_DOMAIN || !MAILGUN_API_KEY) {
        return new Response(JSON.stringify({ message: "Credenciais do Mailgun não configuradas." }), { status: 500 });
    }

    // Prepara os dados para a API do Mailgun
    const mailgunData = new URLSearchParams();
    mailgunData.append('from', `Formulário DivComp <mailgun@${MAILGUN_DOMAIN}>`);
    mailgunData.append('to', 'ramundo@divcomp.com'); // Seu e-mail de destino
    mailgunData.append('subject', `Novo Contato de ${nome}`);
    mailgunData.append('text', `Você recebeu uma nova mensagem de ${nome} (${email}):\n\n${mensagem}`);

    // Envia a requisição para a API do Mailgun
    try {
        const response = await fetch(`https://api.mailgun.net/v3/${MAILGUN_DOMAIN}/messages`, {
            method: 'POST',
            headers: {
                // A chave de API é codificada em Base64 para autenticação
                'Authorization': `Basic ${btoa(`api:${MAILGUN_API_KEY}`)}`,
            },
            body: mailgunData,
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Erro no Mailgun:', errorText);
            return new Response(JSON.stringify({ message: `Ocorreu um erro ao enviar o e-mail.` }), { status: 500 });
        }

        return new Response(JSON.stringify({ message: "Mensagem enviada com sucesso!" }), { status: 200 });

    } catch (error) {
        console.error('Erro de rede:', error);
        return new Response(JSON.stringify({ message: "Erro de conexão ao enviar o e-mail." }), { status: 500 });
    }
};