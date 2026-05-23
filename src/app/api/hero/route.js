import connectDB from "@/db/connectDB";
import { NextResponse } from "next/server";
import Hero from "@/model/Hero";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
    cloud_name: process.env.Cloudinary_Name,
    api_key: process.env.Cloudinary_API_Key,
    api_secret: process.env.Cloudinary_API_Secret,
});

export async function POST(req) {
    try {
        await connectDB();

        const data = await req.formData();
        const title = data.get("title");
        const mediaFiles = data.getAll("media"); // ✅ getAll - multiple files
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

        const hero = await Hero.findOneAndUpdate(
            {},  // pehla document dhundho
            { title, media },
            { upsert: true, new: true }  // nahi hai toh banao
        );
        await hero.save();
        return NextResponse.json(
            {
                success: true,
                message: "Hero created successfully"
            }, { status: 201 });

    } catch (error) {
        return NextResponse.json({
            message: "Error creating hero",
            error: error.message
        }, {
            status: 500
        })
    }
}



export async function GET(req) {
    try {
        await connectDB();
        const hero = await Hero.findOne();
        return NextResponse.json({ success: true, hero }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}