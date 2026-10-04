import {getCliClient} from 'sanity/cli'
import {createRequire} from 'node:module'
const {updateSearchPages} = createRequire(import.meta.url)('../searchPageGrowthUpdate.cjs')
const args = process.argv.slice(2)
if (
  args.some((arg) => !['--apply', '--dry-run'].includes(arg)) ||
  (args.includes('--apply') && args.includes('--dry-run'))
) throw new Error('--dry-run 또는 --apply 중 하나를 사용하세요.')
const client = getCliClient({apiVersion: '2025-08-15'}).withConfig({
  useCdn: false,
  perspective: 'raw',
})
try {
  const result = await updateSearchPages(client, {apply: args.includes('--apply')})
  console.log(JSON.stringify(result, null, 2))
  console.log(result.written
    ? '초고추장·미역국의 검색 제목과 소개를 수정했습니다. 사이트 배포 완료 후 확인하세요.'
    : result.changedDocuments
      ? '확인만 했습니다. 공개 수정은 --apply로 실행합니다.'
      : '이미 반영되어 있습니다. 다시 수정하지 않았습니다.')
} catch (error) {
  console.error(error.message)
  process.exitCode = 1
}
