import { NextResponse } from "next/server"
import { evaluationPrompt } from "@/lib/openai"

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

        // Format messages into conversation string
        const formattedMessages = messages
            .filter((m: { role: string }) => m.role !== 'system')
            .map((m: { role: string; content: string }) =>
                `${m.role === 'assistant' ? 'AI' : 'User'}: ${m.content}`)
            .join("\n");

        // Get the formatted evaluation prompt
        const formattedPrompt = await evaluationPrompt.format({
            messages: formattedMessages
        });

        // Send evaluation request to OpenAI
        const evaluationResponse = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: "gpt-4",
                messages: [
                    {
                        role: "system",
                        content: formattedPrompt
                    }
                ],
                temperature: 0.7
            }),
        });

        if (!evaluationResponse.ok) {
            const errorText = await evaluationResponse.text();
            console.error("OpenAI evaluation error:", evaluationResponse.status, errorText);
            return NextResponse.json(
                { error: "Failed to evaluate conversation" },
                { status: 500 }
            );
        }

        const evaluation = await evaluationResponse.json();
        return NextResponse.json(JSON.parse(evaluation.choices[0].message.content));
    } catch (error) {
        console.error("Unhandled error in evaluate:", error);
        return NextResponse.json(
            { error: "Server error" },
            { status: 500 }
        );
    }
}