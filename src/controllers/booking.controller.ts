import asyncHandler from "../helpers/asynchandeler";
import ApiError from "../helpers/ApiError";
import ApiResponse from "../helpers/ApiResponse";
import { Request, Response } from "express";
import PrismaClient from "../prismaClient/index"
import { z } from "zod"
import Razorpay from "razorpay";
import crypto from "crypto";
import MailToGym from "../mailSender/Templates/MailToGym";
import SendMail from "../mailSender/mailer"
import MailToAdmin from "../mailSender/Templates/MailToAdmin";

const createBooking = asyncHandler(async (req: Request, res: Response) => {
    const { gymId, planId, name, phoneNumber, email } = req.body;
    const userId = req.user_id;

    console.log(process.env.RAZORPAY_ID, process.env.RAZORPAY_KEY);

    const razorpay = new Razorpay({
        key_id: process.env.RAZORPAY_ID || "",
        key_secret: process.env.RAZORPAY_KEY || ""
    });
    // Validate input data
    const BookingSchema = z.object({
        gymId: z.string(),
        planId: z.string(),
        name: z.string().min(2).max(100),
        phoneNumber: z.string().min(10).max(15),
        email: z.string().email()
    });

    const validatedData = BookingSchema.safeParse({ gymId, planId, name, phoneNumber, email });

    if (!validatedData.success) {
        throw new ApiError(400, validatedData.error.errors[0].message);
    }

    //check this gym have this plan
    const gymPlan = await PrismaClient.plans.findFirst({
        where: {
            id: planId,
            gymId: gymId
        }
    });

    if (!gymPlan) {
        throw new ApiError(404, "Plan not found for this gym");
    }

    // Create booking

    // 1 day in start date
    let startDate = new Date();
    startDate.setDate(startDate.getDate() + 1); // Assuming booking starts from the next day
    let endDate = new Date(startDate);
    if (gymPlan.type === "MONTHLY") {
        endDate.setMonth(endDate.getMonth() + 1);
    } else if (gymPlan.type === "QUARTERLY") {
        endDate.setMonth(endDate.getMonth() + 3);
    } else if (gymPlan.type === "HALF_YEARLY") {
        endDate.setMonth(endDate.getMonth() + 6);
    } else if (gymPlan.type === "YEARLY") {
        endDate.setFullYear(endDate.getFullYear() + 1);
    } else if (gymPlan.type === "TRIAL") {
        endDate.setDate(endDate.getDate() + 1); // Assuming trial is for 1 day
    } else {
        throw new ApiError(400, "Invalid plan duration");
    }


    var options = {
        amount: gymPlan.newprice * 100, // Amount in paise
        currency: "INR",
        receipt: `receipt_${Date.now()}`,
        notes: {
            userId: String(userId ?? ""),
            gymId: String(gymId),
            planId: String(planId),
            startDate: new Date(startDate).toISOString(),
            endDate: new Date(endDate).toISOString(),
            name: String(name),
            phoneNumber: String(phoneNumber),
            email: String(email)
        }
    }

    const order = await razorpay.orders.create(options);
    if (!order) {
        throw new ApiError(500, "Failed to create order");
    }

    // Save booking details to the database

    if (!userId) {
        throw new ApiError(401, "User should be signed in before")
    }

    const booking = await PrismaClient.booking.create({
        data: {
            userId: userId,
            gymId: gymId,
            planId: planId,
            startDate,
            endDate,
            name: name,
            phone: phoneNumber,
            email: email,
            orderId: order.id,
        }
    });

    // console.log("Booking created:", booking);



    const response = new ApiResponse("200", { order: order, booking_id: booking.id }, "Booking created successfully")

    res.status(200).json(response);


})

const verifyPayment = asyncHandler(async (req: Request, res: Response) => {
    const { razorpay_payment_id, razorpay_order_id, razorpay_signature, booking_id } = req.body;

    if (!razorpay_payment_id || !razorpay_order_id || !razorpay_signature) {
        throw new ApiError(400, "Missing payment details");
    }

    // console.log("Verifying payment for booking ID:", booking_id);
    // Validate booking ID
    // console.log(razorpay_order_id, razorpay_payment_id, razorpay_signature);

    const hmac = crypto.createHmac('sha256', process.env.RAZORPAY_KEY || "")
    hmac.update(razorpay_order_id + "|" + razorpay_payment_id)
    const generated_signature = hmac.digest('hex')




    if (generated_signature === razorpay_signature) {
        const booking = await PrismaClient.booking.findFirst({
            where: {
                id: booking_id,
                orderId: razorpay_order_id
            }
        });

        if (!booking || booking.planId) {
            throw new ApiError(404, "Booking not found for this payment/order ID");
        }

        const updatedBooking = await PrismaClient.booking.update({
            where: {
                id: booking.id
            },
            data: {
                status: "CONFIRMED",
                paymentId: razorpay_payment_id,
            }
        });

        //Send mail to gym owner
        const gym = await PrismaClient.gym.findUnique({
            where: {
                id: booking.gymId
            }
        });

        if (!booking.planId) {
            throw new ApiError(404, "Plan not found for this booking");
        }

        const plan = await PrismaClient.plans.findUnique({
            where: {
                id: booking.planId
            }
        });

        if (!gym || !plan) {
            throw new ApiError(404, "Gym or Plan not found for this booking");
        }

        await SendMail({
            from: `${process.env.EMAIL}`,
            to: gym.email,
            subject: `New Booking Received from ${booking.name}`,
            html: MailToGym({
                gymName: gym.name,
                userName: booking.name,
                userPhone: booking.phone,
                userEmail: booking.email,
                planName: plan?.type, // Assuming planId is the name of the plan
                startDate: booking.startDate.toISOString().split('T')[0],
                endDate: booking.endDate.toISOString().split('T')[0],
            }),
            text: `You have received a new booking from ${booking.name} for the plan ${booking.planId}.`
        });


        // mail to admin

        await SendMail({
            from: `${process.env.EMAIL}`,
            to: process.env.ADMIN_EMAIL || "",
            subject: `New Booking Received from ${booking.name}`,
            html: MailToAdmin({
                gymName: gym.name,
                gymEmail: gym.email,
                gymLocation: gym.location,
                userId: booking.userId,
                userName: booking.name,
                userPhone: booking.phone,
                userEmail: booking.email,
                razorpayOrderId: booking.orderId,
                planName: plan?.type, // Assuming planId is the name of the plan
                planPrice: plan?.newprice + "", // Assuming newprice is the price of the plan
                startDate: booking.startDate.toISOString().split('T')[0],
                endDate: booking.endDate.toISOString().split('T')[0],
            }),
            text: `You have received a new booking from ${booking.name} for the plan ${booking.planId}.`
        });




        const response = new ApiResponse("200", booking, "Payment verified successfully");

        return res.status(200).json(response);
    }

    const response = new ApiResponse("400", null, "Invalid signature");

    return res.status(400).json(response);
})

export { createBooking, verifyPayment }
