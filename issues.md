# Issues
The next set of issues and features. Use the same logic as before when we did the issues.md file which is now located in /archive.

in /screenshots, you will find pictures taken from the website to display the issues mentioned below.

## UX/Styling
* the previously implemented proxy and missing overlay is too dark. You are not able to see the card behind well.
    * Make the proxy overlay a strip instead of a full card overlay
    * Lower the opacity a bit more to make it clearer
    * the missing/proxy text should be a bit higher and the strip can be a bit bigger too 
* If the card has the placeholder back of the card, add the show the display name + ptcg api id over the card
* The dropshadow in the title is making it hard to read
    * /screenshots/logo_dropshadow_issue.png
* Let's double check responsiveness on all pages
* There is no favicon, I like the DA used as the temporary logo for now to be a favicon as well

## Features
* The card search feature in admin/decks/<slug> is wonky design wise / does not convey what I wanted.
    * The filters should automatically be set by the format or block the deck is in, allowing users to overwrite with the existing "block"
* Possibility to have Multiple cards to be counted as 1 card in the stats page
    * Cards can have multiple prints
    * Use Ultra ball here for testing as this is a very prevelant card
    * I want the cards the be able to be split and aggregated, this can be a toggle on the table, something like "split card versions"
* Card counters on the deck edit page are not as nice as I want
* Add a password to be able to reach the admin pages, no need for a full account, just a securely stored password to keep the admin away from people who do not need to be there
* the formats tab is both uneditable and still not working well, let's discuss on how to fix this
* the Blocks & eras tab in the /admin pages is also broken
    * Blocks/eras should also be able to be added/removed
    * Sets are part of blocks/eras, allow me to add sets in blocks or link a set to a blcok
* Import decks feature in admin. there is a standard convention used by tcg live and the community, allow the admin to use this convention to create decks
    * an example can be found in screenshots/paste_example.txt
    * If cards are missing in the database, It should give a popup and show which cards it will add before creating the deck
* the deck edit page has a "Primer" field, explain to me what the idea was here and why this has not been implement on the frontend?

# Era VS Format VS Block 
This is the most important thing we need to clean up. We have been using the 3 terms together and it has not always been clear what has been meant. Here we will have the definitive explanation of each term. Make sure to scan the site afterwards and update all mentions to this definition. 

Make sure to ask more questions so I know you understand what has been written here and we can make correct changes

* Era: A period in time of the game that a certain set of gimmick(s) were central to this timeframe. This can most often be described as a  
* Block: A Block is a format where all sets of an era are allowed to be played in. The name "block" is a community name given to this kind of format as this was never an original format, but rather a result of players going back to play a group of cards that were ment to be played together according to the game designers.
* Format: A format is a collection of sets, where only the cards in these sets are allowed to be played with. 

## Creating Eras
Eras are a period in time. as these are pretty set in stone, they must require the admin user to create them to display on the site. Eras often have their own set of rules and require some explaining, the admin must be able to write this text.

in /screenshots/format_detail_page.png you can see how this explanation page looks like currently, but this is not editable. Lets discuss if this is something we want to do hardcoded or not

## Creating Blocks 
As mentioned by our new definition, a block is nothing more than a format where all cards of a certain era are legal. As these are a format, the admin user will create them as if they were a format and select all sets corresponding to this block themselves, as they would when creating any normal format. Allow the admin 

## Formats interacting with eras
Most of the time formats are a subset of an era. it does however happen that formats have sets from 2 different eras. This natural quirk of the evolving game must be visible. As a general rule of thumb, the lastest era is where this format belongs to. 
Example: the first BW set is released, and the format now exists of card from the HGSS era and the BW era. The rules have changed with this new release, thus we are now playing with rules of the BW era, thus this is a format of the BW era. This should be set by the user, while also allowing to make an annotation that there are cards in this format from the previous era.

## Cards interacting with formats
As cards are part of sets and sets are part of formats, a link between them is not farfetched. This instance will be most prevelant in the deck edit feature, where the filters will have to be set automatically, so the admin user can only select cards that are in the format the deck is supposed to be in.

## Cards interacting with eras
As cards are part of sets, when adding cards to the database, they should automatically fall into a certain era, this connection should be able to be made when importing the card by user input.