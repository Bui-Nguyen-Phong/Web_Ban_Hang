#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Mapping các thay đổi
const replacements = [
  // Column names
  { from: /\bp\.id\b/g, to: 'p.product_id' },
  { from: /\bu\.id\b/g, to: 'u.user_id' },
  { from: /\bseller_id = u\.id\b/g, to: 'seller_id = u.user_id' },
  { from: /\bp\.seller_id = u\.id\b/g, to: 'p.seller_id = u.user_id' },
  { from: /\bp\.stock\b/g, to: 'p.stock_quantity' },
  { from: /\bstock\b(?!\s*=)/g, to: 'stock_quantity' },
  { from: /\bWHERE id =/g, to: 'WHERE product_id =' },
  { from: /\bFROM products p\b/g, to: 'FROM products p' },
  { from: /\bcart\.id\b/g, to: 'cart_items.cart_item_id' },
  { from: /\bFROM cart\b/g, to: 'FROM cart_items' },
  { from: /\bINTO cart\b/g, to: 'INTO cart_items' },
  { from: /\bUPDATE cart\b/g, to: 'UPDATE cart_items' },
  { from: /\bDELETE FROM cart\b/g, to: 'DELETE FROM cart_items' },
  { from: /\bo\.id\b/g, to: 'o.order_id' },
  { from: /\border_id = o\.id\b/g, to: 'order_id = o.order_id' },
  { from: /\boi\.id\b/g, to: 'oi.order_item_id' },
  { from: /\bcreated_at\b(?=\s+DESC|$)/g, to: 'order_date' },
];

// Files cần update
const files = [
  'productController.js',
  'cartController.js',
  'orderController.js',
];

const controllersDir = path.join(__dirname, '../controllers');

files.forEach(file => {
  const filePath = path.join(controllersDir, file);
  
  if (!fs.existsSync(filePath)) {
    console.log(`⚠️  File không tồn tại: ${file}`);
    return;
  }

  let content = fs.readFileSync(filePath, 'utf8');
  let changed = false;

  replacements.forEach(({ from, to }) => {
    if (content.match(from)) {
      content = content.replace(from, to);
      changed = true;
    }
  });

  if (changed) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ Đã cập nhật: ${file}`);
  } else {
    console.log(`ℹ️  Không cần thay đổi: ${file}`);
  }
});

console.log('\n✨ Hoàn tất cập nhật controllers!');
