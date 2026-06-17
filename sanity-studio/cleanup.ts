import { createClient } from '@sanity/client'

const client = createClient({
  projectId: 'py9o7u56',
  dataset: 'production',
  useCdn: false,
  apiVersion: '2022-03-07',
  token: process.env.SANITY_API_TOKEN
})

const ALLOWED_BRANDS = [
  "CASE IH", "CLAAS", "FENDT", "FIAT", "HÜRLIMANN", "JOHN DEERE",
  "LAMBORGHINI", "MASSEY FERGUSON", "MCCORMICK", "NEW HOLLAND",
  "RENAULT", "SAME", "VALTRA", "ZETOR"
].map(b => b.toLowerCase())

const ALLOWED_CATEGORIES = [
  "Uszczelki i O-ringi", "Łożyska", "Filtry", "Półosie i Piasty",
  "Elementy Hamulcowe", "Przekładnie i Biegi", "Podkładki", "Pompy",
  "Układ Kierowniczy", "Zawieszenie", "Napęd", "Śruby i Nakrętki", "Inne"
].map(c => c.toLowerCase())

const run = async () => {
  // 1. Fetch all brands
  const brands = await client.fetch(`*[_type == "brand"]{_id, name}`)
  for (const b of brands) {
    if (!b.name || !ALLOWED_BRANDS.includes(b.name.toLowerCase())) {
      console.log(`Deleting extra brand: ${b.name}`)
      // Unset references to this brand
      const referencingProducts = await client.fetch(`*[_type == "product" && brandRef._ref == $id]{_id}`, {id: b._id})
      for (const p of referencingProducts) {
        await client.patch(p._id).unset(['brandRef']).commit()
      }
      await client.delete(b._id)
    }
  }

  // 2. Fetch all categories
  const categories = await client.fetch(`*[_type == "category"]{_id, name}`)
  for (const c of categories) {
    if (!c.name || !ALLOWED_CATEGORIES.includes(c.name.toLowerCase())) {
      console.log(`Deleting extra category: ${c.name}`)
      // Unset references to this category
      const referencingProducts = await client.fetch(`*[_type == "product" && categoryRef._ref == $id]{_id}`, {id: c._id})
      for (const p of referencingProducts) {
        await client.patch(p._id).unset(['categoryRef']).commit()
      }
      await client.delete(c._id)
    }
  }

  console.log('Cleanup completed.')
}

run().catch(console.error)
