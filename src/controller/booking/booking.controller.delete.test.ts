import { BadRequestException } from '@nestjs/common'

import {
  type IBookingService,
  type BookingID,
  CannotDeletePickedUpBookingError,
} from '../../application'

import { BookingController } from './booking.controller'

describe('BookingController - Delete', () => {
  let bookingController: BookingController
  let bookingServiceMock: jest.Mocked<IBookingService>

  beforeEach(() => {
    bookingServiceMock = {
      create: jest.fn(),
      get: jest.fn(),
      getAll: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    }
    bookingController = new BookingController(bookingServiceMock)
  })

  describe('delete', () => {
    it('should delete a booking', async () => {
      const bookingId = 1 as BookingID

      bookingServiceMock.delete.mockResolvedValue(undefined)

      await bookingController.delete(bookingId)

      expect(bookingServiceMock.delete).toHaveBeenCalledWith(bookingId)
    })

    it('should throw BadRequestException when booking is in PICKED_UP state', async () => {
      const bookingId = 1 as BookingID

      bookingServiceMock.delete.mockRejectedValue(
        new CannotDeletePickedUpBookingError(bookingId),
      )

      await expect(bookingController.delete(bookingId)).rejects.toThrow(
        BadRequestException,
      )
    })
  })
})
