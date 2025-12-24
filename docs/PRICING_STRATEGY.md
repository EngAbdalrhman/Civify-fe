# Civify Pricing Strategy & Plans

## Pricing Philosophy
- **Episodic Usage**: Job seekers actively search for 2-4 months, then stop
- **Regional Pricing**: Consider lower prices for MENA region
- **Beta Strategy**: Build user base with limited-time early bird pricing

---

## Proposed Plans

### 🆓 Free Tier
| Item | Value |
|------|-------|
| **Price** | $0 |
| **CV Parses** | 2/month |
| **CV Tailorings** | 1/month |
| **Templates** | Basic only |
| **Export** | PDF with watermark |
| **Purpose** | Try before buy |

---

### 🚀 Beta Plan (Limited Time Launch Offer)
| Item | Value |
|------|-------|
| **Price** | $9/month OR $29 one-time (lifetime beta) |
| **CV Parses** | 10/month |
| **CV Tailorings** | 5/month |
| **Templates** | All templates |
| **Export** | PDF, DOCX - No watermark |
| **Extras** | "Beta Tester" badge, Priority support |
| **Lock-in** | Price locked forever if on annual |
| **Limit** | First 500 users only |

**Why Beta Plan?**
- Builds testimonials and reviews
- Creates early adopter community
- Provides feedback loop for improvements
- Low barrier for initial traction

---

### 💼 Pro Plan
| Item | Value |
|------|-------|
| **Price** | $14.99/month OR $119/year (save 34%) |
| **CV Parses** | 50/month |
| **CV Tailorings** | Unlimited |
| **Templates** | All premium templates |
| **Export** | All formats |
| **CV Masking** | ✅ Yes |
| **API Access** | 100 calls/month |
| **Support** | Priority email |

---

### 🏢 Premium / Teams
| Item | Value |
|------|-------|
| **Price** | $39/month OR $299/year (save 36%) |
| **Everything** | Unlimited |
| **Cover Letters** | ✅ When available |
| **Team Features** | ✅ Yes |
| **API Access** | 1000 calls/month |
| **Support** | Dedicated support |

---

## Token Cost Breakdown (For Reference)

If using Gemini 1.5 Flash pricing (~$0.00025/1K input, ~$0.0005/1K output):

| Operation | Estimated Tokens | Your Cost | Suggested Margin |
|-----------|------------------|-----------|------------------|
| CV Parse | 8K in, 4K out | ~$0.004 | 125x ($0.50) |
| CV Tailor | 10K in, 6K out | ~$0.006 | 166x ($1.00) |
| CV Mask | 3K in, 2K out | ~$0.002 | 125x ($0.25) |

---

## Alternative: Credit-Based Pricing

| Pack | Credits | Price | Per Credit |
|------|---------|-------|------------|
| Starter | 10 | $4.99 | $0.50 |
| Popular | 50 | $19.99 | $0.40 (20% off) |
| Power | 200 | $59.99 | $0.30 (40% off) |

**Credit Usage:**
- 1 CV Parse = 1 credit
- 1 CV Tailor = 2 credits
- 1 CV Mask = 1 credit

---

## Regional Pricing (Recommended)

| Region | Pro Price | Discount |
|--------|-----------|----------|
| US/Europe | $14.99 | - |
| MENA | EGP 299 (~$6) | 60% |
| India/SEA | $7.99 | 47% |

---

## Implementation Notes

1. **Backend**: Plans are managed via `subscription` and `plan` entities
2. **Payment**: Fawaterak (MENA) + Paymob for regional pricing
3. **Usage Tracking**: Track parse/tailor counts per billing cycle
4. **Beta Badge**: Display in UI for beta plan users

---

## Next Steps

- [ ] Create Beta plan in database
- [ ] Add Beta badge to user dashboard
- [ ] Implement usage limits per plan
- [ ] Set up regional pricing detection
