/* eslint-env mocha */
const assert = require('assert')
const fs = require('fs')
const parser = require('./parser.js')
const path = require('path')

describe('parser.test4.pgn', () => {
  const demoPGN = fs.readFileSync(path.join(__dirname, 'parser.test4.pgn')).toString()
  describe('toString', () => {
    it('should resconstruct', async () => {
      const pgn = parser.parse(demoPGN).toString()
      assert.strictEqual(parser.cleanSpacing(demoPGN), parser.cleanSpacing(pgn))
    })
  })

  describe('parseTags', () => {
    it('should parse tags', async () => {
      const tags = parser.parseTags(demoPGN)
      assert.strictEqual(tags.Event, '?')
      assert.strictEqual(tags.Site, 'https://lichess.org/study/Nbv')
      assert.strictEqual(tags.Date, '????.??.??')
      assert.strictEqual(tags.Round, '?')
      assert.strictEqual(tags.White, 'King\'s Indian Defense')
      assert.strictEqual(tags.Black, '?')
      assert.strictEqual(tags.Result, '*')
      assert.strictEqual(tags.ECO, 'E99')
      assert.strictEqual(tags.PlyCount, '78')
      assert.strictEqual(tags.SourceDate, '2014.01.17')
    })
  })

  describe('tokenizeLines', () => {
    it('should tokenize moves', async () => {
      const tokenizedPGN = parser.tokenizeLines(demoPGN)
      const demo = parser.cleanSpacing('1.' + demoPGN.split(']\n\n1.')[1])
      const tokenized = parser.cleanSpacing(tokenizedPGN.join(' '))
      assert.strictEqual(demo.endsWith(tokenized), true)
    })
  })

  describe('parse', () => {
    it('should parse', async () => {
      const pgn = parser.parse(demoPGN)
      for (const turn of pgn.turns) {
        assert.notStrictEqual(turn.to, undefined)
        assert.notStrictEqual(turn.to, null)
        assert.notStrictEqual(turn.sequence, undefined)
        assert.notStrictEqual(turn.sequence, null)
      }
    })
  })

  describe('tokenizeLine', () => {
    it('should tokenize lines', async () => {
      const tokenizedPGN = parser.tokenizeLines(demoPGN)
      const move1 = parser.tokenizeLine(tokenizedPGN[3])
      assert.strictEqual(move1.length, 4)
      assert.strictEqual(move1[0], '4.')
      assert.strictEqual(move1[1], 'e4')
      assert.strictEqual(move1[2], 'd6')
      assert.strictEqual(move1[3], '{[%csl Rd4][%cal Gg7d4] This is the main starting point for the King\'s Indian Defense. Black gives up some space in the center to develop their kingside quickly and then look for a timely pawn strike against the center, usually the d4 square.}')
      const move2 = parser.tokenizeLine(tokenizedPGN[4])
      assert.strictEqual(move2.length, 3)
      assert.strictEqual(move2[0], '5.')
      assert.strictEqual(move2[1], 'Nf3')
      assert.strictEqual(move2[2], "(5. f3 {This is called the Samisch variation, although after learning about the 4 pawns attack, one of my student's called this the 3 and a half pawns attack! Great name but the Samisch variation is here to stay. Nowadays this is considered one of white's best responses to the King's Indian.} O-O 6. Be3 {Now black has several ways of trying to pressure white's center. I will focus on the most popular ones.} c5 {This is seen most often. It's a gambit but black will get good play in return for the pawn. More often white will decline the gambit and gain space as soon as black plays Nb8-c6.} (6... e5 {[%cal Ge5d4,Gg7e5,Gg7d4] This is another popular response. It leads to complicated play once again. White can close the position immediately or support their center.} 7. Nge2 (7. d5 $5)) 7. Nge2 (7. dxc5 dxc5 8. Qxd8 {White should trade queens considering they are opening up the center while behind in development and nowhere near castling.} Rxd8 9. Bxc5 Nc6 {[%cal Bf6d7,Bd7e5] One example of how the game could continue is...} 10. Nge2 Nd7 11. Be3 Nde5 12. Nf4 {[%csl Rd3,Rc2]} Nb4 {[%csl Re1,Re3,Ra1][%cal Gb4d3,Gb4c2] This particular position has scored well for white but generally speaking black is going for active piece play with some bothersome threats for white.}) 7... Nc6 {[%cal Rc5d4,Rc6d4,Rg7d4,Ge3d4, Ge2d4,Gd1d4]} 8. d5 Ne5 {Black has ideas like e7-e6 to strike against the center and the position can lead to very wild games.}) (5. f4 {Known as the 4 pawns attack. It has a very aggressive reputation but black has ways of getting counterplay against white's monstrous center.} O-O 6. Nf3 c5 {As usual, black attacks the d4 pawn to clarify the pawn structure in the center. Once the center is fixed, black continues to attack it.} 7. d5 e6 8. Be2 exd5 9. cxd5 {Black has many options at this point but the most common way for the game to continue is as follows...} Bg4 10. O-O Nbd7 11. h3 Bxf3 12. Bxf3 {[%cal Ya7a6,Yb7b5,Yf6e8,Ye8c7] White has the bishop pair and a big center but black is not too bothered by it. Black will shoot for queenside play with a7-a6 and b7-b5. Sometimes even Nf6-e8-c7 is a plan that black can play in this line to help support the queenside advance and to clear the way for the dark-squared bishop.}) 5... O-O 6. Be2 (6. h3 {Magnus Carlsen popularized this line when he used it to defeat Topalov in 2009. It shares some features with the Petrosian variation, mainly in that it closes the game immediately and steers the game towards maneuvering rather than pure attacks.}) 6... e5 7. O-O {This is the classical mainline. Black has a few ways of reacting to it. It depends on the type of game that black wants to get.} (7. dxe5 dxe5 {This is for people who like to fall asleep when they play chess. Just kidding, but not really. This variation does rightfully have a very drawish reputation but if black isn't careful they can slip into a worse endgame. Often times players with white will do this against higher rated players. There are more ambitious lines if white wants to fight for an advantage.} 8. Qxd8 Rxd8 9. Bg5 Re8 (9... c6 {This move invites complications in the event that white plays Nxe5.}) 10. Nd5 Nxd5 11. cxd5 c6 12. Bc4 cxd5 13. Bxd5 Nd7 $10 {[%cal Yd7b6,Yc8e6]}) (7. d5 {This variation is known as the Petrosian variation. Named after the legendary world champion. He had a famous reputation for playing in an ultra-solid, unbreakable fashion, and this variation maintains those characteristics. White solidifies their center and prevents some of the setups that are best used for black's kingside attack.}) (7. Be3 {This is the Gligoric variation, another stiff test of the King's Indian. In these lines, they tend to immediately take a different path compared to other lines.} Ng4 {This is black's most popular move.} 8. Bg5 f6 9. Bh4 g5 (9... Nc6 {This is also popular}) 10. Bg3 Nh6 {This leads to a complex game after either of White's main responses.} 11. dxe5 (11. d5 {This is also popular}) 11... dxe5) 7... Nc6 {[%cal Rc6d4,Rg7d4,Re5d4] This leads to a fighting game when white closes the center.} (7... exd4 {This is a more positional approach that players use if they are not looking to engage in the barbaric attacks of the Mar del Plata variation.} 8. Nxd4) (7... Na6 {This is another good move which has faded in popularity over the last few years.}) 8. d5 Ne7 {Black will play on the kingside and white will play on the queenside. Both sides rush to overpower the opponent. A kill or be killed type of chess! For an incredible game which illustrates this type of spirited fight, please examine the following game.} 9. Ne1 Nd7 10. f3 f5 11. Be3 f4 12. Bf2 g5 13. Nd3 Ng6 14. c5 Nf6 15. Rc1 Rf7 16. Kh1 h5 17. cxd6 cxd6 18. Nb5 a6 19. Na3 b5 20. Rc6 g4 21. Qc2 Qf8 22. Rc1 Bd7 23. Rc7 Bh6 24. Be1 h4 25. fxg4 f3 26. gxf3 Nxe4 27. Rd1 Rxf3 28. Rxd7 Rf1+ 29. Kg2 Be3 30. Bg3 hxg3 31. Rxf1 Nh4+ 32. Kh3 Qh6 33. g5 Nxg5+ 34. Kg4 Nhf3 35. Nf2 Qh4+ 36. Kf5 Rf8+ 37. Kg6 Rf6+ 38. Kxf6 Ne4+ 39. Kg6 Qg5# {So, W. - Nakamura, Hi, 0-1, 3rd Sinquefield Cup 2015, https://lichess.org/uoBA8u3I Doesn't get much more barbaric than this!} *")
    })
  })

  describe('parseTurn', () => {
    it('should parse turn', async () => {
      const tokenizedPGN = parser.tokenizeLines(demoPGN)
      const move1 = parser.parseTurn(tokenizedPGN[4])
      assert.strictEqual(move1[0].moveNumber, '5')
      assert.strictEqual(move1[0].to, 'f3')
      assert.strictEqual(move1[0].color, 'w')
      const move2 = parser.parseTurn(tokenizedPGN[1])
      assert.strictEqual(move2[0].moveNumber, '2')
      assert.strictEqual(move2[0].type, 'P')
      assert.strictEqual(move2[0].to, 'c4')
      assert.strictEqual(move2[0].color, 'w')
      assert.strictEqual(move2[1].moveNumber, '2')
      assert.strictEqual(move2[1].type, 'P')
      assert.strictEqual(move2[1].to, 'g6')
      assert.strictEqual(move2[1].color, 'b')
    })
  })

  describe('processTurn', () => {
    it('should parse turns', async () => {
      // the last move's pieces are checked for correctness
      const moveData = parser.tokenizeLines(demoPGN)
      const turns = parser.parseRecursively(moveData)
      const pieces = [
        { type: 'R', color: 'b', start: 'a8', coordinate: 'a8', image: 'bR.png' },
        { type: 'N', color: 'b', start: 'b8', coordinate: 'b8', image: 'bN.png' },
        { type: 'B', color: 'b', start: 'c8', coordinate: 'c8', image: 'bB.png' },
        { type: 'Q', color: 'b', start: 'd8', coordinate: 'd8', image: 'bQ.png' },
        { type: 'K', color: 'b', start: 'e8', coordinate: 'e8', image: 'bK.png' },
        { type: 'B', color: 'b', start: 'f8', coordinate: 'f8', image: 'bB.png' },
        { type: 'N', color: 'b', start: 'g8', coordinate: 'g8', image: 'bN.png' },
        { type: 'R', color: 'b', start: 'h8', coordinate: 'h8', image: 'bR.png' },
        { type: 'P', color: 'b', start: 'a7', coordinate: 'a7', image: 'bP.png' },
        { type: 'P', color: 'b', start: 'b7', coordinate: 'b7', image: 'bP.png' },
        { type: 'P', color: 'b', start: 'c7', coordinate: 'c7', image: 'bP.png' },
        { type: 'P', color: 'b', start: 'd7', coordinate: 'd7', image: 'bP.png' },
        { type: 'P', color: 'b', start: 'e7', coordinate: 'e7', image: 'bP.png' },
        { type: 'P', color: 'b', start: 'f7', coordinate: 'f7', image: 'bP.png' },
        { type: 'P', color: 'b', start: 'g7', coordinate: 'g7', image: 'bP.png' },
        { type: 'P', color: 'b', start: 'h7', coordinate: 'h7', image: 'bP.png' },
        { type: 'P', color: 'w', start: 'a2', coordinate: 'a2', image: 'oP.png' },
        { type: 'P', color: 'w', start: 'b2', coordinate: 'b2', image: 'oP.png' },
        { type: 'P', color: 'w', start: 'c2', coordinate: 'c2', image: 'oP.png' },
        { type: 'P', color: 'w', start: 'd2', coordinate: 'd2', image: 'oP.png' },
        { type: 'P', color: 'w', start: 'e2', coordinate: 'e2', image: 'oP.png' },
        { type: 'P', color: 'w', start: 'f2', coordinate: 'f2', image: 'oP.png' },
        { type: 'P', color: 'w', start: 'g2', coordinate: 'g2', image: 'oP.png' },
        { type: 'P', color: 'w', start: 'h2', coordinate: 'h2', image: 'oP.png' },
        { type: 'R', color: 'w', start: 'a1', coordinate: 'a1', image: 'oR.png' },
        { type: 'N', color: 'w', start: 'b1', coordinate: 'b1', image: 'oN.png' },
        { type: 'B', color: 'w', start: 'c1', coordinate: 'c1', image: 'oB.png' },
        { type: 'Q', color: 'w', start: 'd1', coordinate: 'd1', image: 'oQ.png' },
        { type: 'K', color: 'w', start: 'e1', coordinate: 'e1', image: 'oK.png' },
        { type: 'B', color: 'w', start: 'f1', coordinate: 'f1', image: 'oB.png' },
        { type: 'N', color: 'w', start: 'g1', coordinate: 'g1', image: 'oN.png' },
        { type: 'R', color: 'w', start: 'h1', coordinate: 'h1', image: 'oR.png' }
      ]
      for (const turn of turns) {
        try {
          parser.processTurn(turn, turns, pieces)
          console.log(turn.pieces.filter(piece => piece.coordinateBefore))
        } catch (error) {
          console.log('error', turn, error)
        }
      }
      // the main timeline (0)
      let piece = turns[0].pieces.filter(piece => piece.coordinateBefore)[0]
      assert.strictEqual(piece.coordinate, 'd4')
      assert.strictEqual(piece.coordinateBefore, 'd2')
      piece = turns[1].pieces.filter(piece => piece.coordinateBefore)[0]
      assert.strictEqual(piece.coordinate, 'f6')
      assert.strictEqual(piece.coordinateBefore, 'g8')      
      piece = turns[2].pieces.filter(piece => piece.coordinateBefore)[0]
      assert.strictEqual(piece.coordinate, 'c4')
      assert.strictEqual(piece.coordinateBefore, 'c2')
      piece = turns[3].pieces.filter(piece => piece.coordinateBefore)[0]
      assert.strictEqual(piece.coordinate, 'g6')
      assert.strictEqual(piece.coordinateBefore, 'g7')      
      piece = turns[4].pieces.filter(piece => piece.coordinateBefore)[0]
      assert.strictEqual(piece.coordinate, 'c3')
      assert.strictEqual(piece.coordinateBefore, 'b1')
      piece = turns[5].pieces.filter(piece => piece.coordinateBefore)[0]
      assert.strictEqual(piece.coordinate, 'g7')
      assert.strictEqual(piece.coordinateBefore, 'f8')
      piece = turns[6].pieces.filter(piece => piece.coordinateBefore)[0]
      assert.strictEqual(piece.coordinate, 'e4')
      assert.strictEqual(piece.coordinateBefore, 'e2')
      piece = turns[7].pieces.filter(piece => piece.coordinateBefore)[0]
      assert.strictEqual(piece.coordinate, 'd6')
      assert.strictEqual(piece.coordinateBefore, 'd7')
      piece = turns[8].pieces.filter(piece => piece.coordinateBefore)[0]
      console.log(piece)
      assert.strictEqual(piece.coordinate, 'f3')
      assert.strictEqual(piece.coordinateBefore, 'g1')
    })
  })
})
