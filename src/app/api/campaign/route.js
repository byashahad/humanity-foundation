import { NextResponse } from "next/server";
import Campaign from "@/model/Campaign";
import connectDB from "@/db/connectDB";
import { v2 as cloudinary } from "cloudinary";


cloudinary.config({
    cloud_name: process.env.Cloudinary_Name,
    api_key: process.env.Cloudinary_API_Key,
    api_secret: process.env.Cloudinary_API_Secret,
});

export async function POST(req) {
    try {
        await connectDB();


        // using formdata
        const data = await req.formData();
        const title = data.get("title");
        const description = data.get("description");
        const targetAmount = parseFloat(data.get("targetAmount"));
        const mediaFiles = data.getAll("media"); // multiple files
        const media = [];

        for (const file of mediaFiles) {
            if (!file || typeof file.arrayBuffer !== "function") continue;

            const buffer = Buffer.from(await file.arrayBuffer());

            const result = await new Promise((resolve, reject) => {
                const stream = cloudinary.uploader.upload_stream(
                    {
                        folder: "Donations",
                        resource_type: "auto",
                    },
                    (error, result) => {
                        if (error) {
                            reject(error);
                        } else {
                            resolve(result);
                        }
                    },
                );
                stream.end(buffer);
            });
            media.push({
                url: result.secure_url,
                publicID: result.public_id
            });
        }

        //
        if (!title || !description || !targetAmount) {
            return NextResponse.json(
                { message: "Missing required fields" },
                { status: 400 },
            );
        }

        // simple slug generation (no library)
        const slug = title.toLowerCase().trim().replace(/\s+/g, "-");

        const newCampaign = await Campaign.create({
            title,
            slug,
            description,
            targetAmount,
            media: media
            //   createdBy,
        });

        return NextResponse.json(
            {
                success: true,
                message: "Campaign created successfully",
                campaign: newCampaign,
            },
            { status: 201 },
        );
    } catch (error) {
        console.error("Error creating campaign:", error);

        return NextResponse.json(
            { success: false, message: "Error creating campaign" },
            { status: 500 },
        );
    }
}
