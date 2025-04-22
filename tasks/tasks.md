# ✅ Status – Mobile App Development (Expo)

This file tracks the development status of key mobile features. All tasks are grouped under their respective feature areas and labeled with unique IDs for easy reference.

---

## 🔥 High Priority

### 🧩 Animation & Auth Flow

**Feature:** Sign-in / Sign-up Animation Flow  
**Goal:** Smooth, immersive, and user-friendly animations during authentication.

- [x] **AUTH-ANIM-001**: Expand animation to full screen area

  - Ensure animation fills the entire viewport, including notch and top buttons.

- [x] **AUTH-ANIM-002**: Prevent layout twitch when switching inputs

  - Eliminate flicker/twitch between email and password fields.

- [x] **AUTH-ANIM-003**: Fix post-animation jump

  - Resolve delayed layout shift after the animation ends.

- [x] **AUTH-ANIM-004**: Fade out background elements

  - Animate background image/text to disappear smoothly on input focus.

- [x] **AUTH-ANIM-005**: Sync keyboard dismissal with UI

  - UI elements should animate alongside keyboard closing for natural feel.

- [x] **AUTH-ANIM-006**: Minimize "Forgot Password" layout shift

  - Avoid harsh transitions when toggling between login and sign-up.

- [x] **AUTH-ANIM-007**: Add password visibility toggle

  - Implement eye icon for toggling password input visibility.

- [x] **AUTH-ANIM-008**: Ensure password field is recognized correctly
  - Make sure it's properly detected as a password input by system-level tools.

---

### 🌄 Home Screen

**Feature:** Homepage Initial Loader Background  
**Goal:** Maintain visual consistency during initial loading.

- [x] **HOME-LOAD-001**: Wrap loader with gradient container
  - Use same visual shell/container as main screen for consistency.

---

### 🌿 Illustration Engine

**Feature:** Seasonal + Task-State Based Illustrations  
**Goal:** Dynamically show calm or chaotic artwork based on user task state and current season.

- [x] **ILLUST-001**: Display calm vs chaotic image

  - `calm.png` if no overdue tasks, `chaotic.png` if tasks overdue.

- [x] **ILLUST-002**: Detect season from system date

  - Map months to seasons to determine appropriate image variant.

- [x] **ILLUST-003**: Render image below greeting

  - Show image right under `{timeOfDay}` greeting and `{name}` block.

- [x] **ILLUST-004**: Future-proof naming convention
  - Use a dynamic key system like `season-timeOfDay-state.png`.

---

### 🛠️ Animation Bug Fixes

**Feature:** Overdue Task Animation Error  
**Goal:** Eliminate warnings and broken animations on task updates.

- [ ] **TASK-ANIM-001**: Diagnose useNativeDriver issue

  - Identify unsupported animated props like `height`.

- [ ] **TASK-ANIM-002**: Refactor height animation workaround

  - Use `scaleY`, visibility toggles, or container transitions instead.

- [ ] **TASK-ANIM-003**: Clean up shared animated node errors
  - Prevent node reuse between native and JS-driven animations.

---

## 🚧 In Progress

_(No items currently marked as in progress. Move tasks here once started.)_

---

## ✅ Completed

- [x] **AUTH-ANIM-001**: Expand animation to full screen area
- [x] **AUTH-ANIM-002**: Prevent layout twitch when switching inputs
- [x] **AUTH-ANIM-003**: Fix post-animation jump
- [x] **AUTH-ANIM-004**: Fade out background elements
- [x] **AUTH-ANIM-005**: Sync keyboard dismissal with UI
- [x] **AUTH-ANIM-006**: Minimize "Forgot Password" layout shift
- [x] **AUTH-ANIM-007**: Add password visibility toggle
- [x] **AUTH-ANIM-008**: Ensure password field is recognized correctly
- [x] **HOME-LOAD-001**: Wrap loader with gradient container
- [x] **ILLUST-001**: Display calm vs chaotic image
- [x] **ILLUST-002**: Detect season from system date
- [x] **ILLUST-003**: Render image below greeting
- [x] **ILLUST-004**: Future-proof naming convention

---
