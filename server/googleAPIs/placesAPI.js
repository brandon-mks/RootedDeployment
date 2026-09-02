import { createBusiness } from "../db/queries/businesses.js";
import "dotenv/config";
import { dummyData } from "../db/db_dummy_data.js";

/**These functions are to filter the
 * Google Places API response data
 * to exclude widely known national
 * and international chains.
 *
 * Only places that do not have a match
 * to the chains in the arrays will be
 * returned and stored in the DB.
 */
const chains = {
  restaurants: [
    "a&w",
    "cava",
    "chipotlemexicangrill",
    "panera",
    "panerabread",
    "pandaexpress",
    "dunkin",
    "7eleven",
    "85cbakerycafe",
    "a&wrestaurants",
    "arbys",
    "auntieannes",
    "bigboyrestaurants",
    "blazepizza",
    "boosterjuice",
    "burgerking",
    "carlsjr",
    "chefette",
    "chickfila",
    "churchstexaschickentexaschicken",
    "cinnabon",
    "dairyqueen",
    "daveshotchicken",
    "dodopizza",
    "dominos",
    "dominospizza",
    "dunkindonuts",
    "fiveguys",
    "hardees",
    "hesburger",
    "jollibee",
    "kfc",
    "krispykreme",
    "littlecaesars",
    "longjohnsilvers",
    "marcospizza",
    "maxhamburgers",
    "mcdonalds",
    "nordsee",
    "pandaexpress",
    "panera",
    "papajohns",
    "peterpiperpizza",
    "pitapit",
    "thepizzacompany",
    "pizzahut",
    "pizzainn",
    "pollocampero",
    "pollotropical",
    "popeyes",
    "quiznos",
    "raisingcaneschickenfingers",
    "sbarro",
    "subway",
    "sweetfrog",
    "tacobell",
    "tcby",
    "timhortons",
    "wendys",
    "wetzelspretzels",
    "whataburger",
    "wienerschnitzel",
    "wingstop",
    "wingstreet",
    "amatos",
    "andysfrozencustard",
    "arbys",
    "arcticcirclerestaurants",
    "arthurtreachers",
    "auntieannes",
    "bajafresh",
    "barberitos",
    "blakeslotaburger",
    "blimpie",
    "bojangles",
    "bonchonchicken",
    "braums",
    "burgerking",
    "burgerstreet",
    "burgerfi",
    "burgerville",
    "captaindsseafoodkitchen",
    "carinositalian",
    "carlsjr",
    "charleysphillysteaks",
    "checkersandrallys",
    "cheddarsscratchkitchen",
    "chesters",
    "chickfila",
    "chickenexpress",
    "churchstexaschicken",
    "cookout",
    "culvers",
    "dairyqueen",
    "daveshotchicken",
    "daylightdonuts",
    "deltaco",
    "dibellas",
    "duchess",
    "dunkindonuts",
    "earthburger",
    "eegees",
    "einsteinbrosbagels",
    "elchico",
    "elpolloloco",
    "eltacotote",
    "erbert&gerberts",
    "farmerboys",
    "fivedaughtersbakery",
    "fiveguysburgersandfries",
    "fostersfreeze",
    "freddysfrozencustard&steakburgers",
    "godfatherspizza",
    "goldstarchili",
    "goldenchick",
    "goodtimesburgers&frozencustard",
    "greenburritoredburrito",
    "guthries",
    "thehabitburgergrill",
    "thehalalguys",
    "hardees",
    "honeydewdonuts",
    "hooters",
    "hotnnow",
    "huddlehouse",
    "thehumanbean",
    "hungryhowiespizza",
    "huntbrotherspizza",
    "ihop",
    "innoutburger",
    "jackinthebox",
    "jacks",
    "jambajuice",
    "jasonsdeli",
    "jetspizza",
    "jerseymikessubs",
    "jimsrestaurants",
    "jimmyjohns",
    "joescrabshack",
    "johnnyrockets",
    "jollibee",
    "kewpee",
    "kfc",
    "kingsseafoodcompany",
    "krispykreme",
    "krispykrunchychicken",
    "krystal",
    "l&lhawaiianbarbecue",
    "lamarsdonuts",
    "larosaspizzeria",
    "lepainquotidien",
    "ledopizza",
    "leesfamousrecipechicken",
    "legalseafoods",
    "lionschoice",
    "littlecaesarspizza",
    "logansroadhouse",
    "longjohnsilvers",
    "maidrite",
    "marcospizza",
    "mcalistersdeli",
    "mcdonalds",
    "themeltingpot",
    "miloshamburgers",
    "misterdonut",
    "modpizza",
    "moessouthwestgrill",
    "mooyah",
    "mrbeastburger",
    "mrsfields",
    "mrswinnerschicken&biscuits",
    "nathansfamous",
    "noodles&company",
    "theoldspaghettifactory",
    "onthebordermexicangrill&cantina",
    "orangejulius",
    "originaltommys",
    "pals",
    "panerabread",
    "pandaexpress",
    "papaginos",
    "papajohnspizza",
    "papamurphys",
    "parisbaguette",
    "penguinpoint",
    "pennstationeastcoastsubs",
    "perkinsrestaurant&bakery",
    "peterpiperpizza",
    "pieology",
    "pizzahut",
    "pizzainn",
    "pizzaranch",
    "planetsmoothie",
    "pollotropical",
    "popeyes",
    "portofsubs",
    "portillos",
    "potbellysandwichworks",
    "qdoba",
    "quiznosclassicsubs",
    "raisingcaneschickenfingers",
    "rax",
    "redlobster",
    "redrobin",
    "ritasitalianice",
    "robeks",
    "romanosmacaronigrill",
    "rosatis",
    "roundtablepizza",
    "royrogersrestaurants",
    "rubioscoastalgrill",
    "rubytuesday",
    "runza",
    "saladandgo",
    "saladworks",
    "saltgrasssteakhouse",
    "sarkujapan",
    "sbarro",
    "schlotzskys",
    "seattlesbestcoffee",
    "shakeshack",
    "shakeyspizza",
    "shipleydonuts",
    "shoneys",
    "sizzler",
    "skylinechili",
    "slimchickens",
    "smashburger",
    "smoothieking",
    "sneakypetes",
    "sonicdrivein",
    "spaghettiwarehouse",
    "spangles",
    "starbucks",
    "steakescape",
    "steaknshake",
    "stircrazy",
    "subway",
    "superdeluxe",
    "sweetgreen",
    "swensens",
    "swensons",
    "tacobell",
    "tacobueno",
    "tacocabana",
    "tacodelmar",
    "tacojohns",
    "tacomayo",
    "tacotico",
    "tacotime",
    "tasteefreeze",
    "tgifridays",
    "togos",
    "toppotdoughnuts",
    "tropicalsmoothiecafe",
    "tudorsbiscuitworld",
    "twinpeaks",
    "umamiburger",
    "valentinos",
    "villageinn",
    "voodoodoughnut",
    "wafflehouse",
    "wahlburgers",
    "wendys",
    "wetzelspretzels",
    "whataburger",
    "whichwich",
    "whitecastle",
    "wienerschnitzel",
    "winchellsdonuts",
    "wingstop",
    "wolfgangssteakhouse",
    "yoshinoya",
    "yumyumdonuts",
    "zaxbys",
    "zipsdrivein",
    "zippys",
  ],
};

/**Takes a Google Places API places response array
 * returns the original array with the displayName.text
 * normalized and stored in an added key 'normalizedName'
 * This is so the names will match when checking against
 * chain business filter arrays
 */
function normalizedPlaceNames(places) {
  const normalizedNames = places.map((place) => {
    const lowerCase = place.displayName.text.toLowerCase();
    const hasSpecialChars = /[^a-zA-Z0-9&]/g.test(lowerCase);
    if (hasSpecialChars) {
      const noSpecial = lowerCase.replace(/[^a-zA-Z0-9]/g, "");
      place = { ...place, normalizedName: noSpecial };
      return place;
    } else {
      place = { ...place, normalizedName: lowerCase };
      return place;
    }
  });
  return normalizedNames;
}

/**Filters through the places array (with normalizedName key
 * from normalizedPlaceNames fn) and excludes/ignores any
 * places that match chains[] values
 * It returns a new array of the original place objects
 * without the normalizedName key
 */
function filterPlaces(places) {
  const noChains = [];
  const chainsArray = new Set(chains.restaurants);
  places.forEach((place) => {
    const { normalizedName, ...originalPlace } = place;
    !chainsArray.has(normalizedName) ? noChains.push(originalPlace) : console.log(place);
  });
  return noChains;
}

//console.log(filterPlaces(normalizedPlaceNames(dummyData.restaurants)).map((place) => place.displayName.text));

/**This queries the Google Places API
 * accepts an array of google places
 * types (var name is types => tags),
 * a location object { latitude, longitude }
 * and the zoom level
 */
export async function fetchPlaces(location, tags, zoom) {
  /**change fetch radius based on map zoom level
   * if zoom is included when function is called
   * radius is in meters
   * default set to 1609 (1 mile)
   */

  let scale = 1609;
  if (zoom) {
    if (zoom > 19 && zoom <= 25) {
      scale *= 0.1;
    } else if (zoom > 15 && zoom <= 19) {
      scale *= 0.3;
    } else if ((zoom = 15)) {
    } else if (zoom >= 13 && zoom < 15) {
      scale *= 1.5;
    } else if (zoom >= 10 && zoom < 13) {
      scale *= 3;
    } else if (zoom < 10) {
      scale *= 10;
    }
  }

  const API_KEY = process.env.API_KEY;
  const nearbySearch = "https://places.googleapis.com/v1/places:searchNearby";
  const defaultProperties =
    "places.displayName" +
    ",places.location" +
    ",places.rating" +
    ",places.primaryType" +
    ",places.types" +
    ",places.websiteUri" +
    ",places.id" +
    ",places.formattedAddress" +
    ",places.editorialSummary.text" +
    ",places.internationalPhoneNumber" +
    ",places.reviewSummary.text" +
    ",places.reviewSummary.reviewsUri" +
    ",places.currentOpeningHours";

  try {
    const response = await fetch(`${nearbySearch}`, {
      method: "POST",
      body: JSON.stringify({
        includedTypes: tags,
        maxResultCount: 20,
        locationRestriction: {
          circle: {
            center: {
              latitude: location.latitude,
              longitude: location.longitude,
            },
            radius: Number(scale),
          },
        },
      }),
      headers: {
        "X-Goog-Api-Key": `${API_KEY}`,
        "X-Goog-FieldMask": `${defaultProperties}`,
        "Content-Type": "application/json",
      },
    });
    //ensures we get a clear error message if error
    //comes from API communication\
    if (!response.ok) {
      const error = await response.json();
      console.log("Google API Error: ", error);
      return;
    }
    const { places } = await response.json();
    const filteredPlaces = filterPlaces(normalizedPlaceNames(places));
    filteredPlaces.forEach((place) => {
      try {
        createBusiness(place);
      } catch (err) {
        console.log(err);
      }
    });
    return filteredPlaces;
  } catch (err) {
    console.log(err);
  }
}
