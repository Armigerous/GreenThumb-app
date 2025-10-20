# 📋 GreenThumb App Development Plan

**Last Updated:** January 16, 2025  
**Priority Level:** High (Pre-Launch Critical Issues)

## 🎯 Current Status & Context

The app is approaching launch with several critical UI/UX issues and payment flow concerns that need immediate attention. Based on user feedback and technical analysis, we have identified specific areas requiring fixes.

## 🚨 Critical Issues Identified

### 1. Payment Flow Testing Required (CRITICAL)

**Problem:** Need to verify complete payment flow works end-to-end
**Impact:** Revenue risk, user trust issues, launch blocking
**Files Affected:**

- `app/(tabs)/checkout.tsx` (lines 28-335)
- `lib/create-subscription-edge-function.ts` (lines 32-128)
- `lib/stripe-webhook-edge-function.ts` (lines 27-175)

### 2. Task Animation Over-Complexity

**Problem:** Full-page task completion animations are overwhelming and cover the entire task list
**Impact:** Poor user experience, visual clutter
**Files Affected:**

- `components/Task.tsx` (lines 60-83)
- `components/TaskList.tsx` (lines 169-239)
- `components/UI/TaskCompletionCelebration.tsx` (lines 38-225)

### 3. Calendar Transparency Issues

**Problem:** Task lists and day elements become transparent after page navigation/animations
**Impact:** Unreadable UI, poor visual hierarchy
**Files Affected:**

- `app/(tabs)/calendar.tsx` (lines 33-657)
- Animation state management causing opacity conflicts

## 📋 Action Plan

### Phase 1: Payment Flow Testing (Priority: CRITICAL)

**Timeline:** 2-3 days
**Objectives:**

- Verify complete payment journey works
- Ensure users receive paid features after payment
- Test edge cases and error scenarios

**Tasks:**

1. **End-to-End Payment Testing**

   - Test subscription creation flow
   - Verify Stripe integration works properly
   - Test webhook processing for payment success
   - Verify user gets access to paid features

2. **Payment Error Handling**
   - Test failed payment scenarios
   - Verify proper error messages
   - Test subscription cancellation flow

### Phase 2: Animation Simplification (Priority: HIGH)

**Timeline:** 1-2 days
**Objectives:**

- Remove full-page task completion animations
- Implement simple cross-out effect for completed tasks
- Maintain subtle feedback without overwhelming UI

**Tasks:**

1. **Simplify Task Completion Animation**

   - Remove `TaskCompletionCelebration` overlay component
   - Keep only checkbox scale and strikethrough animations
   - Remove confetti and full-screen celebrations

2. **Fix Calendar Animation Conflicts**
   - Review `animateWeekChange` function in calendar.tsx
   - Ensure opacity values reset properly after animations
   - Fix transparency issues with task lists

### Phase 3: Calendar Transparency Fixes (Priority: HIGH)

**Timeline:** 1-2 days
**Objectives:**

- Fix transparency issues on calendar page
- Ensure proper opacity management during navigation
- Maintain visual consistency across page transitions

**Tasks:**

1. **Debug Calendar Opacity Issues**

   - Identify root cause of transparency problems
   - Fix opacity state management in calendar navigation
   - Test day switching and week navigation

2. **Fix Task List Transparency**
   - Ensure task lists maintain proper opacity
   - Fix transparency issues after animations
   - Test various navigation scenarios

## 🔧 Technical Implementation Strategy

### Payment Testing Approach

```typescript
// Test subscription creation flow
const testPaymentFlow = async () => {
	// 1. Create test subscription
	// 2. Verify Stripe webhook processing
	// 3. Check user_subscriptions table updates
	// 4. Verify feature access after payment
};
```

### Animation Simplification Approach

```typescript
// Remove complex celebration animations
// Keep simple checkbox + strikethrough
const animateCompletion = (completed: boolean) => {
	checkboxScale.value = withSpring(completed ? 0.9 : 1);
	strikethroughProgress.value = withTiming(completed ? 1 : 0);
	textOpacity.value = withTiming(completed ? 0.6 : 1);
};
```

### Calendar Opacity Fix Strategy

```typescript
// Ensure proper opacity reset after animations
const resetOpacityAfterAnimation = () => {
	taskOpacity.value = withTiming(1, { duration: 200 });
	dayOpacity.value = withTiming(1, { duration: 200 });
};
```

### Payment Testing Checklist

- [ ] Create test subscription
- [ ] Verify Stripe webhook processing
- [ ] Check user_subscriptions table updates
- [ ] Verify feature access after payment
- [ ] Test payment failure scenarios
- [ ] Test subscription cancellation

## 📊 Success Metrics

### Phase 1 Success Criteria (CRITICAL)

- [ ] Payment flow completes successfully
- [ ] Users receive paid features immediately after payment
- [ ] Payment errors are handled gracefully
- [ ] Subscription status updates correctly

### Phase 2 Success Criteria

- [ ] Task completion uses simple cross-out animation only
- [ ] No full-page overlays during task completion
- [ ] Animation performance improved (no lag)

### Phase 3 Success Criteria

- [ ] Calendar page maintains proper opacity during navigation
- [ ] Task lists remain visible and readable
- [ ] Day switching works without transparency issues

## 🚀 Next Steps

1. **Immediate Action:** Start with Phase 1 (Payment Flow Testing) - CRITICAL
2. **Parallel Work:** Begin Phase 2 (Animation Fixes) while testing Phase 1
3. **Final Polish:** Phase 3 (Calendar Fixes) for launch readiness

## 📝 Notes

- All changes should maintain brand consistency per BRAND_IDENTITY.md
- Use pnpm for all package management
- Follow TypeScript best practices (no `any` types)
- Test on both iOS and Android platforms
- Use `/log` command to track completed epics

---

**Ready to Execute:** ✅  
**Estimated Completion:** 4-7 days  
**Launch Blocking:** Yes - Payment flow testing is CRITICAL and must be completed first
