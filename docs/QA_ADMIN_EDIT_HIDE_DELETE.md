# QA Report: Admin Panel — Edit, Hide, Delete

## Scope
All admin panels that expose **Edit**, **Hide** (Show), and **Delete** actions.

---

## 1. Memories Panel ✅

| Action | Implementation | Status |
|--------|----------------|--------|
| **Edit** | Opens `MemoryForm` with `memory={editing}`; form calls `supabase.from('memories').update(formData).eq('id', memory.id)` on submit. | ✅ Correct |
| **Hide** | `handleToggleVisibility` → `update({ visible: !memory.visible }).eq('id', memory.id)` then `loadMemories()`. | ✅ Correct |
| **Delete** | `confirm()` then `delete().eq('id', id)` then `loadMemories()`. | ✅ Correct |

- Form: Add uses `insert([formData])`; Edit uses `update(formData).eq('id', memory.id)`. Both call `onSave()` and `onClose()`.
- List shows “Hidden” overlay when `!memory.visible`.

---

## 2. Letters Panel ✅

| Action | Implementation | Status |
|--------|----------------|--------|
| **Edit** | Opens `LetterForm` with `letter={editing}`; form uses `update(formData).eq('id', letter.id)` or `insert([formData])`. | ✅ Correct |
| **Hide** | `handleToggleVisibility` → `update({ visible: !letter.visible })` then `loadLetters()`. | ✅ Correct |
| **Delete** | `confirm()` then `delete().eq('id', id)` then `loadLetters()`. | ✅ Correct |

- Reorder (↑↓): Uses `orderA` / `orderB` (no state mutation), two `update` calls, then `loadLetters()`. ✅ Fixed (was mutating array in place).
- List shows “(Hidden)” when `!letter.visible`.

---

## 3. Poems Panel (River of Poem) ✅

| Action | Implementation | Status |
|--------|----------------|--------|
| **Edit** | Opens `PoemForm` with `poem={editing}`; form uses `update(formData).eq('id', poem.id)` or `insert([formData])`. | ✅ Correct |
| **Hide** | `handleToggleVisibility` → `update({ visible: !p.visible })` then `loadPoems()`. | ✅ Correct |
| **Delete** | `confirm()` then `delete().eq('id', id)` then `loadPoems()`. | ✅ Correct |

- Reorder: Same pattern as Letters; switched to non-mutating swap. ✅ Fixed.
- List shows “(Hidden)” when `!poem.visible`.

---

## 4. Surprises Panel ✅

| Action | Implementation | Status |
|--------|----------------|--------|
| **Edit** | Opens `SurpriseForm` with `surprise={editing}`; form uses `update(payload).eq('id', surprise.id)` or `insert([payload])`. | ✅ Correct |
| **Hide** | `handleToggleVisibility` → `update({ visible: !surprise.visible })` then `loadSurprises()`. | ✅ Correct |
| **Delete** | `confirm()` then `delete().eq('id', id)` then `loadSurprises()`. | ✅ Correct |

- List shows “(Hidden)” when `!surprise.visible`.

---

## 5. Daily Messages Panel ✅ (no Delete)

| Action | Implementation | Status |
|--------|----------------|--------|
| **Edit** | Inline: `DailyMessageRow` has a textarea; `onBlur` calls `onUpdateMessage(id, localValue)` → `update({ message: trimmed }).eq('id', id)`. | ✅ Correct |
| **Hide** | Toggle button → `update({ visible: !msg.visible })`; label “Visible” / “Hidden”. | ✅ Correct |
| **Delete** | Not implemented (by design; panel has Add + Edit + visibility only). | N/A |

---

## 6. Games Panel (Edit only)

- **Edit Success Message**: Inline edit state; save calls `update({ success_message }).eq('id', game.id)`. No Hide/Delete for games. ✅ As designed.

---

## Fixes applied

1. **LettersPanel / PoemsPanel reorder**  
   Reorder logic no longer mutates the `letters` / `poems` state array. It uses local variables `orderA` / `orderB` and two `update` calls, then refetches. This avoids subtle bugs if refetch failed and keeps React state predictable.

---

## Manual test checklist

1. **Memories**: Add → Edit (change title, save) → Hide → Show → Delete (confirm). Reload and confirm list matches DB.
2. **Letters**: Add → Edit → Hide → Show → Reorder ↑↓ → Delete. Confirm order and visibility on World map (Love Letter House).
3. **Poems**: Add → Edit → Hide → Show → Reorder → Delete. Confirm in River of Poem on World map.
4. **Surprises**: Add (message/audio/image) → Edit → Hide → Show → Delete. Confirm on Star Hill.
5. **Daily Messages**: Add → edit text in textarea, blur → Toggle Visible/Hidden. Confirm “Today’s message” on World.
6. **Games**: Edit success message, save. Confirm in Game Arcade after winning.

---

## Supabase RLS

- Tables `memories`, `letters`, `poems`, `surprises`, `daily_messages`, `games` use RLS with policies that allow **update** and **delete** (e.g. “Allow public update/delete …” with `USING (true)` or equivalent) so the anon key used by the admin can perform these actions. If any Edit/Hide/Delete fails with a permission error, add or adjust the corresponding policy in Supabase.
