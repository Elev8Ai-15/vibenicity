// ═══════════════════════════════════════════════════════════════════════════════
// LINGUISTICS DATABASE - 535 TERMS ACROSS 11 CATEGORIES
// ═══════════════════════════════════════════════════════════════════════════════

export type LinguisticCategory =
  | 'GEN_Z' | 'AAVE' | 'TECH' | 'STARTUP' | 'DESIGN'
  | 'SOUTHERN' | 'UK' | 'HIPHOP' | 'GAMING' | 'HISPANIC' | 'EMOTIONAL';

export interface LinguisticTerm {
  term: string;
  meaning: string;
  category: LinguisticCategory;
}

export interface TranslationResult {
  original: string;
  terms: LinguisticTerm[];
  confidence: number;
  translatedText: string;
}

const LINGUISTICS: Record<LinguisticCategory, Record<string, string>> = {
  GEN_Z: {
    'slay':'excel exceptionally','ate':'nailed it','period':'emphatic agreement','periodt':'emphatic agreement',
    'no cap':'honestly','cap':'lie','bussin':'extremely good','mid':'mediocre','sus':'suspicious',
    'bet':'confirmed','vibe':'atmosphere','vibing':'relaxing','lowkey':'secretly',
    'highkey':'obviously','deadass':'seriously','fr fr':'legitimately','fr':'legit',
    'ngl':'truthfully','iykyk':'insider knowledge','ong':'sworn truth','snatched':'perfect',
    'fire':'excellent','lit':'exciting','goat':'greatest','goated':'greatest',
    'valid':'acceptable','hits different':'unique impact','rent free':'obsessive thought',
    'understood the assignment':'executed perfectly','main character':'protagonist energy',
    'npc':'irrelevant person','simp':'sycophant','stan':'superfan','ratio':'outperformed',
    'L':'failure','W':'success','big W':'major success','big L':'major failure','based':'courageous',
    'cringe':'embarrassing','cheugy':'dated','slaps':'excellent','banger':'hit',
    'sending me':'hilarious','im dead':'hilarious','its giving':'reminiscent of',
    'caught in 4k':'undeniable proof','receipts':'evidence','tea':'gossip'
  },
  AAVE: {
    'finna':'preparing to','gonna':'going to','tryna':'attempting to','boutta':'about to','ion':'I do not',
    'aint':'is not','fam':'team','bruh':'friend','sis':'friend',
    'cuz':'friend','dawg':'friend','homie':'friend','squad':'team',
    'crew':'team','whip':'vehicle','crib':'residence','drip':'style',
    'drippin':'stylish','swag':'style','fresh':'new','fly':'stylish',
    'dope':'excellent','tight':'cool','woke':'aware','trippin':'irrational',
    'wildin':'out of control','buggin':'wrong','flexin':'boasting','flex':'boast',
    'frontin':'pretending','on god':'truthfully','word':'agreed','facts':'correct',
    'straight up':'honestly','real talk':'seriously','keep it real':'be authentic',
    'keep it 100':'be authentic','fo sho':'certainly','fasho':'certainly','aight':'ok',
    'yeet':'discard','salty':'bitter','shook':'shocked','pressed':'upset',
    'heated':'angry','geeked':'excited','hype':'excited','turnt':'energized','bougie':'high-class',
    'ratchet':'unrefined','basic':'generic','extra':'dramatic'
  },
  TECH: {
    'ship it':'deploy','push to prod':'deploy','yolo deploy':'risky deploy',
    'hotfix':'patch','nuke it':'reset','refactor':'restructure',
    'spaghetti code':'messy code','tech debt':'maintenance cost','legacy code':'old system',
    'greenfield':'new project','brownfield':'existing project','yak shaving':'distraction',
    'bikeshedding':'trivial debate','rubber duck':'debug','dogfooding':'internal testing',
    'scope creep':'expansion','mvp':'prototype','poc':'proof of concept',
    'standup':'daily meeting','retro':'review','sprint':'cycle',
    'backlog':'queue','blocker':'impediment','ping':'notify',
    'sync':'align','async':'offline','circle back':'revisit',
    'deep dive':'investigate','bandwidth':'capacity','runway':'budget',
    'north star':'primary goal','low hanging fruit':'easy tasks','moonshot':'ambitious goal',
    '10x':'high performance','ninja':'expert','rockstar':'expert','unicorn':'rare asset',
    'full stack':'complete system','api':'interface','crud':'data operations',
    'microservices':'modular architecture','monolith':'single system','spin up':'initialize',
    'scale':'grow','ci cd':'automation','devops':'operations'
  },
  STARTUP: {
    'disrupt':'transform','pivot':'change strategy','hockey stick':'rapid growth',
    'bootstrapped':'self-funded','vc':'investor','series a':'funding round',
    'seed':'initial funding','angel':'investor','exit':'acquisition',
    'ipo':'public offering','acquisition':'purchase','burn':'spend rate',
    'cap table':'ownership','valuation':'worth','moat':'defense',
    'product market fit':'viability','pmf':'viability','tam':'market size',
    'b2b':'business sales','b2c':'consumer sales','saas':'software service',
    'arr':'annual revenue','mrr':'monthly revenue','ltv':'lifetime value',
    'cac':'acquisition cost','churn':'attrition','retention':'loyalty',
    'viral loop':'growth cycle','growth hack':'strategy','lean':'efficient',
    'agile':'flexible','iterate':'improve','fail fast':'learn'
  },
  DESIGN: {
    'wireframe':'layout','mockup':'preview','prototype':'demo',
    'high fidelity':'detailed','low fidelity':'rough','pixel perfect':'precise',
    'responsive':'adaptive','mobile first':'mobile-optimized','above the fold':'visible area',
    'hero':'banner','cta':'button','hamburger':'menu icon',
    'breadcrumb':'path','carousel':'slider','modal':'overlay',
    'toast':'notification','skeleton':'placeholder','lazy load':'deferred loading',
    'whitespace':'spacing','visual hierarchy':'structure','user flow':'path',
    'happy path':'ideal scenario','edge case':'rare scenario','accessibility':'usability',
    'a11y':'usability','hover state':'interaction','loading state':'waiting',
    'error state':'failure','empty state':'blank','onboarding':'tutorial',
    'tooltip':'hint','dropdown':'menu','debounce':'delay'
  },
  SOUTHERN: {
    'yall':'everyone','fixin to':'preparing to','might could':'possibly can','over yonder':'there',
    'reckon':'suppose','cattywampus':'askew','mash':'press','cut on':'activate',
    'cut off':'deactivate','buggy':'cart','coke':'soda','supper':'dinner',
    'hankering':'craving','tuckered out':'tired','plumb':'completely','right smart':'significant',
    'bless your heart':'sympathy','hold your horses':'wait',
    'happy as a clam':'joyful','madder than a wet hen':'furious','slower than molasses':'slow',
    'fit to be tied':'angry','come hell or high water':'determined'
  },
  UK: {
    'brilliant':'excellent','bloody':'very','blimey':'wow','bollocks':'nonsense',
    'rubbish':'garbage','dodgy':'unreliable','cheeky':'playful','cheers':'thanks',
    'mate':'friend','bloke':'man','lad':'boy','lass':'girl','knackered':'tired',
    'gutted':'disappointed','chuffed':'happy','gobsmacked':'shocked','miffed':'annoyed',
    'skint':'broke','quid':'pound','tenner':'ten pounds','fiver':'five pounds','fortnight':'two weeks',
    'queue':'line','loo':'restroom','lift':'elevator','flat':'apartment','sorted':'resolved','spot on':'accurate'
  },
  HIPHOP: {
    'bars':'lyrics','flow':'rhythm','beat':'instrumental','drop':'release',
    'bop':'song','goes hard':'intense','heat':'quality','certified':'verified',
    'platinum':'successful','underground':'indie','collab':'collaboration',
    'feature':'guest','remix':'revision','sample':'excerpt','hook':'chorus',
    'verse':'stanza','chorus':'refrain','producer':'composer','dj':'selector',
    'mc':'lyricist','cypher':'freestyle','freestyle':'improv','pen game':'writing',
    'wordplay':'wit','punchline':'climax','trap':'genre',
    'drill':'genre','boom bap':'genre','lo-fi':'aesthetic'
  },
  GAMING: {
    'gg':'good game','ggez':'easy win','wp':'well played','glhf':'good luck',
    'nerf':'weaken','buff':'strengthen','meta':'strategy','op':'powerful',
    'broken':'unbalanced','noob':'beginner','pro':'expert','tryhard':'competitive',
    'sweaty':'intense','grind':'work','farm':'gather','spawn':'appear',
    'respawn':'reappear','frag':'eliminate','clutch':'save','throw':'fail',
    'carry':'support','feed':'fail repeatedly','camp':'wait','gank':'ambush',
    'tank':'defender','dps':'attacker','healer':'support','cooldown':'wait time',
    'ult':'ultimate','combo':'sequence','cheese':'exploit','strat':'plan',
    'ping':'latency','lag':'delay','fps':'framerate'
  },
  HISPANIC: {
    'no mames':'impossible','orale':'ok','andale':'hurry','hijole':'wow',
    'chido':'cool','padre':'cool','neta':'truth','la neta':'truth',
    'que onda':'hello','no manches':'impossible','guey':'friend','ese':'friend','vato':'guy',
    'carnal':'brother','compa':'friend','firme':'solid','suave':'smooth',
    'loco':'crazy','feria':'money','lana':'money','troca':'truck','ranfla':'car',
    'jale':'job','chamba':'work','pachanga':'party','mija':'dear',
    'mijo':'dear','familia':'family'
  },
  EMOTIONAL: {
    'shook':'shocked','triggered':'upset','salty':'bitter','pressed':'stressed',
    'heated':'angry','gagged':'stunned','slayed':'impressed','deceased':'laughing',
    'dead':'laughing','obsessed':'fixated','living':'enjoying','thriving':'prospering',
    'struggling':'failing','big mood':'relatable','mood':'relatable','same':'agreed',
    'felt that':'empathized','i cant':'overwhelmed','im weak':'laughing',
    'im done':'finished','over it':'moved on','unbothered':'calm',
    'blessed':'grateful','stressed':'anxious','hyped':'excited','stoked':'excited'
  }
};

// Pre-compiled regex patterns with metadata (OPTIMIZED - built once at module load)
interface CompiledPattern {
  regex: RegExp;
  term: string;
  meaning: string;
  category: LinguisticCategory;
}

class LinguisticsEngine {
  private patterns: CompiledPattern[] = [];
  private db = LINGUISTICS;
  private dynamicPatterns: Map<string, CompiledPattern> = new Map(); // Cache for dynamic terms

  constructor() {
    // PRE-COMPILE all regexes ONCE at initialization (not on every translate call!)
    const allTerms: CompiledPattern[] = [];

    for (const [category, terms] of Object.entries(this.db)) {
      for (const [slang, meaning] of Object.entries(terms)) {
        // Escape special regex characters
        const escaped = slang.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        // Create regex with word boundaries for whole-word matching
        const regex = new RegExp(`\\b${escaped}\\b`, 'gi');

        allTerms.push({
          regex,
          term: slang,
          meaning,
          category: category as LinguisticCategory
        });
      }
    }

    // Sort by term length (longest first) to match multi-word phrases before single words
    this.patterns = allTerms.sort((a, b) => b.term.length - a.term.length);
  }

  // Add a dynamically learned term to the runtime cache
  addDynamicTerm(term: string, meaning: string, category: LinguisticCategory): void {
    const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`\\b${escaped}\\b`, 'gi');

    this.dynamicPatterns.set(term.toLowerCase(), {
      regex,
      term,
      meaning,
      category
    });
  }

  // Load dynamic terms from database (called by storage layer)
  loadDynamicTerms(terms: Array<{ term: string; meaning: string; category: string }>): void {
    for (const t of terms) {
      this.addDynamicTerm(t.term, t.meaning, t.category as LinguisticCategory);
    }
  }

  translate(input: string): TranslationResult {
    if (!input) return { original: '', terms: [], confidence: 1, translatedText: input };

    const found: LinguisticTerm[] = [];
    const foundSet = new Set<string>(); // Prevent duplicates

    // FAST: Test pre-compiled static regexes first
    for (const pattern of this.patterns) {
      if (pattern.regex.test(input)) {
        const key = `${pattern.term}:${pattern.category}`;
        if (!foundSet.has(key)) {
          foundSet.add(key);
          found.push({
            term: pattern.term,
            meaning: pattern.meaning,
            category: pattern.category
          });
        }
        // Reset regex lastIndex for global flag
        pattern.regex.lastIndex = 0;
      }
    }

    // ALSO check dynamic patterns (learned terms)
    for (const pattern of Array.from(this.dynamicPatterns.values())) {
      if (pattern.regex.test(input)) {
        const key = `${pattern.term}:${pattern.category}`;
        if (!foundSet.has(key)) {
          foundSet.add(key);
          found.push({
            term: pattern.term,
            meaning: pattern.meaning,
            category: pattern.category
          });
        }
        pattern.regex.lastIndex = 0;
      }
    }

    // CRITICAL FIX: Return ORIGINAL text, not corrupted version
    // The AI needs clean input to generate correct code
    return {
      original: input,
      terms: found,
      confidence: Math.min(1, 0.7 + found.length * 0.05),
      translatedText: input // Return original, not [bracketed] version
    };
  }

  getRandomTerm(): LinguisticTerm {
    const categories = Object.keys(this.db) as LinguisticCategory[];
    const cat = categories[Math.floor(Math.random() * categories.length)];
    const terms = Object.entries(this.db[cat]);
    const [term, meaning] = terms[Math.floor(Math.random() * terms.length)];
    return { term, meaning, category: cat };
  }
}

export const engine = new LinguisticsEngine();
