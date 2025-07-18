/**
 * Returns an array of all unique values from the given collection under the specified key.
 * Credit: https://www.webstoemp.com/blog/basic-custom-taxonomies-with-eleventy/.
 * @param {*} collectionItems - an array of collection items to map to their unique values under a key
 * @param {*} key - the key to look up in the item's data object
 * @return {string[]}
 */
module.exports.getAllUniqueKeyValues = function getAllUniqueKeyValues(collectionItems, key) {
  // First map each collection item (e.g., blog post) to the value it holds under key.
  let values = collectionItems.map(item => item.data[key] ?? [])
  // Recursively flatten it to a 1D array
  values = values.flat()
  // Remove duplicates
  values = [...new Set(values)]
  // Sort alphabetically
  values = values.sort((key1, key2) => key1.localeCompare(key2, 'en', { sensitivity: 'base' }))
  return values
}
