import { NextResponse } from "next/server"
import { openai, EVALUATION_SYSTEM_PROMPT } from "@/lib/openai"

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

        // Send evaluation request to OpenAI
        const evaluationResponse = await openai.chat.completions.create({
            model: 'gpt-4o-mini-2024-07-18',
            messages: [
                {
                    role: 'system',
                    content: EVALUATION_SYSTEM_PROMPT
                },
                {
                    role: 'user',
                    content: `Please evaluate this conversation:\n${JSON.stringify(messages)}`
                }
            ],
            response_format: { type: "json_object" }
        });

        const evaluation = JSON.parse(evaluationResponse.choices[0].message.content);
        return NextResponse.json(evaluation);
    } catch (error) {
        console.error("Unhandled error in evaluate:", error);
        return NextResponse.json(
            { error: "Server error" },
            { status: 500 }
        );
    }
}
