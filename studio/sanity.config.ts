import {defineConfig} from 'sanity'
import {structureTool} from 'sanity/structure'
import {visionTool} from '@sanity/vision'
import {schemaTypes} from './schemaTypes'
import {RecipeImportTool} from './RecipeImportTool'

export default defineConfig({
  name: 'default',
  title: 'Hansik Young',

  projectId: 'o9hshko6',
  dataset: 'production',

  plugins: [structureTool(), visionTool()],
  tools: [{name: 'chat-recipe', title: '채팅 레시피', component: RecipeImportTool}],

  schema: {
    types: schemaTypes,
  },
})
