export const OVER_OPTIONS = [1,2,3,4,5,6,7,8,10,12,15,20,25,30,35,40,50];
export const WICKET_OPTIONS = [1,2,3,4,5,6,7,8,9,10];
export const PLAYER_COUNT_OPTIONS = [3,4,5,6,7,8,9,10,11];

export const BALL_TYPES = {
  DOT:"0", ONE:"1", TWO:"2", THREE:"3",
  FOUR:"4", SIX:"6", WICKET:"W",
  WIDE:"Wd", NO_BALL:"Nb", LEG_BYE:"Lb",
};

export const PHASES = {
  HOME:             "home",
  HISTORY:          "history",          // list of all saved matches/series
  MATCH_VIEW:       "match-view",       // view saved match scorecard
  SERIES_SETUP:     "series-setup",
  LIMITED_SETUP:    "limited-setup",
  TEAM1:            "team1",
  TEAM2:            "team2",
  SERIES_DASHBOARD: "series-dashboard",
  TOSS:             "toss",
  INNINGS1:         "innings1",
  BETWEEN:          "between",
  INNINGS2:         "innings2",
  RESULT:           "result",
};

export const WIN_TYPE = {
  RUNS:"runs", WICKETS:"wickets", TIE:"tie",
};

export const SERIES_FORMATS = [
  { key:"single",    label:"Single Match",    totalMatches:1, icon:"🏏", description:"One-off game"        },
  { key:"best-of-3", label:"Best of 3",       totalMatches:3, icon:"🥉", description:"First to win 2"       },
  { key:"tri",       label:"Tri Series",      totalMatches:3, icon:"🔺", description:"3 matches, most wins" },
  { key:"best-of-5", label:"Best of 5",       totalMatches:5, icon:"🥈", description:"First to win 3"       },
  { key:"series-5",  label:"5-Match Series",  totalMatches:5, icon:"🏆", description:"5 matches, most wins" },
  { key:"series-7",  label:"7-Match Series",  totalMatches:7, icon:"👑", description:"7 matches, most wins" },
];
