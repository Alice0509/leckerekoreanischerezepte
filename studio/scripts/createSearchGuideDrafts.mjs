import {getCliClient} from 'sanity/cli'
import {createRequire} from 'node:module'
const {createSearchGuideDrafts} = createRequire(import.meta.url)('../searchGuideDrafts.cjs')

const client = getCliClient({apiVersion: '2025-08-15'}).withConfig({
  useCdn: false,
  perspective: 'raw',
})
createSearchGuideDrafts(client, {dryRun: process.argv.includes('--dry-run')})
  .then((result) => {
    console.log(JSON.stringify(result, null, 2))
    console.log('소보로빵·단팥빵 English 소개와 고추장 Deutsch 소개를 Studio에서 검토하세요.')
    console.log('초안은 자동 공개되지 않습니다. 확인한 문서만 Publish하세요.')
  })
  .catch((error) => {
    console.error(error.message)
    process.exitCode = 1
  })
