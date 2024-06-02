exports.up = (pgm) => {
  pgm.createTable('images', {
    id: 'id',
    file_id: { type: 'varchar(255)', notNull: true },
    url: { type: 'text', notNull: true },
    created_at: { type: 'timestamp', notNull: true, default: pgm.func('current_timestamp') },
    updated_at: { type: 'timestamp', notNull: true, default: pgm.func('current_timestamp') },
  });
};

exports.down = (pgm) => {
  pgm.dropTable('images');
};
