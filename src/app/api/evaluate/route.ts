import { NextResponse } from "next/server"
import { evaluationPrompt } from "@/lib/openai"
import OpenAI from "openai";

export async function POST(req: Request) {
    try {
        const { messages } = await req.json();

        if (!messages) {
            return NextResponse.json(
                { error: "Missing messages" },
                { status: 400 }
            );
        }

        if (!process.env.OPENAI_API_KEY) {
            console.error("OPENAI_API_KEY is not defined");
            return NextResponse.json(
                { error: "Configuration error" },
                { status: 500 }
            );
        }


        // Get the formatted evaluation prompt
        const formattedPrompt = await evaluationPrompt.format({
            messages: messages
        });
        const openai = new OpenAI();


        // Send evaluation request to OpenAI
        const evaluationResponse = await openai.responses.create({
            model: 'gpt-4o-mini-2024-07-18',
            input: formattedPrompt
        })
        console.log(evaluationResponse)

        return NextResponse.json(evaluationResponse);
    } catch (error) {
        console.error("Unhandled error in evaluate:", error);
        return NextResponse.json(
            { error: "Server error" },
            { status: 500 }
        );
    }
}
