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
      name: 'brand',
      type: 'string',
      title: 'Marka',
    },
    {
      name: 'category',
      type: 'string',
      title: 'Kategoria',
    },
    {
      name: 'price',
      type: 'number',
      title: 'Cena',
    },
    {
      name: 'image',
      type: 'image',
      title: 'Zdjęcie',
      options: {
        hotspot: true,
      },
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
