// Description:
//   A simple bot that queries the deckbrew service for specific cards.
//
// Commands:
//   hubot gatherer [card name] - queries the card service and returns the first card the query found
//
// Notes:
//   <optional notes required for the script>
//
// Author:
//   HerrPfister and wickerpopstar

module.exports = function (robot) {

  // As of right now, we are just capturing everything after the gatherer command.
  // However, later we can make it more customizable if we want.
  // i.e. getting subtypes, color, rarity, etc.
  robot.respond(/gatherer\s+(.*)/i, function (res) {

    // Grab the captured user's input
    var cardName = res.match[1];

    robot.http('https://api.deckbrew.com/mtg/cards?name=' + cardName)
      .header('Accept', 'application/json')
      .get()(function(error, response, body) {
          if (error) {
            res.send('There was an issue with your request. Please try again later.');
          } else {
            var displayCount = 5;
            var cards = JSON.parse(body);

            // If there are multiple matches from a search, and no exact match,
            // print a list of the names of the first 5 cards (or fewer if
            // there are fewer than five results) in alphabetical order
            if (cards.length > 1) {
              var numOut = displayCount < cards.length ? displayCount : cards.length;
              res.send('Displaying top ' + numOut + ' of ' + cards.length + ' : \n');

              // ToDo: Instead of just text, this can be a gatherer link.
              for (var i = 0; i < numOut; i++) {
                res.send(cards[i].name);
              }

              var remaining = cards.length - numOut;
              if (remaining > 0)
                res.send("...\n" + remaining + ' other results matching search: "' + cardName + '"');
            }
            else
            {
              var card = cards[0];

              if (card) {
                // Get first multiverse_id that isn't 0 (non-set editions don't have a multiverse_id)
                var multiverse_id = '0';
                var cardImage;

                for (var k = 0; k < card.editions.length; k++) {
                  if (card.editions[k].multiverse_id !== '0') {
                    multiverse_id = card.editions[k].multiverse_id;
                    cardImage = card.editions[k].image_url;
                    break;
                  }
                }
                // If the object has an image print that. Otherwise, print the rules data.
                if (cardImage){
                    res.send(cardImage);
                }
                else {
                    res.send(card.name);
                    res.send(card.cost);
                    res.send(card.types);
                    res.send(card.subtypes);
                    res.send(card.text);
                    if (card.power)
                      res.send(card.power + "/" + card.toughness);
                }
                // Add link to view in Gatherer
                var gathererText = "View in Gatherer";
                var gathererLink = gathererText.link('http://gatherer.wizards.com/Pages/Card/Details.aspx?multiverseid=' + multiverse_id);
                res.send(gathererLink);
              } else {
                res.send('We could not find the card ' + cardName + '. Please try again.');
              }
            }
          }
        });

  });
};
