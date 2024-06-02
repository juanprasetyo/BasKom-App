exports.up = (pgm) => {
  pgm.createTable('product_images', {
    product_id: {
      type: 'integer',
      notNull: true,
      references: 'products(id)',
      onDelete: 'CASCADE',
    },
    image_id: {
      type: 'integer',
      notNull: true,
      references: 'images(id)',
      onDelete: 'CASCADE',
    },
    created_at: { type: 'timestamp', notNull: true, default: pgm.func('current_timestamp') },
    updated_at: { type: 'timestamp', notNull: true, default: pgm.func('current_timestamp') },
  });

  pgm.addConstraint(
    'product_images',
    'product_images_pkey',
    {
      primaryKey: ['product_id', 'image_id'],
    },
  );
};

exports.down = (pgm) => {
  pgm.dropTable('product_images');
};
