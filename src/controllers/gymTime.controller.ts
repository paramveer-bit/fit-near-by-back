import asyncHandler from "../helpers/asynchandeler";
import ApiError from "../helpers/ApiError";
import ApiResponse from "../helpers/ApiResponse";
import { Request, Response } from "express";
import PrismaClient from "../prismaClient/index"



const modifyTime = asyncHandler(async (req: Request, res: Response) => {
    const { day, openAt, closeAt } = req.body;

    const { id } = req.params;

    if (!id) {
        throw new ApiError(400, "Gym ID is required.");
    }

    const GymOperatingHours = await PrismaClient.gymOperatingHours.findUnique({
        where: {
            id
        }
    });

    if (!GymOperatingHours) {
        throw new ApiError(404, "Gym operating hours not found.");
    }

    const modifyTime = await PrismaClient.gymOperatingHours.update({
        where: {
            id
        },
        data: {
            day,
            openAt,
            closeAt
        }
    });

    const response = new ApiResponse("200", modifyTime, "Gym operating hours updated successfully");
    return res.status(200).json(response);
})

const getGymtiming = asyncHandler(async (req: Request, res: Response) => {

    const { id } = req.params;

    if (!id) {
        throw new ApiError(400, "Gym ID is required.");
    }

    const gymOperatingHours = await PrismaClient.gymOperatingHours.findMany({
        where: {
            gymId: id
        }
    });

    if (!gymOperatingHours || gymOperatingHours.length === 0) {
        throw new ApiError(404, "No operating hours found for this gym.");
    }

    // convert to key value pair
    const foramtedHours = gymOperatingHours.map((hour) => ({
        id: hour.id,
        day: hour.day,
        openAt: hour.openAt,
        closeAt: hour.closeAt
    }));

    const response = new ApiResponse("200", foramtedHours, "Gym operating hours fetched successfully");
    return res.status(200).json(response);
})


export { modifyTime, getGymtiming }