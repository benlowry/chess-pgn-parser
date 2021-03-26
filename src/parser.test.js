/* eslint-env mocha */
const assert = require('assert')
const parser = require('./parser.js')

describe('parser.js', () => {
  describe('parse', () => {
  })

  describe('toString', () => {
  })

  describe('parseTags', () => {
  })

  describe('extractNextLine', () => {
    it('should extract turn 1', () => {
      const pgn = '1. a5 b7 2. e3 f7'
      const line = parser.extractNextLine(pgn)
      assert.strictEqual(line, '1. a5 b7')
    })

    it('should extract turn with annotation', () => {
      const pgn = '1. a5 b7 {ANNOTATION} 2. a4 b6'
      const line = parser.extractNextLine(pgn)
      assert.strictEqual(line, '1. a5 b7 {ANNOTATION}')
    })

    it('should extract turn with nested turns', () => {
      const pgn = '1. a5 b7 (1. b5 c7) 2. f1 g7'
      const line = parser.extractNextLine(pgn)
      assert.strictEqual(line, '1. a5 b7 (1. b5 c7)')
    })

    it('should extract turn with preceeding annotation', () => {
      const pgn = '{ANNOTATION} 1. a5 b7 2. h3 h7'
      const line = parser.extractNextLine(pgn)
      assert.strictEqual(line, '{ANNOTATION} 1. a5 b7')
    })

    it('should extract turn with preceeding nested turns', () => {
      const pgn = '1. a5 b7 (1. b5 c7) 2. d3 c4'
      const line = parser.extractNextLine(pgn)
      assert.strictEqual(line, '1. a5 b7 (1. b5 c7)')
    })
  })

  describe('processTurn', () => {
    it('should move piece', () => {
      const pieces = [{ type: 'Q', coordinate: 'b4', color: 'w' }]
      const turns = [{ moveNumber: '1', type: 'Q', to: 'b7', color: 'w' }]
      parser.processTurn(turns[0], turns, pieces)
      assert.strictEqual(pieces[0].coordinate, 'b7')
      assert.strictEqual(pieces[0].coordinateBefore, 'b4')
    })

    it('should capture piece', () => {
      const pieces = [
        { type: 'Q', coordinate: 'b4', color: 'w' },
        { type: 'P', coordinate: 'b7', color: 'b' }
      ]
      const turns = [{ moveNumber: '1', type: 'Q', to: 'b7', color: 'w', capturing: true }]
      parser.processTurn(turns[0], turns, pieces)
      assert.strictEqual(pieces[0].coordinate, 'b7')
      assert.strictEqual(pieces[0].coordinateBefore, 'b4')
      assert.strictEqual(pieces.length, 1)
    })

    it('should castle pieces (king-side)', () => {
      let pieces = [
        { type: 'K', coordinate: 'e1', color: 'w', start: 'e1' },
        { type: 'R', coordinate: 'h1', color: 'w', start: 'h1' }
      ]
      let turns = [{ moveNumber: '1', to: 'O-O', color: 'w', kingSideCastling: true }]
      parser.processTurn(turns[0], turns, pieces)
      assert.strictEqual(pieces[0].coordinate, 'g1')
      assert.strictEqual(pieces[1].coordinate, 'f1')
      pieces = [
        { type: 'K', coordinate: 'e8', color: 'b', start: 'e8' },
        { type: 'R', coordinate: 'h8', color: 'b', start: 'h8' }
      ]
      turns = [{ moveNumber: '1', to: 'O-O', color: 'b', kingSideCastling: true }]
      parser.processTurn(turns[0], turns, pieces)
      assert.strictEqual(pieces[0].coordinate, 'g8')
      assert.strictEqual(pieces[1].coordinate, 'f8')
    })

    it('should castle pieces (queen-side)', () => {
      let pieces = [
        { type: 'K', coordinate: 'e1', color: 'w', start: 'e1' },
        { type: 'R', coordinate: 'a1', color: 'w', start: 'a1' }
      ]
      let turns = [{ moveNumber: '1', to: 'O-O-O', color: 'w', queenSideCastling: true }]
      parser.processTurn(turns[0], turns, pieces)
      assert.strictEqual(pieces[0].coordinate, 'c1')
      assert.strictEqual(pieces[1].coordinate, 'd1')
      pieces = [
        { type: 'K', coordinate: 'e8', color: 'b', start: 'e8' },
        { type: 'R', coordinate: 'a8', color: 'b', start: 'a8' }
      ]
      turns = [{ moveNumber: '1', to: 'O-O-O', color: 'b', queenSideCastling: true }]
      parser.processTurn(turns[0], turns, pieces)
      assert.strictEqual(pieces[0].coordinate, 'c8')
      assert.strictEqual(pieces[1].coordinate, 'd8')
    })

    it('should parse alternative turns', () => {
      const pieces = [
        { type: 'Q', coordinate: 'b4', color: 'w', start: 'd1' },
        { type: 'Q', coordinate: 'g3', color: 'b', start: 'd8' }
      ]
      const turn = {
        moveNumber: '1',
        type: 'Q',
        to: 'g4',
        color: 'w',
        siblings: [
          [
            { moveNumber: '1', type: 'Q', to: 'c3', color: 'w' },
            { moveNumber: '1', type: 'Q', to: 'g8', color: 'b' }
          ]
        ]
      }
      parser.processTurn(turn, [turn], pieces)
      // on the main timeline the white queen moved to g4
      assert.strictEqual(turn.pieces[0].coordinate, 'g4')
      // the nested timeline moves the white queen to c3 and black to g8
      assert.strictEqual(turn.siblings[0][0].pieces[0].coordinate, 'c3')
      assert.strictEqual(turn.siblings[0][1].pieces[1].coordinate, 'g8')
    })
  })

  describe('createTurnObject', () => {
    it('should identify queen-side castling', () => {
      const turnObject = parser.createTurnObject('w', 1, 'O-O-O', ['O-O-O'], '1. O-O-O')
      assert.strictEqual(turnObject.queenSideCastling, true)
    })
    it('should identify king-side castling', () => {
      const turnObject = parser.createTurnObject('w', 1, 'O-O', ['O-O'], '1. O-O')
      assert.strictEqual(turnObject.kingSideCastling, true)
    })
    it('should identify capturing', () => {
      const turnObject = parser.createTurnObject('w', 1, 'xa5', ['xa5'], '1. xa5')
      assert.strictEqual(turnObject.capturing, true)
    })
    it('should identify check', () => {
      const turnObject = parser.createTurnObject('w', 1, 'a5+', ['a5+'], '1. a5+')
      assert.strictEqual(turnObject.check, true)
    })
    it('should identify checkmate', () => {
      const turnObject = parser.createTurnObject('w', 1, 'a5#', ['a5#'], '1. a5#')
      assert.strictEqual(turnObject.checkMate, true)
    })
    it('should identify column hints', () => {
      const noHint = parser.createTurnObject('w', 1, 'a5', ['fa5'], '1. fa5')
      assert.strictEqual(noHint.requireColumn, undefined)
      const turnObject = parser.createTurnObject('w', 1, 'fa5', ['fa5'], '1. fa5')
      assert.strictEqual(turnObject.requireColumn, 'f')
    })
    it('should identify row hints', () => {
      const noHint = parser.createTurnObject('w', 1, 'a5', ['fa5'], '1. fa5')
      assert.strictEqual(noHint.requireRow, undefined)
      const turnObject = parser.createTurnObject('w', 1, '4a5', ['4a5'], '1. 4a5')
      assert.strictEqual(turnObject.requireRow, '4')
    })
    it('should identify piece type', () => {
      const turnObject = parser.createTurnObject('w', 1, 'Na5', ['Na5'], '1. Na5')
      assert.strictEqual(turnObject.type, 'N')
    })
    it('should identify promotion', () => {
      const turnObject = parser.createTurnObject('w', 1, 'a5=', ['a5='], '1. a5=')
      assert.strictEqual(turnObject.promoted, true)
    })
    it('should identify default promoted type to Q', () => {
      const turnObject = parser.createTurnObject('w', 1, 'a5=', ['a5='], '1. a5=')
      assert.strictEqual(turnObject.promotedTo, 'Q')
    })
    it('should identify specified promoted type to', () => {
      const turnObject = parser.createTurnObject('w', 1, 'a5=B', ['a5=B'], '1. a5=B')
      assert.strictEqual(turnObject.promotedTo, 'B')
    })
  })

  describe('findCoordinates', () => {
    it('should find no coordinates', async () => {
      const demoPGN = '$1'
      const coordinates = parser.findCoordinates(parser.tokenizeLines(demoPGN))
      assert.strictEqual(coordinates.first, undefined)
      assert.strictEqual(coordinates.second, undefined)
    })

    it('should find one coordinates', async () => {
      const demoPGN = '$3 a4'
      const coordinates = parser.findCoordinates(parser.tokenizeLine(demoPGN))
      assert.strictEqual(coordinates.first, 'a4')
      assert.strictEqual(coordinates.second, undefined)
    })

    it('should find two coordinates', async () => {
      const demoPGN = '$1 a1 $2 a2 {third}'
      const coordinates = parser.findCoordinates(parser.tokenizeLine(demoPGN))
      assert.strictEqual(coordinates.first, 'a1')
      assert.strictEqual(coordinates.second, 'a2')
    })

    it('should ignore (content)', async () => {
      const demoPGN = 'a2 (1. a3))'
      const coordinates = parser.findCoordinates(parser.tokenizeLine(demoPGN))
      assert.strictEqual(coordinates.first, 'a2')
      assert.strictEqual(coordinates.second, undefined)
    })

    it('should ignore {content}', async () => {
      const demoPGN = '{prepended annotatio} a7 { the end }'
      const coordinates = parser.findCoordinates(parser.tokenizeLine(demoPGN))
      assert.strictEqual(coordinates.first, 'a7')
      assert.strictEqual(coordinates.second, undefined)
    })

    it('should including castling', async () => {
      const demoPGN1 = 'O-O a5'
      const coordinates1 = parser.findCoordinates(parser.tokenizeLine(demoPGN1))
      assert.strictEqual(coordinates1.first, 'O-O')
      assert.strictEqual(coordinates1.second, 'a5')
      const demoPGN2 = 'a5 O-O'
      const coordinates2 = parser.findCoordinates(parser.tokenizeLine(demoPGN2))
      assert.strictEqual(coordinates2.first, 'a5')
      assert.strictEqual(coordinates2.second, 'O-O')
      const demoPGN3 = 'O-O-0 a5'
      const coordinates3 = parser.findCoordinates(parser.tokenizeLine(demoPGN3))
      assert.strictEqual(coordinates3.first, 'O-O-0')
      assert.strictEqual(coordinates3.second, 'a5')
      const demoPGN4 = 'a5 O-O-0'
      const coordinates4 = parser.findCoordinates(parser.tokenizeLine(demoPGN4))
      assert.strictEqual(coordinates4.first, 'a5')
      assert.strictEqual(coordinates4.second, 'O-O-0')
    })
  })

  describe('findClosingBracket', () => {
    it('should find ending of []', async () => {
      const demoPGN = '1. e4 [ %cal Ra1b2 ] e5 2. Nf3 Nc6 3. Bb5 a6 { This opening is called the Ruy Lopez. } 4. Ba4 Nf6 5. O-O'
      const pgnParts = demoPGN.split(' ')
      const startingIndex = pgnParts.indexOf('[')
      const closingIndex = parser.findClosingBracket(startingIndex, pgnParts)
      const extracted = pgnParts.slice(startingIndex, closingIndex).join(' ')
      assert.strictEqual(extracted, '[ %cal Ra1b2 ]')
    })

    it('should find ending of nested []', async () => {
      const demoPGN = '1. e4 { annotated [ %cal Ra1b2 ] } e5 2. Nf3 Nc6 3. Bb5 a6 { This opening is called the Ruy Lopez. } 4. Ba4 Nf6 5. O-O'
      const pgnParts = demoPGN.split(' ')
      const startingIndex = pgnParts.indexOf('[')
      const closingIndex = parser.findClosingBracket(startingIndex, pgnParts)
      const extracted = pgnParts.slice(startingIndex, closingIndex).join(' ')
      assert.strictEqual(extracted, '[ %cal Ra1b2 ]')
    })

    it('should find ending of {}', async () => {
      const demoPGN = '1. e4 [ %cal Ra1b2 ] e5 2. Nf3 Nc6 3. Bb5 a6 { This opening is called the Ruy Lopez. } 4. Ba4 Nf6 5. O-O'
      const pgnParts = demoPGN.split(' ')
      const startingIndex = pgnParts.indexOf('{')
      const closingIndex = parser.findClosingBracket(startingIndex, pgnParts)
      const extracted = pgnParts.slice(startingIndex, closingIndex).join(' ')
      assert.strictEqual(extracted, '{ This opening is called the Ruy Lopez. }')
    })

    it('should find ending of nested {}', async () => {
      const demoPGN = '1. e4 [ %cal Ra1b2 ] e5 2. Nf3 Nc6 3. Bb5 a6 { a mistake (3. b3 a4 { This opening is called the Ruy Lopez. } ) } 4. Ba4 Nf6 5. O-O'
      const pgnParts = demoPGN.split(' ')
      const startingIndex = pgnParts.lastIndexOf('{')
      const closingIndex = parser.findClosingBracket(startingIndex, pgnParts)
      const extracted = pgnParts.slice(startingIndex, closingIndex).join(' ')
      assert.strictEqual(extracted, '{ This opening is called the Ruy Lopez. }')
    })

    it('should find ending of outer {}', async () => {
      const demoPGN = '1. e4 [ %cal Ra1b2 ] e5 2. Nf3 Nc6 3. Bb5 a6 { a mistake (3. b3 a4 { This opening is called the Ruy Lopez. } ) } 4. Ba4 Nf6 5. O-O'
      const pgnParts = demoPGN.split(' ')
      const startingIndex = pgnParts.indexOf('{')
      const closingIndex = parser.findClosingBracket(startingIndex, pgnParts)
      const extracted = pgnParts.slice(startingIndex, closingIndex).join(' ')
      assert.strictEqual(extracted, '{ a mistake (3. b3 a4 { This opening is called the Ruy Lopez. } ) }')
    })

    it('should find ending of ()', async () => {
      const demoPGN = '1. e4 [ %cal Ra1b2 ] e5 2. Nf3 Nc6 3. Bb5 a6 ( 3. b4 g7 ) 4. Ba4 Nf6 5. O-O'
      const pgnParts = demoPGN.split(' ')
      const startingIndex = pgnParts.indexOf('(')
      const closingIndex = parser.findClosingBracket(startingIndex, pgnParts)
      const extracted = pgnParts.slice(startingIndex, closingIndex).join(' ')
      assert.strictEqual(extracted, '( 3. b4 g7 )')
    })

    it('should something', () => {
      // this long line of text has a large nested segment, then a sibling, then the game continues
      const demoPGN = "5. Nf3 (5. f3 {This is called the Samisch variation, although after learning about the 4 pawns attack, one of my student's called this the 3 and a half pawns attack! Great name but the Samisch variation is here to stay. Nowadays this is considered one of white's best responses to the King's Indian.} O-O 6. Be3 {Now black has several ways of trying to pressure white's center. I will focus on the most popular ones.} c5 {This is seen most often. It's a gambit but black will get good play in return for the pawn. More often white will decline the gambit and gain space as soon as black plays Nb8-c6.} (6... e5 {[%cal Ge5d4,Gg7e5,Gg7d4] This is another popular response. It leads to complicated play once again. White can close the position immediately or support their center.} 7. Nge2 (7. d5 $5)) 7. Nge2 (7. dxc5 dxc5 8. Qxd8 {White should trade queens considering they are opening up the center while behind in development and nowhere near castling.} Rxd8 9. Bxc5 Nc6 {[%cal Bf6d7,Bd7e5] One example of how the game could continue is...} 10. Nge2 Nd7 11. Be3 Nde5 12. Nf4 {[%csl Rd3,Rc2]} Nb4 { [%csl Re1,Re3,Ra1][%cal Gb4d3,Gb4c2] This particular position has scored well for white but generally speaking black is going for active piece play with some bothersome threats for white.}) 7... Nc6 {[%cal Rc5d4,Rc6d4,Rg7d4,Ge3d4, Ge2d4,Gd1d4]} 8. d5 Ne5 {Black has ideas like e7-e6 to strike against the center and the position can lead to very wild games.}) (5. f4 {Known as the 4 pawns attack. It has a very aggressive reputation but black has ways of getting counterplay against white's monstrous center.} O-O 6. Nf3 c5 {As usual, black attacks the d4 pawn to clarify the pawn structure in the center. Once the center is fixed, black continues to attack it.} 7. d5 e6 8. Be2 exd5 9. cxd5 {Black has many options at this point but the most common way for the game to continue is as follows...} Bg4 10. O-O Nbd7 11. h3 Bxf3 12. Bxf3 { [%cal Ya7a6,Yb7b5,Yf6e8,Ye8c7] White has the bishop pair and a big center but black is not too bothered by it. Black will shoot for queenside play with a7-a6 and b7-b5. Sometimes even Nf6-e8-c7 is a plan that black can play in this line to help support the queenside advance and to clear the way for the dark-squared bishop.}) 5... O-O 6. Be2 (6. h3 {Magnus Carlsen popularized this line when he used it to defeat Topalov in 2009. It shares some features with the Petrosian variation, mainly in that it closes the game immediately and steers the game towards maneuvering rather than pure attacks.}) 6... e5 7. O-O {This is the classical mainline. Black has a few ways of reacting to it. It depends on the type of game that black wants to get.} (7. dxe5 dxe5 {This is for people who like to fall asleep when they play chess. Just kidding, but not really. This variation does rightfully have a very drawish reputation but if black isn't careful they can slip into a worse endgame. Often times players with white will do this against higher rated players. There are more ambitious lines if white wants to fight for an advantage.} 8. Qxd8 Rxd8 9. Bg5 Re8 (9... c6 {This move invites complications in the event that white plays Nxe5.}) 10. Nd5 Nxd5 11. cxd5 c6 12. Bc4 cxd5 13. Bxd5 Nd7 $10 {[%cal Yd7b6,Yc8e6]}) (7. d5 {This variation is known as the Petrosian variation. Named after the legendary world champion. He had a famous reputation for playing in an ultra-solid, unbreakable fashion, and this variation maintains those characteristics. White solidifies their center and prevents some of the setups that are best used for black's kingside attack.}) (7. Be3 {This is the Gligoric variation, another stiff test of the King's Indian. In these lines, they tend to immediately take a different path compared to other lines.} Ng4 {This is black's most popular move.} 8. Bg5 f6 9. Bh4 g5 (9... Nc6 {This is also popular}) 10. Bg3 Nh6 { This leads to a complex game after either of White's main responses.} 11. dxe5 (11. d5 {This is also popular}) 11... dxe5) 7... Nc6 {[%cal Rc6d4,Rg7d4,Re5d4] This leads to a fighting game when white closes the center.} (7... exd4 { This is a more positional approach that players use if they are not looking to engage in the barbaric attacks of the Mar del Plata variation.} 8. Nxd4) (7... Na6 {This is another good move which has faded in popularity over the last few years.}) 8. d5 Ne7 {Black will play on the kingside and white will play on the queenside. Both sides rush to overpower the opponent. A kill or be killed type of chess! For an incredible game which illustrates this type of spirited fight, please examine the following game.} 9. Ne1 Nd7 10. f3 f5 11. Be3 f4 12. Bf2 g5 13. Nd3 Ng6 14. c5 Nf6 15. Rc1 Rf7 16. Kh1 h5 17. cxd6 cxd6 18. Nb5 a6 19. Na3 b5 20. Rc6 g4 21. Qc2 Qf8 22. Rc1 Bd7 23. Rc7 Bh6 24. Be1 h4 25. fxg4 f3 26. gxf3 Nxe4 27. Rd1 Rxf3 28. Rxd7 Rf1+ 29. Kg2 Be3 30. Bg3 hxg3 31. Rxf1 Nh4+ 32. Kh3 Qh6 33. g5 Nxg5+ 34. Kg4 Nhf3 35. Nf2 Qh4+ 36. Kf5 Rf8+ 37. Kg6 Rf6+ 38. Kxf6 Ne4+ 39. Kg6 Qg5# {So, W. - Nakamura, Hi, 0-1, 3rd Sinquefield Cup 2015, https://lichess.org/uoBA8u3I Doesn't get much more barbaric than this!} *"
      const pgnParts = demoPGN.split(' ')
      const startingIndex = 2
      const closingIndex = parser.findClosingBracket(startingIndex, pgnParts)
      const extracted = pgnParts.slice(startingIndex, closingIndex).join(' ')
      assert.strictEqual(extracted, "(5. f3 {This is called the Samisch variation, although after learning about the 4 pawns attack, one of my student's called this the 3 and a half pawns attack! Great name but the Samisch variation is here to stay. Nowadays this is considered one of white's best responses to the King's Indian.} O-O 6. Be3 {Now black has several ways of trying to pressure white's center. I will focus on the most popular ones.} c5 {This is seen most often. It's a gambit but black will get good play in return for the pawn. More often white will decline the gambit and gain space as soon as black plays Nb8-c6.} (6... e5 {[%cal Ge5d4,Gg7e5,Gg7d4] This is another popular response. It leads to complicated play once again. White can close the position immediately or support their center.} 7. Nge2 (7. d5 $5)) 7. Nge2 (7. dxc5 dxc5 8. Qxd8 {White should trade queens considering they are opening up the center while behind in development and nowhere near castling.} Rxd8 9. Bxc5 Nc6 {[%cal Bf6d7,Bd7e5] One example of how the game could continue is...} 10. Nge2 Nd7 11. Be3 Nde5 12. Nf4 {[%csl Rd3,Rc2]} Nb4 { [%csl Re1,Re3,Ra1][%cal Gb4d3,Gb4c2] This particular position has scored well for white but generally speaking black is going for active piece play with some bothersome threats for white.}) 7... Nc6 {[%cal Rc5d4,Rc6d4,Rg7d4,Ge3d4, Ge2d4,Gd1d4]} 8. d5 Ne5 {Black has ideas like e7-e6 to strike against the center and the position can lead to very wild games.})")
    })
  })

  describe('tokenizeLines', () => {
  })

  describe('tokenizeLine', () => {
  })

  describe('parseTurn', () => {
  })

  describe('movePiece', () => {
  })

  describe('addRow', () => {
    it('should add 1 to row', async () => {
      const coordinate = parser.addRow('a1')
      assert.strictEqual(coordinate, 'a2')
    })

    it('should subtract 1 from row', async () => {
      const coordinate = parser.addRow('a5', -1)
      assert.strictEqual(coordinate, 'a4')
    })

    it('should subtract 2 from row', async () => {
      const coordinate = parser.addRow('a5', -2)
      assert.strictEqual(coordinate, 'a3')
    })

    it('should exceed row bounds and return undefined', async () => {
      const coordinate = parser.addRow('a8', 1)
      assert.strictEqual(coordinate, undefined)
    })

    it('should exceed row bounds and return undefined', async () => {
      const coordinate = parser.addRow('a1', -1)
      assert.strictEqual(coordinate, undefined)
    })
  })

  describe('addColumn', () => {
    it('should add 1 to column', async () => {
      const coordinate = parser.addColumn('b1')
      assert.strictEqual(coordinate, 'c1')
    })

    it('should subtract 1 from column', async () => {
      const coordinate = parser.addColumn('b1', -1)
      assert.strictEqual(coordinate, 'a1')
    })

    it('should subtract 2 from column', async () => {
      const coordinate = parser.addColumn('c1', -2)
      assert.strictEqual(coordinate, 'a1')
    })

    it('should exceed column bounds and return undefined', async () => {
      const coordinate = parser.addColumn('a1', -1)
      assert.strictEqual(coordinate, undefined)
    })

    it('should exceed column bounds and return undefined', async () => {
      const coordinate = parser.addColumn('h1', 1)
      assert.strictEqual(coordinate, undefined)
    })
  })

  describe('nextCoordinateUpLeft', () => {
    it('should add one row and subtract one column', async () => {
      const coordinate = parser.nextCoordinateUpLeft('b1')
      assert.strictEqual(coordinate, 'a2')
    })
  })

  describe('nextCoordinateUpRight', () => {
    it('should add one row and add one column', async () => {
      const coordinate = parser.nextCoordinateUpRight('e5')
      assert.strictEqual(coordinate, 'f6')
    })
  })

  describe('nextCoordinateDownLeft', () => {
    it('should subtract one row and subtract one column', async () => {
      const coordinate = parser.nextCoordinateDownLeft('f3')
      assert.strictEqual(coordinate, 'e2')
    })
  })

  describe('nextCoordinateDownRight', () => {
    it('should subtract one row and add one column', async () => {
      const coordinate = parser.nextCoordinateDownRight('d7')
      assert.strictEqual(coordinate, 'e6')
    })
  })

  describe('nextCoordinateUp', () => {
    it('should add one row', async () => {
      const coordinate = parser.nextCoordinateUp('b1')
      assert.strictEqual(coordinate, 'b2')
    })
  })

  describe('nextCoordinateDown', () => {
    it('should subtract one row', async () => {
      const coordinate = parser.nextCoordinateDown('e5')
      assert.strictEqual(coordinate, 'e4')
    })
  })

  describe('nextCoordinateLeft', () => {
    it('should subtract one column', async () => {
      const coordinate = parser.nextCoordinateLeft('f3')
      assert.strictEqual(coordinate, 'e3')
    })
  })

  describe('nextCoordinateRight', () => {
    it('should add one column', async () => {
      const coordinate = parser.nextCoordinateRight('d7')
      assert.strictEqual(coordinate, 'e7')
    })
  })

  describe('addColumnAndRow', () => {
    it('should add 1 to column', async () => {
      const coordinate = parser.addColumnAndRow('b1', 1, 0)
      assert.strictEqual(coordinate, 'c1')
    })

    it('should subtract 1 from column', async () => {
      const coordinate = parser.addColumnAndRow('b1', -1, 0)
      assert.strictEqual(coordinate, 'a1')
    })

    it('should subtract 2 from column', async () => {
      const coordinate = parser.addColumnAndRow('c1', -2, 0)
      assert.strictEqual(coordinate, 'a1')
    })

    it('should exceed column bounds and return undefined', async () => {
      const coordinate = parser.addColumnAndRow('a1', -1, 0)
      assert.strictEqual(coordinate, undefined)
    })

    it('should exceed column bounds and return undefined', async () => {
      const coordinate = parser.addColumnAndRow('h1', 1, 0)
      assert.strictEqual(coordinate, undefined)
    })

    it('should add 1 to row', async () => {
      const coordinate = parser.addColumnAndRow('a1', 0, 1)
      assert.strictEqual(coordinate, 'a2')
    })

    it('should subtract 1 from row', async () => {
      const coordinate = parser.addColumnAndRow('a5', 0, -1)
      assert.strictEqual(coordinate, 'a4')
    })

    it('should subtract 2 from row', async () => {
      const coordinate = parser.addColumnAndRow('a5', 0, -2)
      assert.strictEqual(coordinate, 'a3')
    })

    it('should exceed row bounds and return undefined', async () => {
      const coordinate = parser.addColumnAndRow('a8', 0, 1)
      assert.strictEqual(coordinate, undefined)
    })

    it('should exceed row bounds and return undefined', async () => {
      const coordinate = parser.addColumnAndRow('a1', 0, -1)
      assert.strictEqual(coordinate, undefined)
    })
  })

  describe('calculatePieceMovement', () => {
    function moveTest (description, pieces, expected) {
      it(description, () => {
        const to = expected[expected.length - 1]
        const capturing = pieces.length > 1
        const move = { to, capturing }
        const results = parser.calculatePieceMovement(pieces[0], move, pieces)
        for (const i in expected) {
          assert.strictEqual(results[i], expected[i])
        }
      })
    }
    describe('knight', () => {
      let pieces = [{ type: 'N', coordinate: 'd3', color: 'w' }]
      moveTest('should return left-left-up', pieces, ['d3', 'c3', 'b3', 'b4'])
      pieces = [{ type: 'N', coordinate: 'd3', color: 'w' }, { type: 'P', coordinate: 'b4', color: 'b' }]
      moveTest('should return left-left-up capturing', pieces, ['d3', 'c3', 'b3', 'b4'])
      pieces = [{ type: 'N', coordinate: 'd3', color: 'w' }]
      moveTest('should return left-left-down', pieces, ['d3', 'c3', 'b3', 'b2'])
      pieces = [{ type: 'N', coordinate: 'd3', color: 'w' }, { type: 'P', coordinate: 'b4', color: 'b' }]
      moveTest('should return left-left-down capturing', pieces, ['d3', 'c3', 'b3', 'b2'])
      pieces = [{ type: 'N', coordinate: 'd3', color: 'w' }]
      moveTest('should return right-right-up', pieces, ['d3', 'e3', 'f3', 'f4'])
      pieces = [{ type: 'N', coordinate: 'd3', color: 'w' }, { type: 'P', coordinate: 'f4', color: 'b' }]
      moveTest('should return right-right-up capturing', pieces, ['d3', 'e3', 'f3', 'f4'])
      pieces = [{ type: 'N', coordinate: 'd3', color: 'w' }]
      moveTest('should return right-right-down', pieces, ['d3', 'e3', 'f3', 'f2'])
      pieces = [{ type: 'N', coordinate: 'd3', color: 'w' }, { type: 'P', coordinate: 'f2', color: 'b' }]
      moveTest('should return right-right-down capturing', pieces, ['d3', 'e3', 'f3', 'f2'])
      pieces = [{ type: 'N', coordinate: 'd3', color: 'w' }]
      moveTest('should return up-up-left', pieces, ['d3', 'd4', 'd5', 'c5'])
      pieces = [{ type: 'N', coordinate: 'd3', color: 'w' }, { type: 'P', coordinate: 'c5', color: 'b' }]
      moveTest('should return up-up-left capturing', pieces, ['d3', 'd4', 'd5', 'c5'])
      pieces = [{ type: 'N', coordinate: 'd3', color: 'w' }]
      moveTest('should return up-up-right', pieces, ['d3', 'd4', 'd5', 'e5'])
      pieces = [{ type: 'N', coordinate: 'd3', color: 'w' }, { type: 'P', coordinate: 'e5', color: 'b' }]
      moveTest('should return up-up-right capturing', pieces, ['d3', 'd4', 'd5', 'e5'])
      pieces = [{ type: 'N', coordinate: 'd3', color: 'w' }]
      moveTest('should return down-down-left', pieces, ['d3', 'd2', 'd1', 'c1'])
      pieces = [{ type: 'N', coordinate: 'd3', color: 'w' }, { type: 'P', coordinate: 'c1', color: 'b' }]
      moveTest('should return down-down-left capturing', pieces, ['d3', 'd2', 'd1', 'c1'])
      pieces = [{ type: 'N', coordinate: 'd3', color: 'w' }]
      moveTest('should return down-down-right', pieces, ['d3', 'd2', 'd1', 'e1'])
      pieces = [{ type: 'N', coordinate: 'd3', color: 'w' }, { type: 'P', coordinate: 'e1', color: 'b' }]
      moveTest('should return down-down-right capturing', pieces, ['d3', 'd2', 'd1', 'e1'])
    })
    describe('pawn', () => {
      let pieces = [{ type: 'P', coordinate: 'a2', color: 'w', start: 'a2' }]
      moveTest('should return two spaces up', pieces, ['a2', 'a3', 'a4'])
      pieces = [{ type: 'P', coordinate: 'e7', color: 'b', start: 'e7' }]
      moveTest('should return two spaces down', pieces, ['e7', 'e6', 'e5'])
      pieces = [{ type: 'P', coordinate: 'a4', color: 'w', start: 'a2' }]
      moveTest('should return one space up', pieces, ['a4', 'a5'])
      pieces = [{ type: 'P', coordinate: 'e5', color: 'b', start: 'e7' }]
      moveTest('should return one space down', pieces, ['e5', 'e4'])
      pieces = [{ type: 'P', coordinate: 'd4', color: 'w', start: 'd2' }, { type: 'P', coordinate: 'c5', color: 'b', start: 'c7' }]
      moveTest('should return left-up capturing', pieces, ['d4', 'c5'])
      pieces = [{ type: 'P', coordinate: 'c5', color: 'b', start: 'c7' }, { type: 'P', coordinate: 'd4', color: 'w', start: 'd2' }]
      moveTest('should return left-down capturing', pieces, ['c5', 'd4'])
      pieces = [{ type: 'P', coordinate: 'f4', color: 'w', start: 'd2' }, { type: 'P', coordinate: 'e5', color: 'b', start: 'e7' }]
      moveTest('should return right-up capturing', pieces, ['f4', 'e5'])
      pieces = [{ type: 'P', coordinate: 'e5', color: 'b', start: 'e7' }, { type: 'P', coordinate: 'f4', color: 'w', start: 'f2' }]
      moveTest('should return right-down capturing', pieces, ['e5', 'f4'])
    })
    describe('king', () => {
      let pieces = [{ type: 'K', coordinate: 'b4', color: 'w' }]
      moveTest('should return left', pieces, ['b4', 'a4'])
      pieces = [{ type: 'K', coordinate: 'b4', color: 'w' }, { type: 'P', coordinate: 'a4', color: 'b' }]
      moveTest('should return left capturing', pieces, ['b4', 'a4'])
      pieces = [{ type: 'K', coordinate: 'a4', color: 'w' }]
      moveTest('should return right', pieces, ['a4', 'b4'])
      pieces = [{ type: 'K', coordinate: 'a4', color: 'w' }, { type: 'P', coordinate: 'b4', color: 'b' }]
      moveTest('should return right capturing', pieces, ['a4', 'b4'])
      pieces = [{ type: 'K', coordinate: 'a4', color: 'w' }]
      moveTest('should return up', pieces, ['a4', 'a5'])
      pieces = [{ type: 'K', coordinate: 'a4', color: 'w' }, { type: 'P', coordinate: 'a5', color: 'b' }]
      moveTest('should return up capturing', pieces, ['a4', 'a5'])
      pieces = [{ type: 'K', coordinate: 'e5', color: 'b' }]
      moveTest('should return down', pieces, ['e5', 'e4'])
      pieces = [{ type: 'K', coordinate: 'e5', color: 'b' }, { type: 'P', coordinate: 'e4', color: 'w' }]
      moveTest('should return down capturing', pieces, ['e5', 'e4'])
      pieces = [{ type: 'K', coordinate: 'd4', color: 'w' }]
      moveTest('should return left-up', pieces, ['d4', 'c5'])
      pieces = [{ type: 'K', coordinate: 'd4', color: 'w' }, { type: 'P', coordinate: 'c5', color: 'b' }]
      moveTest('should return left-up capturing', pieces, ['d4', 'c5'])
      pieces = [{ type: 'K', coordinate: 'c5', color: 'b' }]
      moveTest('should return left-down', pieces, ['c5', 'b4'])
      pieces = [{ type: 'K', coordinate: 'c5', color: 'b' }, { type: 'P', coordinate: 'b4', color: 'w' }]
      moveTest('should return left-down capturing', pieces, ['c5', 'b4'])
      pieces = [{ type: 'K', coordinate: 'd4', color: 'w' }]
      moveTest('should return right-up', pieces, ['d4', 'e5'])
      pieces = [{ type: 'K', coordinate: 'd4', color: 'w' }, { type: 'P', coordinate: 'e5', color: 'b' }]
      moveTest('should return right-up capturing', pieces, ['d4', 'e5'])
      pieces = [{ type: 'K', coordinate: 'e5', color: 'b' }]
      moveTest('should return right-down', pieces, ['e5', 'f4'])
      pieces = [{ type: 'K', coordinate: 'e5', color: 'b' }, { type: 'P', coordinate: 'f4', color: 'w' }]
      moveTest('should return right-down capturing', pieces, ['e5', 'f4'])
    })
    describe('rook', () => {
      let pieces = [{ type: 'R', coordinate: 'b4', color: 'w' }]
      moveTest('should return left', pieces, ['b4', 'a4'])
      pieces = [{ type: 'R', coordinate: 'f4', color: 'w' }]
      moveTest('should return left (multiple)', pieces, ['f4', 'e4', 'd4', 'c4', 'b4', 'a4'])
      pieces = [{ type: 'R', coordinate: 'b4', color: 'w' }, { type: 'P', coordinate: 'a4', color: 'b' }]
      moveTest('should return left capturing', pieces, ['b4', 'a4'])
      pieces = [{ type: 'R', coordinate: 'g5', color: 'w' }, { type: 'P', coordinate: 'b5', color: 'b' }]
      moveTest('should return left capturing (multiple)', pieces, ['g5', 'f5', 'e5', 'd5', 'c5', 'b5'])
      pieces = [{ type: 'R', coordinate: 'b4', color: 'w' }]
      moveTest('should return right', pieces, ['b4', 'c4'])
      pieces = [{ type: 'R', coordinate: 'b4', color: 'w' }]
      moveTest('should return right (multiple)', pieces, ['b4', 'c4', 'd4', 'e4', 'f4'])
      pieces = [{ type: 'R', coordinate: 'b4', color: 'w' }, { type: 'P', coordinate: 'a4', color: 'b' }]
      moveTest('should return right capturing', pieces, ['b4', 'a4'])
      pieces = [{ type: 'R', coordinate: 'b5', color: 'w' }, { type: 'P', coordinate: 'g5', color: 'b' }]
      moveTest('should return right capturing (multiple)', pieces, ['b5', 'c5', 'd5', 'e5', 'f5', 'g5'])
      pieces = [{ type: 'R', coordinate: 'b7', color: 'w' }]
      moveTest('should return down', pieces, ['b7', 'b6'])
      pieces = [{ type: 'R', coordinate: 'b7', color: 'w' }]
      moveTest('should return down (multiple)', pieces, ['b7', 'b6', 'b5', 'b4', 'b3', 'b2', 'b1'])
      pieces = [{ type: 'R', coordinate: 'b4', color: 'w' }, { type: 'P', coordinate: 'b3', color: 'b' }]
      moveTest('should return down capturing', pieces, ['b4', 'b3'])
      pieces = [{ type: 'R', coordinate: 'f8', color: 'w' }, { type: 'P', coordinate: 'f5', color: 'b' }]
      moveTest('should return down capturing (multiple)', pieces, ['f8', 'f7', 'f6', 'f5'])
      pieces = [{ type: 'R', coordinate: 'b7', color: 'w' }]
      moveTest('should return up', pieces, ['b7', 'b8'])
      pieces = [{ type: 'R', coordinate: 'b2', color: 'w' }]
      moveTest('should return up (multiple)', pieces, ['b2', 'b3', 'b4', 'b5'])
      pieces = [{ type: 'R', coordinate: 'b3', color: 'w' }, { type: 'P', coordinate: 'b4', color: 'b' }]
      moveTest('should return up capturing', pieces, ['b3', 'b4'])
      pieces = [{ type: 'R', coordinate: 'f1', color: 'w' }, { type: 'P', coordinate: 'f8', color: 'b' }]
      moveTest('should return up capturing (multiple)', pieces, ['f1', 'f2', 'f3', 'f4', 'f5', 'f6', 'f7', 'f8'])
    })

    describe('bishop', () => {
      let pieces = [{ type: 'B', coordinate: 'b4', color: 'w' }]
      moveTest('should return up-left', pieces, ['b4', 'a5'])
      pieces = [{ type: 'B', coordinate: 'f4', color: 'w' }]
      moveTest('should return up-left (multiple)', pieces, ['f4', 'e5', 'd6', 'c7'])
      pieces = [{ type: 'B', coordinate: 'b4', color: 'w' }, { type: 'P', coordinate: 'a3', color: 'b' }]
      moveTest('should return up-left capturing', pieces, ['b4', 'a3'])
      pieces = [{ type: 'B', coordinate: 'g5', color: 'w' }, { type: 'P', coordinate: 'd8', color: 'b' }]
      moveTest('should return up-left capturing (multiple)', pieces, ['g5', 'f6', 'e7', 'd8'])
      pieces = [{ type: 'B', coordinate: 'b4', color: 'w' }]
      moveTest('should return up-right', pieces, ['b4', 'c5'])
      pieces = [{ type: 'B', coordinate: 'b4', color: 'w' }]
      moveTest('should return up-right (multiple)', pieces, ['b4', 'c5', 'd6', 'e7', 'f8'])
      pieces = [{ type: 'B', coordinate: 'f7', color: 'w' }, { type: 'P', coordinate: 'g8', color: 'b' }]
      moveTest('should return up-right capturing', pieces, ['f7', 'g8'])
      pieces = [{ type: 'B', coordinate: 'e3', color: 'w' }, { type: 'P', coordinate: 'h6', color: 'b' }]
      moveTest('should return up-right capturing (multiple)', pieces, ['e3', 'f4', 'g5', 'h6'])
      pieces = [{ type: 'B', coordinate: 'g7', color: 'w' }]
      moveTest('should return down-left', pieces, ['g7', 'f6'])
      pieces = [{ type: 'B', coordinate: 'g7', color: 'w' }]
      moveTest('should return down-left (multiple)', pieces, ['g7', 'f6', 'e5', 'd4', 'c3', 'b2'])
      pieces = [{ type: 'B', coordinate: 'f5', color: 'w' }, { type: 'P', coordinate: 'd3', color: 'b' }]
      moveTest('should return down-left capturing', pieces, ['f5', 'e4', 'd3'])
      pieces = [{ type: 'B', coordinate: 'f8', color: 'w' }, { type: 'P', coordinate: 'a3', color: 'b' }]
      moveTest('should return down-left capturing (multiple)', pieces, ['f8', 'e7', 'd6', 'c5', 'b4', 'a3'])
      pieces = [{ type: 'B', coordinate: 'b7', color: 'w' }]
      moveTest('should return down-right', pieces, ['b7', 'c6'])
      pieces = [{ type: 'B', coordinate: 'e5', color: 'w' }]
      moveTest('should return down-right (multiple)', pieces, ['e5', 'f4', 'g3', 'h2'])
      pieces = [{ type: 'B', coordinate: 'b3', color: 'w' }, { type: 'P', coordinate: 'd1', color: 'b' }]
      moveTest('should return down-right capturing', pieces, ['b3', 'c2', 'd1'])
      pieces = [{ type: 'B', coordinate: 'c8', color: 'w' }, { type: 'P', coordinate: 'a6', color: 'b' }]
      moveTest('should return down-right capturing (multiple)', pieces, ['c8', 'b7', 'a6'])
    })

    describe('queen', () => {
      let pieces = [{ type: 'Q', coordinate: 'b4', color: 'w' }]
      moveTest('should return left', pieces, ['b4', 'a4'])
      pieces = [{ type: 'Q', coordinate: 'f4', color: 'w' }]
      moveTest('should return left (multiple)', pieces, ['f4', 'e4', 'd4', 'c4', 'b4', 'a4'])
      pieces = [{ type: 'Q', coordinate: 'b4', color: 'w' }, { type: 'P', coordinate: 'a4', color: 'b' }]
      moveTest('should return left capturing', pieces, ['b4', 'a4'])
      pieces = [{ type: 'Q', coordinate: 'g5', color: 'w' }, { type: 'P', coordinate: 'b5', color: 'b' }]
      moveTest('should return left capturing (multiple)', pieces, ['g5', 'f5', 'e5', 'd5', 'c5', 'b5'])
      pieces = [{ type: 'Q', coordinate: 'b4', color: 'w' }]
      moveTest('should return right', pieces, ['b4', 'c4'])
      pieces = [{ type: 'Q', coordinate: 'b4', color: 'w' }]
      moveTest('should return right (multiple)', pieces, ['b4', 'c4', 'd4', 'e4', 'f4'])
      pieces = [{ type: 'Q', coordinate: 'b4', color: 'w' }, { type: 'P', coordinate: 'a4', color: 'b' }]
      moveTest('should return right capturing', pieces, ['b4', 'a4'])
      pieces = [{ type: 'Q', coordinate: 'b5', color: 'w' }, { type: 'P', coordinate: 'g5', color: 'b' }]
      moveTest('should return right capturing (multiple)', pieces, ['b5', 'c5', 'd5', 'e5', 'f5', 'g5'])
      pieces = [{ type: 'Q', coordinate: 'b7', color: 'w' }]
      moveTest('should return down', pieces, ['b7', 'b6'])
      pieces = [{ type: 'Q', coordinate: 'b7', color: 'w' }]
      moveTest('should return down (multiple)', pieces, ['b7', 'b6', 'b5', 'b4', 'b3', 'b2', 'b1'])
      pieces = [{ type: 'Q', coordinate: 'b4', color: 'w' }, { type: 'P', coordinate: 'b3', color: 'b' }]
      moveTest('should return down capturing', pieces, ['b4', 'b3'])
      pieces = [{ type: 'Q', coordinate: 'f8', color: 'w' }, { type: 'P', coordinate: 'f5', color: 'b' }]
      moveTest('should return down capturing (multiple)', pieces, ['f8', 'f7', 'f6', 'f5'])
      pieces = [{ type: 'Q', coordinate: 'b7', color: 'w' }]
      moveTest('should return up', pieces, ['b7', 'b8'])
      pieces = [{ type: 'Q', coordinate: 'b2', color: 'w' }]
      moveTest('should return up (multiple)', pieces, ['b2', 'b3', 'b4', 'b5'])
      pieces = [{ type: 'Q', coordinate: 'b3', color: 'w' }, { type: 'P', coordinate: 'b4', color: 'b' }]
      moveTest('should return up capturing', pieces, ['b3', 'b4'])
      pieces = [{ type: 'Q', coordinate: 'f1', color: 'w' }, { type: 'P', coordinate: 'f8', color: 'b' }]
      moveTest('should return up capturing (multiple)', pieces, ['f1', 'f2', 'f3', 'f4', 'f5', 'f6', 'f7', 'f8'])
      pieces = [{ type: 'Q', coordinate: 'b4', color: 'w' }]
      moveTest('should return up-left', pieces, ['b4', 'a5'])
      pieces = [{ type: 'Q', coordinate: 'f4', color: 'w' }]
      moveTest('should return up-left (multiple)', pieces, ['f4', 'e5', 'd6', 'c7'])
      pieces = [{ type: 'Q', coordinate: 'b4', color: 'w' }, { type: 'P', coordinate: 'a3', color: 'b' }]
      moveTest('should return up-left capturing', pieces, ['b4', 'a3'])
      pieces = [{ type: 'Q', coordinate: 'g5', color: 'w' }, { type: 'P', coordinate: 'd8', color: 'b' }]
      moveTest('should return up-left capturing (multiple)', pieces, ['g5', 'f6', 'e7', 'd8'])
      pieces = [{ type: 'Q', coordinate: 'b4', color: 'w' }]
      moveTest('should return up-right', pieces, ['b4', 'c5'])
      pieces = [{ type: 'Q', coordinate: 'b4', color: 'w' }]
      moveTest('should return up-right (multiple)', pieces, ['b4', 'c5', 'd6', 'e7', 'f8'])
      pieces = [{ type: 'Q', coordinate: 'f7', color: 'w' }, { type: 'P', coordinate: 'g8', color: 'b' }]
      moveTest('should return up-right capturing', pieces, ['f7', 'g8'])
      pieces = [{ type: 'Q', coordinate: 'e3', color: 'w' }, { type: 'P', coordinate: 'h6', color: 'b' }]
      moveTest('should return up-right capturing (multiple)', pieces, ['e3', 'f4', 'g5', 'h6'])
      pieces = [{ type: 'Q', coordinate: 'g7', color: 'w' }]
      moveTest('should return down-left', pieces, ['g7', 'f6'])
      pieces = [{ type: 'Q', coordinate: 'g7', color: 'w' }]
      moveTest('should return down-left (multiple)', pieces, ['g7', 'f6', 'e5', 'd4', 'c3', 'b2'])
      pieces = [{ type: 'Q', coordinate: 'f5', color: 'w' }, { type: 'P', coordinate: 'd3', color: 'b' }]
      moveTest('should return down-left capturing', pieces, ['f5', 'e4', 'd3'])
      pieces = [{ type: 'Q', coordinate: 'f8', color: 'w' }, { type: 'P', coordinate: 'a3', color: 'b' }]
      moveTest('should return down-left capturing (multiple)', pieces, ['f8', 'e7', 'd6', 'c5', 'b4', 'a3'])
      pieces = [{ type: 'Q', coordinate: 'b7', color: 'w' }]
      moveTest('should return down-right', pieces, ['b7', 'c6'])
      pieces = [{ type: 'Q', coordinate: 'e5', color: 'w' }]
      moveTest('should return down-right (multiple)', pieces, ['e5', 'f4', 'g3', 'h2'])
      pieces = [{ type: 'Q', coordinate: 'b3', color: 'w' }, { type: 'P', coordinate: 'd1', color: 'b' }]
      moveTest('should return down-right capturing', pieces, ['b3', 'c2', 'd1'])
      pieces = [{ type: 'Q', coordinate: 'c8', color: 'w' }, { type: 'P', coordinate: 'a6', color: 'b' }]
      moveTest('should return down-right capturing (multiple)', pieces, ['c8', 'b7', 'a6'])
    })
  })
})
