import asyncHandler from "../helpers/asynchandeler";
import ApiError from "../helpers/ApiError";
import ApiResponse from "../helpers/ApiResponse";
import { Request, Response } from "express";
import PrismaClient from "../prismaClient/index"
import { z } from "zod"

const Facility = z.object({
    name: z.string().min(3, { message: "Name should be of at least 3 size" }).max(50, { message: "Name should be of at max 50 size" }),
    description: z.string().max(255, { message: "Description should be of at max 255 size" }),
});

const addFacility = asyncHandler(async (req: Request, res: Response) => {
    const { name, description } = req.body;
    const { gymId } = req.params

    // validated data
    const validatedData = Facility.safeParse({ name, description });
    if (!validatedData.success) {
        throw new ApiError(400, validatedData.error.errors[0].message);
    }

    // create facility
    const newFacility = await PrismaClient.facilities.create({
        data: {
            name,
            description,
            gym: {
                connect: {
                    id: gymId
                }
            }
        }
    });

    if (!newFacility) {
        throw new ApiError(500, "Failed to add facility");
    }

    const response = new ApiResponse("200", newFacility, "Facility added successfully");
    return res.status(200).json(response);
})

const getFacilities = asyncHandler(async (req: Request, res: Response) => {
    const { gymId } = req.params;

    // get facilities
    const facilities = await PrismaClient.facilities.findMany({
        where: {
            gymId: gymId
        }
    });

    if (!facilities) {
        throw new ApiError(404, "No facilities found");
    }

    const response = new ApiResponse("200", facilities, "Facilities fetched successfully");
    return res.status(200).json(response);
})

const deleteFacility = asyncHandler(async (req: Request, res: Response) => {
    const { facilityId } = req.params;

    // check if facility exists
    const facility = await PrismaClient.facilities.findUnique({
        where: {
            id: facilityId
        }
    });

    if (!facility) {
        throw new ApiError(404, "Facility not found");
    }

    // delete facility
    await PrismaClient.facilities.delete({
        where: {
            id: facilityId
        }
    });

    const response = new ApiResponse("200", null, "Facility deleted successfully");
    return res.status(200).json(response);
})

export { addFacility, getFacilities, deleteFacility };