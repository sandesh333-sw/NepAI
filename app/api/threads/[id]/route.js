import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import dbConnect from '@/app/lib/dbConnect';
import Thread from '@/app/models/Thread';

export async function GET(req, { params }){
    try {
        const { userId } = await auth();

        if (!userId){
            return NextResponse.json({ error: "Unauthorized"}, { status: 401 });
        }

        await dbConnect();

        const thread = await Thread.findOne({
            _id: params.id,
            userId
        }).lean();

        if (!thread){
            return NextResponse.json({ error: "Thread not found" }, { status: 404 });
        }

        return NextResponse.json(thread);

    } catch (error) {
        console.error("Get thread error", error);
        return NextResponse.json({ error: "Failed to fetch thread" }, { status: 500 });
    }
}