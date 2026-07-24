export function getProductImage(product) {
  if (!product) return '/placeholder-image.png';
  if (product.images && product.images.length > 0) {
    return product.images[0].url;
  }
  if (product.image) return product.image;
  return '/placeholder-image.png'; // Fallback for absolutely no image
}

export function getProductCategory(product) {
  if (!product) return 'Uncategorized';
  return product.category_name || product.category || 'Uncategorized';
}
