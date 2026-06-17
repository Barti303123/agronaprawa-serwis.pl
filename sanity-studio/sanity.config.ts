import {defineConfig} from 'sanity'
import {structureTool} from 'sanity/structure'
import {visionTool} from '@sanity/vision'
import {plPLLocale} from '@sanity/locale-pl-pl'
import {schemaTypes} from './schemaTypes'

export default defineConfig({
  name: 'default',
  title: 'Agronaprawa Serwis',

  projectId: 'py9o7u56',
  dataset: 'production',

  basePath: '/studio',

  plugins: [structureTool(), visionTool(), plPLLocale()],

  schema: {
    types: schemaTypes,
  },
})
