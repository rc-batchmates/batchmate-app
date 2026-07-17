import { mkdirSync, readFileSync, writeFileSync } from "node:fs"
import { dirname, resolve } from "node:path"
import { fileURLToPath } from "node:url"

const here = dirname(fileURLToPath(import.meta.url))
const repoRoot = resolve(here, "../../..")
const devVarsPath = resolve(repoRoot, ".dev.vars")
const outDir = resolve(here, "..", "tmp")
const outJsonPath = resolve(outDir, "zoom-rooms.json")
const outSqlPath = resolve(outDir, "seed-zoom.sql")

type Room = { slug: string; label: string }

const rooms: Room[] = [
	{ slug: "presentation_space", label: "Presentation Space" },
	{ slug: "midori", label: "Midori" },
	{ slug: "aegis", label: "Aegis" },
	{ slug: "edos", label: "Edos" },
	{ slug: "couches", label: "Couches" },
	{ slug: "genera", label: "Genera" },
	{ slug: "verve", label: "Verve" },
	{ slug: "pairing_station_1", label: "Pairing Station 1" },
	{ slug: "pairing_station_2", label: "Pairing Station 2" },
	{ slug: "pairing_station_3", label: "Pairing Station 3" },
	{ slug: "pairing_station_4", label: "Pairing Station 4" },
	{ slug: "pairing_station_5", label: "Pairing Station 5" },
]

function parseDevVars(path: string): Record<string, string> {
	const raw = readFileSync(path, "utf8")
	const out: Record<string, string> = {}
	for (const line of raw.split("\n")) {
		const trimmed = line.trim()
		if (!trimmed || trimmed.startsWith("#")) continue
		const eq = trimmed.indexOf("=")
		if (eq === -1) continue
		const key = trimmed.slice(0, eq).trim()
		let value = trimmed.slice(eq + 1).trim()
		if (
			(value.startsWith('"') && value.endsWith('"')) ||
			(value.startsWith("'") && value.endsWith("'"))
		) {
			value = value.slice(1, -1)
		}
		out[key] = value
	}
	return out
}

const REDIRECT_STATUSES = new Set([301, 302, 303, 307, 308])
const debug = process.argv.includes("--debug")

async function resolveZoomUrl(
	slug: string,
	cookies: { recurse: string; rctogether: string },
): Promise<string> {
	let url = `https://www.recurse.com/zoom/${slug}`
	const chain: string[] = [url]
	for (let hop = 0; hop < 6; hop++) {
		const host = new URL(url).hostname
		const headers: Record<string, string> = {}
		if (host.endsWith("rctogether.com")) headers.Cookie = cookies.rctogether
		else if (host.endsWith("recurse.com")) headers.Cookie = cookies.recurse
		const res = await fetch(url, {
			method: "GET",
			headers,
			redirect: "manual",
		})
		if (debug) console.log(`\n    [${res.status}] ${url}`)
		if (REDIRECT_STATUSES.has(res.status)) {
			const location = res.headers.get("location")
			if (!location) {
				throw new Error(`${slug}: redirect at ${url} with no Location header`)
			}
			const next = new URL(location, url).toString()
			chain.push(next)
			if (next.includes("/login")) {
				throw new Error(
					`${slug}: hop ${hop} (${url}) redirected to ${next} — cookie not accepted. Chain: ${chain.join(" → ")}`,
				)
			}
			url = next
			continue
		}
		if (!res.ok) {
			throw new Error(`${slug}: unexpected status ${res.status} at ${url}`)
		}
		return url
	}
	throw new Error(`${slug}: too many redirects (chain: ${chain.join(" → ")})`)
}

function sqlEscape(s: string): string {
	return s.replace(/'/g, "''")
}

const vars = parseDevVars(devVarsPath)
const recurseCookie = vars.RC_SESSION_COOKIE
const rcTogetherCookie = vars.RC_TOGETHER_SESSION_COOKIE
if (!recurseCookie) {
	console.error("RC_SESSION_COOKIE is not set in .dev.vars")
	console.error(
		"Paste the full Cookie header value from a logged-in recurse.com request.",
	)
	process.exit(1)
}
if (!rcTogetherCookie) {
	console.error("RC_TOGETHER_SESSION_COOKIE is not set in .dev.vars")
	console.error(
		"Paste the full Cookie header value from a logged-in recurse.rctogether.com request.",
	)
	process.exit(1)
}

const resolved: { slug: string; label: string; directUrl: string }[] = []
for (const room of rooms) {
	process.stdout.write(`  ${room.slug}… `)
	try {
		const directUrl = await resolveZoomUrl(room.slug, {
			recurse: recurseCookie,
			rctogether: rcTogetherCookie,
		})
		resolved.push({ ...room, directUrl })
		console.log("ok")
	} catch (err) {
		console.log(`FAILED (${(err as Error).message})`)
	}
}

if (resolved.length === 0) {
	console.error("No rooms resolved — aborting.")
	process.exit(1)
}

mkdirSync(outDir, { recursive: true })
writeFileSync(outJsonPath, `${JSON.stringify(resolved, null, 2)}\n`)
console.log(`Wrote ${outJsonPath}`)

const values = resolved
	.map(
		(r) =>
			`  ('${sqlEscape(r.slug)}', '${sqlEscape(r.label)}', '${sqlEscape(r.directUrl)}', (cast(unixepoch('subsecond') * 1000 as integer)))`,
	)
	.join(",\n")

const sql = `INSERT INTO zoom_room (slug, label, direct_url, updated_at) VALUES
${values}
ON CONFLICT(slug) DO UPDATE SET
  label = excluded.label,
  direct_url = excluded.direct_url,
  updated_at = excluded.updated_at;
`

writeFileSync(outSqlPath, sql)
console.log(`Wrote ${outSqlPath}`)
console.log("")
console.log("Apply locally:")
console.log(
	"  pnpm wrangler d1 execute batchmate --local --file=packages/db/tmp/seed-zoom.sql",
)
console.log("Apply remote:")
console.log(
	"  pnpm wrangler d1 execute batchmate --remote --file=packages/db/tmp/seed-zoom.sql",
)
