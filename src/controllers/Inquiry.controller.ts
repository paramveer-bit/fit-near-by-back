import asyncHandler from "../helpers/asynchandeler";
import ApiError from "../helpers/ApiError";
import ApiResponse from "../helpers/ApiResponse";
import { Request, Response } from "express";
import PrismaClient from "../prismaClient/index"
import { z } from "zod"
import Razorpay from "razorpay";
import crypto from "crypto";
import SendMail from "../mailSender/mailer"
import InquiryEmailTemplate from "../mailSender/Templates/InquiryResponse";
import InquiryToAdmin from "../mailSender/Templates/InquiryToAdmin";

const sendEmail = asyncHandler(async (req: Request, res: Response) => {
    const { name, email, inquiryType, subject, message } = req.body;
    // Validate input data
    const EmailSchema = z.object({
        name: z.string().min(2).max(100),
        email: z.string().email(),
        inquiryType: z.string(),
        subject: z.string().min(2).max(100),
        message: z.string()
    });

    const validatedData = EmailSchema.safeParse(req.body);

    if (!validatedData.success) {
        throw new ApiError(400, validatedData.error.errors[0].message);
    }

    // Here you would integrate with an email service like Nodemailer or SendGrid
    // For demonstration, we'll just log the email details

    //send follow up mail
    const result = await SendMail({
        from: `${process.env.EMAIL}`,
        to: email,
        subject: `New Inquiry Received : ${inquiryType}`,
        html: InquiryEmailTemplate({
            name,
            email,
            inquiry: inquiryType,
            subject,
            message
        }),
        text: `We have received your inquiry regarding ${inquiryType}. Our team will get back to you shortly.`
    });

    // send mail to admin

    if (process.env.ADMIN_EMAIL === undefined) {
        throw new ApiError(500, "Admin email is not configured");
    }
    await SendMail({
        from: `${process.env.EMAIL}`,
        to: process.env.ADMIN_EMAIL,
        subject: `New Inquiry from ${name} : ${inquiryType}`,
        html: InquiryToAdmin({
            name,
            email,
            inquiry: inquiryType,
            subject,
            message
        }),
        text: `You have received a new inquiry from ${name} regarding ${inquiryType}.`
    });


    res.status(200).json(new ApiResponse("200", null, "Email sent successfully"));
});

export { sendEmail }