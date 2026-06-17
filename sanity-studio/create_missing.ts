import { createClient } from '@sanity/client'

const client = createClient({
  projectId: 'py9o7u56',
  dataset: 'production',
  useCdn: false,
  apiVersion: '2022-03-07',
  token: process.env.SANITY_API_TOKEN
})

const OLD_BRANDS = [
  "CASE IH", "CLAAS", "FENDT", "FIAT", "HÜRLIMANN", "JOHN DEERE",
  "LAMBORGHINI", "MASSEY FERGUSON", "MCCORMICK", "NEW HOLLAND",
  "RENAULT", "SAME", "VALTRA", "ZETOR"
];

const OLD_CATEGORIES = [
  "Uszczelki i O-ringi", "Łożyska", "Filtry", "Półosie i Piasty",
  "Elementy Hamulcowe", "Przekładnie i Biegi", "Podkładki", "Pompy",
  "Układ Kierowniczy", "Zawieszenie", "Napęd", "Śruby i Nakrętki", "Inne"
];

const run = async () => {
  // Fetch existing
  const existingBrands = await client.fetch(`*[_type == "brand"].name`)
  const existingCategories = await client.fetch(`*[_type == "category"].name`)

  const existingBrandsLower = existingBrands.map((b: string) => b.toLowerCase())
  const existingCatsLower = existingCategories.map((c: string) => c.toLowerCase())

  // Add missing brands
  for (const b of OLD_BRANDS) {
    if (!existingBrandsLower.includes(b.toLowerCase())) {
      await client.create({ _type: 'brand', name: b })
      console.log(`Created brand: ${b}`)
    }
  }

  // Add missing categories
  for (const c of OLD_CATEGORIES) {
    if (!existingCatsLower.includes(c.toLowerCase())) {
      await client.create({ _type: 'category', name: c })
      console.log(`Created category: ${c}`)
    }
  }

  console.log('Finished creating missing items.')
}

run().catch(console.error)
