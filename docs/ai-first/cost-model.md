# Cost Model – ShopLite AI Touchpoints

---

## Assumptions
- Model: **Llama 3.1 8B Instruct via OpenRouter** at $0.05/1K prompt tokens, $0.20/1K completion tokens
- Support assistant:  
  - Avg tokens in: 600  
  - Avg tokens out: 150  
  - Requests/day: 1,000  
  - Cache hit rate: 30%  
- Search typeahead:  
  - Avg tokens in: 40  
  - Avg tokens out: 10  
  - Requests/day: 50,000  
  - Cache hit rate: 70%  

---

## Calculation


### Support Assistant
- Cost/action = (600/1000 × $0.05) + (150/1000 × $0.20)  
= $0.03 + $0.03  
= **$0.06 per request**  
- Daily cost = $0.06 × 1,000 × (1 − 0.30)  
= $0.06 × 700  
= **$42/day**

---

### Search Typeahead
- Cost/action = (40/1000 × $0.05) + (10/1000 × $0.20)  
= $0.002 + $0.002  
= **$0.004 per request**  
- Daily cost = $0.004 × 50,000 × (1 − 0.70)  
= $0.004 × 15,000  
= **$60/day**

---

## Results
- Support assistant: Cost/action = **$0.06**, Daily = **$42**  
- Search suggestions: Cost/action = **$0.004**, Daily = **$60**  

---

## Cost lever if over budget
- Reduce context length (e.g., trim Support Assistant input from 600 → 400 tokens).  
- Cache more aggressively (increase hit rate from 70% → 85% for typeahead).  
- Switch to GPT-4o-mini for higher-quality but higher-cost scenarios, or reserve Llama for low-risk high-volume tasks.  
