🔎 Retrieval Quality Tests (10)
Test ID	Question	Expected Documents	Pass Criteria
R01	How do I create a seller account on Shoplite?	Doc 1 (User Registration) + Doc 8 (Seller Account Setup)	Retrieved docs include seller registration + setup
R02	What payment methods does Shoplite accept and are they secure?	Doc 4 (Payment Methods & Security) + Doc 14 (Security Policies)	Retrieved docs cover payment options + security
R03	How do I track my order and what are the delivery options?	Doc 5 (Order Tracking & Delivery) + Doc 16 (Shipping Options)	Retrieved docs include tracking + delivery methods
R04	What is the return policy for electronics?	Doc 6 (Returns & Refunds)	Return policy for electronics explicitly retrieved
R05	How do sellers manage inventory and what analytics are available?	Doc 9 (Inventory Mgmt) + Doc 8 (Seller Setup)	Retrieved docs cover inventory tools + analytics
R06	What commission rates do sellers pay?	Doc 10 (Commission & Fees)	Retrieved doc includes commission % by category
R07	How does the mobile app differ from the website?	Doc 12 (Mobile App Features) + Doc 2 (Search & Filtering)	Retrieved docs compare app vs website
R08	What are the benefits of Shoplite's subscription service?	Doc 18 (Subscription & Auto-Replenishment)	Retrieved doc covers discounts + features
R09	How do international returns work?	Doc 6 (Return Policies) + Doc 16 (Shipping Options)	Retrieved docs cover international returns
R10	What support options are available for return issues?	Doc 11 (Customer Support) + Doc 6 (Return Policies)	Retrieved docs include support + returns help
💬 Response Quality Tests (15)
Test ID	Question	Required Keywords	Forbidden Terms	Expected Behavior
Q01	How do I create a seller account?	business verification, 2-3 days, tax ID	instant approval, personal account	Direct answer citing Docs 1 & 8
Q02	What is the return policy and how do I track orders?	30-day return, order tracking, return authorization	no returns, immediate refund	Multi-source answer from Docs 5 & 6
Q03	What payment methods are secure?	credit cards, PayPal, encryption, PCI DSS	unsecured, no encryption	Accurate security info from Doc 4
Q04	How long do refunds take to process?	3-5 business days, payment method, inspection	instant, same day	Specific timeframes from Doc 6
Q05	What are seller commission rates?	commission, category, percentage, fees	no fees, free	Category rates from Doc 10
Q06	How do I use wishlists and share them?	wishlists, sharing, collaborative, privacy	single list, no sharing	Feature explanation from Doc 17
Q07	What mobile app features are exclusive?	barcode scanning, AR visualization, push notifications	same features, no benefits	App-only features from Doc 12
Q08	How does subscription service work?	15% discount, free shipping, flexible scheduling	no discount, fixed schedule	Subscription benefits from Doc 18
Q09	What inventory tools do sellers have?	low stock alerts, CSV upload, analytics, dashboard	manual only, no alerts	Inventory + analytics from Doc 9
Q10	How do gift cards work?	no expiration, e-gifts, balance checking, corporate programs	expires, physical only	Gift card features from Doc 19
Q11	What student discounts are available?	15% discount, .edu email, verification	no discount, all students	Discount details from Doc 15
Q12	How do I contact customer support?	24/7 support, live chat, email, phone	limited hours, email only	Support channels from Doc 11
Q13	What are the shipping options and costs?	free shipping, $35 minimum, carriers, delivery estimates	always free, one carrier	Shipping details from Doc 16
Q14	How does product quality assurance work?	quality standards, authenticity guarantee, seller compliance	no checks, unverified	QA details from Doc 20
Q15	What API access is available for developers?	REST API, OAuth 2.0, rate limits, webhooks	no API, unlimited access	API details from Doc 13
⚠️ Edge Case Tests (5)
Test ID	Scenario	Expected Response Type
E01	"How do I return a product I bought from Amazon?"	Refusal → Shoplite only handles its own returns
E02	"My order is wrong"	Clarification → ask if wrong item, size, or quantity
E03	"Do you ship to Mars?"	Refusal → shipping limited to Earth, suggest alternatives
E04	"I want to complain about everything"	Clarification → ask for specific issues
E05	"What's your policy on [competitor feature not in docs]?"	Refusal → info not in Shoplite docs