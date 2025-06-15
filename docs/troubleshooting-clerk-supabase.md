# 🔧 Clerk + Supabase Integration Troubleshooting Guide

> **Last Updated:** January 15, 2025  
> **Issue:** UUID validation errors with Clerk user IDs

---

## 🚨 Common Error: "invalid input syntax for type uuid"

### Error Message

```
ERROR: {"code": "22P02", "details": null, "hint": null, "message": "invalid input syntax for type uuid: \"user_2tj0mC9c8UaPRPo77HUDAQ9ZEs5\""}
```

### Root Cause

This error occurs when:

1. **Database schema mismatch:** Table has `user_id UUID` but Clerk provides TEXT strings
2. **Wrong RLS function:** Using `auth.uid()` instead of `requesting_user_id()`
3. **Missing function:** The `requesting_user_id()` function doesn't exist

---

## ✅ Solution Checklist

### 1. Verify Database Schema

All user-owned tables must have:

```sql
user_id TEXT NOT NULL  -- ✅ CORRECT
-- NOT: user_id UUID   -- ❌ WRONG
```

### 2. Check RLS Policies

All RLS policies must use:

```sql
-- ✅ CORRECT
CREATE POLICY "policy_name" ON table_name FOR
SELECT USING (requesting_user_id() = user_id);

-- ❌ WRONG
CREATE POLICY "policy_name" ON table_name FOR
SELECT USING (auth.uid()::text = user_id);
```

### 3. Ensure Function Exists

The `requesting_user_id()` function must exist:

```sql
CREATE OR REPLACE FUNCTION requesting_user_id()
RETURNS TEXT AS $$
  SELECT NULLIF(
    current_setting('request.jwt.claims', true)::json->>'sub',
    ''
  )::text;
$$ LANGUAGE sql STABLE;

GRANT EXECUTE ON FUNCTION requesting_user_id() TO authenticated;
```

---

## 🔍 Debugging Steps

### Step 1: Test the Function

```sql
-- In Supabase SQL Editor, run:
SELECT requesting_user_id();
-- Should return your Clerk user ID like: user_2tj0mC9c8UaPRPo77HUDAQ9ZEs5
```

### Step 2: Check Table Schema

```sql
-- Check column types for user-owned tables
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'user_subscriptions'
AND column_name = 'user_id';
-- Should return: user_id | text
```

### Step 3: Verify RLS Policies

```sql
-- List all policies for a table
SELECT schemaname, tablename, policyname, cmd, qual
FROM pg_policies
WHERE tablename = 'user_subscriptions';
-- Check that qual contains 'requesting_user_id()' not 'auth.uid()'
```

---

## 🛠️ Quick Fixes

### Fix 1: Update RLS Policies

```sql
-- Drop old policies
DROP POLICY IF EXISTS "Users can view their own subscriptions" ON user_subscriptions;

-- Create correct policies
CREATE POLICY "Users can view their own subscriptions" ON user_subscriptions FOR
SELECT USING (requesting_user_id() = user_id);

CREATE POLICY "Users can insert their own subscriptions" ON user_subscriptions FOR
INSERT WITH CHECK (requesting_user_id() = user_id);

CREATE POLICY "Users can update their own subscriptions" ON user_subscriptions FOR
UPDATE USING (requesting_user_id() = user_id);
```

### Fix 2: Migrate UUID to TEXT (If Needed)

```sql
-- Only if you have existing UUID columns that need to be converted
-- WARNING: This will lose existing data if user_id contains actual UUIDs

-- 1. Drop foreign key constraints first
-- 2. Change column type
ALTER TABLE user_subscriptions
ALTER COLUMN user_id TYPE TEXT;

-- 3. Recreate constraints if needed
```

---

## 📋 Prevention Checklist

When creating new user-owned tables:

- [ ] Use `user_id TEXT NOT NULL` in schema
- [ ] Use `requesting_user_id() = user_id` in RLS policies
- [ ] Test with actual Clerk user ID before deployment
- [ ] Document the table in `docs/architecture.md`
- [ ] Add to this troubleshooting guide if new patterns emerge

---

## 🔗 Related Files

- **Migration Files:** `supabase/migrations/20250103000000_create_subscriptions.sql`
- **Usage Tracking:** `supabase/migrations/20250103000001_create_usage_tracking.sql`
- **Function Definition:** `supabase/migrations/20250103000002_create_requesting_user_id_function.sql`
- **Architecture Docs:** `docs/architecture.md`
- **Cursor Rules:** `.cursor/rules/expo-mobile-development-rules-and-collaboration-guide.mdc`

---

## 🆘 Still Having Issues?

1. **Check Logs:** Look for the exact error message in Expo logs
2. **Verify JWT:** Ensure Clerk JWT contains the `sub` claim
3. **Test Function:** Run `SELECT requesting_user_id();` in Supabase SQL Editor
4. **Review Migrations:** Ensure all migrations have been applied
5. **Contact Team:** Reference this guide when asking for help
