export class UserAlreadyExistsError extends Error {
  public constructor(username: string) {
    super(`User with name '${username}' already exists`)
  }
}
