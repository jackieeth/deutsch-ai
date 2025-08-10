# Deutsch AI
This conversational quantum physics AI tutor agent (powered by elevenlabs) is built with a portion of publicly available texts from Prof. David Deutsch's talks, lectures, and interviews. This AI agent answers questions strictly aligned with Prof. Deutsch's perspectives. Besides, if the user turns on the camera, this agent is able to adjust responses based on the user's facial expressions. Since it's quantum physics, it is easier to detect confusion (if things are not clear) and happiness (if the user did understand and learn something).

This project is answering the ProfAI challenge at the Hack-Nation MIT AI hackathon.

<img width="1416" height="848" alt="Screenshot 2025-08-09 at 10 00 05 PM" src="https://github.com/user-attachments/assets/464088d0-73cb-4bdb-93fc-5a05ccc06f83" />


## Why?
Can we build a quantum AI tutor with a strict view and accurate knowledge equivalent to a human quantum physicist? When Elon tweeted about learning quantum mechanics with AI agents, I dived into learning quantum physics using AI agents and tools. However, there are inconsistencies, contradictions, and misleading views in explaining fundamental concepts of quantum physics. I found myself lost and had to return to the views of renowned pioneers in quantum mechanics. I compiled a list of Prof. David Deutsch's public materials, including his six talks on quantum computation and a few other interviews, for my study and then built this AI tutor agent.

My goal is to build a quantum physics tutor as close to and as strict as a real physicist's perspective. A way to check this Deutsch AI agent is to ask questions regarding measurement, probability, and wave function collapse, which Prof. Deutsch holds strong opposing views on.

## How?
Based on ElvenLabs `nextjs` sample and agent dashboard, Deutsch AI was built with custom system prompts and knowledge collected from Prof. Deutsch's publicly available materials. Facial expression detection was built with `face-api.js` to provide adaptive (no user action) or reactive (with user action) feedback based on tilted head, confusion, nodding, and smiling.

## Challenges
1. Strong alignment with Prof. Deutsch's view is not easy to achieve because most LLM data about quantum mechanics are inconsistent, inaccurate, or flawed.
2. User facial expressions can be valuable data for representing the user's learning progression. However, turning on the camera when interacting with AI may raise concerns.

## Quick Start
- setup ElevenLabs account and agent
- setup `.env`
- `AGENT_ID=<your_agent_id>`
- `ELEVENLABS_API_KEY=<your_elevenlabs_api_key>`
- `npm i`
- `npm run dev`
- setup vercel and environment variables for public deployment

## Eleven Labs setup
- LLM use `GPT5-nano`
- System prompt: `You are a renowned physicist and a pioneer in the field of quantum computing. You are known for your groundbreaking work on the theory of quantum computation and your advocacy for the Many-Worlds Interpretation of quantum mechanics. You are enthusiastic, articulate, and passionate about explaining complex concepts in an accessible way.`
- Add related talks and materials to the Agent knowledge base and enable RAG.
