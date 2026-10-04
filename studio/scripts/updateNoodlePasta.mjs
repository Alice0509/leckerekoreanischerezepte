import {getCliClient} from 'sanity/cli'
import {createRequire} from 'node:module'
const {updateNoodlePasta} = createRequire(import.meta.url)('../noodlePastaUpdate.cjs')
const args = process.argv.slice(2)
if (
  args.some((arg) => !['--apply', '--dry-run'].includes(arg)) ||
  (args.includes('--apply') && args.includes('--dry-run'))
) {
  throw new Error('--dry-run 또는 --apply 중 하나를 사용하세요.')
}
const client = getCliClient({apiVersion: '2025-08-15'}).withConfig({
  useCdn: false,
  perspective: 'raw',
})
updateNoodlePasta(client, {apply: args.includes('--apply')})
  .then((result) => {
    console.log(JSON.stringify(result, null, 2))
    console.log(
      result.written
        ? '공개된 두 레시피의 설명을 한 번에 수정했습니다. 사이트 배포 완료 후 확인하세요.'
        : '공개 내용은 변경하지 않았습니다. --apply로 실행하면 안내가 공개됩니다.',
    )
  })
  .catch((error) => {
    console.error(error.message)
    process.exitCode = 1
  })
