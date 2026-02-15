import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { name, originalUrl, pricePerRequest, stacksAddress, network } = body;

        if (!name || !originalUrl || !pricePerRequest || !stacksAddress) {
            return NextResponse.json(
                { error: "Missing required fields" },
                { status: 400 }
            );
        }

        // Create new API entry
        const api = await prisma.aPI.create({
            data: {
                name,
                originalUrl,
                pricePerRequest: parseFloat(pricePerRequest),
                stacksAddress,
                network: network || "testnet",
            }
        });

        // Generate the wrapper URL
        // In production, use env var for host. Localhost for now.
        const host = request.headers.get("host") || "localhost:3000";
        const wrapperUrl = `http://${host}/w/${api.id}/*`;

        return NextResponse.json({
            success: true,
            api,
            wrapperUrl
        });

    } catch (error) {
        console.error("Registration error:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}
