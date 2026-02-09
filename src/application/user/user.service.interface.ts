import { type User, type UserID } from './user'

export abstract class IUserService {
  public abstract get(id: UserID): Promise<User>

  public abstract getAll(): Promise<User[]>

  public abstract find(id: UserID): Promise<User | null>

  public abstract findByName(name: string): Promise<User | null>

  public abstract create(data: {
    name: string
    passwordHash: string
    role: string
  }): Promise<User>

  public abstract delete(id: UserID, currentUserId: UserID): Promise<void>
}
