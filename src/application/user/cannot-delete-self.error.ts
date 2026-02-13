export class CannotDeleteSelfError extends Error {
  public constructor() {
    super('You cannot delete yourself')
  }
}
