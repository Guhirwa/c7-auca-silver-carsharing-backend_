import { ConflictException } from '@nestjs/common'

import {
  type IUserService,
  UserAlreadyExistsError,
  CannotDeleteSelfError,
  type UserID,
} from '../../application'
import { UserBuilder } from '../../application/user/user.builder'
import { Role } from '../car-type/role.enum'

import { UserController } from './user.controller'
import { CreateUserDTO } from './create-user.dto'

describe('UserController', () => {
  let userController: UserController
  let userServiceMock: jest.Mocked<IUserService>

  beforeEach(() => {
    userServiceMock = {
      get: jest.fn(),
      getAll: jest.fn(),
      find: jest.fn(),
      findByName: jest.fn(),
      create: jest.fn(),
      delete: jest.fn(),
    }
    userController = new UserController(userServiceMock)
  })

  describe('create', () => {
    it('should create a new user', async () => {
      const createDto = CreateUserDTO.create({
        name: 'Alice',
        password: 'password123',
        role: Role.User,
      })

      const createdUser = new UserBuilder()
        .withId(5 as UserID)
        .withName('Alice')
        .withRole(Role.User)
        .build()

      userServiceMock.create.mockResolvedValue(createdUser)

      const result = await userController.create(createDto)

      expect(result.name).toBe('Alice')
      expect(result.id).toBe(5)
      expect(userServiceMock.create).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'Alice',
          role: Role.User,
        }),
      )
    })

    it('should throw ConflictException when user already exists', async () => {
      const createDto = CreateUserDTO.create({
        name: 'Bob',
        password: 'password123',
        role: Role.User,
      })

      userServiceMock.create.mockRejectedValue(
        new UserAlreadyExistsError('Bob'),
      )

      await expect(userController.create(createDto)).rejects.toThrow(
        ConflictException,
      )
    })
  })

  describe('delete', () => {
    const currentUser = new UserBuilder().withId(1 as UserID).build()

    it('should delete a user', async () => {
      const userId = 2 as UserID

      userServiceMock.delete.mockResolvedValue(undefined)

      await userController.delete(currentUser, userId)

      expect(userServiceMock.delete).toHaveBeenCalledWith(userId, currentUser.id)
    })

    it('should throw ConflictException when trying to delete self', async () => {
      const userId = 1 as UserID

      userServiceMock.delete.mockRejectedValue(new CannotDeleteSelfError())

      await expect(userController.delete(currentUser, userId)).rejects.toThrow(
        ConflictException,
      )
    })
  })
})
