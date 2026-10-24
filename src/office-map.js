// Office floor 3 as a plain grid: one character per tile, see LEGEND in maps.js.
// Regenerate from tools/gen-office.mjs, or edit by hand and run `npm test` (G in game shows coordinates, Tab the minimap).
//  0         10        20        30        40        50        60        70        80        
export const OFFICE = `
                                        ##w##w##w##w##w##w##w##w                  
                                        #......................#                  
                                        w.hmmh.p..hmmh.p.hmmh..#                  
                                        #.hmmh.p..hmmh.p.hmmh..w                  
                                        #.hmmh.p..hmmh.p.hmmh..#                  
                                        w......p.......p.......#                  
                                        #......................w                  
                                        #W.....................#                  
                                        w#####..########..=#####                  
                                        #MM..#..########..=....w                  
                                        #.......########....dd.#                  
                                        w####=..########..=.hh.#                  
                                        #hddh=..########..=....w                  
                                        #hdAh=..########..======                  
                                        whddh=..########..=....#                  
                                        #hddh=..########....dd.w                  
                                        #....=..########..=.hh.#                  
                            w##w##w##w###....X..########..=#####w##w##w##w##w##w##
                            #ccSSSccSScj#....!..########..#o#o#o#o#..............w
                            #VcccScccccc#####=..########..#y#y#y#y#..............#
                            wVcccScSQQSc#vvvv#..########..#...#...#...hhhhhhh....#
                            #ccSSScccccj#....X..########..#...#...#...ddddddd....w
                            #cccccccSScc######..g#######..#...#...#...hhhhhhh....#
                            wPccccccccccc.......########..#i..#i.i#..............#
                            #ccccjccccccc.......########..#...#...#..............w
                            ######k###########..########..##x###x#=.==============
                            =TTTTkkkkaaaaaaaaakka######E............=#############
                            =KKKKkkkkkkkkkkkkkkk&######E..^^^^^ZYZ..=............w
        w##w##              =kkkkkkkkkkkkkakkkkkR######g............=..hhhhhhh...#
        #####w              =kkkKkkKKKKkkkCkkkkkR######E...............ddddddd...#
        #######w##w##w##w##w=kkkTkkTTTTkkkakkkkka######E............=..hhhhhhh...w
        w######.LLLLLLLLL...kkkkKkkKKKKkkkCkkkkka#######..qqqqqq....=............#
        ######E.............kkkkkkkkkkkkkkakkOkka#######............=............#
        #######.............kkKTKkkkkKTKkkkkkOkka#######............=############w
        w#######..###########====D===#########..#########......##w##w##w##w##w##w#
        ########...p.....#_____________#........#LLLL#CR#..hhh.#                  
        ########...p..hhh#_____________#........#....#kkk..mmm.w                  
        w#######...p..mmm#__b______b___#hhh..p..#.ANU#kk#..mmm.#                  
        ########...p..mmm#_____________#mmm..p..#....#kk#..hhh.#                  
        ########...p..hhh#_J__J__J__J__#mmm..p.......#kk#.....pw                  
        w#######...p.....#=============#hhh..p..#....#kk#.....p#                  
        ########........Ww             #.....p..#########..hhh.#                  
        ########......hhh#             w........##d##d##...mmm.w                  
        wo#o#o.#......mmm#             #hhh.....##.##.##...mmm.#                  
        #y#y#y.x......mmmw             #mmm.....##.##.##...hhh.#                  
        #......#......hhh#             wmmm....................w                  
        wi.i...#...=======             #hhh....................#                  
        ########...=..hh.w             #.......................#                  
        ####=.........dd.#             w.......................w                  
        w...=......=..hh.#             =====....#==.===#===.===#                  
        #hd........=.....w             #h..=....#......#.......#                  
        #...=......=======             wd.......#..h...#...h...w                  
        =====......p.....#             #h..=....#..d...#...d...#                  
        #.......hhh...hhhw             #...=....#......#.......#                  
        #.......mmm...mmm#             =====....#......#.......w                  
        w.......mmm...mmm#             #........################                  
        #.......hhh...hhhw             #........################                  
        #................#             whhh....p###############w                  
        wCR..............#             #mmm.....################                  
        #................w             #mmm.....################                  
        #w##w##w##w##w##w#             whhh....p###############w                  
                                       #........################                  
                                       #w##w##w##w##w##w##w##w##                  
                                                                                  
                                                                                  
                                                                                  
`;

// Name plates on the wall beside each room door.
export const OFFICE_PLATES = [
  {"x":45,"y":9,"name":"Massage room","tile":"wall+plate"},
  {"x":45,"y":16,"name":"M2 - Meeting room","tile":"glass+plate"},
  {"x":58,"y":9,"name":"M1 - Meeting room","tile":"glass+plate"},
  {"x":58,"y":14,"name":"S1 - Small room","tile":"glass+plate"},
  {"x":45,"y":20,"name":"Server room","tile":"wall+plate"},
  {"x":33,"y":25,"name":"Chill room","tile":"wall+plate"},
  {"x":59,"y":25,"name":"Men's restroom","tile":"wall+plate"},
  {"x":63,"y":25,"name":"Women's restroom","tile":"wall+plate"},
  {"x":66,"y":25,"name":"L2 - Large room","tile":"glass+plate"},
  {"x":68,"y":28,"name":"L3 - Large room","tile":"glass+plate"},
  {"x":48,"y":38,"name":"IT storage","tile":"wall+plate"},
  {"x":56,"y":35,"name":"Kitchenette","tile":"wall+plate"},
  {"x":49,"y":44,"name":"PB 1 - phone booth","tile":"wall+plate"},
  {"x":52,"y":44,"name":"PB 2 - phone booth","tile":"wall+plate"},
  {"x":43,"y":50,"name":"S2 - Training room","tile":"glass+plate"},
  {"x":50,"y":49,"name":"Manager room 2","tile":"glass+plate"},
  {"x":58,"y":49,"name":"Manager room 1","tile":"glass+plate"},
  {"x":19,"y":47,"name":"S3 - Retro room","tile":"glass+plate"},
  {"x":15,"y":43,"name":"Restroom","tile":"wall+plate"},
  {"x":12,"y":49,"name":"PB 3 - one-person room","tile":"glass+plate"},
];
