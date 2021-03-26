/* eslint-env mocha */
const assert = require('assert')
const fs = require('fs')
const parser = require('./parser.js')
const path = require('path')

describe('parser.test6.pgn', () => {
  const demoPGN = fs.readFileSync(path.join(__dirname, 'parser.test6.pgn')).toString()
  describe('toString', () => {
    it('should resconstruct', async () => {
      const pgn = parser.parse(demoPGN).toString()
      assert.strictEqual(parser.cleanSpacing(demoPGN), parser.cleanSpacing(pgn))
    })
  })

  describe('parseTags', () => {
    it('should parse tags', async () => {
      const tags = parser.parseTags(demoPGN)
      assert.strictEqual(tags.Event, 'USA-01 Morphy Casual Games')
      assert.strictEqual(tags.Site, 'New York,NY')
      assert.strictEqual(tags.Date, '1857.10.11')
      assert.strictEqual(tags.Round, '?')
      assert.strictEqual(tags.White, 'Marache, Napoleon')
      assert.strictEqual(tags.Black, 'Morphy, Paul')
      assert.strictEqual(tags.Result, '0-1')
      assert.strictEqual(tags.ECO, 'C52')
      assert.strictEqual(tags.Annotator, 'ChessBase')
      assert.strictEqual(tags.PlyCount, '40')
      assert.strictEqual(tags.EventDate, '1857.10.??')
      assert.strictEqual(tags.EventType, 'game')
      assert.strictEqual(tags.EventCountry, 'USA')
      assert.strictEqual(tags.SourceTitle, 'EXT 2004')
      assert.strictEqual(tags.Source, 'ChessBase')
      assert.strictEqual(tags.SourceDate, '2003.11.25')
    })
  })

  describe('tokenizeLines', () => {
    it('should tokenize lines', async () => {
      const tokenizedPGN = parser.tokenizeLines(demoPGN)
      const demo = parser.cleanSpacing(demoPGN.split(']\n\n')[1])
      const tokenized = parser.cleanSpacing(tokenizedPGN.join(' ')).trim()
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
    it('should tokenize line', async () => {
      const tokenizedPGN = parser.tokenizeLines(demoPGN)
      const line1 = parser.tokenizeLine(tokenizedPGN[9])
      assert.strictEqual(line1.length, 3)
      assert.strictEqual(line1[0], '9.')
      assert.strictEqual(line1[1], 'O-O')
      assert.strictEqual(line1[2], "Nge7")
      const line2 = parser.tokenizeLine(tokenizedPGN[2])
      assert.strictEqual(line2.length, 3)
      assert.strictEqual(line2[0], '3.')
      assert.strictEqual(line2[1], 'Bc4')
      assert.strictEqual(line2[2], 'Bc5')
    })
  })

  describe('parseTurn', () => {
    it('should parse turn', async () => {
      const tokenizedPGN = parser.tokenizeLines(demoPGN)
      const turn1 = parser.parseTurn(tokenizedPGN[6])
      assert.strictEqual(turn1[0].type, 'P')
      assert.strictEqual(turn1[0].moveNumber, '7')
      assert.strictEqual(turn1[0].to, 'e5')
      assert.strictEqual(turn1[0].color, 'w')
      const turn2 = parser.parseTurn(tokenizedPGN[8])
      assert.strictEqual(turn2[0].moveNumber, '8')
      assert.strictEqual(turn2[0].type, 'P')
      assert.strictEqual(turn2[0].to, 'd6')
      assert.strictEqual(turn2[0].color, 'w')
      assert.strictEqual(turn2[1].moveNumber, '8')
      assert.strictEqual(turn2[1].type, 'Q')
      assert.strictEqual(turn2[1].to, 'd6')
      assert.strictEqual(turn2[1].color, 'b')
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
        parser.processTurn(turn, turns, pieces)
      }
      const finalPiecePositions = turns[turns.length - 1].pieces
      assert.strictEqual(finalPiecePositions.length, 23)
      let found = finalPiecePositions.filter(piece => piece.color === 'b' && piece.type === 'P' && piece.coordinate === 'a7')
      assert.strictEqual(found.length, 1)
      found = finalPiecePositions.filter(piece => piece.color === 'b' && piece.type === 'P' && piece.coordinate === 'b7')
      assert.strictEqual(found.length, 1)
      found = finalPiecePositions.filter(piece => piece.color === 'b' && piece.type === 'P' && piece.coordinate === 'c7')
      assert.strictEqual(found.length, 1)
      found = finalPiecePositions.filter(piece => piece.color === 'b' && piece.type === 'P' && piece.coordinate === 'f7')
      assert.strictEqual(found.length, 1)
      found = finalPiecePositions.filter(piece => piece.color === 'b' && piece.type === 'P' && piece.coordinate === 'g7')
      assert.strictEqual(found.length, 1)
      found = finalPiecePositions.filter(piece => piece.color === 'b' && piece.type === 'P' && piece.coordinate === 'h7')
      assert.strictEqual(found.length, 1)
      found = finalPiecePositions.filter(piece => piece.color === 'b' && piece.type === 'P' && piece.coordinate === 'c3')
      assert.strictEqual(found.length, 1)
      found = finalPiecePositions.filter(piece => piece.color === 'b' && piece.type === 'K' && piece.coordinate === 'g8')
      assert.strictEqual(found.length, 1)
      found = finalPiecePositions.filter(piece => piece.color === 'b' && piece.type === 'B' && piece.coordinate === 'a5')
      assert.strictEqual(found.length, 1)
      found = finalPiecePositions.filter(piece => piece.color === 'b' && piece.type === 'N' && piece.coordinate === 'g3')
      assert.strictEqual(found.length, 1)
      found = finalPiecePositions.filter(piece => piece.color === 'b' && piece.type === 'N' && piece.coordinate === 'e2')
      assert.strictEqual(found.length, 1)
      found = finalPiecePositions.filter(piece => piece.color === 'w' && piece.type === 'P' && piece.coordinate === 'a2')
      assert.strictEqual(found.length, 1)
      found = finalPiecePositions.filter(piece => piece.color === 'w' && piece.type === 'P' && piece.coordinate === 'f2')
      assert.strictEqual(found.length, 1)
      found = finalPiecePositions.filter(piece => piece.color === 'w' && piece.type === 'P' && piece.coordinate === 'g2')
      assert.strictEqual(found.length, 1)
      found = finalPiecePositions.filter(piece => piece.color === 'w' && piece.type === 'P' && piece.coordinate === 'h2')
      assert.strictEqual(found.length, 1)
      found = finalPiecePositions.filter(piece => piece.color === 'w' && piece.type === 'K' && piece.coordinate === 'g1')
      assert.strictEqual(found.length, 1)
      found = finalPiecePositions.filter(piece => piece.color === 'w' && piece.type === 'Q' && piece.coordinate === 'g6')
      assert.strictEqual(found.length, 1)
      found = finalPiecePositions.filter(piece => piece.color === 'w' && piece.type === 'B' && piece.coordinate === 'f4')
      assert.strictEqual(found.length, 1)
      found = finalPiecePositions.filter(piece => piece.color === 'w' && piece.type === 'N' && piece.coordinate === 'b1')
      assert.strictEqual(found.length, 1)
      found = finalPiecePositions.filter(piece => piece.color === 'w' && piece.type === 'R' && piece.coordinate === 'a1')
      assert.strictEqual(found.length, 1)
      found = finalPiecePositions.filter(piece => piece.color === 'w' && piece.type === 'R' && piece.coordinate === 'f1')
      assert.strictEqual(found.length, 1)
    })
  })
})
