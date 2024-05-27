exports.up = (pgm) => {
  pgm.createTable('upgrade_role', {
    id: {
      type: 'serial',
      primaryKey: true,
    },
    user_id: {
      type: 'integer',
      notNull: true,
      references: '"users"',
      onDelete: 'cascade',
    },
    status: {
      type: 'varchar(10)',
      notNull: true,
      check: "status IN ('reject', 'accept', 'waiting')",
      default: 'waiting',
    },
    document_url: {
      type: 'varchar(255)',
      notNull: true,
    },
    created_at: {
      type: 'timestamp',
      notNull: true,
      default: pgm.func('current_timestamp'),
    },
    updated_at: {
      type: 'timestamp',
      notNull: true,
      default: pgm.func('current_timestamp'),
    },
  });

  pgm.createIndex('upgrade_role', 'user_id');
};

exports.down = (pgm) => {
  pgm.dropTable('upgrade_role');
};
