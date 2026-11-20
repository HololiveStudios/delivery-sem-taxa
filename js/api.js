/* ============================================
   API.JS — Lead persistence (Cloudflare Worker)
   ============================================ */

// ---------- Configuration ----------
// Replace with your deployed Worker URL
const API_BASE_URL = 'https://diag-leads.jeslee940.workers.dev/'; // e.g., 'https://diag-leads.your-account.workers.dev'

// ---------- Save Lead ----------
async function saveLead(data) {
    if (!API_BASE_URL) {
        console.log('[API] Worker URL not configured. Lead data:', data);
        return null;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/leads`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        if (!response.ok) {
            console.warn('[API] Failed to save lead:', response.status);
            return null;
        }

        const result = await response.json();
        console.log('[API] Lead saved:', result);
        return result;
    } catch (err) {
        // Don't block the user experience if API fails
        console.warn('[API] Error saving lead:', err.message);
        return null;
    }
}
