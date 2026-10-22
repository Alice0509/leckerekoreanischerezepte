import {getCliClient} from 'sanity/cli'
import {createRequire} from 'node:module'
const {createTteokbokkiGuideDrafts} = createRequire(import.meta.url)('../tteokbokkiGuideDrafts.cjs')
const client = getCliClient({apiVersion: '2025-08-15'}).withConfig({
  useCdn: false,
  perspective: 'raw',
})
createTteokbokkiGuideDrafts(client, {dryRun: process.argv.includes('--dry-run')})
  .then((result) => {
    console.log(JSON.stringify(result, null, 2))
    console.log('떡 재료 English·Deutsch와 떡볶이 English 소개·SEO를 Studio에서 검토하세요.')
    console.log(
      '초안은 자동 공개되지 않습니다. 떡 재료를 먼저 Publish한 뒤 레시피를 Publish하세요.',
    )
  })
  .catch((error) => {
    console.error(error.message)
    process.exitCode = 1
  })
