import asyncHandler from "../helpers/asynchandeler";
import ApiError from "../helpers/ApiError";
import ApiResponse from "../helpers/ApiResponse";
import { Request, Response } from "express";
import PrismaClient from "../prismaClient/index"
import { z } from "zod"
import { uploadImage, deleteImage, getImage } from "../helpers/Image.handler";


const addTrainerSchema = z.object({
    name: z.string().min(3, { message: "Name should be of at least 3 size" }).max(50, { message: "Name should be of at max 50 size" }),
    email: z.string().email({ message: "Invalid email" }).min(5).max(255),
    experience: z.number().min(0, { message: "Experience should be a positive number" }),
    bio: z.string().min(10, { message: "Bio should be of at least 10 size" }).max(500, { message: "Bio should be of at max 500 size" }),
    trained: z.number().min(0, { message: "Trained should be a positive number" }),
});

const addTrainer = asyncHandler(async (req: Request, res: Response) => {
    const { name, email, experience, bio, specialties, trained } = req.body;
    const { gymId } = req.params;

    // Validate input data
    const validatedData = addTrainerSchema.safeParse({ name, email, experience, bio, trained });
    if (!validatedData.success) {
        throw new ApiError(400, validatedData.error.errors[0].message);
    }


    // Validate gymId
    if (!gymId) {
        throw new ApiError(400, "Gym ID is required.");
    }
    const gym = await PrismaClient.gym.findUnique({
        where: {
            id: gymId,
        },
    });

    if (!gym) {
        throw new ApiError(404, "Gym not found.");
    }

    // Check if trainer already exists
    const existingTrainer = await PrismaClient.trainer.findUnique({
        where: {
            email,
            gymId
        },
    });

    if (existingTrainer) {
        throw new ApiError(400, "Trainer with this email already exists.");
    }

    // Create new trainer
    const newTrainer = await PrismaClient.trainer.create({
        data: {
            name,
            email,
            experience,
            bio,
            specialties: specialties,
            trained: trained,
            gymId,
        },
    });

    const response = new ApiResponse("200", newTrainer, "Trainer added successfully");
    res.status(200).json(response);
});

const deleteTrainer = asyncHandler(async (req: Request, res: Response) => {
    const { trainerId } = req.params;

    if (!trainerId) {
        throw new ApiError(400, "Trainer ID is required.");
    }

    const trainer = await PrismaClient.trainer.findUnique({
        where: {
            id: trainerId,
        },
    });

    if (!trainer) {
        throw new ApiError(404, "Trainer not found.");
    }


    // Delete the trainer's profile image from storage
    if (trainer.profileUrl) {
        const deleted = await deleteImage(trainer.profileUrl);
        if (!deleted) {
            throw new ApiError(500, "Failed to delete trainer's profile image.");
        }
    }

    // Delete the trainer from the database
    await PrismaClient.trainer.delete({
        where: {
            id: trainerId,
        },
    });

    const response = new ApiResponse("200", null, "Trainer deleted successfully");
    res.status(200).json(response);
});

const getAllTrainers = asyncHandler(async (req: Request, res: Response) => {
    const { gymId } = req.params;

    if (!gymId) {
        throw new ApiError(400, "Gym ID is required.");
    }

    const gym = await PrismaClient.gym.findUnique({
        where: {
            id: gymId,
        },
    });

    if (!gym) {
        throw new ApiError(404, "Gym not found.");
    }

    const trainers = await PrismaClient.trainer.findMany({
        where: {
            gymId,
        },
    });

    const response = new ApiResponse("200", trainers, "Trainers fetched successfully");
    res.status(200).json(response);
});

export {
    addTrainer,
    deleteTrainer,
    getAllTrainers
};
