exports.up = (pgm) => {
  pgm.createTable('users', {
    id: 'id',
    name: { type: 'varchar(255)', notNull: true },
    email: { type: 'varchar(255)', notNull: true, unique: true },
    address: { type: 'text' },
    phone_number: { type: 'varchar(20)' },
    email_verified_at: { type: 'timestamp' },
    password: { type: 'varchar(255)', notNull: true },
    avatar: { type: 'text' },
    created_at: { type: 'timestamp', default: pgm.func('current_timestamp') },
    updated_at: { type: 'timestamp', default: pgm.func('current_timestamp') },
  });
};

exports.down = (pgm) => {
  pgm.dropTable('users');
};
