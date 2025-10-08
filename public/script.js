// No emailjs.init() here anymore! Secrets are on the backend.

// Helper functions for client-side data collection
function getOS() {
    const userAgent = navigator.userAgent;
    if (userAgent.includes("Win")) return "Windows";
    if (userAgent.includes("Mac")) return "macOS";
    if (userAgent.includes("Linux")) return "Linux";
    if (userAgent.includes("Android")) return "Android";
    if (userAgent.includes("iPhone")) return "iOS";
    return "Unknown";
}

function getBrowser() {
    const userAgent = navigator.userAgent;
    if (userAgent.includes("Chrome") && !userAgent.includes("Edge")) return "Chrome";
    if (userAgent.includes("Firefox")) return "Firefox";
    if (userAgent.includes("Safari") && !userAgent.includes("Chrome")) return "Safari";
    if (userAgent.includes("Edge")) return "Edge";
    if (userAgent.includes("Opera")) return "Opera";
    return "Unknown";
}

async function getIPv6Address() {
    try {
        const response = await fetch('https://api64.ipify.org?format=json');
        const data = await response.json();
        return data.ip;
    } catch {
        return 'unavailable';
    }
}

function getCanvasFingerprint() {
    try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        ctx.textBaseline = 'top';
        ctx.font = '14px Arial';
        ctx.fillText('Canvas fingerprint test', 2, 2);
        return canvas.toDataURL().slice(-20);
    } catch {
        return 'blocked';
    }
}

function getWebGLInfo() {
    try {
        const canvas = document.createElement('canvas');
        const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
        if (!gl) return 'not supported';
        const renderer = gl.getParameter(gl.RENDERER);
        const vendor = gl.getParameter(gl.VENDOR);
        return `${vendor} ${renderer}`.substring(0, 50);
    } catch {
        return 'blocked';
    }
}

async function getBatteryInfo() {
    try {
        if ('getBattery' in navigator) {
            const battery = await navigator.getBattery();
            return `${Math.round(battery.level * 100)}% - ${battery.charging ? 'charging' : 'not charging'}`;
        }
        return 'unavailable';
    } catch {
        return 'blocked';
    }
}

function detectVPN() {
    // This is a very basic heuristic and not foolproof
    const timezoneOffset = new Date().getTimezoneOffset();
    const systemLanguage = navigator.language;
    const userAgent = navigator.userAgent;

    // Example checks (can be expanded)
    if (timezoneOffset !== 0 && systemLanguage.substring(0,2) !== 'en') return 'possible'; // Non-UTC timezone with non-English language
    if (userAgent.includes('Proxy') || userAgent.includes('VPN')) return 'detected';
    return 'not detected';
}

async function loadData() {
    const btn = document.getElementById('refresh-btn');
    btn.textContent = 'loading...';
    btn.disabled = true;
    
    // Collect all client-side data
    const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    const clientData = {
        userAgent: navigator.userAgent,
        screen: `${window.screen.width}x${window.screen.height} (${window.screen.colorDepth}bit)`,
        language: `${navigator.language || 'unknown'} (${navigator.languages?.join(', ') || 'n/a'})`,
        referrer: document.referrer || 'direct',
        connectionEffectiveType: connection ? connection.effectiveType || 'unknown' : 'unavailable',
        connectionDownlink: connection ? connection.downlink || 'unknown' : 'unavailable',
        connectionType: connection ? connection.type || 'unknown' : 'unavailable',
        cpuCores: navigator.hardwareConcurrency || 'unknown',
        deviceMemory: navigator.deviceMemory ? `${navigator.deviceMemory}` : 'unknown', // Send as number/string, format in backend
        touchSupport: 'ontouchstart' in window ? 'supported' : 'not supported',
        batteryInfo: await getBatteryInfo(),
        cookiesEnabled: navigator.cookieEnabled,
        localStorageSupport: typeof(Storage) !== "undefined" ? 'supported' : 'not supported',
        sessionStorageSupport: typeof(sessionStorage) !== "undefined" ? 'supported' : 'not supported',
        webglInfo: getWebGLInfo(),
        canvasFingerprint: getCanvasFingerprint(),
        javaEnabled: navigator.javaEnabled ? navigator.javaEnabled() : 'unknown',
        flashDetected: navigator.plugins['Shockwave Flash'] ? 'enabled' : 'not detected',
        timezoneOffset: new Date().getTimezoneOffset(),
        localTime: new Date().toLocaleString(),
        platform: navigator.platform,
        doNotTrack: navigator.doNotTrack || 'not set',
        onlineStatus: navigator.onLine ? 'online' : 'offline',
        ipv6Address: await getIPv6Address(),
        vpnDetected: detectVPN()
    };

    try {
        // Send ALL collected data to your Netlify backend
        // Make sure this path '/api/track' is correctly redirected by your netlify.toml
        const response = await fetch('/api/track', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(clientData) // Send all clientData here
        });
        
        const result = await response.json();
        
        if (result.success) {
            // Update display with data returned from backend
            document.getElementById('ip').textContent = result.data.ip;
            document.getElementById('location').textContent = result.data.location;
            document.getElementById('isp').textContent = result.data.isp;
            document.getElementById('country').textContent = result.data.country;
            document.getElementById('timezone').textContent = result.data.timezone;
            document.getElementById('coords').textContent = result.data.coords;
            document.getElementById('asn').textContent = result.data.asn;
            
            // Display client-side collected data directly
            document.getElementById('useragent').textContent = clientData.userAgent;
            document.getElementById('screen').textContent = clientData.screen;
            document.getElementById('lang').textContent = clientData.language;
            document.getElementById('connection').textContent = `${clientData.connectionEffectiveType} - ${clientData.connectionDownlink}mbps (${clientData.connectionType})`;

        } else {
            console.error('Backend returned an error:', result.error);
            document.getElementById('ip').textContent = 'error from backend';
            document.getElementById('location').textContent = 'error';
            document.getElementById('isp').textContent = 'error';
            document.getElementById('country').textContent = 'error';
            document.getElementById('timezone').textContent = 'error';
            document.getElementById('coords').textContent = 'error';
            document.getElementById('asn').textContent = 'error';
            document.getElementById('useragent').textContent = 'error';
            document.getElementById('screen').textContent = 'error';
            document.getElementById('lang').textContent = 'error';
            document.getElementById('connection').textContent = 'error';
        }
        
    } catch (error) {
        console.error('Frontend failed to communicate with backend:', error);
        document.getElementById('ip').textContent = 'network error';
        document.getElementById('location').textContent = 'network error';
        document.getElementById('isp').textContent = 'network error';
        document.getElementById('country').textContent = 'network error';
        document.getElementById('timezone').textContent = 'network error';
        document.getElementById('coords').textContent = 'network error';
        document.getElementById('asn').textContent = 'network error';
        document.getElementById('useragent').textContent = 'network error';
        document.getElementById('screen').textContent = 'network error';
        document.getElementById('lang').textContent = 'network error';
        document.getElementById('connection').textContent = 'network error';
    }
    
    btn.textContent = 'refresh data';
    btn.disabled = false;
}

function refresh() {
    loadData();
}

document.addEventListener('DOMContentLoaded', loadData);
