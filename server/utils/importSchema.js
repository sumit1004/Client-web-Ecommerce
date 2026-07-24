export const IMPORT_SCHEMA = [
  { column: 'Name', required: true, desc: 'Name of product', example: 'Premium Cotton Shirt', type: 'string' },
  { column: 'SKU', required: true, desc: 'Unique Stock Code', example: 'SHIRT001', type: 'string' },
  { column: 'Category', required: true, desc: 'Existing Category Name', example: 'Men', type: 'string' },
  { column: 'Brand', required: false, desc: 'Brand Name', example: 'Nike', type: 'string' },
  { column: 'Price', required: true, desc: 'Selling Price', example: 2000, type: 'number' },
  { column: 'Sale_Price', required: false, desc: 'Discounted Price', example: 1800, type: 'number' },
  { column: 'Description', required: false, desc: 'Detailed description', example: 'Premium cotton shirt for daily wear', type: 'string' },
  { column: 'Gender', required: false, desc: 'Target Gender (Men/Women/Kids)', example: 'Men', type: 'string' },
  { column: 'Stock', required: true, desc: 'Available Quantity', example: 25, type: 'number' },
  { column: 'Status', required: true, desc: 'Active / Draft', example: 'Active', type: 'enum', enum: ['Active', 'Draft'] },
  { column: 'Featured', required: false, desc: 'Yes / No', example: 'Yes', type: 'enum', enum: ['Yes', 'No'] },
  { column: 'Homepage', required: false, desc: 'Yes / No (Show on homepage)', example: 'No', type: 'enum', enum: ['Yes', 'No'] },
];
