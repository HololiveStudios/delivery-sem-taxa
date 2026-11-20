const data = {
    source: 'landing',
    utm: { source: null, medium: null, campaign: null },
    business_name: "Teste",
    phone: "11999999999",
    city: "SP",
    consent: true,
    diagnostic: {
        has_ifood: true,
        orders_per_day: "10-30",
        avg_ticket: "25-45",
        fee_percent: "15",
        biggest_pain: "taxa",
        notes: "Hamburgueria"
    },
    score: 80,
    est_fee_monthly: 1000,
    recommended_plan: "PADRÃO",
    ab_variant: "D"
};

(async () => {
    try {
        console.log("Sending POST Request...");
        const res = await fetch('https://diag-leads.jeslee940.workers.dev/leads', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        console.log("HTTP", res.status);
        console.log(await res.text());
    } catch (e) {
        console.error("Error", e.message);
    }
})();
