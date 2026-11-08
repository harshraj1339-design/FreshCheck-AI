# FreshCheck AI

FreshCheck AI separates factual claims in an AI answer, identifies claims that can change, searches current sources with Tavily, and evaluates the evidence through a Bifrost model gateway. Backend scoring is deterministic and reports evidence quality, not a probability of truth. Missing or conflicting evidence remains explicitly uncertain.

## Requirements

- Node.js 20 or newer
- A Tavily API key
- A running Bifrost gateway with a configured provider and model

## Local setup

1. Copy `server/.env.example` to `server/.env` and configure `TAVILY_API_KEY`, `BIFROST_BASE_URL`, `BIFROST_MODEL`, and, if required by the gateway, `BIFROST_API_KEY`.
2. From this directory, run `npm install`.
3. In a separate terminal, start Bifrost with its state stored in the ignored local directory: `npx -y @maximhq/bifrost -app-dir .\server\.bifrost-data`.
4. To configure OpenAI, copy `server/bifrost.config.example.json` to `server/.bifrost-data/config.json`, set `OPENAI_API_KEY` in the environment of the Bifrost process, then restart Bifrost. Never put the key directly into a committed configuration file. Confirm a model appears in Bifrost's catalog and keep `BIFROST_MODEL` set to that provider/model (the example is `openai/gpt-4o-mini`).
5. Run `npm run dev` from the project directory.
6. Open the Vite URL shown in the terminal (normally `http://localhost:5173`). The API listens on port 5000.

The gateway's `/v1` endpoint should be an OpenAI-compatible Bifrost endpoint. A Bifrost process by itself is not enough: configure a provider credential and a model in the gateway. Keep provider credentials in environment variables; Bifrost's documented configuration supports `env.*` references. The local dashboard is at `http://localhost:8080`; API-managed provider configuration may require a Bifrost setup token, so follow the startup configuration for the Bifrost version in use.

## API

- `GET /api/health`: backend liveness
- `GET /api/config/status`: non-secret service readiness
- `POST /api/analyze`: `{ "answer": "..." }` returns a validated report

No answer is persisted by the backend. The History page stores up to 20 reports in this browser's local storage and provides deletion controls. There is no cloud sync.

## Verification behavior

The analysis uses Bifrost calls for claim extraction, classification, and evidence evaluation, plus individual Tavily searches for time-sensitive claims (with bounded concurrency). Search failures stop the analysis instead of becoming a false verdict. Source links and publication dates are taken from Tavily metadata; absent dates remain absent. Freshness scores are calculated from source recency, domain authority, agreement, and relevance, and are omitted when no usable sources exist.

## Configuration

See `server/.env.example` for all settings. `MAX_INPUT_CHARACTERS`, `MAX_CLAIMS`, `MAX_RESULTS_PER_CLAIM`, `MAX_CONCURRENT_SEARCHES`, and `REQUEST_TIMEOUT_MS` are configurable. The app does not require login or a database.

## Stack

React, TypeScript, Vite, Tailwind CSS, React Router, Lucide React, Express, Zod, OpenAI-compatible Bifrost API, and the official `@tavily/core` SDK.
