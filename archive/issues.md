# Issues after user testing
I used the user testing document to gather these issues, These will have to be fixed in a future version. Check all the issues i have mentioned here and provide me a plan we can use to fix them.

## Copywriting
* Capitalize all references to energy types.
* Refer to type instead of "energy type"
* The navigation refers to "buy list" and has the path "stats". I would like the header to be updated to say Stats.
* Era and Block are both used, stick to 1, I prefer block 

## Styling/UX
* Get the backside of a pokemon card to use as a placeholder if the card does not have an image
* Not all type filters have a colored square next to it, make it consistent
* The color of the darkness type is too close to psychic, make it darker
* When editing cards in a deck, the layout shifts to the left to make space for the save button. move the delete and save to the right
    * Add confirmation method on the deletion. Maybe require an extra click or something, talk me through options we could have here
    * The tables don't match up either between card tpes, they should be aligned horizontally as well
    * The cards are squished and barely visible, fix the ratio and allow the user to hover over the card image to view the image better
* On the deck detail page, the missing cards overlay are too dark,
* The ordered overlay is too light, not really visible
* Both the missing and proxy are using 2 different colors in the counts and the top and in the overlay.
    * For the overlay of proxy cards, I would like your thoughts of a "construction tape" with proxy written on it
    * for the missing cards, i would gray them out and put a small black banner with "missing" over them. any thoughts on this?
* There are no hover effects on any button, a very light feedback to the user would be nice
* No feedback to the user when creating an invalid deck in /admin/decks
* No feedback when the user tries to add a duplicate card in a deck
* No ordered count on /admin/decks
    * Would be nice to show somewhere
* Hovering over a card feature in deck detail page barely makes the card readable, keep the hover but add a click that expands/shrinks the card to make it more readable 


## Cards
* Unown N is being used for N the trainer card. N the supporter card is a special case itself, provide possible solutions for handling the card "N"
* Many cards are the wrong card of the pokemon, often the first instance was found, this is good, I will fix this later, but provide options to have some guardrails in the future
* I want to be able to sort the tables on the stats page

## Features
* Add all types to the type filters by default, even if there are no decks to be able to displayed
* Add a live count in the edit deck mode, So i know where I am going over.
* In the deck detail page, let's make all formats close if we are not looking at a deck of this format. make this a toggle that we can open/close this
* Put the format of which we are looking at a deck from at the top
* The stats page "Aggregated buy list", has a filter for era, I also want to have a filter on sets.
    * Remove the "era" column from the table
    * Make the era filter a dropdown
* Custom cards are missing from the stats page
* Deleting a card gives a 500 on /admin/cards
    * Show a custom popup that tells me in what decks this card is in
    * Allow me to delete the card even if it is in decks, after confirming on the previously mentioned popup. This should delete all the cards in the decks as well.
    * If a card is not in a deck show the same popup but mention that this card is not in any deck
* Add basic energies that are format and era agnostic, so they can always easily be added
* Card search to pokemontcgapi is broken. Fix and expand on the search. Here are the docs: https://docs.pokemontcg.io/
    * Add a set search so i can multiple cards from a set
* You are able to create a blank card with no name, this should not be the case
* In admin, formats and eras/blocks should be together 
* Allow to edit the era/block on decks in /admin/decks/<slug>
* The filter on the cards does not work for the Blocks, this should be added in /admin/decks/<slug>
* Deck guardrails do not work for maximum count of a card

## Future features
* Possibility to have Multiple cards to be counted as 1 card in the stats page
    * Cards can have multiple prints
    * Use Ultra ball here for testing as this is a very prevelant card
    * I want the cards the be able to be split and aggregated, this can be a toggle on the table, something like "split card versions"
* Card counters on the deck edit page are not as nice as I want
* Add a password to be able to reach the admin pages, no need for a full account, just a securely stored password to keep the admin away from people who do not need to be there
