import asyncHandler from "../../helpers/asynchandeler";
import ApiError from "../../helpers/ApiError";
import ApiResponse from "../../helpers/ApiResponse";
import { Request, Response } from "express";
import PrismaClient from "../../prismaClient/index"
import { z } from "zod"
import Mailer from "../../mailSender/sendMail";
import jwt from "jsonwebtoken"
import bcrypt from "bcryptjs";


const getUserProfileDetails = asyncHandler(async (req: Request, res: Response) => {
    const user_id = req.user_id

    // Fetch user details from the database
    const user = await PrismaClient.user.findUnique({
        where: {
            id: user_id
        },
        select: {
            id: true,
            name: true,
            email: true,
            phone_number: true,
            isVerified: true,
            createdAt: true,
            updatedAt: true,
            Booking: {
                select: {
                    id: true,
                    gym: true,
                    startDate: true,
                    endDate: true,
                    status: true,
                    createdAt: true,
                    plan: true,
                    name: true,
                    phone: true,
                    email: true,
                    orderId: true
                },
                orderBy: {
                    createdAt: "desc"
                }
            },
            Reviews: {
                select: {
                    id: true,
                    gym: true,
                    rating: true,
                    comment: true,
                    createdAt: true,
                    updatedAt: true
                }
            }
        }
    });

    if (!user) {
        throw new ApiError(404, "User not found");
    }

    // Send response with user details
    const response = new ApiResponse("200", user, "User profile details fetched successfully");
    res.status(200).json(response);

})

export { getUserProfileDetails }