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


    const file = req.file;
    if (!file) {
        throw new ApiError(400, "No file uploaded.");
    }

    const imageName = crypto.randomBytes(16).toString("hex") + "-" + gymId;

    file.originalname = imageName

    console.log("File to be uploaded:", file);

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

    const response = new ApiResponse("200", imageUrls, "Images retrieved successfully");
    res.status(200).json(response);
})

const addGym = asyncHandler(async (req: Request, res: Response) => {
    const gymSchema = z.object({
        name: z.string().min(1, "Gym name is required"),
        address: z.string().min(1, "Gym address is required"),
        email: z.string().email("Invalid email format"),
        description: z.string().min(1, "Gym description is required"),
        latitude: z.number(),
        longitude: z.number(),
        nearBy: z.string().min(1, "Gym nearby location is required"),
        location: z.string(),
        locationLink: z.string()
    });
    console.log("Request body:", req.body);

    const parsedData = gymSchema.safeParse(req.body);
    if (!parsedData.success) {
        throw new ApiError(400, "Invalid gym data", parsedData.error.errors);
    }
    const { name, address, email, description, latitude, longitude, nearBy, location, locationLink } = parsedData.data;

    const existingGym = await PrismaClient.gym.findUnique({
        where: {
            email: email
        }
    })

    if (existingGym) {
        throw new ApiError(400, "Gym with this email already exists");
    }



    const newGym = await PrismaClient.gym.create({
        data: {
            name,
            address,
            email,
            description,
            latitude: Number(latitude),
            longitude: Number(longitude),
            location,
            nearBy: nearBy,
            locationLink
        },
    });
    if (!newGym) {
        throw new ApiError(500, "Failed to create gym.");
    }

    const operatingHours = [
        { day: "Monday", openAt: "06:00", closeAt: "22:00" },
        { day: "Tuesday", openAt: "06:00", closeAt: "22:00" },
        { day: "Wednesday", openAt: "06:00", closeAt: "22:00" },
        { day: "Thursday", openAt: "06:00", closeAt: "22:00" },
        { day: "Friday", openAt: "06:00", closeAt: "22:00" },
        { day: "Saturday", openAt: "08:00", closeAt: "20:00" },
        { day: "Sunday", openAt: "08:00", closeAt: "20:00" }
    ];
    const operatingHoursPromises = operatingHours.map((hour) =>
        PrismaClient.gymOperatingHours.create({
            data: {
                day: hour.day,
                openAt: hour.openAt,
                closeAt: hour.closeAt,
                gymId: newGym.id
            }
        })
    );

    await Promise.all(operatingHoursPromises);
    // Send a welcome email to the gym owner



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

const getAllgyms = asyncHandler(async (req: Request, res: Response) => {
    const gyms = await PrismaClient.gym.findMany();
    if (gyms.length === 0) {
        throw new ApiError(404, "No gyms found.");
    }

    const response = new ApiResponse("200", gyms, "Gyms retrieved successfully");
    res.status(200).json(response);
})


export { addGym, getGymById, addImage, deleteImageById, getAllImagesByGymId, getAllgyms };





