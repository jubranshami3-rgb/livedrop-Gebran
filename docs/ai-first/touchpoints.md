## 1. Search Typeahead

### Problem statement
Shoppers often abandon when they can’t quickly locate relevant products from a catalog of ~10k SKUs. Current keyword-only search returns incomplete matches, increasing drop-offs and lowering conversion. An AI-powered typeahead can suggest relevant queries and products within milliseconds, keeping users engaged and guiding them to purchases faster.

### Happy path
1. User types first few characters in the search bar.
2. Client sends partial query to typeahead API.
3. Cache is checked for recent query prefix suggestions.
4. If cache miss, model generates ranked suggestions based on SKU titles, categories, and synonyms.
5. Suggestions returned (≤5) within p95 300ms budget.
6. UI displays results instantly.
7. User selects a suggestion.
8. Full product search is executed with selected suggestion.
9. User browses product list and adds to cart.
10. Order completes.

### Grounding & guardrails
- **Source of truth**: SKU titles, categories, tags.  
- **Retrieval scope**: only product metadata (no hallucination).  
- **Max context**: 500 tokens.  
- **Refuse outside scope**: if asked non-product queries, return fallback keyword search.  

### Human-in-the-loop
- **Escalation trigger**: <1% queries consistently yielding 0 results.  
- **UI surface**: flagged logs dashboard.  
- **Reviewer**: merch ops team.  
- **SLA**: weekly review of flagged queries.  

### Latency budget
- Client → API: 50ms  
- Cache lookup: 20ms  
- Model inference: 180ms  
- Response assembly: 50ms  
**Total ≤ 300ms (p95)**  
- Cache strategy: 70% hit rate on common prefixes.  

### Error & fallback behavior
- If model fails, fallback to keyword match on SKUs.  
- If API timeout (>250ms), return cached or basic keyword suggestions.  

### PII handling
- No personal identifiers leave the app.  
- Only query text is sent.  
- Logs retained with anonymized query strings.  

### Success metrics
- **Product**:  
  - CTR on suggestions = clicks ÷ impressions.  
  - Conversion uplift = orders from typeahead sessions ÷ orders from non-typeahead sessions.  
- **Business**:  
  - Revenue per session (RPS) = total revenue ÷ sessions.  

### Feasibility note
All inputs (SKU metadata) are already available in the catalog DB. A lightweight LLM with embeddings or semantic search can be layered on existing infra. Next prototype step: build a prefix cache with embedding lookup fallback using OpenRouter Llama 3.1 8B.

---

## 2. Support Assistant

### Problem statement
ShopLite receives repetitive support questions about policies, returns, and order tracking. Current support requires manual human intervention, raising costs and delaying response times. An AI support assistant can resolve FAQs instantly, deflecting tickets and improving customer satisfaction.

### Happy path
1. User opens support chat.  
2. User asks a question (e.g., “Where’s my order?”).  
3. System checks FAQ markdown for cached answer.  
4. If order-specific, assistant queries `order-status` API.  
5. Assistant composes grounded response with supporting reference.  
6. If confident, response returned within 1200ms.  
7. If low confidence, escalation flag triggers.  
8. Human agent reviews flagged query.  
9. User receives resolution (AI or human).  
10. Session ends with optional feedback.  

### Grounding & guardrails
- **Source of truth**: Policies/FAQ markdown, order-status API.  
- **Retrieval scope**: only support-related docs + order API.  
- **Max context**: 1,500 tokens.  
- **Refuse outside scope**: decline to answer unrelated queries.  

### Human-in-the-loop
- **Escalation triggers**: low confidence score (<0.7) or multi-turn unresolved query.  
- **UI surface**: handoff to live chat.  
- **Reviewer**: customer support agents.  
- **SLA**: <5 minutes to human takeover.  

### Latency budget
- Client → API: 100ms  
- Retrieval (FAQ + order-status): 200ms  
- Model inference: 700ms  
- Response assembly: 200ms  
**Total ≤ 1200ms (p95)**  
- Cache strategy: 30% hit rate for common FAQs.  

### Error & fallback behavior
- If model times out, fallback to static FAQ match.  
- If order-status API unavailable, instruct user to check email or retry.  

### PII handling
- Order IDs only sent to API (never exposed to model).  
- User names, addresses, or payment info redacted.  
- Logs stored with anonymized session ID.  

### Success metrics
- **Product**:  
  - Resolution rate = AI-resolved sessions ÷ total sessions.  
  - Avg response time = total response latency ÷ sessions.  
- **Business**:  
  - Support cost per ticket = support spend ÷ tickets resolved.  

### Feasibility note
FAQ markdown already exists; order-status API is available. Off-the-shelf RAG (retrieval-augmented generation) with GPT-4o-mini can handle natural queries. Next prototype step: implement retrieval wrapper with confidence scoring and escalation flag.
