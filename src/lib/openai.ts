import OpenAI from "openai"
import { PromptTemplate } from "@langchain/core/prompts";
export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export const evaluationPrompt = new PromptTemplate({
  template: `
  You are a sales training evaluator. Analyze the conversation and provide detailed feedback.
  Focus on the sales representative's performance, including:
  - Opening approach
  - Needs assessment
  - Product presentation
  - Objection handling
  - Closing techniques

  Conversation to evaluate:
  {messages}

  Provide your evaluation in JSON format with the following structure:
  {
    "overall_score": number (1-10),
    "strengths": string[],
    "areas_for_improvement": string[],
    "detailed_feedback": string
  }
  `,
  inputVariables: ['messages']
})