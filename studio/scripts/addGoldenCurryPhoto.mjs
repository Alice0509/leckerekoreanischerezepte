import {readFile} from 'node:fs/promises'
import {createHash} from 'node:crypto'
import {getCliClient} from 'sanity/cli'
import {createGoldenCurryPhotoDraft} from '../ingredientPhotoDraft.mjs'

const args = process.argv.slice(2)
if (args.length !== 2 || args[0] !== '--image') {
  throw new Error(
    '사용법: sanity exec scripts/addGoldenCurryPhoto.mjs --with-user-token -- --image 사진경로',
  )
}
const imageBytes = await readFile(args[1])
const imageHash = createHash('sha256').update(imageBytes).digest('hex')
if (imageHash !== 'b352c16504b668fb441fea00519a2e1eb38c78e75a2c1a6664bf22d94fc8d046') {
  throw new Error('첨부하신 제품 사진과 파일 해시가 다릅니다. 변경하지 않았습니다.')
}
const client = getCliClient({apiVersion: '2025-08-15'}).withConfig({
  useCdn: false,
  perspective: 'raw',
})
const result = await createGoldenCurryPhotoDraft(client, imageBytes)
if (result.status === 'already-has-photo') {
  console.log('이미 식재료 사진이 등록되어 있습니다. 변경하지 않았습니다.')
} else {
  console.log('제품 사진이 들어간 식재료 초안을 만들었습니다.')
  console.log(
    'https://hansik-young.sanity.studio/ 에서 식재료 사전 → Golden Curry → 사진 확인 → Publish',
  )
  console.log('기존 이름·주소·설명·레시피 연결은 유지됩니다. 아직 공개하지 않았습니다.')
}
