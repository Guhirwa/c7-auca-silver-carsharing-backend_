import { type BookingID } from './booking'

export class CannotDeletePickedUpBookingError extends Error {
  public constructor(bookingId: BookingID) {
    super(`Cannot delete booking ${bookingId} because it is in PICKED_UP state`)
  }
}
