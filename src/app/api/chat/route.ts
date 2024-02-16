import { notesIndex } from "@/lib/db/pinecone";
import openai, { getEmbedding } from "@/lib/openai";
import { auth } from "@clerk/nextjs";
import { match } from "assert";
import { Filter } from "lucide-react";
import { ChatCompletionMessage} from "openai/resources/index.mjs"

import { PrismaClient } from '@prisma/client';
import OpenAI from "openai";
import {OpenAIStream, StreamingTextResponse} from 'ai'


// interface SystemChatCompletionMessage extends ChatCompletionMessage {
//     role: "system";
// }

const prisma = new PrismaClient();
export async function POST(req: Request) {
    try {
        const body = await req.json();
        const messages: ChatCompletionMessage[] = body.messages;
        
        const messagesTruncated = messages.slice(-6)
        const embedding = await getEmbedding(
            messagesTruncated.map((message) => message.content).join("/n")
        )

            const {userId} = auth()
            const vectorQueryResponse = await notesIndex.query({
                vector: embedding,
                topK: 4,
                filter: {userId}
            })

            const relevantNotes = await prisma.note.findMany({
                where: {
                    id: {
                        in: vectorQueryResponse.matches.map((match) => match.id)
                    }
                }
            })

            console.log("Relevant notes found: ", relevantNotes)

            const systemMessage: ChatCompletionMessage = {
                role: "assistant",
                // role: "system",
                content: "You are inteligent note-taking app. You answer the user's question based on theiir existing note. "+
                "The relevant notes for this query are:\n" + 
                relevantNotes.map((note) => `Title: ${note.title}\n\ncontent:\n${note.content}`).join("\n\n")
            };

            const response = await openai.chat.completions.create({
                model: "gpt-3.5-turbo",
                stream: true,
                messages: [systemMessage, ...messagesTruncated]
            })

            const stream = OpenAIStream(response)
            return new StreamingTextResponse(stream)

    } catch (error) {
        console.error(error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
    });
    }
    
}