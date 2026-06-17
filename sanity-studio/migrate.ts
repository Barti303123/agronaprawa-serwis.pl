import {getCliClient} from 'sanity/cli'

const client = getCliClient()

const migrate = async () => {
  const products = await client.fetch(`*[_type == "product"]`)
  console.log(`Found ${products.length} products to migrate.`)

  const categoryMap = new Map()
  const brandMap = new Map()

  for (const product of products) {
    let brandId = null
    let categoryId = null

    // Handle Brand
    if (product.brand && typeof product.brand === 'string') {
      const brandName = product.brand.trim()
      if (brandName) {
        if (brandMap.has(brandName)) {
          brandId = brandMap.get(brandName)
        } else {
          // Check if it already exists in DB
          const existing = await client.fetch(`*[_type == "brand" && name == $name][0]`, {name: brandName})
          if (existing) {
            brandId = existing._id
          } else {
            const doc = {
              _type: 'brand',
              name: brandName
            }
            const created = await client.create(doc)
            brandId = created._id
            console.log(`Created brand: ${brandName}`)
          }
          brandMap.set(brandName, brandId)
        }
      }
    }

    // Handle Category
    if (product.category && typeof product.category === 'string') {
      const categoryName = product.category.trim()
      if (categoryName) {
        if (categoryMap.has(categoryName)) {
          categoryId = categoryMap.get(categoryName)
        } else {
          // Check if it already exists in DB
          const existing = await client.fetch(`*[_type == "category" && name == $name][0]`, {name: categoryName})
          if (existing) {
            categoryId = existing._id
          } else {
            const doc = {
              _type: 'category',
              name: categoryName
            }
            const created = await client.create(doc)
            categoryId = created._id
            console.log(`Created category: ${categoryName}`)
          }
          categoryMap.set(categoryName, categoryId)
        }
      }
    }

    // Patch Product
    if ((brandId && typeof product.brand === 'string') || (categoryId && typeof product.category === 'string')) {
      const patch = client.patch(product._id)
      if (brandId && typeof product.brand === 'string') {
        patch.set({brand: {_type: 'reference', _ref: brandId}})
      }
      if (categoryId && typeof product.category === 'string') {
        patch.set({category: {_type: 'reference', _ref: categoryId}})
      }
      await patch.commit()
      console.log(`Patched product ${product._id} (${product.sku})`)
    }
  }

  console.log('Migration completed!')
}

migrate().catch((err) => {
  console.error(err)
  process.exit(1)
})
