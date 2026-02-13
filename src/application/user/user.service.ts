import { Injectable, Logger } from '@nestjs/common'

import { IDatabaseConnection } from '../../persistence/database-connection.interface'

import { CannotDeleteSelfError } from './cannot-delete-self.error'
import { type User, type UserID } from './user'
import { UserAlreadyExistsError } from './user-already-exists.error'
import { IUserRepository } from './user.repository.interface'
import { IUserService } from './user.service.interface'

@Injectable()
export class UserService implements IUserService {
  private readonly repository: IUserRepository
  private readonly databaseConnection: IDatabaseConnection
  private readonly logger: Logger

  public constructor(
    repository: IUserRepository,
    databaseConnection: IDatabaseConnection,
  ) {
    this.repository = repository
    this.databaseConnection = databaseConnection
    this.logger = new Logger(UserService.name)
  }

  public async get(id: UserID): Promise<User> {
    return this.databaseConnection.transactional(tx =>
      this.repository.get(tx, id),
    )
  }

  public async getAll(): Promise<User[]> {
    return this.databaseConnection.transactional(tx =>
      this.repository.getAll(tx),
    )
  }

  public async find(id: UserID): Promise<User | null> {
    return this.databaseConnection.transactional(tx =>
      this.repository.find(tx, id),
    )
  }

  public async findByName(name: string): Promise<User | null> {
    return this.databaseConnection.transactional(tx =>
      this.repository.findByName(tx, name),
    )
  }

  public async create(data: {
    name: string
    passwordHash: string
    role: string
  }): Promise<User> {
    return this.databaseConnection.transactional(async tx => {
      const existingUser = await this.repository.findByName(tx, data.name)
      if (existingUser) {
        throw new UserAlreadyExistsError(data.name)
      }
      return this.repository.insert(tx, data)
    })
  }

  public async delete(id: UserID, currentUserId: UserID): Promise<void> {
    if (id === currentUserId) {
      throw new CannotDeleteSelfError()
    }

    return this.databaseConnection.transactional(async tx => {
      await this.repository.get(tx, id)
      await this.repository.softDelete(tx, id)
    })
  }
}
