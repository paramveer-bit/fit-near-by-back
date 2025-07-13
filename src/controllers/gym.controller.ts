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
import { urlToHttpOptions } from "url";



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
            id: gymId,
            isActive: true // Ensure only active gyms are fetched
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
        locationLink: z.string(),
        logoUrl: z.string()
    });
    console.log("Request body:", req.body);

    const parsedData = gymSchema.safeParse(req.body);
    if (!parsedData.success) {
        throw new ApiError(400, "Invalid gym data", parsedData.error.errors);
    }
    const { name, address, email, description, latitude, longitude, nearBy, location, locationLink, logoUrl } = parsedData.data;
    console
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
            locationLink,
            logoUrl: logoUrl, // Optional logo URL
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
            id: gymId,
            isActive: true // Ensure only active gyms are fetched
        },
        include: {
            GymOperatingHours: true,
            _count: {
                select: {
                    Reviews: true,
                    Trainer: true
                }
            },
            Facilities: {
                select: {
                    name: true,
                    description: true
                }
            },
            Plans: {
                where: {
                    isActive: true
                }
            }
        }

        // select all needed fields, assuming gym has latitude and longitude fields
        // e.g. select: { id: true, name: true, latitude: true, longitude: true, ... }
    });

    if (!gym) {
        throw new ApiError(404, "Gym not found.");
    }

    if (gym.logoUrl) {
        const image = await getImage(gym.logoUrl);
        if (image) {
            gym.logoUrl = image;
        } else {
            gym.logoUrl = null; // Set to null if image retrieval fails
        }
    }

    const response = new ApiResponse("200", gym, "Gym retrieved successfully");
    res.status(200).json(response);
});


const getAllGymDetails = asyncHandler(async (req: Request, res: Response) => {
    const gyms = await PrismaClient.gym.findMany({
        where: {
            isActive: true
        },
        include: {
            GymOperatingHours: true,
            _count: {
                select: {
                    Reviews: true,
                    Trainer: true
                }
            },
            Facilities: {
                select: {
                    name: true,
                    description: true
                }
            },
            Plans: {
                where: {
                    isActive: true
                }
            },
            Image: {
                take: 1
            }
        }

    })


    if (gyms.length === 0) {
        throw new ApiError(404, "No gyms found.");
    }

    const gymsWithUpdatedLogo = await Promise.all(
        gyms.map(async (gym) => {
            let updatedLogoUrl = gym.logoUrl;
            let imageUrl = null;
            if (gym.logoUrl) {
                const image = await getImage(gym.logoUrl);
                updatedLogoUrl = image ? image : null;
            }
            if (gym.Image && gym.Image.length > 0) {
                const image = await getImage(gym.Image[0].url);
                imageUrl = image ? image : null;
            }
            return {
                ...gym,
                logoUrl: updatedLogoUrl,
                rating: 5, // Default rating
                distance: 0, // Default distanceult
                image: imageUrl
            };
        })
    );

    if (gymsWithUpdatedLogo.length === 0) {
        throw new ApiError(404, "No gyms found.");
    }

    const response = new ApiResponse("200", gymsWithUpdatedLogo, "Gyms retrieved successfully");
    res.status(200).json(response);
})

const getGymsAccordingToLocation = asyncHandler(async (req: Request, res: Response) => {
    const { latitude, longitude } = req.query;
    if (!latitude || !longitude) {
        throw new ApiError(400, "Latitude and longitude are required.");
    }
    const lat = parseFloat(latitude as string);
    const lon = parseFloat(longitude as string);
    if (isNaN(lat) || isNaN(lon)) {
        throw new ApiError(400, "Latitude and longitude must be valid numbers.");
    }

    // Earth radius in km
    const EARTH_RADIUS_KM = 6371;

    // Convert degrees to radians
    const deg2rad = (deg: number) => (deg * Math.PI) / 180;

    // Haversine distance between two coords, in km
    const getDistanceKm = (
        lat1: number,
        lon1: number,
        lat2: number,
        lon2: number
    ): number => {
        const dLat = deg2rad(lat2 - lat1);
        const dLon = deg2rad(lon2 - lon1);
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(deg2rad(lat1)) *
            Math.cos(deg2rad(lat2)) *
            Math.sin(dLon / 2) *
            Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return EARTH_RADIUS_KM * c;
    };

    // 10 km radius: compute approximate bounding box deltas
    // 1 deg latitude ≈ 111.32 km
    const latDelta = 10 / 111.32;
    // 1 deg longitude ≈ 111.32 * cos(lat) km
    const lonDelta = 10 / (111.32 * Math.cos(deg2rad(lat)));

    // Fetch gyms within the bounding box
    const gymsInBox = await PrismaClient.gym.findMany({
        where: {
            latitude: {
                gte: lat - latDelta,
                lte: lat + latDelta,
            },
            longitude: {
                gte: lon - lonDelta,
                lte: lon + lonDelta,
            },
            isActive: true // Ensure only active gyms are fetched
        },
        include: {
            GymOperatingHours: true,
            _count: {
                select: {
                    Reviews: true,
                    Trainer: true
                }
            },
            Facilities: {
                select: {
                    name: true,
                    description: true
                }
            },
            Plans: {
                where: {
                    isActive: true
                }
            },
            Image: {
                take: 1
            }
        }

        // select all needed fields, assuming gym has latitude and longitude fields
        // e.g. select: { id: true, name: true, latitude: true, longitude: true, ... }
    });


    // Compute precise distance and filter <= 10 km, also attach distance
    const gymsWithDistance = gymsInBox
        .map((gym) => {
            // assume gym.latitude and gym.longitude are numbers
            const gymLat = Number(gym.latitude);
            const gymLon = Number(gym.longitude);
            const distance = getDistanceKm(lat, lon, gymLat, gymLon);
            return {
                ...gym,
                distance: Number(distance.toFixed(2)), // in km as a number (e.g., 3.42)
                rating: 5
            };
        })
        .filter((gym) => gym.distance <= 10)
        // Optionally sort by distance ascending:
        .sort((a, b) => a.distance - b.distance);

    //get url helpers
    const gymsWithUpdatedLogo = await Promise.all(
        gymsWithDistance.map(async (gym) => {
            let updatedLogoUrl = gym.logoUrl;
            let imageUrl = null;
            if (gym.logoUrl) {
                const image = await getImage(gym.logoUrl);
                updatedLogoUrl = image ? image : null;
            }
            if (gym.Image && gym.Image.length > 0) {
                const image = await getImage(gym.Image[0].url);
                imageUrl = image ? image : null;
            }
            return {
                ...gym,
                logoUrl: updatedLogoUrl,
                image: imageUrl
            };
        })
    );


    const response = new ApiResponse("200", gymsWithUpdatedLogo, "Gyms retrieved successfully");

    res.status(200).json(response);
});

const uploadGymLogo = asyncHandler(async (req: Request, res: Response) => {
    const file = req.file;
    if (!file) {
        throw new ApiError(400, "No file uploaded.");
    }
    const imageName = crypto.randomBytes(16).toString("hex");

    file.originalname = imageName


    const uploaded = await uploadImage(file);
    if (!uploaded) {
        throw new ApiError(500, "Failed to upload image.");
    }
    const response = new ApiResponse("200", { url: file.originalname }, "Image added successfully");
    res.status(200).json(response);
})



export { addGym, uploadGymLogo, getGymById, addImage, deleteImageById, getAllImagesByGymId, getAllGymDetails, getGymsAccordingToLocation };





