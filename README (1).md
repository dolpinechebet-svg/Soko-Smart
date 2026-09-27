# Soko Smart

**Agentic AI B2B coordination platform for Kenya's small business owners.**

Soko Smart helps informal and small-scale traders — duka owners, hardware sellers, salon and barbershop owners, tailors, boda boda parts dealers, food kiosks, and other jua kali businesses — pool their individual buying needs into bulk orders, negotiate directly with wholesalers and suppliers, generate simple purchase agreements, and settle payment automatically via M-PESA. All of it happens over WhatsApp/SMS, in Swahili, English, or Sheng, by voice or text.

## The Problem

Small business owners buying stock alone — vegetables, cement, hair products, fabric, spare parts, packaging — face the same three issues regardless of trade:

- **No bargaining power.** Buying alone means paying retail-adjacent prices with no leverage.
- **No easy way to coordinate with peers.** Traders in the same neighbourhood doing the same business have no reliable channel to combine orders.
- **Low digital literacy tools.** Most coordination and ordering tools assume smartphone fluency and English-only interfaces that don't fit how these businesses actually communicate.

Soko Smart solves this with a WhatsApp/SMS-native agent that does the coordination work automatically, in the user's own language.

## How It Works

1. **Onboarding** — A business owner messages the platform, registers their trade type, location, M-PESA number, and typical stock needs.
2. **Demand capture** — The agent periodically asks what they need next, parsing free-text or voice messages (Swahili/English/Sheng) into structured orders.
3. **Demand clustering** — A backend job pools open orders by neighbourhood, business category, and product until a minimum order quantity is reached.
4. **Supplier negotiation** — The agent negotiates price, delivery, and quality terms with suppliers within configured guardrails, escalating to a human when terms fall outside those bounds.
5. **Agreement generation** — A plain-language, bilingual micro-agreement is drafted and confirmed by both sides with a single reply.
6. **Payment** — M-PESA STK Push collects each business's share; funds are reconciled and paid out to the supplier.
7. **Delivery & disputes** — Business owners confirm receipt; mismatches open a human-reviewed dispute ticket.
8. **Reputation** — Fulfilment rate, timeliness, and dispute history build a trust score used in future clustering and negotiation.

Soko Smart is trade-agnostic by design: the same demand-pooling → negotiation → agreement → payment engine works whether the product is a sack of tomatoes, a roll of fabric, or a carton of shampoo. Product catalogs and price bands are configured per business category, not hardcoded.

## Architecture

| Component | Responsibility |
|---|---|
| **Conversation Gateway** | WhatsApp Business API + SMS fallback; voice note ingestion via Swahili/Sheng speech-to-text |
| **NLU / Entity Layer** | LLM-based parser that extracts intent, product, quantity, unit, price ceiling, and location from free-text or voice input |
| **Demand Aggregation Engine** | Scheduler that pools open orders per neighbourhood/category/product until MOQ is met |
| **Negotiation Agent** | LLM agent that negotiates with suppliers within hard price/term guardrails; escalates exceptions to a human |
| **Agreement Generator** | Template-based bilingual micro-agreement generator (PDF + structured JSON) |
| **Payments Layer** | Safaricom Daraja API integration (STK Push, B2C/B2B) with an internal reconciliation ledger |
| **Reputation & Risk Engine** | Tracks fulfilment, timeliness, and disputes per business and supplier |
| **Ops Console** | Internal dashboard for exception review, dispute handling, onboarding, and ledger visibility |

Full design details, guardrails, and the MVP build sequence are in [`soko-smart-build-prompt.md`](./soko-smart-build-prompt.md).

## Tech Stack

- **Backend:** Python (FastAPI) or Node.js (NestJS)
- **LLM:** Claude via the Anthropic API, structured JSON output for parsing/negotiation/contract data
- **Messaging:** WhatsApp Business Cloud API (Meta) + Africa's Talking or Twilio (SMS fallback)
- **Speech:** Google Cloud Speech-to-Text (`sw-KE`) or a Whisper-based service
- **Database:** PostgreSQL (transactional/ledger data), Redis (session state)
- **Payments:** Safaricom Daraja API (sandbox → production)
- **Infra:** Docker containers, message queue (RabbitMQ or equivalent) for scheduling and negotiation jobs
- **Admin dashboard:** React + Python/Node backend

## Project Status

Pre-MVP. See the build prompt for the phased scope:

1. Text-only ordering in one neighbourhood, one business category
2. Rules-based demand clustering, fixed price list (no automated negotiation yet)
3. Agreement generation + WhatsApp confirmation
4. M-PESA STK Push collection (manual supplier payout initially)
5. Basic dispute flow
6. Replicate the engine for a second business category to validate the trade-agnostic design
7. Layer in: voice input, automated LLM negotiation, automated supplier payout, reputation scoring

## Non-Negotiable Guardrails

- LLM output never directly triggers a real M-PESA payment — always through a validated, schema-checked intermediate step.
- Negotiation agent cannot finalize terms outside configured price/term bands without human approval.
- Every LLM decision is logged with its raw input for auditability and dispute resolution.
- Product/unit ontology and price bands are per-category config data, not hardcoded prompts.

## Compliance Notes

- Agreements are informal digital records for accountability, not legally binding smart contracts, unless formalized separately.
- Safaricom Daraja API access requires business registration and approval — a real-world prerequisite before payments can go live.
- Plan for Kenya Data Protection Act compliance given the sensitivity of phone numbers, M-PESA details, and location data.

## Getting Started

```bash
# Clone and set up the project
git clone <repo-url>
cd soko-smart

# Backend setup (adjust for your chosen stack)
# Python example:
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Environment variables you'll need:
# - WHATSAPP_BUSINESS_TOKEN
# - ANTHROPIC_API_KEY
# - MPESA_CONSUMER_KEY / MPESA_CONSUMER_SECRET (Daraja sandbox)
# - DATABASE_URL
# - REDIS_URL

# Run locally
uvicorn app.main:app --reload
```

> Replace the commands above with whatever matches the stack you actually scaffold — this is a starting point, not a fixed requirement.

## Contributing

This is an early-stage build. Before adding a new business category, add its product/unit ontology and price bands to config rather than modifying negotiation or parsing logic directly — that's the whole point of the trade-agnostic design.

## License

TBD.
