exports.up = (pgm) => {
  pgm.createTable('user_roles', {
    user_id: { type: 'integer', notNull: true, references: 'users' },
    role_id: { type: 'integer', notNull: true, references: 'roles' },
    created_at: { type: 'timestamp', default: pgm.func('current_timestamp') },
    updated_at: { type: 'timestamp', default: pgm.func('current_timestamp') },
  });

  pgm.createConstraint('user_roles', 'unique_user_role', {
    unique: ['user_id', 'role_id'],
  });
};

exports.down = (pgm) => {
  pgm.dropConstraint('user_roles', 'unique_user_role');

  pgm.dropTable('user_roles');
};
