import {getCliClient} from 'sanity/cli'
import {createRequire} from 'node:module'
const {createGochugaruEnglishDraft} = createRequire(import.meta.url)('../gochugaruEnglishDraft.cjs')

const client = getCliClient({apiVersion: '2025-08-15'}).withConfig({
  useCdn: false,
  perspective: 'raw',
})
createGochugaruEnglishDraft(client)
  .then((result) => {
    console.log(JSON.stringify(result))
    console.log('Studio의 고춧가루 재료에서 English 소개를 검토하고 Publish하세요.')
  })
  .catch((error) => {
    console.error(error.message)
    process.exitCode = 1
  })
