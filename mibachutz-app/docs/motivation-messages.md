# Mibachutz - Motivation Messages System

## Philosophy
**Only nudge when activity is naturally slow.** The goal is gentle motivation, not spam. Messages should feel like a friend checking in, not an app pushing notifications.

**Fine line:** Help moms connect without making them feel pressured or annoyed.

## When to Send (Trigger-Based, Not Scheduled)

### Primary Trigger: Inactivity Detection
**Send ONLY when:**
- No one in group pressed "אני בחוץ" for 48+ hours
- No chat messages for 24+ hours
- Weather is nice (optional boost)

**Never send if:**
- Someone is currently "outside" 
- There was activity in last 6 hours
- It's after 8pm or before 8am
- Already sent a nudge in last 48 hours
- Weekend evenings (family time)
- Holidays

### Maximum Frequency
- **Max 2-3 messages per week per group**
- **Never 2 days in a row**
- **Track response rate** - if ignored, back off even more

## Message Types

### 1. Gentle Check-in (After 48h quiet)
- "היי בנות, מה נשמע? 😊"
- "שקט פה היום... הכל בסדר?"
- "מתגעגעת! מתי ניפגש?"

### 2. Weather Opportunity (Nice day + 36h quiet)
- "איזה יום יפה בחוץ..."
- "מזג אוויר מושלם לטיול"

### 3. Soft Suggestion (After 72h+ quiet)
- "מישהי רוצה לצאת השבוע?"
- "חושבת עליכן 💛"

### 4. Location-Based (Learned from chat)
Only after 2+ weeks of data:
- "מי בעניין ל[PARK]?"
- "קפה ב[CAFE] מישהי?"

## Response Tracking

### Measure Success
```
1. Did someone go "outside" within 2 hours of message? → Success
2. Did chat activity increase? → Partial success  
3. No response for 6+ hours? → Back off this group
```

### Adaptive Frequency
- **High engagement group:** Can nudge every 48h of quiet
- **Medium engagement:** Every 72h
- **Low engagement:** Weekly max, or stop entirely
- **If 3 nudges ignored:** Stop for 2 weeks, then try once more

## Message Style

### Do's
- ✅ Short (under 10 words ideal)
- ✅ Casual Hebrew with natural typos ok
- ✅ Use emoji sparingly (1 max)
- ✅ Sound like a tired mom, not a marketer
- ✅ Questions work better than statements

### Don'ts
- ❌ No exclamation marks overload!!!
- ❌ No "notification" or "reminder" language
- ❌ No perfect grammar
- ❌ No pressure ("you should", "don't forget")
- ❌ No guilt ("the baby needs fresh air")
- ❌ Never more than one message without response

## Sample Week

```
Sunday: [quiet since Friday] → "מה נשמע בנות?"
Monday: [someone went out] → NO MESSAGE
Tuesday: [activity] → NO MESSAGE  
Wednesday: [quiet 30h] → NO MESSAGE (not 48h yet)
Thursday: [quiet 48h+] → "יום יפה בחוץ היום"
Friday: [Shabbat prep] → NO MESSAGE
Saturday: [Shabbat] → NO MESSAGE
```

## Technical Implementation

### Check Function (runs every 4 hours)
```javascript
async function shouldNudge(groupId) {
  const lastActivity = await getLastActivity(groupId);
  const lastNudge = await getLastNudge(groupId);
  const currentlyOutside = await getOutsideCount(groupId);
  const hour = new Date().getHours();
  
  // Hard stops
  if (currentlyOutside > 0) return false;
  if (hour < 8 || hour > 20) return false;
  if (isShabbat() || isHoliday()) return false;
  if (hoursSince(lastNudge) < 48) return false;
  
  // Activity threshold
  if (hoursSince(lastActivity) < 48) return false;
  
  // Check group response rate
  const responseRate = await getResponseRate(groupId);
  if (responseRate < 0.1) return false;
  
  return true;
}
```

### Database
```sql
CREATE TABLE nudge_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id uuid REFERENCES groups_v2(id),
  message text,
  sent_at timestamptz DEFAULT now(),
  response_within_2h boolean DEFAULT false
);
```

## The Golden Rule

**When in doubt, don't send.**

It's better to have a quiet group than an annoyed one. Moms will use the app when they need it. Our job is just a gentle reminder that their friends are there.
