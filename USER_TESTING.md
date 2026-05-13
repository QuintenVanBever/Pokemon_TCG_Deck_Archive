
**URL:** https://pokemon-tcg-deck-archive.pages.dev  

**Admin:** https://pokemon-tcg-deck-archive.pages.dev/admin

Mark each test: ✅ Pass · ❌ Fail · ⚠️ Partial · — Skip

---
## 1. Homepage (`/decks`)
### 1.1 Page load

| #   | Step                | Expected                                                       | Result |
| --- | ------------------- | -------------------------------------------------------------- | ------ |
| 1   | Open `/decks`       | Deck grid loads, status footer visible at bottom               | ✅      |
| 2   | Check footer        | Shows total real / proxy / missing / ordered card counts       | ✅      |
| 3   | Inspect a deck card | Shows energy-colored box, deck name, real% badge, progress bar | ✅      |
### 1.2 Deck fan

| #   | Step                              | Expected                                                 | Result |
| --- | --------------------------------- | -------------------------------------------------------- | ------ |
| 4   | Look at a deck with fan cards set | Shows 3 actual card images fanned at top of card         | ✅      |
| 5   | Look at a deck with no fan cards  | Shows 3 generic colored card placeholders                | ✅      |
| 6   | Hover over any deck               | Fan cards spread out / lift, deck box shifts with shadow | ✅      |

### 1.3 Filters

| #   | Step                           | Expected                               | Result |
| --- | ------------------------------ | -------------------------------------- | ------ |
| 7   | Click an energy type chip      | Grid filters to that energy type only  | ✅      |
| 8   | Click an era chip              | Grid filters to that era block only    | ✅      |
| 9   | Combine both filters           | Only decks matching both filters shown | ✅      |
| 10  | Click "All Types" + "All Eras" | Full grid restored                     | ✅      |
| 11  | Filter to era with 0 matches   | Empty state message shown, no crash    | ✅      |

  ### 1.4 Navigation to deck

| #   | Step                | Expected                    | Result |
| --- | ------------------- | --------------------------- | ------ |
| 12  | Click any deck card | Navigates to `/decks/$slug` | ✅      |

  ---

  ## 2. Deck Detail (`/decks/$slug`)

  ### 2.1 Page load

| #   | Step                          | Expected                                                        | Result |
| --- | ----------------------------- | --------------------------------------------------------------- | ------ |
| 13  | Open any deck                 | Card sleeve grid visible, grouped by Pokémon / Trainer / Energy | ✅      |
| 14  | Check card images             | Cards with pokemontcg_id show actual card art                   | —      |
| 15  | Navigate to non-existent slug | 404 / "not found" state, no crash                               | ✅      |

  ### 2.2 Sleeve grid & status

| #   | Step                    | Expected               | Result |
| --- | ----------------------- | ---------------------- | ------ |
| 16  | Inspect a real card     | Green sleeve styling   | ✅      |
| 17  | Inspect a proxy card    | Purple sleeve styling  | ⚠️     |
| 18  | Inspect a missing card  | Red sleeve styling     | ⚠️     |
| 19  | Inspect an ordered card | Blue sleeve styling    | ⚠️     |
| 20  | Card with qty > 1       | Shows multiple sleeves | ✅      |

  ---

  ## 3. Buy List (`/stats`)

| #   | Step                    | Expected                                        | Result |
| --- | ----------------------- | ----------------------------------------------- | ------ |
| 21  | Open `/stats`           | Table of cards that are missing/proxied/ordered | ✅      |
| 22  | Filter by era           | Table updates to that era's cards               | ✅      |
| 23  | Filter by supertype     | Table updates accordingly                       | ✅      |
| 24  | Toggle "Include custom" | Custom cards appear/disappear                   | ❌      |
| 25  | Check deck count column | Shows how many decks need each card             | ✅      |

  ---
 
## 4. Admin — Cards (`/admin/cards`)

  ### 4.1 Filtering

| #   | Step                  | Expected                                   | Result |
| --- | --------------------- | ------------------------------------------ | ------ |
| 26  | Open `/admin/cards`   | Full card catalog table loads              | ✅      |
| 27  | Type in Search box    | Table filters live by name or display name | ✅      |
| 28  | Filter by Supertype   | Shows only Pokémon / Trainer / Energy      | ✅      |
| 29  | Filter by Era         | Shows only cards in that era block         | ✅      |
| 30  | Combine all 3 filters | Correct intersection of results            | ✅      |
  
### 4.2 Import from TCG API

| #   | Step                                              | Expected                                             | Result |
| --- | ------------------------------------------------- | ---------------------------------------------------- | ------ |
| 31  | Click "↓ Import from TCG API"                     | Import panel expands                                 | ✅      |
| 32  | Type a card name (e.g. "Pikachu")                 | Search fires automatically, results appear within 1s | ❌      |
| 33  | Check result columns                              | Shows thumbnail, pokemontcg ID, name, set, type      | ❌      |
| 34  | Type a name with no results                       | Error message "No cards found for that name"         | ✅      |
| 35  | Optionally select an era block, then click Import | Card added to catalog                                | ❌      |
| 36  | Search again for same card                        | Imported card now in catalog with set info and image | —      |
| 37  | Click "✕ Close import"                            | Panel collapses                                      | ✅      |
 
### 4.3 Create card manually

| #   | Step                                | Expected                                          | Result |
| --- | ----------------------------------- | ------------------------------------------------- | ------ |
| 38  | Click "+ New card"                  | Full form expands                                 | ✅      |
| 39  | Fill in Name, Supertype, click Save | Card created, appears in table                    | ✅      |
| 40  | Leave name blank, click Save        | No crash (browser validation or graceful failure) | ❌      |
  ### 4.4 Edit card

| #   | Step                      | Expected                                | Result |
| --- | ------------------------- | --------------------------------------- | ------ |
| 41  | Click "Edit" on any card  | Form pre-fills with card's current data | ✅      |
| 42  | Change Display name, save | Table shows updated display name        | ✅      |
| 43  | Change Era block, save    | Card era updates                        | ✅      |
| 44  | Click "Cancel"            | Form closes, no changes saved           | ✅      |

  

### 4.5 Delete card

| #   | Step                    | Expected                | Result |
| --- | ----------------------- | ----------------------- | ------ |
| 45  | Click "Del" on any card | Confirm dialog shown    | ❌      |
| 46  | Confirm delete          | Card removed from table | ❌      |
| 47  | Cancel delete           | Card remains            | ❌      |

  

---

  

## 5. Admin — Formats (`/admin/formats`)

  ### 5.1 Page load

| #   | Step                  | Expected                                                | Result |
| --- | --------------------- | ------------------------------------------------------- | ------ |
| 48  | Open `/admin/formats` | Existing formats listed (Modified, Standard, Unlimited) | ✅      |
| 49  | Check columns         | Shows name, slug, regulation marks, legal sets count    | ✅      |
 
### 5.2 Create a regulation-based format

| #   | Step                                      | Expected                                                | Result |
| --- | ----------------------------------------- | ------------------------------------------------------- | ------ |
| 50  | Click "+ New Format"                      | Form expands                                            | ✅      |
| 51  | Type a name (e.g. "Standard 2025")        | Slug auto-fills as "standard-2025"                      | ❌      |
| 52  | Click letters E, F, G in Regulation Marks | Buttons highlight navy/yellow                           | ✅      |
| 53  | Check hint text below marks               | "Cards with marks E, F, G will be legal in this format" | ✅      |
| 54  | Click Save Format                         | New format appears in list with E F G mark chips        | ✅      |
 

### 5.3 Create a set-based format

| #   | Step                                                                            | Expected                                               | Result |
| --- | ------------------------------------------------------------------------------- | ------------------------------------------------------ | ------ |
| 55  | Click "+ New Format"                                                            | Form expands                                           | ✅      |
| 56  | Type a name (e.g. "Modified HGSS-on")                                           |                                                        | ✅      |
| 57  | Check the Legal Sets browser                                                    | Loads ~200 sets from pokemontcg.io                     | ✅      |
| 58  | Type "HeartGold" in the set search                                              | Filters to HGSS sets                                   | ✅      |
| 59  | Click "+ Add" on HeartGold & SoulSilver, Undaunted, Unleashed, Triumphant, etc. | Sets appear as chips above the browser                 | ✅      |
| 60  | Click "×" on one chip                                                           | Set removed from selection                             | ✅      |
| 61  | Click Save Format                                                               | Format saved, list shows "X sets" in Legal Sets column | ✅      |

  ### 5.4 Edit format

| #   | Step                          | Expected                              | Result |
| --- | ----------------------------- | ------------------------------------- | ------ |
| 62  | Click Edit on existing format | Form pre-fills marks + sets correctly | ✅      |
| 63  | Add/remove marks or sets      | Changes reflected in chips            | ✅      |
| 64  | Save                          | Format updated                        | ✅      |
  ### 5.5 Delete format

| #   | Step      | Expected                                | Result |
| --- | --------- | --------------------------------------- | ------ |
| 65  | Click Del | Confirm dialog with warning about decks | ✅      |
| 66  | Cancel    | Format remains                          | ✅      |

  

---

  

## 6. Admin — Decks (`/admin/decks`)

  ### 6.1 Create deck

| #   | Step                                                     | Expected                     | Result |
| --- | -------------------------------------------------------- | ---------------------------- | ------ |
| 67  | Click "+ New Deck"                                       | Form expands                 | ✅      |
| 68  | Fill Name (slug auto-fills), pick Era Block, Energy Type |                              | ✅      |
| 69  | Click Create Deck                                        | Deck appears in list         | ✅      |
| 70  | Try creating with no name                                | Disabled or validation error | ⚠️     |
 
### 6.2 Deck list

| #   | Step           | Expected                                                         | Result |
| --- | -------------- | ---------------------------------------------------------------- | ------ |
| 71  | Check deck row | Shows name, era badge, energy, format, real/proxy/missing counts | ⚠️     |
| 72  | Click Edit     | Navigates to `/admin/decks/$slug/edit`                           | ✅      |
  

---

  

## 7. Admin — Deck Edit (`/admin/decks/$slug/edit`)

  ### 7.1 Metadata

| #   | Step                    | Expected                                                 | Result |
| --- | ----------------------- | -------------------------------------------------------- | ------ |
| 73  | Open any deck edit page | Metadata form pre-filled                                 | ✅      |
| 74  | Change format dropdown  | Format updates in form (card search will use new format) | ✅      |
| 75  | Click "Save metadata"   | ✓ Saved confirmation appears briefly                     | ✅      |
| 76  | Reload page             | Changes persisted                                        | ✅      |
|     |                         |                                                          |        |

  ### 7.2 Format-filtered card search

| #   | Step                                                | Expected                                                    | Result |
| --- | --------------------------------------------------- | ----------------------------------------------------------- | ------ |
| 77  | Ensure deck has a format with legal sets configured |                                                             | —      |
| 78  | In "Add card" box, type a card name                 | Only shows cards whose set_id is in the format's legal sets | —      |
| 79  | Change format to "— none —", save metadata          | Card search shows all cards in catalog                      | —      |
| 80  | Set back to regulation-based format                 | Card search shows only cards with matching regulation mark  | ❌      |

  ### 7.3 Adding cards

| #   | Step                                    | Expected                                     | Result |
| --- | --------------------------------------- | -------------------------------------------- | ------ |
| 81  | Type a card name in the search box      | Dropdown appears with matching cards         | ✅      |
| 82  | Card shows thumbnail + name + supertype |                                              | ✅      |
| 83  | Click a card                            | Added to deck list with qty real=1, others=0 | ✅      |
| 84  | Try adding same card twice              | No duplicate (already in deck)               | ✅      |

  ### 7.4 Deck size guardrail

| #   | Step                                 | Expected                                                                                            | Result |
| --- | ------------------------------------ | --------------------------------------------------------------------------------------------------- | ------ |
| 85  | Set intended size to e.g. 5          |                                                                                                     | ❌      |
| 86  | Add cards until total would exceed 5 | Red error banner appears with message "Adding this card would bring the deck to X cards (limit: 5)" | ❌      |
| 87  | Size counter in card list header     | Turns red when total > intended_size                                                                | ❌      |

  

### 7.5 Quantity editing

| #   | Step                                                   | Expected                            | Result |
| --- | ------------------------------------------------------ | ----------------------------------- | ------ |
| 88  | Change a quantity spinner (real/proxy/missing/ordered) | "Save" button appears for that row  | ✅      |
| 89  | Click Save                                             | Row updates, Save button disappears | ✅      |
| 90  | Set all qty to 0                                       | Total shown as 0                    | ✅      |
| 91  | Don't click Save, navigate away, come back             | Unsaved changes lost (expected)     | ✅      |

  

### 7.6 Fan slot

| #   | Step                                                                       | Expected                                             | Result |
| --- | -------------------------------------------------------------------------- | ---------------------------------------------------- | ------ |
| 92  | Set Fan = 1 on one card, Fan = 2 on another, Fan = 3 on a third, Save each |                                                      | ✅      |
| 93  | Navigate to public `/decks/$slug` homepage                                 | 3 real card images show in the fan                   | ✅      |
| 94  | Set one fan slot to "—", save                                              | That slot reverts to generic placeholder on homepage | ✅      |
| 95  | Try setting same fan slot number on two cards                              | Second save should overwrite first (last write wins) | ✅      |
 

### 7.7 Remove card

| #   | Step                         | Expected                           | Result |
| --- | ---------------------------- | ---------------------------------- | ------ |
| 96  | Click ✕ on any card row      | Card removed from deck immediately | ✅      |
| 97  | Deck count in header updates | Reflects new total                 | ✅      |
  

---

  

## 8. Navigation & General
 
| #   | Step                                   | Expected                                   | Result |
| --- | -------------------------------------- | ------------------------------------------ | ------ |
| 98  | Click "Deck Archive" logo              | Navigates to `/decks`                      | ✅      |
| 99  | Click "Buy List" nav link              | Navigates to `/stats`                      | ✅      |
| 100 | Click "Admin ↗" button                 | Navigates to `/admin/decks`                | ✅      |
| 101 | Click "← Public site" in admin sidebar | Navigates to `/decks`                      | ✅      |
| 102 | All admin sidebar links                | Decks / Cards / Formats navigate correctly | ✅      |
| 103 | Resize browser to narrow viewport      | No major layout breakage on public pages   | ✅      |
 

---

  

## 9. Edge Cases & Stress Tests

| #   | Step                                             | Expected                                        | Result |
| --- | ------------------------------------------------ | ----------------------------------------------- | ------ |
| 104 | Card with no image                               | No broken image icon, graceful empty slot       | ✅      |
| 105 | Deck with 0 cards                                | Deck detail shows empty state, no crashes       | ✅      |
| 106 | Format with no legal sets or marks               | Card search shows all cards (no filter applied) | ✅      |
| 107 | Import a card that already exists                | Silently updates image/set data, no duplicate   | ✅      |
| 108 | Delete a card that's in a deck                   | — (note what happens)                           | ❌      |
| 109 | Very long deck name                              | Truncated in homepage grid, no overflow         | ❌      |
| 110 | Set intended_size to 1, add 1 card               | Works normally                                  | ❌      |
| 111 | Type garbage in regulation marks search          | No crash                                        | ❌      |
| 112 | Open format editor, switch away before sets load | No crash on return                              | ❌      |

  ---

## 10. Bug Log

| # | Date | Area | Description | Severity | Status |
|---|------|------|-------------|----------|--------|
| | | | | | |
| | | | | | |
| | | | | | |
 

---

  ## Notes

- **Card filter only applies when searching to add cards** — the existing cards in a deck are not retroactively removed when format changes.
- **Regulation marks on cards** are populated from pokemontcg.io at import time. Older cards manually created before the import update will have `regulation_mark = null` and won't appear in regulation-filtered searches.
- **Fan slot "last write wins"** — there's no uniqueness constraint on fan_slot per deck in the DB, so assigning the same slot to two cards and saving both will result in both being stored; the homepage will just show the last one for that slot.