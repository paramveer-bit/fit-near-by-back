import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3"
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";


const s3 = new S3Client({
    region: process.env.BUCKET_REGION,
    credentials: {
        accessKeyId: process.env.ACCESS_KEY || "",
        secretAccessKey: process.env.SECRET_ACCESS_KEY || "",
    },
})

export const uploadImage = async (file: Express.Multer.File) => {
    if (!file) {
        throw new Error("No file uploaded.");
    }

    const command = new PutObjectCommand({
        Bucket: process.env.BUCKET_NAME,
        Key: file.originalname,
        Body: file.buffer,
        ContentType: file.mimetype,
    });

    try {
        await s3.send(command);
        console.log("File uploaded successfully.");
        return "File uploaded successfully.";
    } catch (error) {
        console.error("Error uploading file:", error);
        return "Error uploading file.";
    }
};

export const getImage = async (key: string) => {
    const getObjectParams = {
        Bucket: process.env.BUCKET_NAME,
        Key: key
    };

    try {
        const command = new GetObjectCommand(getObjectParams);
        const url = await getSignedUrl(s3, command, { expiresIn: 3600 });
        console.log("Signed URL generated:", url);
        return url
    } catch (error) {
        console.error("Error generating signed URL:", error);
        return null
    }
}

export const deleteImage = async (key: string) => {
    const deleteParams = {
        Bucket: process.env.BUCKET_NAME,
        Key: key
    };

    try {
        const command = new DeleteObjectCommand(deleteParams);
        await s3.send(command);
        console.log("File deleted successfully.");
        return "File deleted successfully.";
    } catch (error) {
        console.error("Error deleting file:", error);
        return "Error deleting file.";
    }
}

