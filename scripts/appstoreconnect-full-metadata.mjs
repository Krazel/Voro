import crypto from "node:crypto";
import fs from "node:fs";

const manifestPath = process.argv[2] ?? "store/app-store-connect-metadata.json";
const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
const bundleId = manifest.app?.iosBundleId;
const ios = manifest.ios;
if (!bundleId || !ios?.locales) fail("El manifiesto necesita app.iosBundleId e ios.locales.");

const token = createToken({
  keyId: requiredEnv("ASC_KEY_ID"),
  issuerId: requiredEnv("ASC_ISSUER_ID"),
  privateKey: fs.readFileSync(requiredEnv("ASC_PRIVATE_KEY_PATH"), "utf8")
});

const app = (await asc("GET", `/v1/apps?filter[bundleId]=${encodeURIComponent(bundleId)}&limit=1`)).data?.[0];
if (!app) fail(`No se encontro app para Bundle ID ${bundleId}.`);
if (manifest.app.appleId && app.id !== manifest.app.appleId) {
  fail(`El Apple ID del manifiesto (${manifest.app.appleId}) no coincide con la app (${app.id}).`);
}
console.log(`App comprobada: ${app.id} (${app.attributes?.name ?? "sin nombre"})`);

if (manifest.app.primaryLocale && app.attributes?.primaryLocale !== manifest.app.primaryLocale) {
  const primaryLocaleResult = await asc("PATCH", `/v1/apps/${app.id}`, {
    data: {
      type: "apps",
      id: app.id,
      attributes: { primaryLocale: manifest.app.primaryLocale }
    }
  }, { allowPrimaryLocaleScreenshotBlock: true });
  if (primaryLocaleResult.blocked) {
    console.log("Locale principal pendiente: Apple exige capturas de la nueva locale para cada version.");
  } else {
    console.log(`Locale principal actualizado: ${manifest.app.primaryLocale}`);
  }
} else {
  console.log(`Locale principal verificado: ${app.attributes?.primaryLocale ?? "no informado"}`);
}

const info = (await asc("GET", `/v1/apps/${app.id}/appInfos?limit=200`)).data?.find((item) =>
  item.attributes?.state === "PREPARE_FOR_SUBMISSION"
) ?? (await asc("GET", `/v1/apps/${app.id}/appInfos?limit=1`)).data?.[0];
if (!info) fail("No se encontro un appInfo editable.");

const version = (await asc(
  "GET",
  `/v1/apps/${app.id}/appStoreVersions?filter[platform]=${encodeURIComponent(ios.platform ?? "IOS")}&limit=200`
)).data?.find((item) => item.attributes?.versionString === ios.versionString);
if (!version) fail(`No se encontro version ${ios.versionString}.`);
console.log(`Version comprobada: ${version.attributes?.versionString} (${version.id}), estado ${version.attributes?.appStoreState ?? "desconocido"}`);

if (manifest.app.price?.amount && manifest.app.price?.currency === "EUR") {
  await syncAppPrice(app.id, manifest.app.price);
}

for (const [locale, content] of Object.entries(ios.locales)) {
  validateLocale(locale, content);
  const infoLocs = (await asc("GET", `/v1/appInfos/${info.id}/appInfoLocalizations?limit=200`)).data ?? [];
  await upsert(
    "appInfoLocalizations",
    infoLocs.find((item) => item.attributes?.locale === locale),
    {
      locale,
      name: content.name,
      subtitle: content.subtitle,
      privacyPolicyUrl: content.privacyPolicyUrl ?? manifest.app.privacyPolicyUrl
    },
    "appInfo",
    "appInfos",
    info.id
  );

  const versionLocs = (await asc("GET", `/v1/appStoreVersions/${version.id}/appStoreVersionLocalizations?limit=200`)).data ?? [];
  await upsert(
    "appStoreVersionLocalizations",
    versionLocs.find((item) => item.attributes?.locale === locale),
    {
      locale,
      description: content.description,
      keywords: content.keywords,
      promotionalText: content.promotionalText,
      whatsNew: content.whatsNew,
      supportUrl: content.supportUrl ?? manifest.app.supportUrl
    },
    "appStoreVersion",
    "appStoreVersions",
    version.id,
    { allowWhatsNewStateBlock: true }
  );
  console.log(`Metadatos escritos: ${locale}`);
}

const freshApp = (await asc("GET", `/v1/apps/${app.id}`)).data;
const freshInfoLocs = (await asc("GET", `/v1/appInfos/${info.id}/appInfoLocalizations?limit=200`)).data ?? [];
const freshVersionLocs = (await asc("GET", `/v1/appStoreVersions/${version.id}/appStoreVersionLocalizations?limit=200`)).data ?? [];
const verification = {
  appId: app.id,
  bundleId: freshApp.attributes?.bundleId,
  primaryLocale: freshApp.attributes?.primaryLocale,
  version: version.attributes?.versionString,
  versionState: version.attributes?.appStoreState,
  infoLocalizations: freshInfoLocs.map(redactLocalization),
  versionLocalizations: freshVersionLocs.map(redactLocalization)
};
if (manifest.app.price?.amount && manifest.app.price?.currency === "EUR") {
  const priceSchedule = await asc(
    "GET",
    `/v1/apps/${app.id}/appPriceSchedule?include=baseTerritory,manualPrices&limit[manualPrices]=50`
  );
  verification.priceSchedule = redactPriceSchedule(priceSchedule);
}
console.log(JSON.stringify(verification, null, 2));

async function syncAppPrice(appId, target) {
  const amount = String(target.amount);
  const territory = target.territory ?? "ESP";
  const points = (await asc(
    "GET",
    `/v1/apps/${appId}/appPricePoints?filter[territory]=${encodeURIComponent(territory)}&include=territory&limit=200`
  )).data ?? [];
  const point = points.find((item) => String(item.attributes?.customerPrice) === amount);
  if (!point) fail(`No se encontro un precio ${amount} EUR para el territorio ${territory}.`);
  const current = await asc(
    "GET",
    `/v1/apps/${appId}/appPriceSchedule?include=baseTerritory,manualPrices&limit[manualPrices]=50`,
    undefined,
    { allowNotFound: true }
  );
  const currentBase = current.data?.relationships?.baseTerritory?.data?.id;
  const currentIncluded = current.included ?? [];
  const alreadySet = currentBase === territory && currentIncluded.some((item) =>
    item.type === "appPricePoints" && String(item.attributes?.customerPrice) === amount
  );
  if (alreadySet) {
    console.log(`Precio verificado: ${amount} EUR (${territory})`);
    return;
  }
  const manualId = `voro-price-${Date.now()}`;
  const body = {
    data: {
      type: "appPriceSchedules",
      attributes: {},
      relationships: {
        app: { data: { type: "apps", id: appId } },
        baseTerritory: { data: { type: "territories", id: territory } },
        manualPrices: { data: [{ type: "appPrices", id: manualId }] }
      }
    },
    included: [{
      type: "appPrices",
      id: manualId,
      attributes: { startDate: null, endDate: null },
      relationships: { appPricePoint: { data: { type: "appPricePoints", id: point.id } } }
    }]
  };
  await asc("POST", "/v1/appPriceSchedules", body);
  console.log(`Precio actualizado: ${amount} EUR (${territory})`);
}

function redactPriceSchedule(result) {
  const base = result.data?.relationships?.baseTerritory?.data?.id ?? null;
  const prices = (result.included ?? [])
    .filter((item) => item.type === "appPricePoints")
    .map((item) => ({ id: item.id, customerPrice: item.attributes?.customerPrice }));
  return { baseTerritory: base, pricePoints: prices };
}

function redactLocalization(item) {
  const a = item.attributes ?? {};
  return {
    locale: a.locale,
    name: a.name,
    subtitle: a.subtitle,
    descriptionLength: typeof a.description === "string" ? a.description.length : undefined,
    keywordsLength: typeof a.keywords === "string" ? a.keywords.length : undefined,
    promotionalTextLength: typeof a.promotionalText === "string" ? a.promotionalText.length : undefined,
    whatsNewLength: typeof a.whatsNew === "string" ? a.whatsNew.length : undefined,
    hasPrivacyPolicyUrl: Boolean(a.privacyPolicyUrl),
    hasSupportUrl: Boolean(a.supportUrl),
    hasMarketingUrl: Boolean(a.marketingUrl)
  };
}

function validateLocale(locale, content) {
  if (!/^[a-z]{2}-[A-Z]{2}$/.test(locale)) fail(`Locale no valida: ${locale}`);
  for (const field of ["name", "subtitle", "keywords", "description", "promotionalText", "whatsNew"]) {
    if (typeof content[field] !== "string" || !content[field].trim()) fail(`${locale}: falta ${field}.`);
  }
  for (const field of ["privacyPolicyUrl", "supportUrl"]) {
    if (content[field] !== undefined && content[field] !== null) {
      try {
        const url = new URL(content[field]);
        if (url.protocol !== "https:") fail(`${locale}: ${field} debe usar HTTPS.`);
      } catch {
        fail(`${locale}: ${field} no es una URL valida.`);
      }
    }
  }
  if (content.name.length > 30) fail(`${locale}: name supera 30 caracteres.`);
  if (content.subtitle.length > 30) fail(`${locale}: subtitle supera 30 caracteres.`);
  if (content.keywords.length > 100) fail(`${locale}: keywords supera 100 caracteres.`);
  if (content.promotionalText.length > 170) fail(`${locale}: promotionalText supera 170 caracteres.`);
  if (content.description.length > 4000) fail(`${locale}: description supera 4000 caracteres.`);
  if (content.whatsNew.length > 4000) fail(`${locale}: whatsNew supera 4000 caracteres.`);
}

async function upsert(type, existing, attributes, relation, parentType, parentId, options = {}) {
  if (existing) {
    const { locale: _locale, ...updates } = attributes;
    const result = await asc("PATCH", `/v1/${type}/${existing.id}`, {
      data: { type, id: existing.id, attributes: updates }
    }, options);
    if (result.blocked === "whatsNew") {
      delete updates.whatsNew;
      await asc("PATCH", `/v1/${type}/${existing.id}`, {
        data: { type, id: existing.id, attributes: updates }
      });
      console.log("  whatsNew pendiente por estado de la version");
    }
    return;
  }
  const result = await asc("POST", `/v1/${type}`, {
    data: {
      type,
      attributes,
      relationships: { [relation]: { data: { type: parentType, id: parentId } } }
    }
  }, options);
  if (result.blocked === "whatsNew") {
    const withoutWhatsNew = { ...attributes };
    delete withoutWhatsNew.whatsNew;
    await asc("POST", `/v1/${type}`, {
      data: {
        type,
        attributes: withoutWhatsNew,
        relationships: { [relation]: { data: { type: parentType, id: parentId } } }
      }
    });
    console.log("  whatsNew pendiente por estado de la version");
  }
}

async function asc(method, endpoint, body, options = {}) {
  const response = await fetch(`https://api.appstoreconnect.apple.com${endpoint}`, {
    method,
    headers: { Authorization: `Bearer ${token}`, ...(body ? { "Content-Type": "application/json" } : {}) },
    body: body ? JSON.stringify(body) : undefined
  });
  const raw = await response.text();
  let json = {};
  try { json = raw ? JSON.parse(raw) : {}; } catch { /* preserve status without echoing raw secrets */ }
  if (!response.ok) {
    if (options.allowNotFound && response.status === 404) return { notFound: true };
    const errors = json.errors ?? [];
    const screenshotBlock = errors.some((error) => error.code === "ENTITY_ERROR.ATTRIBUTE.INVALID.INVALID_STATE.MISSING_SCREENSHOTS_PRIMARY_LOCALE");
    if (options.allowPrimaryLocaleScreenshotBlock && response.status === 409 && screenshotBlock) {
      return { blocked: true };
    }
    const whatsNewStateBlock = errors.some((error) =>
      error.code === "STATE_ERROR" && /whatsNew/i.test(error.detail ?? "")
    );
    if (options.allowWhatsNewStateBlock && response.status === 409 && whatsNewStateBlock) {
      return { blocked: "whatsNew" };
    }
    fail(`${method} ${endpoint}: ${response.status} ${JSON.stringify(errors)}`);
  }
  return json;
}

function createToken({ keyId, issuerId, privateKey }) {
  const now = Math.floor(Date.now() / 1000);
  const encode = (value) => Buffer.from(JSON.stringify(value)).toString("base64url");
  const header = encode({ alg: "ES256", kid: keyId, typ: "JWT" });
  const payload = encode({ iss: issuerId, aud: "appstoreconnect-v1", iat: now, exp: now + 10 * 60 });
  const message = `${header}.${payload}`;
  const signature = crypto.sign("sha256", Buffer.from(message), { key: privateKey, dsaEncoding: "ieee-p1363" }).toString("base64url");
  return `${message}.${signature}`;
}

function requiredEnv(name) {
  const value = process.env[name];
  if (!value) fail(`Falta ${name}.`);
  return value;
}

function fail(message) {
  console.error(message);
  process.exit(1);
}
