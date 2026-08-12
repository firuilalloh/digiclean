const { google } = require("googleapis");
const axios = require("axios");

const WELCOME_KEYWORDS =
  'subject:("welcome" OR "confirm" OR "verify" OR "pendaftaran" OR "selamat datang" OR "account" OR "registered" OR "activation")';

// Cache breach list di memory backend biar gak hit API terus-terusan
let cachedBreaches = null;
let lastFetchTime = 0;

/**
 * Fetch list seluruh perusahaan/domain yang pernah mengalami Data Breach dari HaveIBeenPwned
 */
async function getKnownBreaches() {
  const CACHE_DURATION = 1000 * 60 * 60 * 24; // Cache selama 24 jam
  const now = Date.now();

  if (cachedBreaches && now - lastFetchTime < CACHE_DURATION) {
    return cachedBreaches;
  }

  try {
    const response = await axios.get(
      "https://haveibeenpwned.com/api/v3/breaches",
      {
        headers: { "User-Agent": "DigiClean-App" },
        timeout: 5000,
      },
    );

    cachedBreaches = response.data;
    lastFetchTime = now;
    return cachedBreaches;
  } catch (err) {
    console.warn(
      "Gagal mengambil HIBP Breach list, fallback ke offline scoring:",
      err.message,
    );
    return []; // Return empty jika API limit / error
  }
}

/**
 * Pengecekan Real-time Kebocoran Data per Domain
 */
function analyzeDomainRisk(domain, dateString, breachesList) {
  const cleanDomain = domain.toLowerCase().trim();

  // Cari apakah domain ini ada dalam database Data Breach
  const matchedBreach = breachesList.find((b) => {
    const breachDomain = b.Domain?.toLowerCase();
    return (
      breachDomain &&
      (breachDomain === cleanDomain || cleanDomain.endsWith("." + breachDomain))
    );
  });

  if (matchedBreach) {
    const pwnCountFormatted = matchedBreach.PwnCount
      ? matchedBreach.PwnCount.toLocaleString()
      : "Jutaan";
    return {
      level: "HIGH",
      isBreached: true,
      breachName: matchedBreach.Title,
      breachDate: matchedBreach.BreachDate,
      dataClasses: matchedBreach.DataClasses || [],
      reason: `⚠️ PLATFORM PERNAH BOCOR! (${matchedBreach.BreachDate}) - ${pwnCountFormatted} akun terdampak. Data bocor: ${matchedBreach.DataClasses.slice(0, 3).join(", ")}.`,
    };
  }

  // Fallback Umur Akun jika tidak terdaftar di Breach List
  const yearCreated = new Date(dateString).getFullYear();
  const currentYear = new Date().getFullYear();
  const accountAgeYears = currentYear - yearCreated;

  if (accountAgeYears >= 3) {
    return {
      level: "MEDIUM",
      isBreached: false,
      reason:
        "Akun mengendap (> 3 tahun). Berpotensi rentan credential stuffing.",
    };
  }

  return {
    level: "LOW",
    isBreached: false,
    reason: "Tidak ditemukan dalam database kebocoran publik.",
  };
}

async function scanUserServices(accessToken) {
  const auth = new google.auth.OAuth2();
  auth.setCredentials({ access_token: accessToken });

  const gmail = google.gmail({ version: "v1", auth });

  try {
    // 1. Ambil data Breach HIBP secara paralel
    const breachesList = await getKnownBreaches();

    // 2. Fetch Email Pendaftaran dari Gmail
    let allMessages = [];
    let nextPageToken = null;
    let pageCount = 0;
    const maxPages = 10;

    do {
      const response = await gmail.users.messages.list({
        userId: "me",
        q: WELCOME_KEYWORDS,
        maxResults: 50,
        pageToken: nextPageToken,
      });

      if (response.data.messages) {
        allMessages = allMessages.concat(response.data.messages);
      }

      nextPageToken = response.data.nextPageToken;
      pageCount++;
    } while (nextPageToken && pageCount < maxPages);

    if (allMessages.length === 0) return [];

    const servicesMap = new Map();

    await Promise.all(
      allMessages.map(async (msg) => {
        try {
          const detail = await gmail.users.messages.get({
            userId: "me",
            id: msg.id,
            format: "metadata",
            metadataHeaders: ["From", "Subject", "Date"],
          });

          const headers = detail.data.payload.headers || [];
          const fromHeader =
            headers.find((h) => h.name === "From")?.value || "";
          const dateHeader =
            headers.find((h) => h.name === "Date")?.value || "";

          const match = fromHeader.match(/(.*?)\s*<(.*?)>/) || [
            null,
            fromHeader,
            "",
          ];
          let serviceName = match[1]?.replace(/"/g, "").trim() || "";
          const senderEmail = match[2] || fromHeader;
          const domain = senderEmail.split("@")[1] || "";

          if (!domain) return;

          if (!serviceName || serviceName.includes("@")) {
            serviceName = domain.split(".")[0] || "Unknown";
            serviceName =
              serviceName.charAt(0).toUpperCase() + serviceName.slice(1);
          }

          if (!servicesMap.has(domain)) {
            const detectedAt = new Date(dateHeader).toISOString();

            // Analisis Risk dengan Breach Engine
            const riskInfo = analyzeDomainRisk(
              domain,
              detectedAt,
              breachesList,
            );

            servicesMap.set(domain, {
              id: msg.id,
              name: serviceName,
              domain: domain,
              sender: senderEmail,
              detectedAt: detectedAt,
              risk: riskInfo,
            });
          }
        } catch (err) {
          // Ignore error per email
        }
      }),
    );

    return Array.from(servicesMap.values());
  } catch (error) {
    console.error("Error scanning Gmail:", error);
    throw new Error("Gagal melakukan scanning Gmail: " + error.message);
  }
}

module.exports = {
  scanUserServices,
};
