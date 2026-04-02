// src/scripts/fixDivisionVillageWard.js
// Run with: npx vite-node src/scripts/fixDivisionVillageWard.js

import { readdirSync, readFileSync, writeFileSync } from 'fs'
import { resolve, join } from 'path'

const VOTERS_FOLDER = resolve('./src/voters') // 👈 change if needed

// Ward token pattern — matches "வார்டு-4" OR "வார்டு 4" OR "Ward-4" OR "Ward 4"
const WARD_PATTERN = /(?:வார்டு|Ward)[-\s]\d+/

/**
 * "1-ஊட்டத்தூர் (வ.கி) மற்றும் (ஊ)"  →  "1-ஊட்டத்தூர்"
 */
function cleanDivision(raw) {
  return raw.replace(/\s*\(.*$/, '').trim()
}

/**
 * Extracts ward token from the Ward field.
 * "ஊ, வார்டு-4 தெற்கு வீதி"  →  "வார்டு-4"
 * "ஊ, வார்டு 4 நல்லூர்..."    →  "வார்டு 4"
 */
function extractWardFromWardField(raw) {
  const match = raw.match(WARD_PATTERN)
  return match ? match[0].trim() : null
}

/**
 * Parses the Village field to extract ward and village separately.
 *
 * Handles:
 *   "வார்டு-4 தெற்கு வீதி"          → ward: "வார்டு-4",  village: "தெற்கு வீதி"
 *   "வார்டு 4 நல்லூர்அரிசனத் தெரு"  → ward: "வார்டு 4",  village: "நல்லூர்அரிசனத் தெரு"
 *   "மேற்கு தெரு வார்டு-1"          → ward: "வார்டு-1",  village: "மேற்கு தெரு"
 *   "வார்டு-3"                       → ward: "வார்டு-3",  village: ""
 *   "வார்டு-2அரிசனத்தெரு கிழக்கு"   → ward: "வார்டு-2",  village: "அரிசனத்தெரு கிழக்கு"
 *   "அரிஜன காலனி தெற்கு தெரு"       → ward: null  (fallback to Ward field)
 *   "குறும்பர்தெரு"                  → ward: null  (fallback to Ward field)
 */
function parseVillageField(raw) {
  const wp = WARD_PATTERN.source // reuse pattern source

  // Pattern 1: ward FIRST with space — "வார்டு-4 தெற்கு வீதி" / "வார்டு 4 நல்லூர்..."
  const wardFirstSpace = raw.match(new RegExp(`^(${wp})\\s+(.+)$`))
  if (wardFirstSpace) {
    return { ward: wardFirstSpace[1].trim(), village: wardFirstSpace[2].trim() }
  }

  // Pattern 2: ward FIRST no space — "வார்டு-2அரிசனத்தெரு"
  const wardFirstNoSpace = raw.match(new RegExp(`^(${wp})(\\S.*)$`))
  if (wardFirstNoSpace) {
    return { ward: wardFirstNoSpace[1].trim(), village: wardFirstNoSpace[2].trim() }
  }

  // Pattern 3: ward LAST with space — "மேற்கு தெரு வார்டு-1"
  const wardLast = raw.match(new RegExp(`^(.+?)\\s+(${wp})$`))
  if (wardLast) {
    return { ward: wardLast[2].trim(), village: wardLast[1].trim() }
  }

  // Pattern 4: ward ONLY — "வார்டு-3"
  const wardOnly = raw.match(new RegExp(`^(${wp})$`))
  if (wardOnly) {
    return { ward: wardOnly[1].trim(), village: '' }
  }

  // No ward token found — caller will fallback to Ward field
  return { ward: null, village: raw }
}

// ── Process each object block ──────────────────────────────────────────────

function fixBlock(block) {
  const divMatch  = block.match(/"Division"\s*:\s*"([^"]*)"/)
  const vilMatch  = block.match(/"Village"\s*:\s*"([^"]*)"/)
  const wardMatch = block.match(/"Ward"\s*:\s*"([^"]*)"/)

  if (!divMatch || !vilMatch || !wardMatch) return block

  const newDivision = cleanDivision(divMatch[1])

  let newWard, newVillage
  const parsed = parseVillageField(vilMatch[1])

  if (parsed.ward) {
    // Village field had a recognisable ward token
    newWard    = parsed.ward
    newVillage = parsed.village
  } else {
    // Plain village name — extract ward from the Ward field instead
    newWard    = extractWardFromWardField(wardMatch[1])
    newVillage = vilMatch[1] // keep village exactly as-is

    if (!newWard) {
      console.warn(`  ⚠️  Could not extract ward from either field. Village: "${vilMatch[1]}" | Ward: "${wardMatch[1]}"`)
      return block // skip safely, don't corrupt
    }
  }

  let fixed = block
  fixed = fixed.replace(/"Division"\s*:\s*"[^"]*"/, `"Division": "${newDivision}"`)
  fixed = fixed.replace(/"Village"\s*:\s*"[^"]*"/,  `"Village": "${newVillage}"`)
  fixed = fixed.replace(/"Ward"\s*:\s*"[^"]*"/,     `"Ward": "${newWard}"`)

  return fixed
}

// ── Process entire file text ───────────────────────────────────────────────

function fixFileContent(content) {
  return content.replace(
    /(\{[^{}]*"Division"\s*:[^{}]*"Village"\s*:[^{}]*"Ward"\s*:[^{}]*\})/gs,
    (block) => fixBlock(block)
  )
}

// ── Main ───────────────────────────────────────────────────────────────────

const jsxFiles = readdirSync(VOTERS_FOLDER)
  .filter(f => f.endsWith('.jsx') || f.endsWith('.js'))
  .map(f => join(VOTERS_FOLDER, f))

console.log(`📂 Folder : ${VOTERS_FOLDER}`)
console.log(`📄 Files  : ${jsxFiles.length}\n`)

let totalFixed = 0

for (const filePath of jsxFiles) {
  const original = readFileSync(filePath, 'utf8')
  const fixed    = fixFileContent(original)

  if (fixed === original) {
    console.log(`⏭  No changes — ${filePath}`)
    continue
  }

  writeFileSync(filePath, fixed, 'utf8')
  totalFixed++
  console.log(`✅ Fixed   — ${filePath}`)
}

console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`)
console.log(`Done. ${totalFixed} file(s) updated.`)
console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`)