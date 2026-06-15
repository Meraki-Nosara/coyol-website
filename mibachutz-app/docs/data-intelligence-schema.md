# Mibachutz Data Intelligence Schema

## Overview

The AI agent participates in mom group chats, providing helpful coordination while extracting valuable market intelligence. All data is anonymized and aggregated before any B2B use.

---

## Data Collection Layers

### Layer 1: Registration Data (Explicit Consent)
Collected at signup - mom knows and agrees:

```sql
CREATE TABLE mom_profiles (
  id UUID PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Demographics
  city TEXT,
  neighborhood TEXT,
  language TEXT,  -- Hebrew, Russian, English, Arabic
  
  -- Baby info
  baby_birth_date DATE,
  baby_gender TEXT,
  is_first_child BOOLEAN,
  
  -- Contact (encrypted)
  phone_hash TEXT,  -- Hashed, not plaintext
  email_hash TEXT,
  
  -- Computed
  age_segment TEXT,  -- '0-3m', '3-6m', '6-12m', '1-2y'
  socioeconomic_proxy TEXT  -- Derived from neighborhood + language
);
```

### Layer 2: Behavioral Data (Implicit)
Derived from app usage:

```sql
CREATE TABLE mom_behavior (
  id UUID PRIMARY KEY,
  mom_id UUID REFERENCES mom_profiles(id),
  recorded_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Engagement
  messages_sent INT,
  meetups_attended INT,
  meetups_organized INT,
  
  -- Timing patterns
  most_active_hours INT[],  -- Array of hours
  most_active_days INT[],   -- 0=Sun, 6=Sat
  
  -- Social
  connections_count INT,
  group_size INT,
  is_group_leader BOOLEAN
);
```

### Layer 3: Intent Signals (AI Extracted)
The gold - extracted from conversations:

```sql
CREATE TABLE intent_signals (
  id UUID PRIMARY KEY,
  extracted_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Source (anonymized)
  mom_segment TEXT,      -- Not mom_id! Aggregated segment only
  city TEXT,
  neighborhood TEXT,
  baby_age_range TEXT,
  
  -- Signal
  signal_type TEXT,      -- 'purchase_intent', 'brand_mention', 'pain_point', 'recommendation', 'health_concern'
  category TEXT,         -- 'stroller', 'formula', 'daycare', 'pediatrician', etc.
  subcategory TEXT,
  
  -- Details
  brand_mentioned TEXT,
  sentiment TEXT,        -- 'positive', 'negative', 'neutral', 'seeking'
  price_sensitivity TEXT, -- 'budget', 'mid', 'premium', 'unknown'
  urgency TEXT,          -- 'immediate', 'soon', 'researching', 'future'
  
  -- Context
  keywords TEXT[],
  raw_snippet_hash TEXT  -- Hash of original text, not the text itself
);
```

### Layer 4: Location Intelligence
Where moms go:

```sql
CREATE TABLE location_patterns (
  id UUID PRIMARY KEY,
  recorded_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Aggregated only
  city TEXT,
  neighborhood TEXT,
  mom_segment TEXT,
  
  -- Pattern
  location_type TEXT,    -- 'park', 'cafe', 'mall', 'clinic', 'activity_center'
  location_name TEXT,    -- "Sarona Market", "Hayarkon Park"
  visit_frequency TEXT,  -- 'daily', 'weekly', 'monthly'
  typical_day TEXT,
  typical_time TEXT,
  
  -- Derived
  spend_estimate TEXT,   -- 'low', 'medium', 'high'
  group_size_avg FLOAT
);
```

---

## AI Extraction Rules

### What to Extract:

```yaml
purchase_intent:
  triggers:
    - "looking for"
    - "need to buy"
    - "any recommendations for"
    - "where can I get"
    - "best [product]"
  extract:
    - product_category
    - brand_if_mentioned
    - price_sensitivity
    - urgency

brand_sentiment:
  triggers:
    - brand name mentioned
    - "love/hate/like/dislike"
    - "worth it / not worth it"
    - "recommend / don't recommend"
  extract:
    - brand_name
    - sentiment
    - reason_if_stated

pain_points:
  triggers:
    - "frustrated"
    - "can't find"
    - "wish there was"
    - "anyone else struggle with"
    - "so hard to"
  extract:
    - category
    - specific_problem
    - location_if_relevant

health_signals:
  triggers:
    - symptoms mentioned
    - doctor/pediatrician questions
    - medication questions
    - developmental concerns
  extract:
    - concern_category
    - severity_implied
    - seeking_type (advice/recommendation/validation)
  IMPORTANT: Extra anonymization, no individual tracking

life_stage_transitions:
  triggers:
    - "starting solids"
    - "weaning"
    - "going back to work"
    - "looking for daycare"
    - "moving to"
  extract:
    - transition_type
    - timeline
    - associated_needs
```

### What NOT to Extract:

- Personal identifying information
- Specific health diagnoses
- Financial details
- Relationship/family problems
- Anything that could identify a specific person

---

## Aggregation Rules

**CRITICAL: Never sell individual data. Always aggregate.**

### Minimum Aggregation Thresholds:

| Data Type | Minimum Group Size |
|-----------|-------------------|
| Purchase intent | 10 moms |
| Brand sentiment | 20 moms |
| Location patterns | 15 moms |
| Health signals | 50 moms |
| Demographic insights | 25 moms |

### Aggregated Output Example:

```json
{
  "report_type": "purchase_intent",
  "period": "2026-Q2",
  "segment": {
    "location": "Tel Aviv North",
    "baby_age": "3-6 months",
    "language": "Hebrew"
  },
  "sample_size": 847,
  "insights": [
    {
      "category": "strollers",
      "intent_volume": 234,
      "top_brands_considered": ["Bugaboo", "Yoyo", "Cybex"],
      "price_sensitivity": {"budget": 12, "mid": 45, "premium": 43},
      "peak_research_month": "month_before_birth"
    },
    {
      "category": "formula",
      "intent_volume": 156,
      "trigger_event": "returning_to_work",
      "brand_loyalty": "low",
      "decision_influencer": "pediatrician_recommendation"
    }
  ]
}
```

---

## Security Architecture

### Data Storage:

```
┌─────────────────────────────────────────────────────────────┐
│                     PRODUCTION ENV                          │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐     │
│  │   App DB    │    │  Analytics  │    │   Reports   │     │
│  │  (Supabase) │───▶│     DB      │───▶│    (B2B)    │     │
│  │             │    │ (Aggregated)│    │ (Anonymized)│     │
│  │ - Profiles  │    │             │    │             │     │
│  │ - Messages  │    │ - Signals   │    │ - Insights  │     │
│  │ - Groups    │    │ - Patterns  │    │ - Trends    │     │
│  └─────────────┘    └─────────────┘    └─────────────┘     │
│         │                                                   │
│         │ Real-time extraction                              │
│         ▼                                                   │
│  ┌─────────────┐                                           │
│  │  AI Agent   │                                           │
│  │  (OpenClaw) │                                           │
│  │             │                                           │
│  │ - Monitors  │                                           │
│  │ - Extracts  │                                           │
│  │ - Anonymizes│                                           │
│  └─────────────┘                                           │
└─────────────────────────────────────────────────────────────┘
```

### Access Control:

| Role | App DB | Analytics DB | Reports |
|------|--------|--------------|---------|
| App Users | Own data only | ❌ | ❌ |
| AI Agent | Read messages | Write signals | ❌ |
| Data Team | ❌ | Read only | Write |
| B2B Clients | ❌ | ❌ | Read (paid) |
| Admin | Full | Full | Full |

### Encryption:

- **At rest:** AES-256 for all databases
- **In transit:** TLS 1.3
- **PII fields:** Additional field-level encryption
- **Hashing:** Phone/email stored as SHA-256 hashes only

---

## Consent Framework

### Registration Consent (Required):

```
☑️ I agree to the Terms of Service and Privacy Policy

Summary: Mibachutz uses AI to help coordinate meetups and 
improve our service. We may use aggregated, anonymous insights 
from app usage to understand trends among new parents. 
Your personal information is never sold or shared.
```

### Enhanced Data Consent (Optional, unlocks premium features):

```
☐ Help improve products for parents (Optional)

By opting in, you help us share anonymous, aggregated insights 
with baby brands and services to make better products for parents 
like you. You may receive occasional surveys or early access to 
new products. Your identity is never revealed.

Benefits: Premium features, exclusive offers, product samples
```

---

## B2B Data Products

### 1. Market Intelligence Reports (Monthly)
- Category trends by segment
- Brand sentiment tracking
- Emerging pain points
- **Price:** $5,000-20,000/month depending on depth

### 2. Custom Research
- Specific questions answered from data
- Segment deep-dives
- Competitive analysis
- **Price:** $10,000-50,000 per project

### 3. Real-time Dashboards
- Live trend monitoring
- Alert on sentiment shifts
- Category pulse
- **Price:** $15,000-30,000/month

### 4. Lead Generation (Consent-based only)
- Moms who opted in to hear from brands
- Matched to purchase intent
- **Price:** $50-200 per qualified lead

---

## Implementation Priority

### Phase 1: Foundation (Week 1-2)
- [ ] Create analytics database schema
- [ ] Build AI extraction prompts
- [ ] Implement anonymization layer
- [ ] Set up consent flow

### Phase 2: Collection (Week 3-4)
- [ ] Deploy AI agent to monitor chats
- [ ] Start populating intent_signals
- [ ] Build internal dashboard
- [ ] Validate extraction accuracy

### Phase 3: Monetization (Month 2+)
- [ ] Create first market report
- [ ] Pitch to 3 potential B2B clients
- [ ] Build self-serve dashboard
- [ ] Iterate based on client feedback

---

## Legal Considerations

- **GDPR Compliance:** Even in Israel, follow EU standards for global scalability
- **Israeli Privacy Law:** Register with Privacy Protection Authority if >10K users
- **Children's Data:** Extra careful - baby data is sensitive
- **Right to Deletion:** Must be able to purge all user data on request
- **Data Portability:** User can export their own data

---

*Document created: June 15, 2026*
*Classification: Internal - Confidential*
