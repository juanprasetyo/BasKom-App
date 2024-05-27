exports.up = (pgm) => {
  pgm.dropConstraint('user_roles', 'user_roles_user_id_fkey');
  pgm.addConstraint('user_roles', 'user_roles_user_id_fkey', {
    foreignKeys: {
      columns: 'user_id',
      references: 'users(id)',
      onDelete: 'CASCADE',
    },
  });

  pgm.dropConstraint('user_roles', 'user_roles_role_id_fkey');
  pgm.addConstraint('user_roles', 'user_roles_role_id_fkey', {
    foreignKeys: {
      columns: 'role_id',
      references: 'roles(id)',
      onDelete: 'CASCADE',
    },
  });
};

exports.down = (pgm) => {
  pgm.dropConstraint('user_roles', 'user_roles_user_id_fkey');
  pgm.addConstraint('user_roles', 'user_roles_user_id_fkey', {
    foreignKeys: {
      columns: 'user_id',
      references: 'users(id)',
    },
  });

  pgm.dropConstraint('user_roles', 'user_roles_role_id_fkey');
  pgm.addConstraint('user_roles', 'user_roles_role_id_fkey', {
    foreignKeys: {
      columns: 'role_id',
      references: 'roles(id)',
    },
  });
};
