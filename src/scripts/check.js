// src/scripts/stressTestInsert.js
// Run with: npx vite-node src/scripts/stressTestInsert.js

import { createClient } from '@supabase/supabase-js'
import data1 from '../voters/2026-EROLLGEN-S22-143-SIR-DraftRoll-Revision1-TAM-1-WI_with_roof.jsx'

const supabase = createClient(
  'https://dfgjvhausdsacnovjeqd.supabase.co',
  'sb_publishable_lRtGChozBoqkIXVZ29joVw_R8-mW_qF'
)

const mapVoter = (v) => ({
  s_no:                    (parseInt(v['S.No'], 10) || 0) - 1,
  one_roof:                v['One Roof'],
  one_roof_running_number: v['One Roof Running Number'],
  position:                v['Position'],
  name:                    v['Name'],
  relation_type:           v['Relation Type'],
  relative_name:           v['Relative Name'],
  house_no:                v['House No'],
  age:                     v['Age'],
  gender:                  v['Gender'],
  id_code:                 v['ID Code'],
  photo:                   v['Photo'],
  page:                    v['Page'],
  constituency:            v['Constituency'],
  division:                v['Division'],
  village:                 v['Village'],
  ward:                    v['Ward'],
  part:                    v['Part'],
  roof_key:                v['Roof_Key'],
})

const sleep = (ms) => new Promise(r => setTimeout(r, ms))

async function upsertWithRetry(batch, batchIndex, maxRetries = 3) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    const { error } = await supabase
      .from('voters')
      .upsert(batch, { onConflict: 'id_code' })

    if (!error) return { success: true }

    const isTimeout = error.message.includes('statement timeout') || 
                      error.message.includes('canceling statement')

    if (isTimeout && attempt < maxRetries) {
      console.warn(`  ⚠️  Batch ${batchIndex} timed out — retry ${attempt}/${maxRetries} after ${attempt * 500}ms...`)
      await sleep(attempt * 500) // 500ms, 1000ms, 1500ms back-off
    } else {
      console.error(`  ❌ Batch ${batchIndex} failed after ${attempt} attempt(s): ${error.message}`)
      return { success: false, error }
    }
  }
}

const REPEAT   = 250
const BATCH    = 100
const DELAY_MS = 50

const allData = Array.from({ length: REPEAT }, () => data1).flat().map(mapVoter)

console.log(`Total voters to upsert (${REPEAT}x repeated): ${allData.length}`)
console.log(`Batch size: ${BATCH} | Delay: ${DELAY_MS}ms | Max retries: 3\n`)

let successCount = 0
let failCount    = 0
const startTime  = Date.now()

for (let i = 0; i < allData.length; i += BATCH) {
  const batch      = allData.slice(i, i + BATCH)
  const batchIndex = `${i}–${i + batch.length}`
  const result     = await upsertWithRetry(batch, batchIndex)

  if (result.success) {
    successCount += batch.length
    const pct = ((Math.min(i + batch.length, allData.length) / allData.length) * 100).toFixed(1)
    console.log(`✅ ${Math.min(i + batch.length, allData.length)} / ${allData.length} (${pct}%)`)
  } else {
    failCount++
  }

  await sleep(DELAY_MS)
}

const elapsed = ((Date.now() - startTime) / 1000).toFixed(1)
console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`)
console.log(`Done in ${elapsed}s`)
console.log(`✅ ${successCount} rows succeeded`)
console.log(`❌ ${failCount} batches failed`)
console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`)