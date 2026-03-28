import { onCall, HttpsError } from "firebase-functions/v2/https";
import { setGlobalOptions } from "firebase-functions";
import { defineString } from "firebase-functions/params";
import { initializeApp } from "firebase-admin/app";
import { getFirestore, FieldValue } from "firebase-admin/firestore";
import OpenAI from "openai";

const openAIKey = defineString("OPENAI_API_KEY");

setGlobalOptions({ maxInstances: 10 });
initializeApp();
const db = getFirestore();

export const generateProjectTree = onCall({}, async (request) => {
  const openai = new OpenAI({ apiKey: openAIKey.value() });

  if (!request.auth) {
    throw new HttpsError("unauthenticated", "Please log in first!");
  }

  const { userPrompt, projectId } = request.data;

  const systemPrompt = `You are a senior project manager and subject-matter expert embedded inside 'VINEA', a project roadmap app. Your job is to turn a user's project description into a brutally specific, actionable roadmap — the kind a real mentor would give you on day one.
        CRITICAL RULES:
        1. JSON ONLY. Return raw minified JSON. No markdown backticks, no preamble, no explanation. Any non-JSON output crashes the system.
        2. FLAT ARCHITECTURE. The 'nodes' and 'edges' arrays must be strictly flat — no nesting.
        3. SPATIAL MATH. Calculate every node position:
        - First node: {"x": 250, "y": 0}
        - Sequential steps: increase y by 150
        - Parallel steps: same y, spread x (e.g. x: 100 and x: 400)
        4. ATOMIC NODES. Each node = one concrete deliverable. Max 1-2 hours of work. Start label with a strong action verb.
        5. SPECIFIC SUBTASKS. Each node must have 3-5 subtasks that are hyper-specific to the user's actual project — not generic advice. A subtask should tell the user exactly what to open, type, read, or build. Bad: "Research the topic". Good: "Search 'React useEffect cleanup function site:react.dev' and read the official docs example."
        6. REAL RESOURCES. Each subtask should reference a real, named tool, library, command, website, or document — not vague suggestions. Bad: "Use a code editor". Good: "Open VS Code, create /src/hooks/useAuth.js".

        REQUIRED OUTPUT SCHEMA:
        {
        "project_metadata": {
            "title": "string (short punchy title, 4 words max)",
            "total_xp_available": number,
            "total_nodes": number,
            "ai_assessment": "string (1 sentence: realistic time estimate + one specific heads-up about the hardest part)"
        },
        "reactFlowData": {
            "nodes": [
            {
                "id": "string (e.g. 'node_1')",
                "type": "actionableTask",
                "position": { "x": number, "y": number },
                "data": {
                "label": "string (action verb + object, max 6 words, shown on the tree node)",
                "status": "pending",
                "xp_value": number,
                "subtasks": [
                    {
                    "id": "string (e.g. 'node_1_sub_1')",
                    "text": "string (hyper-specific instruction — tool name, exact step, expected output)",
                    "done": false
                    }
                ],
                "resources": [
                    "string (named resource: 'MDN Web Docs — Fetch API', 'npm install express', 'docs.firebase.google.com/firestore', etc.)"
                ],
                "estimated_minutes": number
                }
            }
            ],
            "edges": [
            {
                "id": "string (e.g. 'edge_1-2')",
                "source": "string",
                "target": "string",
                "animated": true
            }
            ]
        }
        }`;

  console.info("Sending request to OpenAI for project:", projectId);

  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user",   content: userPrompt   },
    ],
    temperature: 0.4, // Lower = more focused and specific, less hallucinated fluff
  });

  const aiData = JSON.parse(response.choices[0].message.content);

  await db.collection("projects").doc(projectId).set({
    userId:        request.auth.uid,
    status:        "active",
    reactFlowData: aiData,
    createdAt:     FieldValue.serverTimestamp(),
  }, { merge: true });

  console.info("Project tree saved:", projectId);
  return { success: true };
});