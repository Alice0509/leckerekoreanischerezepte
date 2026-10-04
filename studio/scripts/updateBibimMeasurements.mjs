import {getCliClient} from 'sanity/cli'
import {createRequire} from 'node:module'
const {updateBibimMeasurements} = createRequire(import.meta.url)('../bibimMeasurementUpdate.cjs')
const unknown = process.argv.slice(2).filter((arg) => !['--apply', '--dry-run'].includes(arg))
if (unknown.length || (process.argv.includes('--apply') && process.argv.includes('--dry-run'))) {
  throw new Error('미리보기는 --dry-run, 공개 내용 수정은 --apply 중 하나만 사용하세요.')
}
const client = getCliClient({apiVersion: '2025-08-15'}).withConfig({useCdn: false, perspective: 'raw'})
updateBibimMeasurements(client, {apply: process.argv.includes('--apply')})
  .then((result) => {
    console.log(JSON.stringify(result, null, 2))
    console.log(result.written
      ? '비빔 소스의 공개 계량 안내를 한 번에 수정했습니다. 웹사이트 배포 완료 후 확인하세요.'
      : '공개 내용은 변경하지 않았습니다. --apply로 실행하면 검토한 계량 안내가 공개됩니다.')
  })
  .catch((error) => {console.error(error.message); process.exitCode = 1})
