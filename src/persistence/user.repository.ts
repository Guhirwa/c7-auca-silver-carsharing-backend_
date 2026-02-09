import { Injectable } from '@nestjs/common'

import {
  type IUserRepository,
  User,
  type UserID,
  UserNotFoundError,
} from '../application'
import { Role } from '../controller/car-type/role.enum'

import { type Transaction } from './database-connection.interface'

/**********************************************************************************************************************\
 *                                                                                                                     *
 *   This file is already fully implemented. You don't need to modify it to successfully finish your project.          *
 *                                                                                                                     *
 \*********************************************************************************************************************/

type Row = {
  id: number
  name: string
  password: string
  role: string
}

function rowToDomain(row: Row): User {
  return new User({
    id: row.id as UserID,
    name: row.name,
    passwordHash: row.password,
    role: row.role as Role,
  })
}

@Injectable()
export class UserRepository implements IUserRepository {
  public async find(tx: Transaction, id: UserID): Promise<User | null> {
    const row = await tx.oneOrNone<Row>(
      'SELECT * FROM users WHERE id = $(id)',
      {
        id,
      },
    )

    return row ? rowToDomain(row) : null
  }

  public async findByName(tx: Transaction, name: string): Promise<User | null> {
    const row = await tx.oneOrNone<Row>(
      'SELECT * FROM users WHERE name = $(name)',
      {
        name,
      },
    )

    return row ? rowToDomain(row) : null
  }

  public async get(tx: Transaction, id: UserID): Promise<User> {
    const user = await this.find(tx, id)

    if (!user) {
      throw new UserNotFoundError(id)
    }

    return user
  }

  public async getAll(tx: Transaction): Promise<User[]> {
    const rows = await tx.any<Row>('SELECT * FROM users')

    return rows.map(row => rowToDomain(row))
  }

  public async insert(
    tx: Transaction,
    data: { name: string; passwordHash: string; role: string },
  ): Promise<User> {
    const row = await tx.one<Row>(
      'INSERT INTO users (name, password, role) VALUES ($(name), $(passwordHash), $(role)) RETURNING *',
      data,
    )

    return rowToDomain(row)
  }

  public async softDelete(tx: Transaction, id: UserID): Promise<void> {
    await tx.none('DELETE FROM users WHERE id = $(id)', { id })
  }
}
