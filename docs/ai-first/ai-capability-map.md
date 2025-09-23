# AI Capability Map – ShopLite

| Capability        | Intent (user)                                   | Inputs (this sprint)            | Risk 1–5 (tag) | p95 ms | Est. cost/action | Fallback                      | Selected |
|-------------------|-------------------------------------------------|---------------------------------|----------------|-------:|-----------------:|--------------------------------|:-------:|
| Search Typeahead  | Quickly find products while typing              | SKU titles, categories          | 2              |   300  | $0.002           | Default keyword search         |   ✅    |
| Support Assistant | Get instant answers about orders & policies     | FAQ markdown, order-status API  | 3              |  1200  | $0.015           | Escalate to human support      |   ✅    |
| Product Describer | Auto-generate SEO-friendly product descriptions | SKU metadata, sample catalog    | 4              | 1500   | $0.020           | Human editor writes description|         |
| Fraud Signals     | Detect and flag potentially risky orders        | Order + payment metadata        | 5              | 2000   | $0.030           | Manual fraud review            |         |

---

## Why these two

 **Search Typeahead** and **Support Assistant** are selected because they directly tie to critical ShopLite KPIs. Typeahead reduces friction in finding products, improving **conversion rate** on 10k+ SKUs. Support Assistant deflects repetitive support questions, lowering **contact rate** while maintaining customer satisfaction. Both integrate with existing assets (catalog, FAQ markdown, order-status API), making risk low and feasibility high. They also have simple fallbacks—keyword search and human escalation—ensuring reliability without blocking the user.
