# Issues

## Styling/UX
* ~~On the deck overview page, make the 100% the full 60 cards~~ ✓
* ~~Let's update the "Playability" status logic~~ ✓ (wip = missing or incomplete; playable = full + no missing; awaiting = full + some ordered)
* ~~The proxy sleeve: smaller, more orange, bigger text~~ ✓
* ~~Missing cards: bigger text~~ ✓


## Features
* ~~On the admin deck edit page, era filters the format dropdown; Type field moved before Era~~ ✓
* ~~Multiple energy types per deck~~ ✓ (multi-select chip toggle in admin edit; dots shown on deck cards; filter matches any assigned type)

* Admin password — protect the /admin routes behind a simple password gate so the admin area isn't open to anyone with the URL

* Deck import from TCG Live paste — parse the clipboard/text format that Pokémon TCG Live exports (e.g. 4 Charizard ex SVI 6) and auto-create deck cards from it, skipping the manual card-by-card add flow

* Split card versions in the buy list — the buylist currently groups all copies of a card by name regardless of set; this would split them by specific set/version so you can track which printing you need