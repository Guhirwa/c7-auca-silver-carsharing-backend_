/* eslint-disable @typescript-eslint/naming-convention */
import { MigrationBuilder, ColumnDefinitions } from 'node-pg-migrate'

export const shorthands: ColumnDefinitions | undefined = undefined

export function up(pgm: MigrationBuilder): void {
  pgm.createTable('bookings', {
    id: {
      type: 'serial',
      primaryKey: true,
    },
    car_id: {
      type: 'integer',
      references: 'cars',
      onDelete: 'CASCADE',
    },
    renter_id: {
      type: 'integer',
      references: 'users',
      onDelete: 'CASCADE',
    },
    state: {
      type: 'text',
    },
    start_date: {
      type: 'timestamptz',
    },
    end_date: {
      type: 'timestamptz',
    },
  })
}

export function down(pgm: MigrationBuilder): void {
  pgm.dropTable('bookings')
}
