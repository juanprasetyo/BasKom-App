const pool = require('../config/db');

const createProduct = async (productData) => {
  const {
    name, description, price, qty, userId,
  } = productData;
  const result = await pool.query(
    `INSERT INTO products (name, description, price, qty, user_id, deleted, created_at, updated_at)
     VALUES ($1, $2, $3, $4, $5, false, NOW(), NOW()) RETURNING id, name, description, price, qty, created_at, updated_at`,
    [name, description, price, qty, userId],
  );
  return result.rows[0];
};

const findProductById = async (id) => {
  const result = await pool.query(
    `SELECT p.id, p.name, p.description, p.price, p.qty,
            jsonb_build_object(
              'id', u.id,
              'name', u.name,
              'address', u.address,
              'phone_number', u.phone_number,
              'avatar', u.avatar,
              'created_at', u.created_at,
              'updated_at', u.updated_at
            ) AS user,
            COALESCE(
              jsonb_agg(DISTINCT jsonb_build_object(
                'id', c.id,
                'name', c.name,
                'created_at', c.created_at,
                'updated_at', c.updated_at
              )) FILTER (WHERE c.id IS NOT NULL), '[]'::jsonb
            ) AS categories,
            COALESCE(
              jsonb_agg(DISTINCT jsonb_build_object(
                'id', i.id,
                'file_id', i.file_id,
                'url', i.url,
                'created_at', i.created_at,
                'updated_at', i.updated_at
              )) FILTER (WHERE i.id IS NOT NULL), '[]'::jsonb
            ) AS images,
            p.created_at, p.updated_at
     FROM products p
     JOIN users u ON p.user_id = u.id
     LEFT JOIN product_categories pc ON p.id = pc.product_id
     LEFT JOIN categories c ON pc.category_id = c.id
     LEFT JOIN product_images pi ON p.id = pi.product_id
     LEFT JOIN images i ON pi.image_id = i.id
     WHERE p.id = $1 AND p.deleted = false
     GROUP BY p.id, u.id`,
    [id],
  );

  if (result.rows.length === 0) {
    return null;
  }

  return result.rows[0];
};

const updateProduct = async (id, productData) => {
  const {
    name, description, price, qty,
  } = productData;
  const result = await pool.query(
    `UPDATE products
     SET name = $1, description = $2, price = $3, qty = $4, updated_at = NOW()
     WHERE id = $5 AND deleted = false RETURNING id, name, description, price, qty, created_at, updated_at`,
    [name, description, price, qty, id],
  );
  return result.rows[0];
};

const softDeleteProduct = async (id) => {
  await pool.query(
    'UPDATE products SET deleted = true, updated_at = NOW() WHERE id = $1',
    [id],
  );
};

const getAllProducts = async () => {
  const result = await pool.query(
    `SELECT p.id, p.name, p.description, p.price, p.qty,
            jsonb_build_object(
              'id', u.id,
              'name', u.name,
              'address', u.address,
              'phone_number', u.phone_number,
              'avatar', u.avatar,
              'created_at', u.created_at,
              'updated_at', u.updated_at
            ) AS user,
            COALESCE(
              jsonb_agg(DISTINCT jsonb_build_object(
                'id', c.id,
                'name', c.name,
                'created_at', c.created_at,
                'updated_at', c.updated_at
              )) FILTER (WHERE c.id IS NOT NULL), '[]'::jsonb
            ) AS categories,
            COALESCE(
              jsonb_agg(DISTINCT jsonb_build_object(
                'id', i.id,
                'file_id', i.file_id,
                'url', i.url,
                'created_at', i.created_at,
                'updated_at', i.updated_at
              )) FILTER (WHERE i.id IS NOT NULL), '[]'::jsonb
            ) AS images,
            p.created_at, p.updated_at
     FROM products p
     JOIN users u ON p.user_id = u.id
     LEFT JOIN product_categories pc ON p.id = pc.product_id
     LEFT JOIN categories c ON pc.category_id = c.id
     LEFT JOIN product_images pi ON p.id = pi.product_id
     LEFT JOIN images i ON pi.image_id = i.id
     WHERE p.deleted = false AND p.qty > 0
     GROUP BY p.id, u.id`,
  );

  return result.rows;
};

const searchProducts = async (searchParams) => {
  const {
    name, category, minPrice, maxPrice,
  } = searchParams;
  let query = `SELECT p.id, p.name, p.description, p.price, p.qty,
                      jsonb_build_object(
                        'id', u.id,
                        'name', u.name,
                        'address', u.address,
                        'phone_number', u.phone_number,
                        'avatar', u.avatar,
                        'created_at', u.created_at,
                        'updated_at', u.updated_at
                      ) AS user,
                      COALESCE(
                        jsonb_agg(DISTINCT jsonb_build_object(
                          'id', c.id,
                          'name', c.name,
                          'created_at', c.created_at,
                          'updated_at', c.updated_at
                        )) FILTER (WHERE c.id IS NOT NULL), '[]'::jsonb
                      ) AS categories,
                      COALESCE(
                        jsonb_agg(DISTINCT jsonb_build_object(
                          'id', i.id,
                          'file_id', i.file_id,
                          'url', i.url,
                          'created_at', i.created_at,
                          'updated_at', i.updated_at
                        )) FILTER (WHERE i.id IS NOT NULL), '[]'::jsonb
                      ) AS images,
                      p.created_at, p.updated_at
               FROM products p
               JOIN users u ON p.user_id = u.id
               LEFT JOIN product_categories pc ON p.id = pc.product_id
               LEFT JOIN categories c ON pc.category_id = c.id
               LEFT JOIN product_images pi ON p.id = pi.product_id
               LEFT JOIN images i ON pi.image_id = i.id
               WHERE p.deleted = false AND p.qty > 0`;
  const queryParams = [];

  if (name) {
    queryParams.push(`%${name}%`);
    query += ` AND p.name ILIKE $${queryParams.length}`;
  }

  if (category) {
    queryParams.push(category);
    query += ` AND c.name ILIKE $${queryParams.length}`;
  }

  if (minPrice) {
    queryParams.push(minPrice);
    query += ` AND p.price >= $${queryParams.length}`;
  }

  if (maxPrice) {
    queryParams.push(maxPrice);
    query += ` AND p.price <= $${queryParams.length}`;
  }

  query += ' GROUP BY p.id, u.id';

  const result = await pool.query(query, queryParams);

  return result.rows;
};

const findProductsByUserId = async (userId) => {
  const result = await pool.query(
    `SELECT p.id, p.name, p.description, p.price, p.qty,
            jsonb_build_object(
              'id', u.id,
              'name', u.name,
              'address', u.address,
              'phone_number', u.phone_number,
              'avatar', u.avatar,
              'created_at', u.created_at,
              'updated_at', u.updated_at
            ) AS user,
            COALESCE(
              jsonb_agg(DISTINCT jsonb_build_object(
                'id', c.id,
                'name', c.name,
                'created_at', c.created_at,
                'updated_at', c.updated_at
              )) FILTER (WHERE c.id IS NOT NULL), '[]'::jsonb
            ) AS categories,
            COALESCE(
              jsonb_agg(DISTINCT jsonb_build_object(
                'id', i.id,
                'file_id', i.file_id,
                'url', i.url,
                'created_at', i.created_at,
                'updated_at', i.updated_at
              )) FILTER (WHERE i.id IS NOT NULL), '[]'::jsonb
            ) AS images,
            p.created_at, p.updated_at
     FROM products p
     JOIN users u ON p.user_id = u.id
     LEFT JOIN product_categories pc ON p.id = pc.product_id
     LEFT JOIN categories c ON pc.category_id = c.id
     LEFT JOIN product_images pi ON p.id = pi.product_id
     LEFT JOIN images i ON pi.image_id = i.id
     WHERE p.user_id = $1 AND p.deleted = false
     GROUP BY p.id, u.id`,
    [userId],
  );

  return result.rows;
};

module.exports = {
  createProduct,
  findProductById,
  updateProduct,
  softDeleteProduct,
  getAllProducts,
  searchProducts,
  findProductsByUserId,
};
