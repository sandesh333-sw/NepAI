import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Thread from "@/models/Thread";

export async function GET(){
    try {
        const { userId } = await auth();

        if (!userId){
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        await dbConnect();

        const threads = await Thread.find({ userId })
          .sort({ updatedAt: -1})
          .select('-messages')
          .lean();

          return NextResponse.json(threads);

    } catch (error) {
        console.error("Get threads error: ", error);
        return NextResponse.json({ error: "Failed to fetch threads" }, { status: 500});
    }
}