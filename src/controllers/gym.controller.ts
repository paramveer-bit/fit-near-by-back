import asyncHandler from "../helpers/asynchandeler";
import ApiError from "../helpers/ApiError";
import ApiResponse from "../helpers/ApiResponse";
import { Request, Response } from "express";
import PrismaClient from "../prismaClient/index"
import { z } from "zod"
import Mailer from "../mailSender/sendMail";
import jwt from "jsonwebtoken"
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { uploadImage, deleteImage, getImage } from "../helpers/Image.handler";



const addImage = asyncHandler(async (req: Request, res: Response) => {
    const { gymId } = req.body;
    if (!gymId) {
        throw new ApiError(400, "Gym ID is required.");
    }
    const gym = await PrismaClient.gym.findUnique({
        where: {
            id: gymId
        }
    });

    if (!gym) {
        throw new ApiError(404, "Gym not found.");
    }


    const file = req.file;
    if (!file) {
        throw new ApiError(400, "No file uploaded.");
    }

    const imageName = crypto.randomBytes(16).toString("hex") + "-" + gymId;

    file.originalname = imageName

    const uploaded = await uploadImage(file);
    if (!uploaded) {
        throw new ApiError(500, "Failed to upload image.");
    }
    const image = await PrismaClient.image.create({
        data: {
            gymId: gym.id,
            url: file.originalname,
        }
    });

    const response = new ApiResponse("200", image, "Image added successfully");
    res.status(200).json(response);
})

const deleteImageById = asyncHandler(async (req: Request, res: Response) => {
    const { imageId } = req.params;

    if (!imageId) {
        throw new ApiError(400, "Image ID is required.");
    }

    const image = await PrismaClient.image.findUnique({
        where: {
            id: imageId
        }
    });

    if (!image) {
        throw new ApiError(404, "Image not found.");
    }

    const deleted = await deleteImage(image.url);
    if (!deleted) {
        throw new ApiError(500, "Failed to delete image.");
    }

    await PrismaClient.image.delete({
        where: {
            id: imageId
        }
    });

    const response = new ApiResponse("200", null, "Image deleted successfully");
    res.status(200).json(response);
})

const getAllImagesByGymId = asyncHandler(async (req: Request, res: Response) => {
    const { gymId } = req.params;

    if (!gymId) {
        throw new ApiError(400, "Gym ID is required.");
    }

    const gym = await PrismaClient.gym.findUnique({
        where: {
            id: gymId
        }
    });

    if (!gym) {
        throw new ApiError(404, "Gym not found.");
    }

    const images = await PrismaClient.image.findMany({
        where: {
            gymId: gym.id
        }
    });

    const imageUrls = await Promise.all(
        images.map(async (image) => {
            const url = await getImage(image.url);
            return {
                ...image,
                url: url || null // Ensure URL is not null
            };
        })
    );

    if (images.length === 0) {
        throw new ApiError(404, "No images found for this gym.");
    }

    const response = new ApiResponse("200", images, "Images retrieved successfully");
    res.status(200).json(response);
})

const addGym = asyncHandler(async (req: Request, res: Response) => {
    const gymSchema = z.object({
        name: z.string().min(1, "Gym name is required"),
        address: z.string().min(1, "Gym address is required"),
        email: z.string().email("Invalid email format"),
        description: z.string().min(1, "Gym description is required"),
        lattitude: z.string().min(1, "Gym latitude is required"),
        longitude: z.string().min(1, "Gym longitude is required"),
        nearby: z.string().min(1, "Gym nearby location is required"),
        location: z.string()
    });

    const parsedData = gymSchema.safeParse(req.body);
    if (!parsedData.success) {
        throw new ApiError(400, "Invalid gym data", parsedData.error.errors);
    }
    const { name, address, email, description, lattitude, longitude, nearby, location } = parsedData.data;

    const file = req.file;
    if (!file) {
        throw new ApiError(400, "No Image Given");
    }

    const existingGym = await PrismaClient.gym.findUnique({
        where: {
            email: email
        }
    })

    if (existingGym) {
        throw new ApiError(400, "Gym with this email already exists");
    }

    file.originalname = crypto.randomBytes(16).toString("hex") + "-" + file.originalname;

    const uploaded = await uploadImage(file);
    if (!uploaded) {
        throw new ApiError(500, "Failed to upload image.");
    }

    const newGym = await PrismaClient.gym.create({
        data: {
            name,
            address,
            email,
            description,
            latitude: Number(lattitude),
            longitude: Number(longitude),
            location,
            nearBy: nearby,
            logoUrl: file.originalname, // Assuming the image is stored with the original name
        },
    });
    if (!newGym) {
        throw new ApiError(500, "Failed to create gym.");
    }

    const response = new ApiResponse("200", newGym, "Gym added successfully");
    res.status(200).json(response);

});

const getGymById = asyncHandler(async (req: Request, res: Response) => {
    const { gymId } = req.params;

    if (!gymId) {
        throw new ApiError(400, "Gym ID is required.");
    }

    const gym = await PrismaClient.gym.findUnique({
        where: {
            id: gymId
        }
    });

    if (!gym) {
        throw new ApiError(404, "Gym not found.");
    }

    const response = new ApiResponse("200", gym, "Gym retrieved successfully");
    res.status(200).json(response);
});






