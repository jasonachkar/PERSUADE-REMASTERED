import OpenAI from "openai"
import { PromptTemplate } from "@langchain/core/prompts";

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const evaluationPrompt = new PromptTemplate({
  template: `You are a sales training evaluator. Analyze the conversation and provide detailed feedback.
Focus on the sales representative's performance, including:
- Opening approach
- Needs assessment
- Product presentation
- Objection handling
- Closing techniques

Conversation to evaluate:
{messages}

Provide your evaluation in the following format:
{
  "overall_score": "A number between 1 and 10",
  "strengths": ["List of strengths as strings"],
  "areas_for_improvement": ["List of areas to improve as strings"],
  "detailed_feedback": "Detailed feedback as a single string"
}`,
  inputVariables: ["messages"]
});
