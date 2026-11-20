/* ============================================
   QUIZ.JS — Diagnostic Quiz V2.0
   8 perguntas, LGPD, mensagens por faixa de score
   ============================================ */

// ---------- Configuration ----------
const WHATSAPP_NUMBER = '5589994691009'; // Replace with actual number (e.g., 5511999999999)

// ---------- Questions (8 total, order per playbook) ----------
const questions = [
    {
        id: 'business_type',
        text: 'Qual o tipo do seu delivery?',
        type: 'radio',
        options: [
            { label: '🍕 Pizzaria', value: 'Pizzaria' },
            { label: '🍔 Hamburgueria', value: 'Hamburgueria' },
            { label: '🍱 Marmitaria', value: 'Marmitaria' },
            { label: '🍨 Açaí', value: 'Açaí' },
            { label: '🍽️ Restaurante', value: 'Restaurante' },
            { label: '🏪 Lanchonete', value: 'Lanchonete' },
            { label: '📦 Outro', value: 'Outro' }
        ]
    },
    {
        id: 'has_app',
        text: 'Você vende por aplicativo hoje?',
        type: 'radio',
        options: [
            { label: '✅ Sim', value: 'Sim' },
            { label: '❌ Não', value: 'Não' }
        ]
    },
    {
        id: 'orders_per_day',
        text: 'Quantos pedidos por dia em média?',
        type: 'radio',
        options: [
            { label: '📊 0 a 10 pedidos', value: '0-10' },
            { label: '📈 10 a 30 pedidos', value: '10-30' },
            { label: '🚀 Mais de 30 pedidos', value: '30+' }
        ]
    },
    {
        id: 'avg_ticket',
        text: 'Qual o ticket médio por pedido?',
        type: 'radio',
        options: [
            { label: '💵 Até R$25', value: 'ate-25' },
            { label: '💰 R$25 a R$45', value: '25-45' },
            { label: '💎 Acima de R$45', value: '45+' }
        ]
    },
    {
        id: 'fee_percent',
        text: 'Que taxa você paga no app?',
        type: 'radio',
        options: [
            { label: '📉 Cerca de 10%', value: '10' },
            { label: '📉 Cerca de 15%', value: '15' },
            { label: '📉 20% ou mais', value: '20+' },
            { label: '🤷 Não sei exatamente', value: 'nao-sei' }
        ]
    },
    {
        id: 'biggest_pain',
        text: 'Qual a sua maior dor hoje?',
        type: 'radio',
        options: [
            { label: '💸 Taxa alta', value: 'taxa' },
            { label: '⚡ Plataforma trava', value: 'plataforma-cai' },
            { label: '📱 Pedido bagunçado', value: 'pedido-baguncado' },
            { label: '🏍️ Entrega confusa', value: 'entrega' },
            { label: '🎨 Falta de identidade', value: 'personalizacao' },
            { label: '📦 Outro', value: 'outro' }
        ]
    },
    {
        id: 'delivery_mode',
        text: 'Como você quer começar?',
        type: 'radio',
        options: [
            { label: '🏪 Retirada no balcão', value: 'retirada' },
            { label: '🏍️ Entrega própria', value: 'entrega-propria' },
            { label: '📦 Motoboy parceiro', value: 'motoboy' },
            { label: '🤔 Ainda não sei', value: 'nao-sei' }
        ]
    },
    {
        id: 'contact',
        text: 'Qual seu WhatsApp e nome?',
        type: 'contact',
        fields: [
            { key: 'owner_name', placeholder: 'Seu nome', type: 'text' },
            { key: 'phone', placeholder: 'WhatsApp (com DDD)', type: 'tel' }
        ]
    }
];

// ---------- State ----------
let currentQuestion = 0;
let answers = {};

// ---------- Init ----------
function initQuiz() {
    const container = document.getElementById('quizQuestions');
    container.innerHTML = '';

    questions.forEach((q, idx) => {
        const div = document.createElement('div');
        div.className = 'quiz-question' + (idx === 0 ? ' active' : '');
        div.id = `question-${idx}`;
        div.innerHTML = buildQuestion(q, idx);
        container.appendChild(div);
    });

    updateProgress();
}

function buildQuestion(q, idx) {
    let html = `<h3>${q.text}</h3>`;

    if (q.type === 'radio') {
        html += '<div class="quiz-options">';
        q.options.forEach((opt) => {
            html += `
        <div class="quiz-option" onclick="selectOption(${idx}, '${opt.value}', this)">
          <span class="quiz-option-radio"></span>
          <span>${opt.label}</span>
        </div>
      `;
        });
        html += '</div>';
    } else if (q.type === 'contact') {
        html += `<div class="quiz-input-group">`;
        q.fields.forEach((f) => {
            html += `<input class="quiz-input" type="${f.type || 'text'}" id="input-${f.key}" placeholder="${f.placeholder}" autocomplete="off">`;
        });
        html += `
      <label class="quiz-lgpd">
        <input type="checkbox" id="lgpd-consent"> 
        Concordo em receber contato sobre o plano indicado. Seus dados estão seguros.
      </label>
      <button class="btn btn-primary quiz-next-btn" onclick="submitContact(${idx})">Ver resultado 🎯</button>
    </div>`;
    }

    return html;
}

// ---------- Navigation ----------
function selectOption(idx, value, el) {
    const q = questions[idx];
    answers[q.id] = value;

    const parent = el.closest('.quiz-options');
    parent.querySelectorAll('.quiz-option').forEach((o) => o.classList.remove('selected'));
    el.classList.add('selected');

    setTimeout(() => nextQuestion(), 350);
}

function submitContact(idx) {
    const fields = questions[idx].fields;
    let valid = true;

    fields.forEach((f) => {
        const input = document.getElementById(`input-${f.key}`);
        const val = input.value.trim();
        if (!val) {
            input.style.borderColor = 'var(--red-400)';
            valid = false;
        } else {
            input.style.borderColor = '';
            answers[f.key] = val;
        }
    });

    // Check LGPD consent
    const consent = document.getElementById('lgpd-consent');
    answers.consent = consent?.checked || false;

    if (!valid) return;
    nextQuestion();
}

function nextQuestion() {
    const currentEl = document.getElementById(`question-${currentQuestion}`);
    currentEl.classList.remove('active');

    currentQuestion++;

    if (currentQuestion >= questions.length) {
        showResult();
        return;
    }

    const nextEl = document.getElementById(`question-${currentQuestion}`);
    nextEl.classList.add('active');

    const textInput = nextEl.querySelector('.quiz-input');
    if (textInput) {
        setTimeout(() => textInput.focus(), 400);
    }

    updateProgress();
}

function updateProgress() {
    const pct = ((currentQuestion) / questions.length) * 100;
    document.getElementById('progressFill').style.width = pct + '%';
    document.getElementById('progressText').textContent = `Pergunta ${Math.min(currentQuestion + 1, questions.length)} de ${questions.length}`;
}

// ---------- Reset ----------
function resetQuiz() {
    currentQuestion = 0;
    answers = {};
    document.getElementById('resultScreen').classList.remove('active');
    document.querySelector('.quiz-progress').style.display = '';
    initQuiz();
}

// ---------- Score Calculation ----------
function calculateScore() {
    let score = 0;

    switch (answers.orders_per_day) {
        case '0-10': score += 15; break;
        case '10-30': score += 25; break;
        case '30+': score += 35; break;
    }

    switch (answers.avg_ticket) {
        case 'ate-25': score += 10; break;
        case '25-45': score += 18; break;
        case '45+': score += 25; break;
    }

    switch (answers.has_app) {
        case 'Sim': score += 20; break;
        case 'Não': score += 10; break;
    }

    switch (answers.fee_percent) {
        case '10': score += 10; break;
        case '15': score += 15; break;
        case '20+': score += 20; break;
        case 'nao-sei': score += 12; break;
    }

    switch (answers.biggest_pain) {
        case 'taxa': score += 15; break;
        case 'plataforma-cai': score += 12; break;
        case 'pedido-baguncado': score += 10; break;
        case 'entrega': score += 10; break;
        case 'personalizacao': score += 10; break;
        case 'outro': score += 8; break;
    }

    return Math.min(score, 100);
}

// ---------- Score messages & CTA by range ----------
function getScoreData(score) {
    if (score >= 80) {
        return {
            msg: 'Perfil perfeito. Sua economia começa imediatamente.',
            cta: 'Quero meu link pronto agora',
            whatsappText: `Oi! Fiz o diagnóstico. Deu ${score}% e estimativa de R$TAXA/mês em taxa. Quero ver meu link pronto — Plano PLANO.`
        };
    }
    if (score >= 60) {
        return {
            msg: 'Bom perfil. Dá pra migrar sem bagunça.',
            cta: 'Quero ver um exemplo do meu link',
            whatsappText: `Oi! Fiz o diagnóstico. Deu ${score}% e estimativa de R$TAXA/mês em taxa. Quero ver um exemplo do meu link — Plano PLANO.`
        };
    }
    if (score >= 40) {
        return {
            msg: 'Possível. Vamos ajustar o básico primeiro.',
            cta: 'Quero receber o plano',
            whatsappText: `Oi! Fiz o diagnóstico. Deu ${score}% e estimativa de R$TAXA/mês em taxa. Quero receber o plano — Plano PLANO.`
        };
    }
    return {
        msg: 'Não é prioridade agora — mas enviamos o plano de graça.',
        cta: 'Me manda o plano básico',
        whatsappText: `Oi! Fiz o diagnóstico. Deu ${score}%. Quero receber o plano básico.`
    };
}

// ---------- Tax Estimation ----------
function calculateTax() {
    let orders;
    switch (answers.orders_per_day) {
        case '0-10': orders = 7; break;
        case '10-30': orders = 20; break;
        case '30+': orders = 35; break;
        default: orders = 10;
    }

    let ticket;
    switch (answers.avg_ticket) {
        case 'ate-25': ticket = 22; break;
        case '25-45': ticket = 35; break;
        case '45+': ticket = 55; break;
        default: ticket = 30;
    }

    let taxRate;
    switch (answers.fee_percent) {
        case '10': taxRate = 0.10; break;
        case '15': taxRate = 0.15; break;
        case '20+': taxRate = 0.20; break;
        case 'nao-sei': taxRate = 0.15; break;
        default: taxRate = 0.15;
    }

    return Math.round(orders * 30 * ticket * taxRate);
}

// ---------- Plan Recommendation ----------
function getRecommendedPlan() {
    switch (answers.orders_per_day) {
        case '0-10': return 'Leve';
        case '10-30': return 'Padrão';
        case '30+': return 'Turbo';
        default: return 'Padrão';
    }
}

// ---------- Show Result ----------
function showResult() {
    const score = calculateScore();
    const tax = calculateTax();
    const plan = getRecommendedPlan();
    const scoreData = getScoreData(score);

    // Hide progress
    document.querySelector('.quiz-progress').style.display = 'none';

    // Show result screen
    const resultScreen = document.getElementById('resultScreen');
    resultScreen.classList.add('active');

    // Animate score ring
    const circumference = 2 * Math.PI * 65;
    const offset = circumference - (score / 100) * circumference;
    const ring = document.getElementById('scoreRing');
    setTimeout(() => {
        ring.style.strokeDashoffset = offset;
    }, 100);

    // Set values
    document.getElementById('scoreValue').textContent = score + '%';
    document.getElementById('scoreMsg').textContent = scoreData.msg;
    document.getElementById('taxValue').textContent = `R$ ${tax.toLocaleString('pt-BR')}/mês`;
    document.getElementById('planValue').textContent = `🎯 ${plan}`;

    // WhatsApp button with score-based CTA
    document.getElementById('whatsappCta').textContent = scoreData.cta;
    const whatsappMsg = encodeURIComponent(
        scoreData.whatsappText
            .replace('TAXA', tax.toLocaleString('pt-BR'))
            .replace('PLANO', plan)
    );
    document.getElementById('whatsappBtn').href = `https://wa.me/${WHATSAPP_NUMBER}?text=${whatsappMsg}`;

    // Save lead via API
    if (typeof saveLead === 'function') {
        saveLead({
            owner_name: answers.owner_name || '',
            phone: answers.phone || '',
            consent: answers.consent || false,
            business_type: answers.business_type || '',
            has_app: answers.has_app || '',
            platforms: '',
            orders_per_day: answers.orders_per_day || '',
            avg_ticket: answers.avg_ticket || '',
            fee_percent: answers.fee_percent || '',
            biggest_pain: answers.biggest_pain || '',
            delivery_mode: answers.delivery_mode || '',
            score: score,
            est_fee_monthly: tax,
            recommended_plan: plan,
            respostas: answers
        });
    }
}

// ---------- Copy Result ----------
function copyResult() {
    const score = document.getElementById('scoreValue').textContent;
    const tax = document.getElementById('taxValue').textContent;
    const plan = document.getElementById('planValue').textContent;
    const msg = document.getElementById('scoreMsg').textContent;

    const text = [
        `🩺 Diagnóstico Delivery Sem Taxa`,
        ``,
        `📊 Qualificação: ${score}`,
        `💸 Taxa estimada: ${tax}`,
        `🎯 Plano recomendado: ${plan}`,
        ``,
        `"${msg}"`,
    ].join('\n');

    navigator.clipboard.writeText(text).then(() => {
        const btn = document.getElementById('copyBtn');
        btn.textContent = '✅ Copiado!';
        setTimeout(() => btn.textContent = '📋 Copiar resultado', 2000);
    }).catch(() => {
        alert(text);
    });
}

// ---------- Init ----------
document.addEventListener('DOMContentLoaded', initQuiz);
