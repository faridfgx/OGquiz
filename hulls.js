// ══════════════════════════════════════════════════════
// GALAXY ONLINE II — SHIPS & WEAPONS QUIZ DATABASE
// Sourced from galaxyonlineii.fandom.com (Ship Design, Fleet Design,
// Category:Frigates/Cruisers/Battleships/Flagships, Combat Mechanics,
// Ballistic/Directional/Missile/Ship-Based Weapons, Attack/Defense Module)
// Each question has exactly 3 choices. "answer" must match one option's text exactly.
// ══════════════════════════════════════════════════════

const HQUIZ_CATEGORIES = [
  { key: 'ships',   label: 'SHIP HULLS',     icon: '🚀', desc: 'Frigates, Cruisers, Battleships & Flagships' },
  { key: 'weapons', label: 'WEAPONS',        icon: '⚔️', desc: 'Ballistic, Directional, Missile & Ship-Based' },
  { key: 'armor',   label: 'ARMOR & DAMAGE', icon: '🛡️', desc: 'Armor types, matchups & combat mechanics' },
];

const HQUIZ_BANK = [

  // ══════════════════ SHIP HULLS ══════════════════
  { category: 'ships', question: "Which ship hull has the LOWEST carrying volume for modules?", options: ["Frigate", "Cruiser", "Battleship"], answer: "Frigate" },
  { category: 'ships', question: "Which ship hull is described as having the most volume capacity, most He3 storage, and the highest structure?", options: ["Frigate", "Cruiser", "Battleship"], answer: "Battleship" },
  { category: 'ships', question: "Which ship hull has the LOWEST shields of the three main hull types?", options: ["Frigate", "Cruiser", "Battleship"], answer: "Battleship" },
  { category: 'ships', question: "What is the base effective stack size for a Frigate under a Common Commander?", options: ["900", "1000", "1100"], answer: "1100" },
  { category: 'ships', question: "What is the base effective stack size for a Cruiser under a Common Commander?", options: ["900", "1000", "1100"], answer: "1000" },
  { category: 'ships', question: "What is the base effective stack size for a Battleship under a Common Commander?", options: ["900", "1000", "1100"], answer: "900" },
  { category: 'ships', question: "In the ship hull matchup triangle, which hull deals bonus damage to Battleships?", options: ["Frigate", "Cruiser", "Battleship"], answer: "Frigate" },
  { category: 'ships', question: "In the ship hull matchup triangle, which hull deals bonus damage to Frigates?", options: ["Frigate", "Cruiser", "Battleship"], answer: "Cruiser" },
  { category: 'ships', question: "In the ship hull matchup triangle, which hull deals bonus damage to Cruisers?", options: ["Frigate", "Cruiser", "Battleship"], answer: "Battleship" },
  { category: 'ships', question: "Frigates begin with a default value that lets them can skip equipping which modules?", options: ["Transmission Module", "Electronic Module", "Storage Module"], answer: "Transmission Module" },
  { category: 'ships', question: "What innate critical hit bonus do all Frigates carry?", options: ["+1%", "+5%", "+10%"], answer: "+1%" },
  { category: 'ships', question: "The Independence is a Special Hull built on which ship type?", options: ["Frigate", "Cruiser", "Battleship"], answer: "Cruiser" },
  { category: 'ships', question: "The Black Hole is a Special Hull built on which ship type?", options: ["Frigate", "Cruiser", "Battleship"], answer: "Battleship" },
  { category: 'ships', question: "What armor type does the Independence use, letting it cut damage from every weapon type by 90%?", options: ["Chrome Armor", "Light Armor", "Regen Armor"], answer: "Light Armor" },
  { category: 'ships', question: "Which ship is famously the Independence's greatest nemesis, dealing major bonus damage to Light Armor?", options: ["Black Hole", "Tiamat", "Valentine Victory"], answer: "Black Hole" },
  { category: 'ships', question: "How much bonus effective stack size do standard Flagships add on top of their base hull value?", options: ["+50", "+100", "+200"], answer: "+100" },
  { category: 'ships', question: "Which type of ship is restricted to a single stack per fleet formation?", options: ["Federation Flagship", "Humaroid-Flagship", "Special Hull"], answer: "Humaroid-Flagship" },
  { category: 'ships', question: "A Special Hull ship can be built on which of these base types?", options: ["Only Frigates", "Only Battleships", "Frigates, Cruisers, or Battleships"], answer: "Frigates, Cruisers, or Battleships" },
  { category: 'ships', question: "Cruisers are described as being slower than Frigates but making up for it with what?", options: ["More He3 storage", "Faster movement", "Lower build cost"], answer: "More He3 storage" },
  { category: 'ships', question: "What determines the maximum effective stack size a fleet can bring into battle?", options: ["The Commander's star rank", "The color of the hull", "The number of weapons equipped"], answer: "The Commander's star rank" },

  // ══════════════════ WEAPONS ══════════════════
  { category: 'weapons', question: "What is the base shooting range of Ballistic Weapons?", options: ["1-2", "2-5", "5-8"], answer: "1-2" },
  { category: 'weapons', question: "What is the base shooting range of Directional Weapons?", options: ["1-2", "2-5", "6-10"], answer: "2-5" },
  { category: 'weapons', question: "What is the base shooting range of Missile Weapons?", options: ["2-5", "5-8", "6-10"], answer: "5-8" },
  { category: 'weapons', question: "What is the base shooting range of Ship-Based Weapons?", options: ["2-5", "5-8", "6-10"], answer: "6-10" },
  { category: 'weapons', question: "Which weapon type has 0 rounds of cooldown, letting it fire every single round?", options: ["Ballistic", "Directional", "Missile"], answer: "Ballistic" },
  { category: 'weapons', question: "Which weapon type comes in exactly two damage flavors: Heat and Magnetic?", options: ["Ballistic", "Directional", "Missile"], answer: "Directional" },
  { category: 'weapons', question: "Which weapon type always deals Explosive damage?", options: ["Directional", "Missile", "Ship-Based"], answer: "Missile" },
  { category: 'weapons', question: "Which weapon type can be built as any of the four damage types: Kinetic, Heat, Magnetic, or Explosive?", options: ["Ballistic", "Directional", "Ship-Based"], answer: "Ship-Based" },
  { category: 'weapons', question: "Which weapon type burns through the most He3 per round?", options: ["Ballistic", "Missile", "Ship-Based"], answer: "Ship-Based" },
  { category: 'weapons', question: "Which weapon type can eventually research 'Scattering Damage' that hits every ship in the target's row?", options: ["Ballistic", "Missile", "Ship-Based"], answer: "Ballistic" },
  { category: 'weapons', question: "Planetary Weapons are specifically designed to quickly attack what?", options: ["Enemy Frigates", "Defensive structures", "Shield modules only"], answer: "Defensive structures" },
  { category: 'weapons', question: "What is the base range of Planetary Weapons?", options: ["1-2", "5-8", "6-10"], answer: "1-2" },
  { category: 'weapons', question: "Ballistic Weapons primarily carry which two damage attributes?", options: ["Heat / Kinetic", "Magnetic / Explosive", "Kinetic / Explosive"], answer: "Heat / Kinetic" },
  { category: 'weapons', question: "Which weapon type is generally recommended for beginners alongside starting Frigate hulls?", options: ["Ship-Based Weapons", "Ballistic or Missile Weapons", "Planetary Weapons only"], answer: "Ballistic or Missile Weapons" },
  { category: 'weapons', question: "What is widely considered ineffective when designing a fleet's weapon loadout?", options: ["Mixing multiple weapon classes in one fleet", "Using only one weapon class", "Layering weapon tiers"], answer: "Mixing multiple weapon classes in one fleet" },
  { category: 'weapons', question: "Which module can intercept incoming Missile or Ship-Based attacks before they land?", options: ["Extreme Counterattack", "Aldrin Particle Cannon", "Iron Veil"], answer: "Aldrin Particle Cannon" },
  { category: 'weapons', question: "Roughly how does Ship-Based Weapon He3 consumption compare to Ballistic and Directional Weapons?", options: ["About half as much", "About the same", "About four times as much"], answer: "About four times as much" },

  // ══════════════════ ARMOR & DAMAGE ══════════════════
  { category: 'armor', question: "Chrome Armor, being weak to Magnetic and Explosive damage, is especially vulnerable to which weapon type?", options: ["Missile Weapons", "Ballistic Weapons", "Directional (Heat)"], answer: "Missile Weapons" },
  { category: 'armor', question: "Regen Armor is weak to Heat and Explosive damage — which weapon type exploits this?", options: ["Heat Directional Weapons", "Kinetic Ship-Based Weapons", "Magnetic Directional Weapons"], answer: "Heat Directional Weapons" },
  { category: 'armor', question: "Nano Armor is weak to Kinetic and Magnetic damage — which weapon type exploits this?", options: ["Magnetic Directional Weapons", "Heat Ballistic Weapons", "Explosive Missile Weapons"], answer: "Magnetic Directional Weapons" },
  { category: 'armor', question: "Neutralizing Armor is weak to Kinetic and Heat damage — which Ship-Based damage type exploits this?", options: ["Kinetic Ship-Based Weapons", "Magnetic Ship-Based Weapons", "Explosive Ship-Based Weapons"], answer: "Kinetic Ship-Based Weapons" },
  { category: 'armor', question: "In the damage resolution sequence, what gets hit FIRST — shields or hull structure?", options: ["Shields", "Hull structure", "Both simultaneously"], answer: "Shields" },
  { category: 'armor', question: "Which shield module is the standard go-to upgrade for heavily 'tanked' defensive ship builds?", options: ["Eos Phase Shift Shield", "Detonator Shield", "Heat Diffusion Shield"], answer: "Eos Phase Shift Shield" },
  { category: 'armor', question: "A Commander's proficiency with a weapon or hull type is graded on which letter scale?", options: ["S, A, B, C, D", "1 through 10", "Bronze, Silver, Gold"], answer: "S, A, B, C, D" },
  { category: 'armor', question: "On the Commander skill scale, which grade represents an average pilot with no bonus or penalty?", options: ["A", "B", "C"], answer: "B" },
  { category: 'armor', question: "Which of these is NOT one of the four core weapon damage attributes in Galaxy Online II?", options: ["Kinetic", "Radiant", "Explosive"], answer: "Radiant" },
  { category: 'armor', question: "The Detonator Shield module is primarily built to defend against which damage type?", options: ["Explosive", "Heat", "Magnetic"], answer: "Explosive" },
  

  // ── Precise armor multipliers (from the game's own damage table) ──
  { category: 'armor', question: "What exact damage multiplier does Explosive damage deal against Chrome Armor?", options: ["0.5×", "1.0×", "1.5×"], answer: "1.5×" },
  { category: 'armor', question: "What exact damage multiplier does Heat damage deal against Chrome Armor?", options: ["0.5×", "1.0×", "1.5×"], answer: "0.5×" },
  { category: 'armor', question: "What exact damage multiplier does Magnetic damage deal against Nano Armor?", options: ["0.5×", "1.0×", "1.5×"], answer: "1.5×" },
  { category: 'armor', question: "What exact damage multiplier does Explosive damage deal against Nano Armor?", options: ["0.5×", "1.0×", "1.5×"], answer: "0.5×" },
  { category: 'armor', question: "What exact damage multiplier does Kinetic damage deal against Neutralizing Armor?", options: ["0.5×", "1.0×", "1.5×"], answer: "1.5×" },
  { category: 'armor', question: "What exact damage multiplier does Heat damage deal against Regen Armor?", options: ["0.5×", "1.0×", "1.5×"], answer: "1.5×" },
  { category: 'armor', question: "What exact damage multiplier does Kinetic damage deal against Regen Armor?", options: ["0.5×", "1.0×", "1.5×"], answer: "0.5×" },
  { category: 'armor', question: "What flat damage multiplier does Light Armor (used by Flagships like the Independence) apply against EVERY weapon type?", options: ["0.5×", "0.25×", "0.1×"], answer: "0.1×" },
  { category: 'armor', question: "Which armor type takes an exactly neutral 1.0× multiplier from Heat damage?", options: ["Neutralizing Armor", "Chrome Armor", "Regen Armor"], answer: "Neutralizing Armor" },
  { category: 'armor', question: "Which armor type takes an exactly neutral 1.0× multiplier from Kinetic damage?", options: ["Nano Armor", "Chrome Armor", "Regen Armor"], answer: "Nano Armor" },
  { category: 'armor', question: "How many distinct armor/defend types exist in the game's data (Chrome, Nano, Neutralizing, Regen, Light)?", options: ["Three", "Four", "Five"], answer: "Five" },

  // ── Fleet mechanics & module system trivia ──
  { category: 'weapons', question: "Which fleet targeting order makes your ships attack whichever enemy fleet has the highest star-rank commander?", options: ["Max Attack", "Commander", "Max Durability"], answer: "Commander" },
  { category: 'weapons', question: "Which of these is a real defensive structure players can build, alongside Particle Cannon and Anti-Aircraft Cannon?", options: ["Meteor Star", "Comet Strike", "Solar Flare"], answer: "Meteor Star" },
  { category: 'weapons', question: "How many distinct module categories does the game classify equipment into (Ballistic, Directional, Missile, Ship-Based, Planetary, Structure, Shield, Air-Defense, Electronic, Storage, Transmission)?", options: ["8", "11", "14"], answer: "11" },

  // ── Commander tiers & exact effective-stack data ──
  { category: 'ships', question: "In the game's internal data, the common low-tier commander type is labeled as which of these?", options: ["Spell", "Legendary", "Super"], answer: "Spell" },
  { category: 'ships', question: "Which two commander tiers share an IDENTICAL effective-stack progression table in the game's data?", options: ["Legendary and Divine", "Super and Spell", "Spell and Divine"], answer: "Legendary and Divine" },
  { category: 'ships', question: "At maximum (9-star), what is a Legendary/Divine Commander's effective stack for Cruisers?", options: ["2550", "2777", "2999"], answer: "2777" },
  { category: 'ships', question: "At maximum (9-star), what is a Legendary/Divine Commander's effective stack for Frigates?", options: ["2805", "2922", "3000"], answer: "3000" },
  { category: 'ships', question: "At maximum (9-star), what is a Legendary/Divine Commander's effective stack for Battleships?", options: ["2599", "2622", "2777"], answer: "2599" },
  { category: 'ships', question: "Which commander tier reaches the LOWEST 9-star effective stack for Battleships?", options: ["Spell", "Super", "Legendary"], answer: "Spell" },

  // ══════════════════ SHIP HULL IDENTIFICATION (from the game's own hull category lists) ══════════════════
  { category: 'ships', question: "Which hull category is the Chimera Leonis?", options: ["Frigate", "Cruiser", "Battleship"], answer: "Frigate" },
  { category: 'ships', question: "Which hull category is the Chimera Capra?", options: ["Frigate", "Cruiser", "Battleship"], answer: "Cruiser" },
  { category: 'ships', question: "Which hull category is the Hamdar?", options: ["Frigate", "Cruiser", "Battleship"], answer: "Frigate" },
  { category: 'ships', question: "Which hull category is the Tiamat?", options: ["Frigate", "Cruiser", "Battleship"], answer: "Battleship" },
  { category: 'ships', question: "Which hull category is the Helena?", options: ["Frigate", "Cruiser", "Battleship"], answer: "Cruiser" },
  { category: 'ships', question: "Which hull category is the Dessicator Notus?", options: ["Frigate", "Cruiser", "Battleship"], answer: "Frigate" },
  { category: 'ships', question: "Which hull category is the Mysterious Alecto?", options: ["Frigate", "Cruiser", "Battleship"], answer: "Cruiser" },
  { category: 'ships', question: "Which hull category is the Megaran Grudge?", options: ["Frigate", "Cruiser", "Battleship"], answer: "Cruiser" },
  { category: 'ships', question: "Which hull category is the Ultra Nwyfre?", options: ["Frigate", "Cruiser", "Battleship"], answer: "Frigate" },
  { category: 'ships', question: "Which hull category is the Asterion?", options: ["Frigate", "Cruiser", "Battleship"], answer: "Battleship" },
  { category: 'ships', question: "The Independence and Black Hole are both officially classified under which hull category?", options: ["Flagship", "Special", "Battleship"], answer: "Special" },
  { category: 'ships', question: "Which hull category is the Valentine Victory?", options: ["Frigate", "Special", "Flagship"], answer: "Special" },
  { category: 'ships', question: "Which hull category is Kirov?", options: ["Frigate", "Special", "Battleship"], answer: "Special" },
  { category: 'ships', question: "Which hull has the following bonus: Reduces enemy critical hit rate by 90%?", options: ["The Tenebrae", "Dreaded Deimos", "Asterion"],  answer: "Dreaded Deimos"}, 
  { category: 'ships', question: "Which hull has the following bonus: Blitz (Increases all damage by 80%)?", options: ["Miracle-III", "Heaven Piercer III", "Aggressive Warlord-III"],  answer: "Miracle-III"},
  { category: 'ships', question: "Which hull has the following bonus: Enhanced Agility (Agility +5)?", options: ["Last Stand-III", "Megaran Grudge III", "Heaven Piercer III"],  answer: "Megaran Grudge III"},
  { category: 'ships', question: "Which hull has the following bonus: Exploitation (Damage +100% when attacking from the side or back)?", options: ["Devourer Boreas III", "Quick Assault-III", "Shadow Trojan-III"],  answer: "Devourer Boreas III"},
  { category: 'ships', question: "Which hull has the following bonus: Enhanced Agility increases Agility by 6. (Battleship)?", options: ["Ultra Calas-III", "Asterion-III", "Striking Sword-III"],  answer: "Asterion-III"},
  { category: 'ships', question: "Which hull has the following bonus: Increases Stability by 300%. Also nullifies all bonus damage from lateral and rear attacks.?", options: ["Presidio of Glory-III", "Nihelbet-III", "Chimera Viper-III"],  answer: "Presidio of Glory-III"},
  { category: 'ships', question: "Which hull has the following bonus: Increased Agility by 8?", options: ["Paramour III", "Independence Mk2 III", "Liberty Wings 2S III"],  answer: "Liberty Wings 2S III"},
  { category: 'ships', question: "Which hull has the following bonus: Damage negation modules negate an extra 120 DMG?", options: ["Bastion III", "Abyssal Scylla III", "Grim Reaper-III"],  answer: "Abyssal Scylla III"},
  { category: 'ships', question: "Which hull has the following bonus: High-Quality Armor (All effective damage sustained is reduced by 15%)?", options: ["Chimera Viper-III", "Daybreak-III", "Shadow Trojan-III"],  answer: "Chimera Viper-III"},
  { category: 'ships', question: "Which hull has the following bonus: Tesla Flak (Increases interception rate by 30%)?", options: ["Paramour III", "Erotes-III", "Megaran Grudge III"],  answer: "Paramour III"},
  { category: 'ships', question: "Which hull has the following bonus: Expert Precision (Hit Rate +30%)?", options: ["Megaran Grudge III", "Mysterious Alecto III", "Zefram-MK42 III"],  answer: "Mysterious Alecto III"},
  { category: 'ships', question: "Which hull has the following bonus: Deals 30% Scattering DMG?", options: ["Liberty Wings 2S III", "Caerulex Ladon III", "Charon Ferry III"],  answer: "Caerulex Ladon III"},
  { category: 'ships', question: "Which hull has the following bonus: Tachyon Pulse (Increases damage negated by Energy Armor by 30)?", options: ["Independence Mk2 III", "Aggressive Warlord-III", "Shadow Guardian-III"],  answer: "Independence Mk2 III"},
  { category: 'ships', question: "Which hull has the following bonus: Tachyon Pulse (Damage Negation Armor modules can negate an additional 40 damage)?", options: ["Valentine Victory III", "Caerulex Ladon III", "Liberty Wings 2S III"],  answer: "Valentine Victory III"},
  { category: 'ships', question: "Which hull has the following bonus: Enhanced Agility (Agility +5)?", options: ["Secretariat III", "Striking Sword-III", "Dreaded Deimos III"],  answer: "Dreaded Deimos III"},
  { category: 'ships', question: "Which hull has the following bonus: Reduces enemy Critical Hit Rate by 30%?", options: ["Mysterious Alecto III", "Exodus-III", "Asterion-III"],  answer: "Exodus-III"},
  { category: 'ships', question: "Which hull has the following bonus: Increases Fleets Penetration Damage by 30%?", options: ["Ultra Calas-III", "Kirov-III", "Principia de Vis III"],  answer: "Principia de Vis III"},
  { category: 'ships', question: "Which hull has the following bonus: Deals an additional 300% damage to Light Armor.?", options: ["Abyssal Scylla III", "Chimera Leonis-III", "Black Hole-III"],  answer: "Black Hole-III"},
  { category: 'ships', question: "Which hull has the following bonus: Increases Penetration Damage by 30%?", options: ["Striking Sword-III", "Terra Scorpirex III", "Charon Ferry III"],  answer: "Terra Scorpirex III"},
  { category: 'ships', question: "Which hull has the following bonus: Ignores all bonus damage from side and rear attacks?", options: ["Liberty Wings-III", "Chimera Leonis-III", "Ultra Gwyar-III"],  answer: "Ultra Gwyar-III"},
  { category: 'ships', question: "Which hull has the following bonus: Enhanced Reflection (Allows reflective modules to reflect 30% more damage)?", options: ["Caerulex Ladon III", "Liberty Wings 2S III", "Dessicator Notus III"],  answer: "Dessicator Notus III"},
  { category: 'ships', question: "Which hull has the following bonus: Improves antiaircraft defense by 15% and increases agility by 3.?", options: ["Terra Scorpirex III", "Nihelbet-III", "Aggressive Warlord-III"],  answer: "Nihelbet-III"},
  { category: 'ships', question: "Which hull has the following bonus: Increases movement by 7 and reduces damage taken.?", options: ["Last Stand-III", "Independence-III", "Kazati III"],  answer: "Independence-III"},
  { category: 'ships', question: "Which hull has the following bonus: High-Quality Armor (All effective damage sustained is reduced by 15%)?", options: ["Ultra Gwyar-III", "Megaran Grudge III", "Liberty Wings-III"],  answer: "Liberty Wings-III"},
  { category: 'ships', question: "Which hull has the following bonus: Deals an additional 300% damage to Light Armor?", options: ["Charon Ferry III", "Nihelbet-III", "Kazati III"],  answer: "Kazati III"},
  { category: 'ships', question: "Which hull has the following bonus: Agility Boost - Increases Agility by 5?", options: ["GFS-Vengeance III", "Secretariat III", "Principia de Vis III"],  answer: "Secretariat III"},
  { category: 'ships', question: "Which hull has the following bonus: Tesla Armor (Damage Taken -25%)?", options: ["Megaran Grudge III", "Liberty Wings-III", "The Tenebrae III"],  answer: "The Tenebrae III"},
  { category: 'ships', question: "Which hull has the following bonus: Tesla Armor (Damage Taken -25%)?", options: ["Abyssal Scylla III", "Conquistador-III", "Charon Ferry III"],  answer: "Charon Ferry III"},

 // ══════════════════ WEAPON IDENTIFICATION (from the game's own module category lists) ══════════════════
  { category: 'weapons', question: "Which weapon category is Cinderspire Howtzer?", options: ["Ballistic", "Directional", "Missile"], answer: "Ballistic" },
  { category: 'weapons', question: "Which weapon category is Fissure Cannon?", options: ["Ballistic", "Directional", "Missile"], answer: "Ballistic" },
  { category: 'weapons', question: "Which weapon category is Voidmaker?", options: ["Ballistic", "Directional", "Missile"], answer: "Ballistic" },
  { category: 'weapons', question: "Which weapon category is Ion Flare?", options: ["Ballistic", "Directional", "Missile"], answer: "Directional" },
  { category: 'weapons', question: "Which weapon category is Plasma Beacon?", options: ["Ballistic", "Directional", "Missile"], answer: "Directional" },
  { category: 'weapons', question: "Which weapon category is Venom Launcher?", options: ["Directional", "Missile", "Ship-Based"], answer: "Missile" },
  { category: 'weapons', question: "Which weapon category is Patriot Launcher?", options: ["Directional", "Missile", "Ship-Based"], answer: "Missile" },
  { category: 'weapons', question: "Which weapon category is Widowmaker?", options: ["Missile", "Ship-Based", "Directional"], answer: "Ship-Based" },
  { category: 'weapons', question: "Which weapon category is Cormack?", options: ["Ballistic", "Missile", "Ship-Based"], answer: "Ship-Based" },
  { category: 'weapons', question: "Which weapon category is Tyrannos?", options: ["Ship-Based", "Directional", "Missile"], answer: "Ship-Based" },
  { category: 'weapons', question: "Which weapon category is Munroe Arrow?", options: ["Ballistic", "Directional", "Ship-Based"], answer: "Directional" },
  { category: 'weapons', question: "Which weapon category is Thunderbird?", options: ["Directional", "Missile", "Ship-Based"], answer: "Missile" },
  { category: 'weapons', question: "Which weapon category is Galeforce?", options: ["Directional", "Missile", "Ship-Based"], answer: "Missile" },
  { category: 'weapons', question: "Which weapon category is Bulwark?", options: ["Directional", "Missile", "Ship-Based"], answer: "Ship-Based" },
  { category: 'weapons', question: "Which weapon category is NMR Ballista?", options: ["Ballistic", "Directional", "Missile"], answer: "Ballistic" },
  { category: 'weapons', question: "Which weapon category is Overclock Pike?", options: ["Ballistic", "Directional", "Ship-Based"], answer: "Directional" },
  { category: 'weapons', question: "Which weapon category is Nova Storm?", options: ["Ballistic", "Missile", "Ship-Based"], answer: "Ship-Based" },
];

// ══════════════════════════════════════════════════════
// ALIASES — index.html references HULLS_BANK / HULLS_CATEGORIES
// (this file's source data is named HQUIZ_BANK / HQUIZ_CATEGORIES)
// ══════════════════════════════════════════════════════
const HULLS_BANK = HQUIZ_BANK;
const HULLS_CATEGORIES = HQUIZ_CATEGORIES;

// ══════════════════════════════════════════════════════
// ADMIN — HULLS & WEAPONS QUIZ SETUP
// ══════════════════════════════════════════════════════
function initHullsSetup() {
  document.getElementById('hullsTimerPicker').innerHTML = renderTimerPickerHtml('#4d94ff');
  hullsQCount = 10;
  hullsPrizes = Array(HULLS_TOP_N).fill('');
  hullsConsolationPrize = '';
  hullsQMode = 'random';
  hullsHandPickedQuestions = [];
  hullsPickerSelected = new Set();
  hullsSelectedCategories = new Set(HULLS_CATEGORIES.map(c => c.key));
  // Keep all "TOP N" labels in sync with HULLS_TOP_N regardless of static HTML text
  const badge = document.getElementById('hullsSetupBadge');
  if (badge) badge.textContent = `${hullsQCount} QUESTIONS · TOP ${HULLS_TOP_N} WIN`;
  const warn = document.getElementById('hullsSetupWarn');
  if (warn) warn.textContent = `⚠ SET ALL ${HULLS_TOP_N} PRIZES BEFORE PUBLISHING`;
  const prizeTitle = document.getElementById('hullsPrizeTitle');
  if (prizeTitle) prizeTitle.textContent = `▶ PRIZE POOL — TOP ${HULLS_TOP_N} SCORERS EACH WIN ONE`;
  const consolLabel = document.querySelector('#hullsSetup .consolation-label');
  if (consolLabel) consolLabel.textContent = `⬡ CONSOLATION PRIZE — EVERYONE OUTSIDE TOP ${HULLS_TOP_N}`;
  renderHullsQCountBtns();
  renderHullsPrizeGrid();
  setHullsQMode('random');
  renderHullsCategoryGrid();
}

function setHullsQMode(mode) {
  hullsQMode = mode;
  document.getElementById('hModeRandom').classList.toggle('active', mode === 'random');
  document.getElementById('hModeHandpick').classList.toggle('active', mode === 'handpick');
  const status = document.getElementById('hullsHandPickStatus');
  const countBtns = document.getElementById('hullsQCountBtns');
  const catPanel = document.getElementById('hullsCategoryFilterPanel');
  if (mode === 'handpick') {
    status.style.display = 'block';
    catPanel.style.display = 'none';
    countBtns.style.opacity = '0.3';
    countBtns.style.pointerEvents = 'none';
    updateHullsHandPickStatus();
  } else {
    status.style.display = 'none';
    catPanel.style.display = 'block';
    countBtns.style.opacity = '';
    countBtns.style.pointerEvents = '';
    updateHullsCatPoolCount();
  }
}

function updateHullsHandPickStatus() {
  const n = hullsPickerSelected.size;
  document.getElementById('hullsHandPickCount').textContent = n > 0 ? `${n} question${n!==1?'s':''} selected` : 'No questions selected — click EDIT SELECTION';
}

// ── Category filter (random mode) ──────────────────────
function renderHullsCategoryGrid() {
  const grid = document.getElementById('hullsCategoryGrid');
  if (!grid || typeof HULLS_CATEGORIES === 'undefined') return;
  grid.innerHTML = '';
  HULLS_CATEGORIES.forEach(cat => {
    const count = HULLS_BANK.filter(q => q.category === cat.key).length;
    const active = hullsSelectedCategories.has(cat.key);
    const card = document.createElement('div');
    card.id = 'hcatcard-' + cat.key;
    card.style.cssText = `
      display:flex;align-items:center;gap:9px;padding:8px 10px;
      border-radius:3px;cursor:pointer;transition:all .15s;
      border:1px solid ${active ? 'rgba(77,148,255,0.45)' : 'rgba(255,255,255,0.07)'};
      background:${active ? 'rgba(77,148,255,0.1)' : 'rgba(255,255,255,0.02)'};
    `;
    card.innerHTML = `
      <div style="font-size:16px;line-height:1;">${cat.icon}</div>
      <div style="flex:1;min-width:0;">
        <div style="font-size:10px;letter-spacing:1px;color:${active ? '#4d94ff' : 'var(--text2)'};">${cat.label}</div>
        <div style="font-size:9px;color:var(--text3);margin-top:1px;">${cat.desc}</div>
      </div>
      <div style="text-align:right;flex-shrink:0;">
        <div style="font-family:'Orbitron',monospace;font-size:11px;color:${active ? '#4d94ff' : 'var(--text3)'};">${count}</div>
        <div style="font-size:8px;color:var(--text3);letter-spacing:1px;">QS</div>
      </div>
      <div style="width:14px;height:14px;border-radius:2px;border:1px solid ${active ? '#4d94ff' : 'rgba(255,255,255,0.15)'};background:${active ? '#4d94ff' : 'transparent'};display:flex;align-items:center;justify-content:center;flex-shrink:0;font-size:9px;color:#fff;">
        ${active ? '✓' : ''}
      </div>
    `;
    card.onclick = () => toggleHullsCategory(cat.key);
    grid.appendChild(card);
  });
  updateHullsCatPoolCount();
}

function toggleHullsCategory(key) {
  if (hullsSelectedCategories.has(key)) {
    if (hullsSelectedCategories.size === 1) return; // keep at least one
    hullsSelectedCategories.delete(key);
  } else {
    hullsSelectedCategories.add(key);
  }
  renderHullsCategoryGrid();
}

function toggleAllHullsCategories(selectAll) {
  if (selectAll) {
    HULLS_CATEGORIES.forEach(c => hullsSelectedCategories.add(c.key));
  } else {
    hullsSelectedCategories = new Set([HULLS_CATEGORIES[0].key]);
  }
  renderHullsCategoryGrid();
}

function updateHullsCatPoolCount() {
  const el = document.getElementById('hullsCatPoolCount');
  if (!el || typeof HULLS_BANK === 'undefined') return;
  const pool = HULLS_BANK.filter(q => hullsSelectedCategories.has(q.category)).length;
  el.textContent = `${pool} questions in pool`;
  el.style.color = pool >= hullsQCount ? 'var(--green)' : 'var(--orange)';
}

function renderHullsQCountBtns() {
  const c = document.getElementById('hullsQCountBtns'); if(!c) return; c.innerHTML = '';
  [5,10,15,20,25,30].forEach(n => {
    const b = document.createElement('button');
    b.className = 'count-btn' + (n === hullsQCount ? ' active' : '');
    b.textContent = n;
    b.onclick = () => {
      hullsQCount = n;
      document.querySelectorAll('#hullsQCountBtns .count-btn').forEach(x => x.classList.remove('active'));
      b.classList.add('active');
      document.getElementById('hullsSetupBadge').textContent = `${n} QUESTIONS · TOP ${HULLS_TOP_N} WIN`;
      document.getElementById('hullsSetupWarn').textContent = `⚠ SET ALL ${HULLS_TOP_N} PRIZES BEFORE PUBLISHING`;
      updateHullsCatPoolCount();
    };
    c.appendChild(b);
  });
}

function renderHullsPrizeGrid() {
  const grid = document.getElementById('hullsPrizeGrid'); grid.innerHTML = '';
  for (let i = 0; i < HULLS_TOP_N; i++) {
    const pal = PALETTES[i % PALETTES.length];
    const rankLabel = i === 0 ? '🥇 1ST' : i === 1 ? '🥈 2ND' : i === 2 ? '🥉 3RD' : `#${i+1}`;
    const div = document.createElement('div');
    div.style.cssText = `background:var(--bg3);border:1px solid ${pal.accent}33;border-radius:4px;padding:10px;position:relative;overflow:visible;`;
    div.innerHTML = `
      <div style="font-size:9px;color:#4d94ff;letter-spacing:2px;margin-bottom:6px;">${rankLabel} PLACE PRIZE</div>
      <div class="cc-input-wrap" id="hsug-wrap-${i}" style="overflow:visible;">
        <input class="cc-input" id="hprize-${i}" type="text" placeholder="Enter prize…" value="${hullsPrizes[i]||''}"
          oninput="onHullsPrizeInput(${i},this.value)"
          onfocus="openSuggestions(${i},'hulls','')"
          onblur="closeSuggestions(${i},'hulls')"
          style="border-color:#4d94ff33;font-size:11px;${hullsPrizes[i]?'border-color:rgba(57,255,20,0.35);color:var(--green);':''}" />
        <div class="reward-suggestions" id="hsug-dd-${i}" style="z-index:9999;"></div>
      </div>`;
    grid.appendChild(div);
  }
  updateHullsProgress();
}

function onHullsPrizeInput(i, val) {
  hullsPrizes[i] = val.trim();
  filterSuggestions(i, 'hulls', '', val);
  updateHullsProgress();
  const inp = document.getElementById('hprize-' + i);
  if (inp) { if (hullsPrizes[i]) inp.classList.add('filled'); else inp.classList.remove('filled'); }
}

function updateHullsProgress() {
  const filled = hullsPrizes.filter(p => p).length;
  document.getElementById('hullsProgFill').style.width = (filled / HULLS_TOP_N * 100) + '%';
  document.getElementById('hullsProgCount').textContent = filled + '/' + HULLS_TOP_N;
}

function clearHullsPrizes() {
  hullsPrizes = Array(HULLS_TOP_N).fill('');
  renderHullsPrizeGrid();
}

async function publishHulls() {
  const missing = hullsPrizes.filter(p => !p).length;
  const warn = document.getElementById('hullsSetupWarn');

  let selected;
  if (hullsQMode === 'handpick') {
    if (hullsPickerSelected.size === 0) {
      warn.textContent = '⚠ HAND-PICK AT LEAST ONE QUESTION BEFORE PUBLISHING';
      warn.style.display = 'block'; setTimeout(()=>warn.style.display='none',3000); return;
    }
    selected = [...hullsPickerSelected].map(i => HULLS_BANK[i]);
  } else {
    const pool = HULLS_BANK.filter(q => hullsSelectedCategories.has(q.category));
    if (pool.length < hullsQCount) {
      warn.textContent = `⚠ ONLY ${pool.length} QUESTIONS IN SELECTED CATEGORIES — REDUCE QUESTION COUNT OR ADD MORE CATEGORIES`;
      warn.style.display = 'block'; setTimeout(()=>warn.style.display='none',4000); return;
    }
    const shuffledBank = shuffle([...pool]);
    selected = shuffledBank.slice(0, hullsQCount);
  }

  if (missing > 0) {
    warn.textContent = `⚠ SET ALL ${HULLS_TOP_N} PRIZES BEFORE PUBLISHING`;
    warn.style.display = 'block'; setTimeout(()=>warn.style.display='none',3000); return;
  }
  warn.style.display = 'none';

  const actualCount = selected.length;
  const gameId = 'HQZ_' + Date.now();
  const endsAt  = getSelectedEndsAt();
  const gameData = {
    id: gameId, mode: 'hulls',
    questions: selected,
    q_count: actualCount,
    q_mode: hullsQMode,
    q_categories: hullsQMode === 'random' ? [...hullsSelectedCategories] : null,
    prizes: hullsPrizes,
    consolation_prize: hullsConsolationPrize || '',
    active: true, revealed: false,
    ends_at: endsAt,
    created_at: new Date().toISOString()
  };
  const { error } = await sb.from('constellation_games').upsert({ id: gameId, data: gameData });
  if (error) { alert('Error publishing quiz: ' + error.message); return; }

  activeHullsId = gameId;
  document.getElementById('activeGameId').textContent = gameId;
  document.getElementById('activeGameType').textContent = 'HULLS';
  document.getElementById('gameStatusRow').style.display = 'flex';
  document.getElementById('hullsDashPanel').style.display = 'block';
  document.getElementById('gameStatusChip').innerHTML = '<span class="status-chip status-active">LIVE</span>';
  loadHullsDashboard(); subscribeToHullsAdmin(); loadHistory();
  startGameTimer(endsAt, gameId);
  alert(`✓ Hulls & Weapons Quiz published! ${actualCount} questions · ${hullsQMode === 'handpick' ? 'Hand-picked' : 'Random'} selection. Share the URL with players.`);
}

// ══════════════════════════════════════════════════════
// ADMIN — HULLS & WEAPONS QUIZ DASHBOARD
// ══════════════════════════════════════════════════════
async function loadHullsDashboard() {
  const gid = activeHullsId;
  if (!gid) return;
  const { data, error } = await sb.from('constellation_claims').select('*').eq('game_id', gid).order('score', { ascending: false });
  if (error) { document.getElementById('hullsDashBody').innerHTML = `<div class="warn" style="display:block;">Error: ${error.message}</div>`; return; }
  renderHullsDashboard(data || []);
}

function renderHullsDashboard(scores) {
  document.getElementById('activePlayers').textContent = scores.length;
  const body = document.getElementById('hullsDashBody');
  const totalQ = hullsQCount || HULLS_Q_COUNT;
  if (!scores.length) { body.innerHTML = '<div class="loading-msg" style="color:var(--text2);">WAITING FOR PLAYERS TO COMPLETE THE QUIZ...</div>'; return; }

  scores.sort((a, b) => (b.score - a.score) || (a.time_taken - b.time_taken));

  let html = `<div style="margin-bottom:16px;font-size:10px;color:var(--text2);letter-spacing:2px;">▶ TOP ${HULLS_TOP_N} SCORERS WIN PRIZES · ${scores.length} PLAYER(S) COMPLETED · ${totalQ} QUESTIONS</div>`;
  html += '<div style="background:var(--bg3);border:1px solid rgba(77,148,255,0.2);border-radius:4px;overflow:hidden;">';

  scores.forEach((s, i) => {
    const pal = PALETTES[i % PALETTES.length];
    const rankClass = i === 0 ? 'gold' : i === 1 ? 'silver' : i === 2 ? 'bronze' : '';
    const prize = i < hullsPrizes.length ? hullsPrizes[i] : null;
    const timeSec = s.time_taken ? Math.round(s.time_taken/1000) : '?';
    const tied = (scores[i-1] && scores[i-1].score === s.score) || (scores[i+1] && scores[i+1].score === s.score);
    const timeDisplay = tied
      ? `<span style="color:#4d94ff;font-weight:700;">${timeSec}s</span>`
      : `${timeSec}s`;
    html += `<div class="leaderboard-row" style="border-color:${i < HULLS_TOP_N ? 'rgba(77,148,255,0.15)' : 'rgba(255,255,255,0.04)'}">
      <div class="lb-rank ${rankClass}" style="${rankClass ? '' : `color:${pal.accent};font-size:13px;`}">${i+1}</div>
      <div>
        <div class="lb-name">${s.username}</div>
        <div class="lb-time">ID: ${s.game_user_id} · ${timeDisplay}${s.tab_switches > 0 ? ` · <span style="color:var(--danger);">⚠ ${s.tab_switches} tab switch${s.tab_switches!==1?'es':''}</span>` : ''}</div>
      </div>
      <div style="text-align:right;">
        <div class="lb-score">${s.score}/${totalQ}</div>
        ${prize ? `<div class="reward-pill">${prize}</div>` : ''}
      </div>
    </div>`;
  });
  html += '</div>';
  body.innerHTML = html;
}

function subscribeToHullsAdmin() {
  if (!activeHullsId) return;
  if (hullsChannel) sb.removeChannel(hullsChannel);
  hullsChannel = sb.channel('hulls-admin-'+activeHullsId)
    .on('postgres_changes', { event:'*', schema:'public', table:'constellation_claims', filter:`game_id=eq.${activeHullsId}` }, () => loadHullsDashboard())
    .subscribe();
}

// ══════════════════════════════════════════════════════
// PLAYER — HULLS & WEAPONS QUIZ
// ══════════════════════════════════════════════════════
async function loadPlayerHulls(gd) {
  const { data: existing } = await sb.from('constellation_claims').select('*').eq('game_id', activeHullsId).eq('game_user_id', currentUser.gameId);
  if (existing && existing.length) {
    showHullsResults(existing[0], gd);
    return;
  }

  hullsQuestions = gd.questions;
  const totalQ = gd.q_count || hullsQuestions.length || HULLS_Q_COUNT;
  hullsAnswers = Array(totalQ).fill(null);
  hullsCurrent = 0;
  hullsScore = 0;
  hullsSubmitted = false;

  // ── Restore session if the player already started (page refresh) ──
  const savedSession = loadHullsSession();
  if (savedSession && savedSession.startTime) {
    hullsStartTime = savedSession.startTime;
    hullsCurrent   = savedSession.current  ?? 0;
    hullsScore     = savedSession.score    ?? 0;
    hullsAnswers   = savedSession.answers  ?? Array(totalQ).fill(null);
  }

  document.getElementById('hullsStatusBadge').textContent = `ACTIVE · ${totalQ} QUESTIONS`;
  if (gd.ends_at) {
    const badge = document.getElementById('hullsStatusBadge');
    startPlayerTimer(badge, gd.ends_at, () => loadPlayerView());
  }

  if (savedSession && savedSession.startTime) {
    if (hullsCurrent < hullsQuestions.length) {
      renderHullsQuestion();
    } else {
      finishHulls();
    }
  } else {
    showHullsPrizeTable(gd, totalQ);
  }

  if (hullsChannel) sb.removeChannel(hullsChannel);
  hullsChannel = sb.channel('hulls-player-'+activeHullsId)
    .on('postgres_changes', { event:'UPDATE', schema:'public', table:'constellation_games', filter:`id=eq.${activeHullsId}` }, async (payload) => {
      const gd2 = payload.new?.data;
      if (gd2 && !gd2.active) {
        const { data: mySubmit } = await sb.from('constellation_claims').select('*').eq('game_id', activeHullsId).eq('game_user_id', currentUser.gameId);
        if (mySubmit && mySubmit.length) showHullsResults(mySubmit[0], gd2);
      }
    })
    .subscribe();
}

function showHullsPrizeTable(gd, totalQ) {
  const prizes = gd.prizes || [];
  const body = document.getElementById('hullsPlayerBody');

  let prizeRows = prizes.map((prize, i) => {
    const rankLabel = i === 0 ? '🥇 1st' : i === 1 ? '🥈 2nd' : i === 2 ? '🥉 3rd' : `#${i+1}`;
    const pal = PALETTES[i % PALETTES.length];
    return `<div style="display:flex;align-items:center;gap:12px;padding:9px 14px;border-bottom:1px solid rgba(77,148,255,0.1);">
      <div style="font-family:'Orbitron',monospace;font-size:13px;min-width:44px;${i===0?'color:var(--gold);':i===1?'color:#c0c0c0;':i===2?'color:#cd7f32;':'color:'+pal.accent+';'}">${rankLabel}</div>
      <div style="flex:1;font-size:12px;color:#ffe8aa;">${prize}</div>
    </div>`;
  }).join('');
  const consolation = gd?.consolation_prize || '';
  if (consolation) {
    prizeRows += `<div style="display:flex;align-items:center;gap:12px;padding:9px 14px;background:rgba(255,107,53,0.04);">
      <div style="font-size:13px;min-width:44px;color:var(--orange);">rest</div>
      <div style="flex:1;font-size:12px;color:#ffe8aa;">${consolation}</div>
    </div>`;
  }

  body.innerHTML = `
    <div style="margin-bottom:16px;padding:14px 16px;background:rgba(77,148,255,0.06);border:1px solid rgba(77,148,255,0.25);border-radius:4px;">
      <div style="font-family:'Orbitron',monospace;font-size:10px;letter-spacing:3px;color:#4d94ff;margin-bottom:4px;">◈ QUIZ INFO</div>
      <div style="font-size:11px;color:var(--text2);line-height:1.7;">
        <span style="color:var(--accent);">${totalQ} questions</span> · Multiple choice · Auto-advances after each answer · Top <span style="color:#4d94ff;">${prizes.length}</span> scorers win prizes · Tiebreaker by fastest time
      </div>
    </div>

    <div style="margin-bottom:16px;">
      <div style="font-family:'Orbitron',monospace;font-size:9px;letter-spacing:2px;color:#4d94ff;margin-bottom:10px;">✦ PRIZE TABLE — TOP ${prizes.length} WIN</div>
      <div style="background:var(--bg3);border:1px solid rgba(77,148,255,0.2);border-radius:4px;overflow:hidden;">
        ${prizeRows}
      </div>
    </div>

    <div style="text-align:center;padding:8px 0 4px;">
      <button class="btn" style="background:#4d94ff;color:#04101f;font-size:13px;padding:12px 32px;letter-spacing:2px;" onclick="startHulls()">⬡ START QUIZ</button>
      <div style="font-size:9px;color:var(--text3);margin-top:10px;letter-spacing:1px;">Once started you cannot go back. Answer all ${totalQ} questions.</div>
    </div>`;
}

function hullsStorageKey() {
  return `hulls_session_${activeHullsId}_${currentUser.gameId}`;
}

function saveHullsSession() {
  const session = {
    startTime:  hullsStartTime,
    current:    hullsCurrent,
    score:      hullsScore,
    answers:    hullsAnswers,
    tabSwitches: hullsTabSwitches
  };
  try { localStorage.setItem(hullsStorageKey(), JSON.stringify(session)); } catch(e) {}
}

function loadHullsSession() {
  try {
    const raw = localStorage.getItem(hullsStorageKey());
    return raw ? JSON.parse(raw) : null;
  } catch(e) { return null; }
}

function clearHullsSession() {
  try { localStorage.removeItem(hullsStorageKey()); } catch(e) {}
}

function startHulls() {
  const existing = loadHullsSession();
  if (existing && existing.startTime) {
    hullsStartTime   = existing.startTime;
    hullsTabSwitches = existing.tabSwitches ?? 0;
  } else {
    hullsStartTime   = Date.now();
    hullsTabSwitches = 0;
    // Shuffle questions once per player-session
    hullsQuestions = shuffleArray([...hullsQuestions]);
    // Shuffle choices within each question
    hullsQuestions = hullsQuestions.map(q => shuffleOptions(q));
  }
  saveHullsSession();
  startHullsTabWatcher();
  renderHullsQuestion();
}

function renderHullsQuestion() {
  const q = hullsQuestions[hullsCurrent];
  const totalQ = hullsQuestions.length;
  const progress = Math.round((hullsCurrent / totalQ) * 100);
  const body = document.getElementById('hullsPlayerBody');

  body.innerHTML = `
    <div class="quiz-progress">
      <span style="font-size:9px;color:#4d94ff;letter-spacing:2px;">QUESTION</span>
      <span style="font-family:'Orbitron',monospace;font-size:16px;color:#4d94ff;">${hullsCurrent + 1}</span>
      <span style="font-size:9px;color:var(--text2);">/ ${totalQ}</span>
      <div style="flex:1;height:3px;background:var(--bg3);border-radius:2px;overflow:hidden;margin-left:10px;">
        <div style="height:100%;width:${progress}%;background:linear-gradient(90deg,#4d94ff,var(--accent));border-radius:2px;transition:width .3s;"></div>
      </div>
      <span style="font-size:10px;color:var(--green);">✓ ${hullsScore} pts</span>
    </div>
    <div class="quiz-q-card">
      <div class="quiz-q-num" style="color:#4d94ff;">◈ QUESTION ${hullsCurrent + 1} OF ${totalQ}</div>
      <div class="quiz-q-text">${q.question}</div>
      <div class="quiz-options" id="hullsOptions">
        ${q.options.map((opt, oi) => `<button class="quiz-opt" onclick="answerHulls(${oi})">${opt}</button>`).join('')}
      </div>
      <div id="hullsFeedback" style="display:none;"></div>
    </div>`;
}

function answerHulls(optionIdx) {
  const q = hullsQuestions[hullsCurrent];
  const selected = q.options[optionIdx];
  const isCorrect = selected === q.answer;

  hullsAnswers[hullsCurrent] = selected;
  if (isCorrect) hullsScore++;

  // Increment BEFORE saving so a refresh resumes at the NEXT question
  hullsCurrent++;
  saveHullsSession();

  const btns = document.querySelectorAll('#hullsOptions .quiz-opt');
  btns.forEach((btn, i) => {
    btn.disabled = true;
    if (q.options[i] === q.answer) btn.classList.add('correct');
    else if (i === optionIdx && !isCorrect) btn.classList.add('wrong');
  });

  const fb = document.getElementById('hullsFeedback');
  fb.style.display = 'block';
  fb.className = 'quiz-feedback ' + (isCorrect ? 'correct' : 'wrong');
  fb.innerHTML = isCorrect ? `✓ CORRECT! +1 point` : `✗ INCORRECT — Correct: <strong>${q.answer}</strong>`;

  setTimeout(() => {
    if (hullsCurrent < hullsQuestions.length) {
      renderHullsQuestion();
    } else {
      finishHulls();
    }
  }, 1500);
}

async function finishHulls() {
  hullsSubmitted = true;
  stopHullsTabWatcher();
  const timeTaken = Date.now() - hullsStartTime;
  clearHullsSession();
  const totalQ = hullsQuestions.length;

  document.getElementById('hullsPlayerBody').innerHTML = `<div class="quiz-score-display">
    <div style="font-size:10px;letter-spacing:3px;color:#4d94ff;margin-bottom:12px;">QUIZ COMPLETE</div>
    <div class="quiz-score-num">${hullsScore}/${totalQ}</div>
    <div class="quiz-score-label">FINAL SCORE</div>
    <div style="font-size:10px;color:var(--text2);margin-top:10px;">Time: ${Math.round(timeTaken/1000)}s</div>
    <div style="margin-top:16px;font-size:11px;color:var(--text2);">Submitting score...</div>
  </div>`;

  const { error } = await sb.from('constellation_claims').insert({
    game_id:              activeHullsId,
    constellation_index:  0,
    username:             currentUser.username,
    game_user_id:         currentUser.gameId,
    score:                hullsScore,
    time_taken:           timeTaken,
    tab_switches:         hullsTabSwitches
  });

  if (error && !error.message.includes('duplicate')) {
    document.getElementById('hullsPlayerBody').innerHTML += `<div style="color:var(--danger);font-size:10px;margin-top:8px;">⚠ Error saving score: ${error.message}</div>`;
    return;
  }

  const { data: gameRow } = await sb.from('constellation_games').select('*').eq('id', activeHullsId).single();
  const { data: scores }  = await sb.from('constellation_claims').select('*').eq('game_id', activeHullsId).order('score', { ascending: false });

  document.getElementById('playerHullsResultPanel').style.display = 'block';
  showHullsResults({ score: hullsScore, time_taken: timeTaken }, gameRow?.data, scores || []);

  document.getElementById('hullsPlayerBody').innerHTML = `<div class="quiz-score-display">
    <div style="font-size:10px;letter-spacing:3px;color:#4d94ff;margin-bottom:12px;">QUIZ COMPLETE</div>
    <div class="quiz-score-num">${hullsScore}/${totalQ}</div>
    <div class="quiz-score-label">YOUR FINAL SCORE</div>
    <div style="font-size:10px;color:var(--text2);margin-top:10px;">Time: ${Math.round(timeTaken/1000)}s · Score submitted!</div>
  </div>`;
}

async function showHullsResults(myResult, gd, allScores) {
  if (!allScores) {
    const { data: scores } = await sb.from('constellation_claims').select('*').eq('game_id', activeHullsId).order('score', { ascending: false });
    allScores = scores || [];
    if (!gd) {
      const { data: gameRow } = await sb.from('constellation_games').select('*').eq('id', activeHullsId).single();
      gd = gameRow?.data;
    }
  }

  allScores.sort((a, b) => (b.score - a.score) || (a.time_taken - b.time_taken));
  const myRank = allScores.findIndex(s => s.game_user_id === currentUser.gameId) + 1;
  const prizes = gd?.prizes || hullsPrizes;
  const consolation = gd?.consolation_prize || '';
  const totalQ = gd?.q_count || (gd?.questions?.length) || HULLS_Q_COUNT;

  document.getElementById('playerHullsPanel').style.display = 'block';
  document.getElementById('playerHullsResultPanel').style.display = 'block';
  document.getElementById('hullsResultBadge').textContent = `RANK #${myRank || '?'} · ${myResult.score || 0}/${totalQ}`;

  const myPrize = myRank > 0 && myRank <= prizes.length ? prizes[myRank - 1] : null;

  let html = '';

  // ── MY RESULT CARD ──
  if (myPrize) {
    html += `<div class="player-reward-win" style="margin-bottom:18px;">
      <div class="prw-title">🏆 TOP ${prizes.length} — YOU WIN A PRIZE!</div>
      <div class="prw-reward">${myPrize}</div>
      <div class="prw-rank" style="margin-top:8px;">
        <span style="color:#4d94ff;font-family:'Orbitron',monospace;">RANK #${myRank}</span>
        <span style="color:rgba(255,255,255,0.3);margin:0 8px;">·</span>
        Score: ${myResult.score || 0}/${totalQ}
        <span style="color:rgba(255,255,255,0.3);margin:0 8px;">·</span>
        Time: ${myResult.time_taken ? Math.round(myResult.time_taken/1000) : '?'}s
      </div>
    </div>`;
  } else {
    html += `<div style="padding:16px;background:rgba(90,120,138,0.08);border:1px solid rgba(90,120,138,0.2);border-radius:4px;margin-bottom:18px;text-align:center;">
      <div style="font-size:9px;letter-spacing:2px;color:var(--text2);margin-bottom:6px;">YOUR RESULT</div>
      <div style="font-family:'Orbitron',monospace;font-size:24px;color:var(--text);margin-bottom:4px;">${myRank > 0 ? `Rank #${myRank}` : '—'}</div>
      <div style="font-size:11px;color:var(--text2);">Score: ${myResult.score||0}/${totalQ} · Time: ${myResult.time_taken ? Math.round(myResult.time_taken/1000) : '?'}s</div>
      ${myRank > prizes.length ? `<div style="font-size:10px;color:rgba(255,51,68,0.7);margin-top:6px;">Not in top ${prizes.length}</div>` : ''}
      ${consolation ? `<div style="margin-top:10px;padding:8px 14px;background:rgba(255,107,53,0.08);border:1px solid rgba(255,107,53,0.25);border-radius:3px;display:inline-block;">
        <div style="font-size:9px;color:var(--orange);letter-spacing:1px;margin-bottom:4px;">⬡ CONSOLATION PRIZE</div>
        <div style="font-size:14px;color:#ffe8aa;">${consolation}</div>
      </div>` : ''}
    </div>`;
  }

  // ── PRIZE TABLE ──
  html += `<div style="margin-bottom:18px;">
    <div style="font-family:'Orbitron',monospace;font-size:9px;letter-spacing:2px;color:#4d94ff;margin-bottom:8px;">✦ PRIZE TABLE — TOP ${prizes.length} WIN</div>
    <div style="background:var(--bg3);border:1px solid rgba(77,148,255,0.2);border-radius:4px;overflow:hidden;">`;

  prizes.forEach((prize, i) => {
    const rankLabel = i === 0 ? '🥇 1st' : i === 1 ? '🥈 2nd' : i === 2 ? '🥉 3rd' : `#${i+1}`;
    const isMyRank = (i + 1) === myRank;
    const pal = PALETTES[i % PALETTES.length];
    html += `<div style="display:flex;align-items:center;gap:12px;padding:9px 14px;border-bottom:1px solid rgba(77,148,255,0.08);${isMyRank ? 'background:rgba(77,148,255,0.10);' : ''}">
      <div style="font-family:'Orbitron',monospace;font-size:12px;min-width:44px;${i===0?'color:var(--gold);':i===1?'color:#c0c0c0;':i===2?'color:#cd7f32;':'color:'+pal.accent+';'}">${rankLabel}</div>
      <div style="flex:1;font-size:11px;color:#ffe8aa;">${prize}</div>
      ${isMyRank ? '<div style="font-size:10px;color:#4d94ff;letter-spacing:1px;">◀ YOU</div>' : ''}
    </div>`;
  });
  if (consolation) {
    const isMyRank = myRank > prizes.length && myRank > 0;
    html += `<div style="display:flex;align-items:center;gap:12px;padding:9px 14px;background:rgba(255,107,53,0.04);${isMyRank?'background:rgba(255,107,53,0.10);':''}">
      <div style="font-size:12px;min-width:44px;color:var(--orange);">rest</div>
      <div style="flex:1;font-size:11px;color:#ffe8aa;">${consolation}</div>
      ${isMyRank ? '<div style="font-size:10px;color:var(--orange);">◀ YOU</div>' : ''}
    </div>`;
  }
  html += `</div></div>`;

  // ── LEADERBOARD ──
  html += `<div style="font-family:'Orbitron',monospace;font-size:9px;color:var(--text2);letter-spacing:2px;margin-bottom:10px;">▶ LEADERBOARD (${allScores.length} player${allScores.length !== 1 ? 's' : ''})</div>`;
  html += '<div style="background:var(--bg3);border:1px solid rgba(77,148,255,0.2);border-radius:4px;overflow:hidden;">';

  allScores.slice(0, 25).forEach((s, i) => {
    const isMe = s.game_user_id === currentUser.gameId;
    const rankClass = i === 0 ? 'gold' : i === 1 ? 'silver' : i === 2 ? 'bronze' : '';
    const prize = i < prizes.length ? prizes[i] : null;
    const timeSec = s.time_taken ? Math.round(s.time_taken/1000) : '?';
    const tied = (allScores[i-1] && allScores[i-1].score === s.score) || (allScores[i+1] && allScores[i+1].score === s.score);
    const timeDisplay = tied
      ? `<span style="color:#4d94ff;font-weight:700;">${timeSec}s</span>`
      : `${timeSec}s`;
    html += `<div class="leaderboard-row" style="${isMe ? 'background:rgba(77,148,255,0.08);' : ''}${i < prizes.length ? '' : 'opacity:0.6;'}">
      <div class="lb-rank ${rankClass}" style="${rankClass ? '' : 'color:var(--text2);font-size:13px;'}">${i+1}</div>
      <div>
        <div class="lb-name" style="${isMe ? 'color:#4d94ff;' : ''}">${s.username}${isMe ? ' ◀ YOU' : ''}</div>
        <div class="lb-time">${timeDisplay} · ${s.score}/${totalQ} pts</div>
      </div>
      <div style="text-align:right;">
        ${prize ? `<div class="reward-pill">${prize}</div>` : '<div style="font-size:10px;color:var(--text3);margin-top:2px;">no prize</div>'}
      </div>
    </div>`;
  });
  html += '</div>';

  document.getElementById('playerHullsResultBody').innerHTML = html;

  if (!hullsSubmitted) {
    document.getElementById('hullsPlayerBody').innerHTML = `<div class="quiz-score-display">
      <div style="font-size:10px;letter-spacing:3px;color:#4d94ff;margin-bottom:12px;">ALREADY SUBMITTED</div>
      <div class="quiz-score-num">${myResult.score||0}/${totalQ}</div>
      <div class="quiz-score-label">YOUR SCORE</div>
    </div>`;
    hullsSubmitted = true;
  }
}

// ══════════════════════════════════════════════════════
// GAME HISTORY — HULLS & WEAPONS QUIZ
// (called from index.html's renderHistoryBody dispatcher
//  once you add: if (mode === 'hulls') return renderHistoryHulls(gd, claims);)
// ══════════════════════════════════════════════════════
function renderHistoryHulls(gd, claims) {
  const prizes = gd.prizes || [];
  const consolation = gd.consolation_prize || '';
  const totalQ = gd.q_count || (gd.questions?.length) || '?';
  const qMode = gd.q_mode || 'random';

  claims = claims.slice().sort((a, b) => (b.score - a.score) || (a.time_taken - b.time_taken));

  let html = `<div style="display:flex;gap:16px;flex-wrap:wrap;margin-bottom:12px;">
    <div style="font-size:10px;color:var(--text2);">Questions: <span style="color:#4d94ff;">${totalQ}</span></div>
    <div style="font-size:10px;color:var(--text2);">Selection: <span style="color:#4d94ff;">${qMode}</span></div>
    <div style="font-size:10px;color:var(--text2);">Players: <span style="color:#4d94ff;">${claims.length}</span></div>
    ${consolation ? `<div style="font-size:10px;color:var(--text2);">Consolation: <span style="color:var(--orange);">${consolation}</span></div>` : ''}
  </div>`;

  if (!claims.length) return html + '<div style="font-size:10px;color:var(--text3);">No submissions yet.</div>';

  html += '<table class="admin-table"><thead><tr><th>RANK</th><th>PLAYER</th><th>SCORE</th><th>TIME</th><th>PRIZE</th></tr></thead><tbody>';
  claims.forEach((c, i) => {
    const rankLabel = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i+1}`;
    const prize = i < prizes.length ? prizes[i] : (consolation || '—');
    const prizeColor = i < prizes.length ? 'var(--gold)' : consolation ? 'var(--orange)' : 'var(--text3)';
    const tied = (claims[i-1] && claims[i-1].score === c.score) || (claims[i+1] && claims[i+1].score === c.score);
    const timeSec = c.time_taken ? Math.round(c.time_taken/1000)+'s' : '—';
    const timeCell = tied
      ? `<span style="color:#4d94ff;font-family:'Orbitron',monospace;font-weight:700;">${timeSec}</span>`
      : `<span style="color:var(--text2);">${timeSec}</span>`;
    html += `<tr>
      <td style="font-family:'Orbitron',monospace;font-size:12px;">${rankLabel}</td>
      <td style="color:var(--text);">${c.username}<br><span style="color:var(--text3);font-size:9px;">${c.game_user_id}</span></td>
      <td style="color:#4d94ff;font-family:'Orbitron',monospace;">${c.score}/${totalQ}</td>
      <td style="font-size:10px;">${timeCell}</td>
      <td style="color:${prizeColor};font-size:11px;">${prize}</td>
    </tr>`;
  });
  html += '</tbody></table>';
  return html;
}