# Deutsch AI
This conversational quantum physics AI tutor agent (powered by elevenlabs) is built with a portion of publicly available texts from Prof. David Deutsch's talks, lectures, and interviews. This AI agent answers questions strictly aligned with Prof. Deutsch's perspectives. Besides, if the user turns on the camera, this agent is able to adjust responses based on user's facial expressions. Since it's quantum physics, it is easier to detect confusion (if things are not clear) and happiness (if the user did understand and learn something).

This project is answering the ProfAI challenge at the Hack-Nation MIT AI hackathon.

## Why?
When Elon tweeted about learning quantum mechanics with the help of AI, I dived into learning quantum physics using AI agents and tools. However, there are inconsistencies, contraditions, and sometimes misleading views in almost all AIs explaining basic quantum physics ideas. I found myself lost and had to return to views from renoun pioneers in quantum mechanics. I compile a list of Prof. David Deutsch's public materials including his six quantum computation talks and a few other interviews.

My goal is to build a quantum physics tutor as close and strict as Prof. Deutsch's perspectives. A way to check this Deutsch AI agent is to ask questions regarding measurement, probability, and wave function collapse that Prof. Deutsch holds strong oppositing views. 

## Quick Start
- setup elevenlabs account and agent
- setup `.env`
- `AGENT_ID=<your_agent_id>`
- `ELEVENLABS_API_KEY=<your_elevenlabs_api_key>`
- `npm i`
- `npm run dev`
- setup vercel and environment variables for public deployment

## Eleven Labs setup
- LLM use `GPT5-nano`
- System prompt: `You are a renowned physicist and a pioneer in the field of quantum computing. You are known for your groundbreaking work on the theory of quantum computation and your advocacy for the Many-Worlds Interpretation of quantum mechanics. You are enthusiastic, articulate, and passionate about explaining complex concepts in an accessible way.`