// export async function POST(req: Request) {
//     try {
//         const body = await req.json();

import { notesIndex } from "@/lib/db/pinecone";
import { getEmbedding } from "@/lib/openai";
import { createNoteSchema, deleteNoteSchema, updateNoteSchema } from "@/lib/validation/note";
import { auth } from "@clerk/nextjs";
// import { RecordValues, RecordValues, RecordValues } from "@pinecone-database/pinecone";
import { PrismaClient } from "@prisma/client";
import { error } from "console";
const prisma = new PrismaClient();

//     } catch (error) {
//         console.error(error);
//         return Response.json({error: "Internal server error"}, {status: 500})

//     }

// }

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parseResult = createNoteSchema.safeParse(body);

    if (!parseResult.success) {
      console.error(parseResult.error);
      return new Response(JSON.stringify({ error: "Invalid input" }), {
        status: 400,
      });
    }

    const { title, content } = parseResult.data;

    const { userId } = auth();

    if (!userId) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
      });
    }

    const embedding = await getEmbeddingForNote(title, content);

 

    const note = await prisma.$transaction( async (tx) => { 
        const note = await tx.note.create({
            data: {
              title,
              content,
              userId,
            },
          });

          await notesIndex.upsert([
            {
                id: note.id,
                values: embedding,
                metadata: {userId},
          }
        ])
        return note
    })

  

    return new Response(JSON.stringify({ note }), { status: 201 });
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
    });
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();

    const parseResult = updateNoteSchema.safeParse(body);

    if (!parseResult.success) {
      console.error(parseResult.error);
      return new Response(JSON.stringify({ error: "Invalid input" }), {
        status: 400,
      });
    }

    const { id, title, content } = parseResult.data;

    const note = await prisma?.note.findUnique({ where: { id } });

    if (!note) {
      return new Response(JSON.stringify({ error: "Note not found" }), {
        status: 404,
      });
    }

    const { userId } = auth();

    if (!userId || userId !== note.userId) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
      });
    }

    const embedding = await getEmbeddingForNote (title, content)
    const updatedNote = await prisma.$transaction ( async (tx) => {
        const updatedNote = await tx.note.update({
            where: { id },
            data: {
              title,
              content,
            },
          });

          await notesIndex.upsert([
            {
                id,
                values: embedding,
                metadata: {userId},
          }
        ])
        return updatedNote;

    });


    

    return new Response(JSON.stringify({ updatedNote }), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
    });
  }
}


export async function DELETE(req: Request) {
    try {
      const body = await req.json();
  
      const parseResult = deleteNoteSchema.safeParse(body);
  
      if (!parseResult.success) {
        console.error(parseResult.error);
        return new Response(JSON.stringify({ error: "Invalid input" }), {
          status: 400,
        });
      }
  
      const { id } = parseResult.data;
  
      const note = await prisma?.note.findUnique({ where: { id } });
  
      if (!note) {
        return new Response(JSON.stringify({ error: "Note not found" }), {
          status: 404,
        });
      }
  
      const { userId } = auth();
  
      if (!userId || userId !== note.userId) {
        return new Response(JSON.stringify({ error: "Unauthorized" }), {
          status: 401,
        });
      }

      await prisma.$transaction ( async (tx) => {
        await tx.note.delete({where: {id}})
        await notesIndex.deleteOne(id);

      })
  



    
  
      return new Response(JSON.stringify({ message: "Note deleted" }), { status: 200 });
    } catch (error) {
      return new Response(JSON.stringify({ error: "Internal server error" }), {
        status: 500,
      });
    }
  }

  async function getEmbeddingForNote(title: string, content: string|undefined) {
    return getEmbedding(title + "\n\n" + content ?? "")
  }