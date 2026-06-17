export default {
  name: 'product',
  type: 'document',
  title: 'Produkt',
  fields: [
    {
      name: 'sku',
      type: 'string',
      title: 'SKU (Kod produktu)',
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: 'name',
      type: 'string',
      title: 'Nazwa',
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: 'brandRef',
      type: 'reference',
      to: [{type: 'brand'}],
      title: 'Marka (Wybierz z listy)',
    },
    {
      name: 'categoryRef',
      type: 'reference',
      to: [{type: 'category'}],
      title: 'Kategoria (Wybierz z listy)',
    },
    {
      name: 'brand',
      type: 'string',
      title: 'Marka (Stary tekst)',
      hidden: true,
    },
    {
      name: 'category',
      type: 'string',
      title: 'Kategoria (Stary tekst)',
      hidden: true,
    },
    {
      name: 'price',
      type: 'number',
      title: 'Cena',
    },
    {
      name: 'description',
      type: 'text',
      title: 'Opis produktu',
    },
    {
      name: 'image',
      type: 'image',
      title: 'Zdjęcie Główne (Miniaturka sklepu)',
      options: {
        hotspot: true,
      },
    },
    {
      name: 'gallery',
      type: 'array',
      title: 'Galeria Dodatkowych Zdjęć',
      of: [{ type: 'image', options: { hotspot: true } }],
    },
  ],
  preview: {
    select: {
      title: 'name',
      subtitle: 'sku',
      media: 'image',
    },
  },
}
