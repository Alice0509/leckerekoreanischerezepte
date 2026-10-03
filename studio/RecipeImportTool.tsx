import {useEffect, useMemo, useRef, useState} from 'react'
import {useClient} from 'sanity'
import {IntentLink} from 'sanity/router'
import {
  createDraftDocuments,
  fields,
  importMutations,
  parseRecipeInput,
  preparePublication,
  readText,
  recipeId,
} from './recipeImport'
import type {Catalog, Document, Publication, RecipeInput} from './recipeImport'
import './RecipeImportTool.css'

const CATALOG_QUERY = `{
  "ingredients": *[_type == "ingredient" && !(_id in path("drafts.**")) && !(_id in path("versions.**"))]{_id, _type, name, slug},
  "categories": *[_type == "category" && !(_id in path("drafts.**")) && !(_id in path("versions.**"))]{_id, _type, name},
  "recipes": *[_type == "recipe" && !(_id in path("versions.**"))]{_id, _type, titel, slug},
  "assets": *[_type in ["sanity.imageAsset", "sanity.fileAsset"]]{_id, _type}
}`
const IMPORTS_QUERY = `*[_type == "recipe" && _id match "drafts.chat-recipe-*"] | order(_createdAt desc)[0...100]{_id, _type, titel}`

function name(doc: Document | undefined): string {
  const value = fields(doc?.name)
  return String(value.en || value.de || doc?._id || '')
}

function Preview({
  recipe,
  ingredients,
  steps,
  catalog,
}: {
  recipe: Document
  ingredients: Document[]
  steps: Document[]
  catalog: Catalog
}) {
  return (
    <div className="hansik-import-preview">
      {(['en', 'de'] as const).map((locale) => (
        <section key={locale}>
          <h3>{locale === 'en' ? 'English' : 'Deutsch'}</h3>
          <h4>{String(fields(recipe.titel)[locale])}</h4>
          <p>
            분류:{' '}
            {Array.isArray(recipe.categories) &&
              recipe.categories
                .map((ref) => {
                  const category = catalog.categories.find((item) => item._id === fields(ref)._ref)
                  return String(fields(category?.name)[locale] || name(category))
                })
                .join(', ')}
          </p>
          <p>{readText(fields(recipe.description)[locale])}</p>
          <p>
            주소: {String(fields(recipe.slug)[locale])} ·{' '}
            {String(fields(recipe.preparationTime)[locale])}분 ·{' '}
            {String(fields(recipe.servings)[locale])}인분
          </p>
          <ul>
            {ingredients.map((doc) => {
              const ingredient = catalog.ingredients.find(
                (item) => item._id === fields(doc.ingredient)._ref,
              )
              const label = fields(ingredient?.name)[locale] || name(ingredient)
              return (
                <li key={doc._id}>
                  {String(label)} — {String(fields(doc.quantity)[locale])}
                  {fields(doc.prepNote)[locale] ? ` (${String(fields(doc.prepNote)[locale])})` : ''}
                </li>
              )
            })}
          </ul>
          <ol>
            {steps.map((doc) => (
              <li key={doc._id}>
                {readText(fields(doc.description)[locale])}
                {doc.timerDuration !== undefined && (
                  <small> 타이머 {String(doc.timerDuration)}초</small>
                )}
              </li>
            ))}
          </ol>
        </section>
      ))}
    </div>
  )
}

export function RecipeImportTool() {
  const studioClient = useClient({apiVersion: '2025-08-15'})
  const client = useMemo(
    () => studioClient.withConfig({useCdn: false, perspective: 'raw'}),
    [studioClient],
  )
  const [source, setSource] = useState('')
  const [catalog, setCatalog] = useState<Catalog | null>(null)
  const [plan, setPlan] = useState<{input: RecipeInput; documents: Document[]} | null>(null)
  const [recent, setRecent] = useState<Document[]>([])
  const [selected, setSelected] = useState('')
  const [publication, setPublication] = useState<Publication | null>(null)
  const [confirmed, setConfirmed] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const lock = useRef(false)

  async function run(operation: () => Promise<void>) {
    if (lock.current) return
    lock.current = true
    setBusy(true)
    setError('')
    setNotice('')
    try {
      if (client.config().projectId !== 'o9hshko6' || client.config().dataset !== 'production') {
        throw new Error('Hansik Young production 프로젝트에서만 사용할 수 있습니다.')
      }
      await operation()
    } catch (caught) {
      const message = caught instanceof Error ? caught.message : '요청을 완료하지 못했습니다.'
      setError(`${message}\n저장·발행 결과가 불확실하면 초안 목록을 새로고침해 확인하세요.`)
    } finally {
      lock.current = false
      setBusy(false)
    }
  }

  async function refresh() {
    const data = await client.fetch<Document[]>(IMPORTS_QUERY)
    setRecent(data)
  }

  useEffect(() => {
    let mounted = true
    Promise.all([client.fetch<Catalog>(CATALOG_QUERY), client.fetch<Document[]>(IMPORTS_QUERY)])
      .then(([data, imports]) => {
        if (mounted) {
          setCatalog(data)
          setRecent(imports)
        }
      })
      .catch(() => {
        if (mounted)
          setError('목록을 읽지 못했습니다. 로그인·프로젝트 권한을 확인하고 새로고침하세요.')
      })
    return () => {
      mounted = false
    }
  }, [client])

  function changeSource(value: string) {
    setSource(value)
    setPlan(null)
    setError('')
    setNotice('')
  }

  async function downloadCatalog() {
    const data = await client.fetch<Catalog>(CATALOG_QUERY)
    setCatalog(data)
    const download = {
      format: 'hansik-catalog-v1',
      ingredients: data.ingredients.map((doc) => ({id: doc._id, name: doc.name, slug: doc.slug})),
      categories: data.categories.map((doc) => ({id: doc._id, name: doc.name})),
      recipeSlugs: data.recipes.map((doc) => ({title: doc.titel, slug: doc.slug})),
    }
    const url = URL.createObjectURL(
      new Blob([JSON.stringify(download, null, 2)], {type: 'application/json'}),
    )
    const link = document.createElement('a')
    link.href = url
    link.download = 'hansik-recipe-catalog.json'
    link.click()
    URL.revokeObjectURL(url)
    setNotice('목록 파일과 한국어 레시피를 채팅에 보내주세요. 가져오기 파일로 정리할 수 있습니다.')
  }

  async function checkImport() {
    setPlan(null)
    const input = parseRecipeInput(source)
    const data = await client.fetch<Catalog>(CATALOG_QUERY)
    const documents = createDraftDocuments(input, data)
    const ids = documents.flatMap((doc) => [doc._id, doc._id.slice(7)])
    const existing = await client.fetch<Document[]>('*[_id in $ids]{_id, _type}', {ids})
    importMutations(documents, existing)
    setCatalog(data)
    setPlan({input, documents})
  }

  async function saveImport() {
    if (!plan) return
    const data = await client.fetch<Catalog>(CATALOG_QUERY)
    const documents = createDraftDocuments(plan.input, data)
    const ids = documents.flatMap((doc) => [doc._id, doc._id.slice(7)])
    const existing = await client.fetch<Document[]>('*[_id in $ids]{_id, _type}', {ids})
    await client.mutate(importMutations(documents, existing), {visibility: 'sync'})
    setCatalog(data)
    setSelected(recipeId(plan.input))
    setPublication(null)
    setPlan(null)
    setNotice(
      '레시피·재료 분량·조리 단계를 모두 초안으로 저장했어요. 아래에서 레시피를 열어 사진을 넣고 내용을 검토하세요.',
    )
    await refresh()
  }

  async function checkPublication() {
    setPublication(null)
    setConfirmed(false)
    const [data, bundle] = await Promise.all([
      client.fetch<Catalog>(CATALOG_QUERY),
      client.fetch<Document[]>(
        `*[_id == $id || _id == $draft || _id match $children || _id match $draftChildren]`,
        {
          id: selected,
          draft: `drafts.${selected}`,
          children: `${selected}-*`,
          draftChildren: `drafts.${selected}-*`,
        },
      ),
    ])
    setCatalog(data)
    setPublication(preparePublication(selected, bundle, data))
  }

  async function publish() {
    if (!publication || !confirmed) return
    // Check current catalog/URLs again; draft revision guards retain the reviewed contents.
    const data = await client.fetch<Catalog>(CATALOG_QUERY)
    const checked = preparePublication(
      selected,
      [...publication.ingredients, ...publication.steps, publication.recipe],
      data,
    )
    await client.mutate(checked.mutations, {visibility: 'sync'})
    setPublication(null)
    setConfirmed(false)
    setSelected('')
    setNotice(
      '레시피와 연결된 재료·조리 단계를 함께 발행했어요. 최종 Vercel Production 배포가 Ready가 되면 두 사이트에서 확인하세요.',
    )
    await refresh()
  }

  const recipe = plan?.documents.find((doc) => doc._type === 'recipe')
  return (
    <div className="hansik-import" aria-busy={busy}>
      <h1>채팅 레시피 가져오기</h1>
      <p>
        한국어로 레시피를 채팅에 적고, 정리된 파일을 한 번 가져오세요. 제목·소개·재료 분량·조리
        단계를 영어와 독일어로 함께 저장합니다.
      </p>
      <section>
        <h2>1 · 채팅에 레시피 보내기</h2>
        <p>
          음식 이름, 인분, 시간, 재료와 분량, 조리 순서, 사진을 보내주세요. 채팅에서 최신
          식재료·분류를 확인해 연결합니다. 목록 확인이 필요하면 아래 파일을 받아 보내주세요.
        </p>
        <button disabled={busy} onClick={() => void run(downloadCatalog)}>
          식재료·분류 목록 받기
        </button>
      </section>
      <section>
        <h2>2 · 정리된 파일 가져오기</h2>
        <label>
          채팅에서 받은 JSON 파일
          <input
            type="file"
            accept=".json,application/json"
            disabled={busy}
            onChange={(event) => {
              const file = event.target.files?.[0]
              if (!file) return
              void run(async () => {
                if (file.size > 100000)
                  throw new Error('파일이 너무 큽니다. 레시피 하나씩 가져오세요.')
                changeSource(await file.text())
              })
              event.target.value = ''
            }}
          />
        </label>
        <details>
          <summary>파일 대신 JSON 내용 붙여넣기</summary>
          <label htmlFor="recipe-json">채팅에서 정리한 JSON</label>
          <textarea
            id="recipe-json"
            value={source}
            maxLength={100000}
            rows={10}
            disabled={busy}
            onChange={(event) => changeSource(event.target.value)}
          />
        </details>
        <button disabled={busy || !source} onClick={() => void run(checkImport)}>
          가져올 내용 확인
        </button>
        {plan && recipe && catalog && (
          <>
            <Preview
              recipe={recipe}
              catalog={catalog}
              ingredients={plan.documents.filter((doc) => doc._type === 'recipeIngredient')}
              steps={plan.documents.filter((doc) => doc._type === 'step')}
            />
            <button disabled={busy} onClick={() => void run(saveImport)}>
              모두 초안으로 저장
            </button>
          </>
        )}
      </section>
      <section>
        <h2>3 · 사진 넣고 검토한 뒤 함께 발행</h2>
        <p>
          가져온 레시피를 열어 대표 사진을 넣고 두 언어를 검토하세요. 단계 사진은 선택 사항이에요.
          이 메뉴로 돌아와 발행할 내용을 확인하세요.
        </p>
        <label htmlFor="imported-recipe">가져온 레시피 초안</label>
        <select
          id="imported-recipe"
          disabled={busy}
          value={selected}
          onChange={(event) => {
            setSelected(event.target.value)
            setPublication(null)
            setConfirmed(false)
          }}
        >
          <option value="">레시피 선택</option>
          {recent.map((doc) => (
            <option key={doc._id} value={doc._id.slice(7)}>
              {String(fields(doc.titel).en || fields(doc.titel).de || doc._id)}
            </option>
          ))}
        </select>
        <div className="hansik-import-buttons">
          <button disabled={busy} onClick={() => void run(refresh)}>
            초안 목록 새로고침
          </button>
          {selected && (
            <IntentLink
              intent="edit"
              params={{id: selected, type: 'recipe'}}
              target="_blank"
              rel="noopener"
            >
              레시피 열기 · 사진·내용 확인
            </IntentLink>
          )}
          <button disabled={busy || !selected} onClick={() => void run(checkPublication)}>
            발행할 내용 확인
          </button>
        </div>
        {publication && catalog && (
          <>
            <Preview {...publication} catalog={catalog} />
            <label className="hansik-import-confirm">
              <input
                type="checkbox"
                checked={confirmed}
                disabled={busy}
                onChange={(event) => setConfirmed(event.target.checked)}
              />
              대표 사진과 영어·독일어 내용을 검토했고 두 사이트에 공개하겠습니다.
            </label>
            <button disabled={busy || !confirmed} onClick={() => void run(publish)}>
              레시피와 재료·단계 함께 발행
            </button>
            <p>검토 후 내용을 바꿨다면 발행할 내용을 다시 확인하세요.</p>
          </>
        )}
      </section>
      {busy && <p role="status">처리 중이에요…</p>}
      {error && (
        <p className="hansik-import-error" role="alert">
          {error}
        </p>
      )}
      {notice && (
        <p className="hansik-import-notice" role="status">
          {notice}
        </p>
      )}
    </div>
  )
}
