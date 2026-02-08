import { HttpStatus, INestApplication } from '@nestjs/common'
import { Test } from '@nestjs/testing'
import request from 'supertest'

import {
  type CarTypeID,
  CarTypeNotFoundError,
  ICarTypeService,
} from '../../application'
import { CarTypeBuilder, UserBuilder } from '../../builders'
import { Role } from '../../controller/car-type/role.enum'
import {
  AuthenticationGuardMock,
  type CarTypeServiceMock,
  mockCarTypeService,
} from '../../mocks'
import { configureGlobalEnhancers } from '../../setup-app'
import { AuthenticationGuard } from '../authentication.guard'

import { CarTypeController } from './car-type.controller'

describe('CarTypeController', () => {
  const user = UserBuilder.from({
    id: 42,
    name: 'peter',
  })
    .withRole(Role.User)
    .build()

  const carTypeOne = CarTypeBuilder.from({
    id: 13,
    name: 'CarType #13',
    imageUrl: 'http://images.local/cartypes/13',
  }).build()
  const carTypeTwo = CarTypeBuilder.from({
    id: 42,
    name: 'CarType #42',
    imageUrl: 'http://images.local/cartypes/42',
  }).build()

  let app: INestApplication
  let carTypeServiceMock: CarTypeServiceMock
  let authenticationGuardMock: AuthenticationGuardMock

  beforeEach(async () => {
    carTypeServiceMock = mockCarTypeService()
    authenticationGuardMock = new AuthenticationGuardMock(user)

    const moduleReference = await Test.createTestingModule({
      controllers: [CarTypeController],
      providers: [
        {
          provide: ICarTypeService,
          useValue: carTypeServiceMock,
        },
      ],
    })
      .overrideGuard(AuthenticationGuard)
      .useValue(authenticationGuardMock)
      .compile()

    app = moduleReference.createNestApplication()

    await configureGlobalEnhancers(app).init()
  })

  afterEach(() => app.close())

  describe('getAll', () => {
    it('should return all car types', async () => {
      carTypeServiceMock.getAll.mockResolvedValue([carTypeOne, carTypeTwo])

      await request(app.getHttpServer())
        .get('/car-types')
        .expect(HttpStatus.OK)
        .expect([
          {
            id: 13 as CarTypeID,
            name: 'CarType #13',
            imageUrl: 'http://images.local/cartypes/13',
          },
          {
            id: 42 as CarTypeID,
            name: 'CarType #42',
            imageUrl: 'http://images.local/cartypes/42',
          },
        ])
    })
  })

  describe('getOne', () => {
    it('should return a car type', async () => {
      carTypeServiceMock.get.mockResolvedValue(carTypeOne)

      await request(app.getHttpServer())
        .get(`/car-types/${carTypeOne.id}`)
        .expect(HttpStatus.OK)
        .expect({
          id: 13 as CarTypeID,
          name: 'CarType #13',
          imageUrl: 'http://images.local/cartypes/13',
        })
    })

    it('should return a 400', async () => {
      await request(app.getHttpServer())
        .get(`/car-types/foo`)
        .expect(HttpStatus.BAD_REQUEST)
    })

    it('should return a 404', async () => {
      const carTypeId = 99 as CarTypeID
      carTypeServiceMock.get.mockRejectedValue(
        new CarTypeNotFoundError(carTypeId),
      )

      await request(app.getHttpServer())
        .get(`/car-types/${carTypeId}`)
        .expect(HttpStatus.NOT_FOUND)
    })
  })

  describe('create', () => {
    it('should fail if the user is not an administrator', async () => {
      await request(app.getHttpServer())
        .post(`/car-types`)
        .send({
          name: 'New name!',
          imageUrl: null,
        })
        .expect(HttpStatus.FORBIDDEN)

      expect(carTypeServiceMock.create).not.toHaveBeenCalled()
    })

    it('should create a new car type if the user is an administrator', async () => {
      const newCarType = new CarTypeBuilder().withId(42).build()
      carTypeServiceMock.create.mockResolvedValue(newCarType)

      authenticationGuardMock.user = UserBuilder.from(user)
        .withRole(Role.Admin)
        .build()

      await request(app.getHttpServer())
        .post(`/car-types`)
        .send({
          name: newCarType.name,
          imageUrl: newCarType.imageUrl,
        })
        .expect(HttpStatus.CREATED)
        .expect({ ...newCarType })

      expect(carTypeServiceMock.create).toHaveBeenCalledWith({
        name: newCarType.name,
        imageUrl: newCarType.imageUrl,
      })
    })
  })

  describe('patch', () => {
    it('should fail if the user is not an administrator', async () => {
      await request(app.getHttpServer())
        .patch(`/car-types/${carTypeOne.id}`)
        .send({
          name: 'Updated name',
        })
        .expect(HttpStatus.FORBIDDEN)

      expect(carTypeServiceMock.update).not.toHaveBeenCalled()
    })

    it('should update a car type if the user is an administrator', async () => {
      const updatedCarType = CarTypeBuilder.from(carTypeOne)
        .withName('Updated name')
        .build()
      carTypeServiceMock.update.mockResolvedValue(updatedCarType)

      authenticationGuardMock.user = UserBuilder.from(user)
        .withRole(Role.Admin)
        .build()

      await request(app.getHttpServer())
        .patch(`/car-types/${carTypeOne.id}`)
        .send({
          name: 'Updated name',
        })
        .expect(HttpStatus.OK)
        .expect({ ...updatedCarType })

      expect(carTypeServiceMock.update).toHaveBeenCalledWith(carTypeOne.id, {
        name: 'Updated name',
      })
    })
  })
})
