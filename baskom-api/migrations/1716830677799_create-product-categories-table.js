exports.shorthands = undefined;

exports.up = (pgm) => {
  pgm.createTable('product_categories', {
    product_id: {
      type: 'integer',
      notNull: true,
      references: '"products"',
      onDelete: 'CASCADE',
    },
    category_id: {
      type: 'integer',
      notNull: true,
      references: '"categories"',
      onDelete: 'CASCADE',
    },
    created_at: { type: 'timestamp', notNull: true, default: pgm.func('current_timestamp') },
    updated_at: { type: 'timestamp', notNull: true, default: pgm.func('current_timestamp') },
  });

  pgm.addConstraint('product_categories', 'primary_key', { primaryKey: ['product_id', 'category_id'] });
};

exports.down = (pgm) => {
  pgm.dropTable('product_categories');
};
