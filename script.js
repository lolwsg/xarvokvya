document.addEventListener('DOMContentLoaded', () => {
    // Start the boot sequence and scan
    initSystem();
    
    // Attach event listener to the button
    const btn = document.getElementById('refresh-btn');
    if(btn) {
        btn.addEventListener('click', () => {
            btn.textContent = 'SYSTEM SCANNIN...';
            btn.disabled = true;
            initScan().then(() => {
                setTimeout(() => {
                    btn.textContent = 'RE-INITIALIZE SCAN';
                    btn.disabled = false;
                }, 1000);
            });
        });
    }
});

// --- MAIN SYSTEM INITIALIZATION ---
function initSystem() {
    console.log("XARVOK SYSTEM: INITIALIZING...");
    startClock();
    initScan();
    typeWriterEffect("status-msg", "SYSTEM ONLINE // WAITING FOR INPUT...");
}

// --- CORE SCANNING FUNCTION ---
async function initScan() {
    try {
        // 1. Fetch Network Data (IP, Location, ISP)
        updateStatus("FETCHING NETWORK PACKETS...");
        let ipData = { ip: 'UNAVAILABLE', city: 'UNKNOWN', region: 'UNKNOWN', org: 'UNKNOWN', asn: 'UNKNOWN' };
        
        try {
            const res = await fetch('https://ipapi.co/json/');
            if(res.ok) {
                ipData = await res.json();
            }
        } catch (e) {
            console.warn("Network scan blocked by client.");
        }

        // 2. Latency Test (Ping)
        updateStatus("MEASURING LATENCY...");
        const latency = await getLatency();

        // 3. Hardware & Browser Data
        updateStatus("ANALYZING HARDWARE...");
        const nav = navigator;
        const screen = window.screen;
        
        // Battery
        let batteryInfo = "RESTRICTED";
        if ('getBattery' in nav) {
            try {
                const b = await nav.getBattery();
                const level = Math.round(b.level * 100);
                const charging = b.charging ? " [CHRG]" : "";
                batteryInfo = `${level}%${charging}`;
            } catch (e) {}
        }

        // Connection Type
        let connType = "UNKNOWN";
        if (nav.connection) {
            connType = nav.connection.effectiveType ? nav.connection.effectiveType.toUpperCase() : "UNKNOWN";
            if (nav.connection.downlink) {
                connType += ` (${nav.connection.downlink} Mbps)`;
            }
        }

        // --- UPDATE UI ELEMENTS ---
        
        // Network Section
        updateElement('ip', ipData.ip);
        updateElement('isp', ipData.org);
        updateElement('location', `${ipData.city}, ${ipData.region}`);
        updateElement('coords', `${ipData.latitude}, ${ipData.longitude}`);
        
        // Hardware Section
        updateElement('os', getOS());
        updateElement('cores', (nav.hardwareConcurrency || '?') + ' LOGICAL CORES');
        updateElement('ram', nav.deviceMemory ? `~${nav.deviceMemory} GB` : 'UNAVAILABLE');
        updateElement('gpu', getGPU());
        
        // Environment Section
        updateElement('browser', getBrowserFull());
        updateElement('res', `${screen.width}x${screen.height} (${screen.colorDepth}-bit)`);
        updateElement('battery', batteryInfo);
        updateElement('connection', connType);
        
        // Latency (You might need to add a div with id="ping" to your HTML to see this)
        // If you don't have a specific spot, we can append it or just log it.
        console.log(`LATENCY: ${latency}ms`);

        updateStatus("SCAN COMPLETE.");

    } catch (error) {
        console.error("CRITICAL FAILURE:", error);
        updateStatus("SCAN FAILED.");
    }
}

// --- HELPER FUNCTIONS ---

function updateElement(id, text) {
    const el = document.getElementById(id);
    if (el) {
        // Simple fade effect
        el.style.opacity = '0';
        setTimeout(() => {
            el.textContent = text || 'N/A';
            el.style.opacity = '1';
        }, 200);
    }
}

function updateStatus(msg) {
    const statusEl = document.querySelector('.status-indicator');
    if(statusEl) {
        // Just appending text or changing it
        // If you have a specific status text element, use that.
        // For now, let's log to console to keep UI clean.
        console.log(`[STATUS]: ${msg}`);
    }
}

// 1. Operating System Detector
function getOS() {
    const ua = navigator.userAgent;
    if (ua.indexOf("Win") !== -1) return "WINDOWS NT";
    if (ua.indexOf("Mac") !== -1) return "MACOS";
    if (ua.indexOf("Linux") !== -1) return "LINUX KERNEL";
    if (ua.indexOf("Android") !== -1) return "ANDROID";
    if (ua.indexOf("iPhone") !== -1 || ua.indexOf("iPad") !== -1) return "IOS";
    return "UNKNOWN OS";
}

// 2. GPU Detector (WebGL)
function getGPU() {
    try {
        const canvas = document.createElement('canvas');
        const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
        if (!gl) return "SOFTWARE RENDERER";
        const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
        if (!debugInfo) return "GENERIC GPU";
        return gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
    } catch { 
        return "DRIVER ERROR"; 
    }
}

// 3. Browser Detector
function getBrowserFull() {
    const ua = navigator.userAgent;
    let browserName = "UNKNOWN";
    
    if (ua.indexOf("Firefox") > -1) browserName = "MOZILLA FIREFOX";
    else if (ua.indexOf("SamsungBrowser") > -1) browserName = "SAMSUNG INTERNET";
    else if (ua.indexOf("Opera") > -1 || ua.indexOf("OPR") > -1) browserName = "OPERA";
    else if (ua.indexOf("Trident") > -1) browserName = "INTERNET EXPLORER";
    else if (ua.indexOf("Edge") > -1) browserName = "MICROSOFT EDGE";
    else if (ua.indexOf("Chrome") > -1) browserName = "GOOGLE CHROME";
    else if (ua.indexOf("Safari") > -1) browserName = "APPLE SAFARI";

    return browserName;
}

// 4. Latency / Ping Test
async function getLatency() {
    const start = Date.now();
    try {
        // Fetch a tiny resource (favicon or similar) to test speed
        // Using a generic reliable endpoint, or just the current page
        await fetch(window.location.href, { method: 'HEAD', cache: 'no-cache' });
        const end = Date.now();
        return (end - start);
    } catch {
        return "TIMEOUT";
    }
}

// 5. Live Clock
function startClock() {
    // If you add <div id="clock"></div> to your HTML, this will run
    const clockEl = document.getElementById('clock');
    if (!clockEl) return;

    setInterval(() => {
        const now = new Date();
        const timeString = now.toLocaleTimeString('en-US', { hour12: false });
        clockEl.textContent = `${timeString} UTC`;
    }, 1000);
}

// 6. Visual Typing Effect
function typeWriterEffect(elementId, text, speed = 50) {
    const el = document.getElementById(elementId);
    if (!el) return;
    
    let i = 0;
    el.textContent = "";
    
    function type() {
        if (i < text.length) {
            el.textContent += text.charAt(i);
            i++;
            setTimeout(type, speed);
        }
    }
    type();
}