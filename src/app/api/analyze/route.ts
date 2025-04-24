import OpenAI from "openai";

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: any) {
    console.log("API endpoint hit");
    console.log(
        "OpenAI API Key:",
        process.env.OPENAI_API_KEY ? "Loaded" : "Not Loaded"
    );

    try {
        const formData = await req.formData();
        const file = formData.get("file");

        if (!file) {
            return new Response(JSON.stringify({ error: "No file uploaded" }), {
                status: 400,
            });
        }

        const fileContent = await file.text();

        const response = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                {
                    role: "system",
                    content:
                        "Analyze the file content and identify categories and the 5 levels of completion (initial, repeatable, defined, managed, optimizing) with requirements for each level.",
                },
                { role: "user", content: fileContent },
            ],
        });

        const analysis = response.choices[0].message.content;

        return new Response(JSON.stringify({ analysis }), {
            status: 200,
        });
    } catch (error) {
        console.error(error);
        return new Response(
            JSON.stringify({ error: "Failed to analyze file" }),
            {
                status: 500,
            }
        );
    }
}
