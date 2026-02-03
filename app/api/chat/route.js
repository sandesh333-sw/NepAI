import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import dbConnect from "@/app/lib/dbConnect";
import Thread from "@/app/models/Thread";
import getOpenAIResponse from "@/app/utils/openai";

export async function POST(req){
    try {
        
        const { userId } = await auth();

        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { threadId, message } = await req.json();

        if (!message?.trim()){
            return NextResponse.json({ error: "Message is required" }, { status: 400 });
        }

        await dbConnect();

        let thread;

        if (threadId){
            // Continue existing thread
            thread = await Thread.findOne({ _id: threadId, userId });

            if (!thread){
                return NextResponse.json({ error: "Thread not found" }, { status: 404});
            }
        } else {
            // Create new  thread
            thread = new Thread({
                userId,
                title: message.substring(0, 50),
                messages: []
            });
        }

        // Add user message
        thread.messages.push({
            role: "user",
            content: message.trim()
        });

        // Get AI response with full conversation context
        const conversationHistory = thread.messages.map(m => ({
            role: m.role,
            content: m.content
        }));

        const reply = await getOpenAIResponse(conversationHistory);

        // Add assistant response
        thread.messages.push({
            role: "assistant",
            content: reply
        });

        await thread.save();
        return NextResponse.json({
            reply,
            threadId: thread._id
        });


    } catch (error) {
        console.error("Chat error", error);
        return NextResponse.json({ error: "Failed to process message" }, { status: 500 });
    }
}