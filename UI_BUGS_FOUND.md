# UI Bugs Found - Mobile & Desktop Issues

## 🔴 CRITICAL BUGS

### 1. **Z-Index Layering Issue (Controls Bar vs Mobile Nav)**
**Location**: `static/css/style.css` lines ~550 and ~673

**Problem**: 
- Controls bar: `z-index: 100` at `bottom: 0` (fixed)
- Mobile bottom nav: `z-index: 99` at `bottom: 60px` (fixed)
- Mobile nav (z-99) appears BEHIND controls bar (z-100)
- This causes mobile navigation to be unreachable/hidden

**Fix**: Change mobile-bottom-nav to `z-index: 101` to appear above controls bar

```css
.mobile-bottom-nav {
  z-index: 101;  /* CHANGED from 99 */
}
```

---

### 2. **Fixed Element Positioning Mismatch (Mobile)**
**Location**: `static/css/style.css` lines ~550, ~673

**Problem**:
- Controls bar: `position: fixed; bottom: 0;` (approximately 56px tall)
- Mobile nav: `position: fixed; bottom: 60px; height: 48px;`
- These are two separate fixed elements with hardcoded `bottom` values
- They can overlap if controls bar height changes (due to padding/content)

**Current spacing**:
- Bottom 0-56px: Controls bar
- Bottom 56-104px: Should be mobile nav (but positioned at bottom: 60px)
- **GAP**: 4px overlap possible

**Fix**: Make mobile nav account for actual controls bar height dynamically

---

### 3. **Reading Area Padding Insufficient**
**Location**: `static/css/style.css` line ~470

**Problem**:
```css
.reading-main {
  padding: 0.75rem 1rem 5.5rem 1rem;  /* 5.5rem = 88px */
}
```

**Issue**: 
- Controls bar: ~56px
- Mobile nav: 48px
- Total needed: ~104px (to avoid content being hidden behind fixed elements)
- Currently: 88px (missing ~16px)

**Fix**: Increase padding-bottom

```css
.reading-main {
  padding: 0.75rem 1rem 6.5rem 1rem;  /* 6.5rem = 104px */
}
```

---

## 🟡 MODERATE BUGS

### 4. **Mobile Bottom Nav Hidden Below Fold on Desktop**
**Location**: `static/css/style.css` line ~695

**Problem**: Mobile nav should be completely hidden on desktop, but CSS only has:
```css
@media (min-width: 768px) {
  .mobile-bottom-nav {
    display: none;  /* ✓ Good */
  }
}
```
This works, but bottom nav sits at `bottom: 60px` which assumes controls-bar exists. On desktop where controls-bar is `position: relative`, this positioning breaks.

**Already handled** (display: none works), but fragile.

---

### 5. **Controls Bar Height Not Consistent**
**Location**: `static/css/style.css` line ~548-570

**Problem**:
```css
.controls-bar {
  height: auto;  /* Undefined height */
  padding: 0.5rem;  /* 8px total */
  /* 40px buttons + 8px padding = ~48px minimum */
}
```

On mobile, button heights are 40px (regular) and 48px (play). With padding, total height varies.

**Fix**: Explicitly set minimum height on mobile

```css
.controls-bar {
  height: auto;
  min-height: 56px;  /* Explicit minimum */
  padding: 0.5rem;
}
```

---

### 6. **Mobile Nav Positioning Breaks on Content Scroll**
**Location**: HTML structure and mobile nav positioning

**Problem**:
- Mobile nav has `position: fixed; bottom: 60px`
- When user scrolls horizontally (shouldn't happen but might), nav stays fixed
- When content is very short, nav might appear in unexpected places

**Scenario**: If page has minimal content, mobile nav could appear mid-screen.

---

## 🟠 MINOR BUGS

### 7. **Play Button Size Inconsistency**
**Location**: `static/css/style.css` lines ~594-5

**Problem**: Play button is larger (48px) than other buttons (40px)
```css
.ctrl-btn { width: 40px; height: 40px; }
.ctrl-btn.play-btn { width: 48px; height: 48px; }
```

On mobile with flex centering, this creates visual misalignment. Button should all be uniform size.

**Recommendation**: Make all buttons 44px on mobile (iOS standard)

---

### 8. **Voice Select Dropdown Text Overflow**
**Location**: HTML `<select id="voiceSelect">` and CSS `static/css/style.css`

**Problem**: 
```css
.voice-select {
  max-width: 200px;  /* Limited width on mobile */
  font-size: 0.75rem;
}
```

On mobile (< 300px width), 200px dropdown takes 2/3 of screen. Text gets cut off.

**Fix**: Make responsive
```css
.voice-control {
  display: none;  /* Already hidden on mobile - GOOD */
}
```

Actually this is already handled correctly!

---

## ✅ SUMMARY OF FIXES NEEDED

| Priority | Issue | Fix |
|----------|-------|-----|
| 🔴 CRITICAL | `mobile-bottom-nav` z-index too low | Change z-index from 99 to 101 |
| 🔴 CRITICAL | `reading-main` padding insufficient | Increase padding-bottom from 5.5rem to 6.5rem |
| 🔴 CRITICAL | Controls bar positioning hardcoded | Set explicit min-height: 56px |
| 🟡 MODERATE | Mobile nav positioning fragile | Consider dynamic positioning via JS |
| 🟠 MINOR | Play button size different | Standardize to 44px |

---

## 📱 Testing Checklist

- [ ] Test on mobile (< 480px): Verify mobile nav visible and accessible
- [ ] Test on tablet (480-768px): Verify layout transition smooth
- [ ] Test on desktop (> 768px): Verify mobile nav hidden, layout correct
- [ ] Scroll reading content: Verify no overlap with bottom nav
- [ ] Click all bottom nav tabs: Verify panels show/hide correctly
- [ ] Play/stop audio: Verify controls are clickable and don't overlap

