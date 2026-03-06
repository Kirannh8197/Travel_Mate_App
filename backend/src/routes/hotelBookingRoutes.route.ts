import { Router, Request, Response } from "express";
import {
  createBooking,
  getBookingsByUser,
  getBookingsByHotel,
  cancelBooking,
  completeBooking,
  //V's_new_start
  confirmBooking,
  //V's_new_end
} from "../services/hotelBooking.service";

const router = Router();

/**
 * Create Booking
 * POST /api/bookings
 */
router.post("/", async (req: Request, res: Response) => {
  try {
    const { userId, hotelId, checkInDate, checkOutDate } = req.body;

    const booking = await createBooking(
      userId,
      hotelId,
      checkInDate,
      checkOutDate
    );

    res.status(201).json(booking);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
});

/**
 * Get Bookings By User
 * GET /api/bookings/user/:userId
 */
router.get("/user/:userId", async (req: Request<{ userId: string }>, res: Response) => {
  try {
    const { userId } = req.params;

    const bookings = await getBookingsByUser(userId);

    res.status(200).json(bookings);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
});

/**
 * Get Bookings By Hotel
 * GET /api/bookings/hotel/:hotelId
 */
router.get("/hotel/:hotelId", async (req: Request<{ hotelId: string }>, res: Response) => {
  try {
    const { hotelId } = req.params;

    const bookings = await getBookingsByHotel(hotelId);

    res.status(200).json(bookings);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
});

/**
 * Cancel Booking
 * PATCH /api/bookings/:bookingId/cancel
 */
router.patch("/:bookingId/cancel", async (req: Request<{ bookingId: string }>, res: Response) => {
  try {
    const { bookingId } = req.params;

    const booking = await cancelBooking(bookingId);

    res.status(200).json(booking);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
});

//V's_new_start
/**
 * Confirm Booking
 * PATCH /api/bookings/:bookingId/confirm
 */
router.patch("/:bookingId/confirm", async (req: Request<{ bookingId: string }>, res: Response) => {
  try {
    const { bookingId } = req.params;
    const booking = await confirmBooking(bookingId);
    res.status(200).json(booking);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
});
//V's_new_end

/**
 * Complete Booking
 * PATCH /api/bookings/:bookingId/complete
 */
router.patch("/:bookingId/complete", async (req: Request<{ bookingId: string }>, res: Response) => {
  try {
    const { bookingId } = req.params;

    const booking = await completeBooking(bookingId);

    res.status(200).json(booking);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
});

export default router;