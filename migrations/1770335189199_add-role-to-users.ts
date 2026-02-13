import { MigrationBuilder } from 'node-pg-migrate'

export function up(pgm: MigrationBuilder): void {
  pgm.addColumn('users', {
    role: {
      type: 'text',
      notNull: true,
      default: 'user',
    },
  })
}

export function down(pgm: MigrationBuilder): void {
  pgm.dropColumn('users', 'role')
}
