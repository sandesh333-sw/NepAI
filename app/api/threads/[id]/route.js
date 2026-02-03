import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Thread from '@/models/Thread';

export async function GET(req, context) {
  try {
    const { userId } = await auth();

    const params = await context.params;   
    const id = params.id;

    console.log("Thread ID:", id);

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    const thread = await Thread.findOne({
      _id: id,
      userId
    }).lean();

    console.log("DB Result:", thread);

    if (!thread) {
      return NextResponse.json({ error: "Thread not found" }, { status: 404 });
    }

    return NextResponse.json(thread);

  } catch (error) {
    console.error("Get thread error", error);
    return NextResponse.json({ error: "Failed to fetch thread" }, { status: 500 });
  }
}



export async function DELETE(req, { params }){
    try {
        const { userId } = await auth();

        if (!userId){
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        await dbConnect();

        const deletedThread = await Thread.findOneAndDelete({
            _id: params.id,
            userId
        });

        return NextResponse.json({ message: "Thread deleted successfully" });

    } catch (error) {
        console.error("Delete thread error", error);
        return NextResponse.json({ error: "Failed to delete thread" }, { status: 500 });
    }
}