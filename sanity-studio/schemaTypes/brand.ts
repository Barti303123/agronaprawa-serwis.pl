import {defineField, defineType} from 'sanity'

export default defineType({
  name: 'brand',
  title: 'Marka',
  type: 'document',
  fields: [
    defineField({
      name: 'name',
      title: 'Nazwa Marki',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
  ],
})
