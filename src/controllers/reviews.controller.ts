import asyncHandler from "../helpers/asynchandeler";
import ApiError from "../helpers/ApiError";
import ApiResponse from "../helpers/ApiResponse";
import { Request, Response } from "express";
import PrismaClient from "../prismaClient/index"
import { z } from "zod"


// Authentic route
const addReview = asyncHandler(async (req: Request, res: Response) => {
    const user_id = req.user_id;
    const { rating, comment } = req.body;
    const { gymId } = req.params;
    // Validate data
    const ReviewSchema = z.object({
        rating: z.number().min(1, { message: "Rating should be at least 1" }).max(5, { message: "Rating should be at most 5" }),
        comment: z.string().max(500, { message: "Comment should be at most 500 characters" }),
    });

    const validatedData = ReviewSchema.safeParse({ rating, comment });

    if (!validatedData.success) {
        console.log("Validation Error:", validatedData.error.errors);
        throw new ApiError(400, validatedData.error.errors[0].message);
    }

    // Check if the user has already reviewed this gym
    const existingReview = await PrismaClient.reviews.findFirst({
        where: {
            gymId: gymId,
            userId: user_id
        }
    });

    if (existingReview) {
        throw new ApiError(400, "You have already reviewed this gym");
    }

    //check if user is registered in the gym
    const isUserRegistered = await PrismaClient.booking.findFirst({
        where: {
            gymId: gymId,
            userId: user_id
        }
    });
    if (!isUserRegistered) {
        throw new ApiError(400, "You must be registered in this gym to leave a review");
    }

    // Create the review
    const newReview = await PrismaClient.reviews.create({
        data: {
            rating,
            comment,
            gym: {
                connect: {
                    id: gymId
                }
            },
            user: {
                connect: {
                    id: user_id
                }
            }
        }
    });

    if (!newReview) {
        throw new ApiError(500, "Failed to add review");
    }

    const response = new ApiResponse("200", newReview, "Review added successfully");
    return res.status(200).json(response);


})

// This function retrieves all reviews for a specific gym.
const getGymReviews = asyncHandler(async (req: Request, res: Response) => {
    const { gymId } = req.params;

    // Get reviews for the gym
    const reviews = await PrismaClient.reviews.findMany({
        where: {
            gymId: gymId
        },
        include: {
            user: {
                select: {
                    id: true,
                    name: true,
                    email: true
                }
            },


        }
    });

    if (!reviews || reviews.length === 0) {
        throw new ApiError(404, "No reviews found for this gym");
    }

    const response = new ApiResponse("200", reviews, "Reviews fetched successfully");
    return res.status(200).json(response);
})

// This function retrieves all reviews made by the authenticated user.
const getUserReviews = asyncHandler(async (req: Request, res: Response) => {
    const user_id = req.user_id;

    // Get reviews by the user
    const reviews = await PrismaClient.reviews.findMany({
        where: {
            userId: user_id
        },
        include: {
            gym: {
                select: {
                    id: true,
                    name: true,
                    location: true
                }
            }
        }
    });

    if (!reviews || reviews.length === 0) {
        throw new ApiError(404, "No reviews found for this user");
    }

    const response = new ApiResponse("200", reviews, "User reviews fetched successfully");
    return res.status(200).json(response);
})

// This function deletes a review made by the authenticated user.
const deleteReview = asyncHandler(async (req: Request, res: Response) => {
    const user_id = req.user_id;
    const { reviewId } = req.params;

    // Check if the review exists and belongs to the user
    const review = await PrismaClient.reviews.findFirst({
        where: {
            id: reviewId,
            userId: user_id
        }
    });

    if (!review) {
        throw new ApiError(404, "Review not found or you do not have permission to delete it");
    }

    // Delete the review
    await PrismaClient.reviews.delete({
        where: {
            id: reviewId
        }
    });

    const response = new ApiResponse("200", null, "Review deleted successfully");
    return res.status(200).json(response);
})


export { addReview, getGymReviews, getUserReviews, deleteReview };