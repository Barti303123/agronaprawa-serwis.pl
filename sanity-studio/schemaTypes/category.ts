import {defineField, defineType} from 'sanity'

export default defineType({
  name: 'category',
  title: 'Kategoria Produktów',
  type: 'document',
  fields: [
    defineField({
      name: 'name',
      title: 'Nazwa Kategorii',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
  ],
})
