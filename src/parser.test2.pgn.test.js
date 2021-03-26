/* eslint-env mocha */
const assert = require('assert')
const fs = require('fs')
const parser = require('./parser.js')
const path = require('path')

describe('parser.test2.pgn', () => {
  const demoPGN = fs.readFileSync(path.join(__dirname, 'parser.test2.pgn')).toString()
  describe('toString', () => {
    it('should resconstruct', async () => {
      const pgn = parser.parse(demoPGN).toString()
      assert.strictEqual(parser.cleanSpacing(demoPGN), parser.cleanSpacing(pgn))
    })
  })

  describe('parseTags', () => {
    it('should parse tags', async () => {
      const tags = parser.parseTags(demoPGN)
      assert.strictEqual(tags.Event, 'Wch27')
      assert.strictEqual(tags.Site, 'Moscow')
      assert.strictEqual(tags.Date, '1969.??.??')
      assert.strictEqual(tags.Round, '17')
      assert.strictEqual(tags.White, 'Spassky, Boris')
      assert.strictEqual(tags.Black, 'Petrosian, Tigran V')
      assert.strictEqual(tags.Result, '1-0')
      assert.strictEqual(tags.ECO, 'B42')
      assert.strictEqual(tags.Annotator, 'JvR')
      assert.strictEqual(tags.PlyCount, '115')
      assert.strictEqual(tags.EventDate, '1969.??.??')
    })
  })

  describe('tokenizeLines', () => {
    it('should tokenize moves', async () => {
      const tokenizedPGN = parser.tokenizeLines(demoPGN)
      const demo = parser.cleanSpacing('1.' + demoPGN.split('\n\n1.')[1])
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
      const move1 = parser.tokenizeLine(tokenizedPGN[9])
      assert.strictEqual(move1.length, 5)
      assert.strictEqual(move1[0], '10.')
      assert.strictEqual(move1[1], 'Bb2')
      assert.strictEqual(move1[2], '$1')
      assert.strictEqual(move1[3], 'a5')
      assert.strictEqual(move1[4], '({The point is} 10...Bxd2 11.Qxd2 dxe4 12.Qg5 {[#]})')
      const move2 = parser.tokenizeLine(tokenizedPGN[33])
      assert.strictEqual(move2.length, 2)
      assert.strictEqual(move2[0], '33...')
      assert.strictEqual(move2[1], 'Rd4')
    })
  })

  describe('parseTurn', () => {
    it('should parse turn', async () => {
      const tokenizedPGN = parser.tokenizeLines(demoPGN)
      const move1 = parser.parseTurn(tokenizedPGN[3])
      assert.strictEqual(move1[0].moveNumber, '4')
      assert.strictEqual(move1[0].type, 'N')
      assert.strictEqual(move1[0].capturing, true)
      assert.strictEqual(move1[0].to, 'd4')
      assert.strictEqual(move1[0].color, 'w')
      assert.strictEqual(move1[1].moveNumber, '4')
      assert.strictEqual(move1[1].to, 'a6')
      assert.strictEqual(move1[1].color, 'b')
      const move2 = parser.parseTurn(tokenizedPGN[6])
      assert.strictEqual(move2[0].moveNumber, '7')
      assert.strictEqual(move2[0].to, '')
      assert.strictEqual(move2[0].kingSideCastling, true)
      assert.strictEqual(move2[0].color, 'w')
      assert.strictEqual(move2[1].moveNumber, '7')
      assert.strictEqual(move2[1].to, 'd5')
      assert.strictEqual(move2[1].color, 'b')
    })
  })

  describe('processTurn', () => {
    it('should parse turns', async () => {
      // all moves and nested moves are checked for correctness
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
      // the main timeline
      let piece = turns[0].pieces.filter(piece => piece.coordinateBefore)[0]
      assert.strictEqual(piece.coordinate, 'e4')
      assert.strictEqual(piece.coordinateBefore, 'e2')
      piece = turns[1].pieces.filter(piece => piece.coordinateBefore)[0]
      assert.strictEqual(piece.coordinate, 'c5')
      assert.strictEqual(piece.coordinateBefore, 'c7')
      piece = turns[2].pieces.filter(piece => piece.coordinateBefore)[0]
      assert.strictEqual(piece.coordinate, 'f3')
      assert.strictEqual(piece.coordinateBefore, 'g1')
      piece = turns[3].pieces.filter(piece => piece.coordinateBefore)[0]
      assert.strictEqual(piece.coordinate, 'e6')
      assert.strictEqual(piece.coordinateBefore, 'e7')
      piece = turns[4].pieces.filter(piece => piece.coordinateBefore)[0]
      assert.strictEqual(piece.coordinate, 'd4')
      assert.strictEqual(piece.coordinateBefore, 'd2')
      piece = turns[5].pieces.filter(piece => piece.coordinateBefore)[0]
      assert.strictEqual(piece.coordinate, 'd4')
      assert.strictEqual(piece.coordinateBefore, 'c5')
      assert.strictEqual(turns[5].pieces.length, turns[4].pieces.length - 1)
      piece = turns[6].pieces.filter(piece => piece.coordinateBefore)[0]
      assert.strictEqual(piece.coordinate, 'd4')
      assert.strictEqual(piece.coordinateBefore, 'f3')
      assert.strictEqual(turns[6].pieces.length, turns[5].pieces.length - 1)
      piece = turns[7].pieces.filter(piece => piece.coordinateBefore)[0]
      assert.strictEqual(piece.coordinate, 'a6')
      assert.strictEqual(piece.coordinateBefore, 'a7')
      piece = turns[8].pieces.filter(piece => piece.coordinateBefore)[0]
      assert.strictEqual(piece.coordinate, 'd3')
      assert.strictEqual(piece.coordinateBefore, 'f1')
      piece = turns[9].pieces.filter(piece => piece.coordinateBefore)[0]
      assert.strictEqual(piece.coordinate, 'c6')
      assert.strictEqual(piece.coordinateBefore, 'b8')
      piece = turns[10].pieces.filter(piece => piece.coordinateBefore)[0]
      assert.strictEqual(piece.coordinate, 'c6')
      assert.strictEqual(piece.coordinateBefore, 'd4')
      assert.strictEqual(turns[10].pieces.length, turns[9].pieces.length - 1)
      piece = turns[11].pieces.filter(piece => piece.coordinateBefore)[0]
      assert.strictEqual(piece.coordinate, 'c6')
      assert.strictEqual(piece.coordinateBefore, 'b7')
      assert.strictEqual(turns[11].pieces.length, turns[10].pieces.length - 1)
      piece = turns[12].pieces.filter(piece => piece.coordinateBefore)
      assert.strictEqual(piece[0].coordinate, 'g1')
      assert.strictEqual(piece[0].coordinateBefore, 'e1')
      assert.strictEqual(piece[1].coordinate, 'f1')
      assert.strictEqual(piece[1].coordinateBefore, 'h1')
      piece = turns[13].pieces.filter(piece => piece.coordinateBefore)[0]
      assert.strictEqual(piece.coordinate, 'd5')
      assert.strictEqual(piece.coordinateBefore, 'd7')
      piece = turns[14].pieces.filter(piece => piece.coordinateBefore)[0]
      assert.strictEqual(piece.coordinate, 'd2')
      assert.strictEqual(piece.coordinateBefore, 'b1')
      piece = turns[15].pieces.filter(piece => piece.coordinateBefore)[0]
      assert.strictEqual(piece.coordinate, 'f6')
      assert.strictEqual(piece.coordinateBefore, 'g8')
      piece = turns[16].pieces.filter(piece => piece.coordinateBefore)[0]
      assert.strictEqual(piece.coordinate, 'b3')
      assert.strictEqual(piece.coordinateBefore, 'b2')
      piece = turns[17].pieces.filter(piece => piece.coordinateBefore)[0]
      assert.strictEqual(piece.coordinate, 'b4')
      assert.strictEqual(piece.coordinateBefore, 'f8')
      piece = turns[18].pieces.filter(piece => piece.coordinateBefore)[0]
      assert.strictEqual(piece.coordinate, 'b2')
      assert.strictEqual(piece.coordinateBefore, 'c1')
      piece = turns[19].pieces.filter(piece => piece.coordinateBefore)[0]
      assert.strictEqual(piece.coordinate, 'a5')
      assert.strictEqual(piece.coordinateBefore, 'a6')
      piece = turns[20].pieces.filter(piece => piece.coordinateBefore)[0]
      assert.strictEqual(piece.coordinate, 'c3')
      assert.strictEqual(piece.coordinateBefore, 'c2')
      piece = turns[21].pieces.filter(piece => piece.coordinateBefore)[0]
      assert.strictEqual(piece.coordinate, 'e7')
      assert.strictEqual(piece.coordinateBefore, 'b4')
      piece = turns[22].pieces.filter(piece => piece.coordinateBefore)[0]
      assert.strictEqual(piece.coordinate, 'c4')
      assert.strictEqual(piece.coordinateBefore, 'c3')
      piece = turns[23].pieces.filter(piece => piece.coordinateBefore)
      assert.strictEqual(piece[0].coordinate, 'g8')
      assert.strictEqual(piece[0].coordinateBefore, 'e8')
      assert.strictEqual(piece[1].coordinate, 'f8')
      assert.strictEqual(piece[1].coordinateBefore, 'h8')
      piece = turns[24].pieces.filter(piece => piece.coordinateBefore)[0]
      assert.strictEqual(piece.coordinate, 'c2')
      assert.strictEqual(piece.coordinateBefore, 'd1')
      piece = turns[25].pieces.filter(piece => piece.coordinateBefore)[0]
      assert.strictEqual(piece.coordinate, 'h6')
      assert.strictEqual(piece.coordinateBefore, 'h7')
      piece = turns[26].pieces.filter(piece => piece.coordinateBefore)[0]
      assert.strictEqual(piece.coordinate, 'a3')
      assert.strictEqual(piece.coordinateBefore, 'a2')
      piece = turns[27].pieces.filter(piece => piece.coordinateBefore)[0]
      assert.strictEqual(piece.coordinate, 'a6')
      assert.strictEqual(piece.coordinateBefore, 'c8')
      piece = turns[28].pieces.filter(piece => piece.coordinateBefore)[0]
      assert.strictEqual(piece.coordinate, 'e1')
      assert.strictEqual(piece.coordinateBefore, 'f1')
      piece = turns[29].pieces.filter(piece => piece.coordinateBefore)[0]
      assert.strictEqual(piece.coordinate, 'b6')
      assert.strictEqual(piece.coordinateBefore, 'd8')
      piece = turns[30].pieces.filter(piece => piece.coordinateBefore)[0]
      assert.strictEqual(piece.coordinate, 'd5')
      assert.strictEqual(piece.coordinateBefore, 'e4')
      assert.strictEqual(turns[30].pieces.length, turns[29].pieces.length - 1)
      piece = turns[31].pieces.filter(piece => piece.coordinateBefore)[0]
      assert.strictEqual(piece.coordinate, 'd5')
      assert.strictEqual(piece.coordinateBefore, 'c6')
      assert.strictEqual(turns[31].pieces.length, turns[30].pieces.length - 1)
      piece = turns[32].pieces.filter(piece => piece.coordinateBefore)[0]
      assert.strictEqual(piece.coordinate, 'd5')
      assert.strictEqual(piece.coordinateBefore, 'c4')
      assert.strictEqual(turns[32].pieces.length, turns[31].pieces.length - 1)
      piece = turns[33].pieces.filter(piece => piece.coordinateBefore)[0]
      assert.strictEqual(piece.coordinate, 'd3')
      assert.strictEqual(piece.coordinateBefore, 'a6')
      assert.strictEqual(turns[33].pieces.length, turns[32].pieces.length - 1)
      piece = turns[34].pieces.filter(piece => piece.coordinateBefore)[0]
      assert.strictEqual(piece.coordinate, 'd3')
      assert.strictEqual(piece.coordinateBefore, 'c2')
      assert.strictEqual(turns[34].pieces.length, turns[33].pieces.length - 1)
      piece = turns[35].pieces.filter(piece => piece.coordinateBefore)[0]
      assert.strictEqual(piece.coordinate, 'd8')
      assert.strictEqual(piece.coordinateBefore, 'f8')
      piece = turns[36].pieces.filter(piece => piece.coordinateBefore)[0]
      assert.strictEqual(piece.coordinate, 'c4')
      assert.strictEqual(piece.coordinateBefore, 'd2')
      piece = turns[37].pieces.filter(piece => piece.coordinateBefore)[0]
      assert.strictEqual(piece.coordinate, 'a6')
      assert.strictEqual(piece.coordinateBefore, 'b6')
      piece = turns[38].pieces.filter(piece => piece.coordinateBefore)[0]
      assert.strictEqual(piece.coordinate, 'f3')
      assert.strictEqual(piece.coordinateBefore, 'd3')
      piece = turns[39].pieces.filter(piece => piece.coordinateBefore)[0]
      assert.strictEqual(piece.coordinate, 'd5')
      assert.strictEqual(piece.coordinateBefore, 'd8')
      assert.strictEqual(turns[39].pieces.length, turns[38].pieces.length - 1)
      piece = turns[40].pieces.filter(piece => piece.coordinateBefore)[0]
      assert.strictEqual(piece.coordinate, 'd1')
      assert.strictEqual(piece.coordinateBefore, 'a1')
      piece = turns[41].pieces.filter(piece => piece.coordinateBefore)[0]
      assert.strictEqual(piece.coordinate, 'f5')
      assert.strictEqual(piece.coordinateBefore, 'd5')
      piece = turns[42].pieces.filter(piece => piece.coordinateBefore)[0]
      assert.strictEqual(piece.coordinate, 'g3')
      assert.strictEqual(piece.coordinateBefore, 'f3')
      piece = turns[43].pieces.filter(piece => piece.coordinateBefore)[0]
      assert.strictEqual(piece.coordinate, 'g5')
      assert.strictEqual(piece.coordinateBefore, 'f5')
      piece = turns[44].pieces.filter(piece => piece.coordinateBefore)[0]
      assert.strictEqual(piece.coordinate, 'c7')
      assert.strictEqual(piece.coordinateBefore, 'g3')
      piece = turns[45].pieces.filter(piece => piece.coordinateBefore)[0]
      assert.strictEqual(piece.coordinate, 'e8')
      assert.strictEqual(piece.coordinateBefore, 'a8')
      piece = turns[46].pieces.filter(piece => piece.coordinateBefore)[0]
      assert.strictEqual(piece.coordinate, 'f6')
      assert.strictEqual(piece.coordinateBefore, 'b2')
      assert.strictEqual(turns[46].pieces.length, turns[45].pieces.length - 1)
      piece = turns[47].pieces.filter(piece => piece.coordinateBefore)[0]
      assert.strictEqual(piece.coordinate, 'f6')
      assert.strictEqual(piece.coordinateBefore, 'g7')
      assert.strictEqual(turns[47].pieces.length, turns[46].pieces.length - 1)
      piece = turns[48].pieces.filter(piece => piece.coordinateBefore)[0]
      assert.strictEqual(piece.coordinate, 'd7')
      assert.strictEqual(piece.coordinateBefore, 'd1')
      piece = turns[49].pieces.filter(piece => piece.coordinateBefore)[0]
      assert.strictEqual(piece.coordinate, 'c8')
      assert.strictEqual(piece.coordinateBefore, 'e8')
      piece = turns[50].pieces.filter(piece => piece.coordinateBefore)[0]
      assert.strictEqual(piece.coordinate, 'b7')
      assert.strictEqual(piece.coordinateBefore, 'c7')
      piece = turns[51].pieces.filter(piece => piece.coordinateBefore)[0]
      assert.strictEqual(piece.coordinate, 'b7')
      assert.strictEqual(piece.coordinateBefore, 'a6')
      assert.strictEqual(turns[51].pieces.length, turns[50].pieces.length - 1)
      piece = turns[52].pieces.filter(piece => piece.coordinateBefore)[0]
      assert.strictEqual(piece.coordinate, 'b7')
      assert.strictEqual(piece.coordinateBefore, 'd7')
      assert.strictEqual(turns[52].pieces.length, turns[51].pieces.length - 1)
      piece = turns[53].pieces.filter(piece => piece.coordinateBefore)[0]
      assert.strictEqual(piece.coordinate, 'f8')
      assert.strictEqual(piece.coordinateBefore, 'g8')
      piece = turns[54].pieces.filter(piece => piece.coordinateBefore)[0]
      assert.strictEqual(piece.coordinate, 'a4')
      assert.strictEqual(piece.coordinateBefore, 'a3')
      piece = turns[55].pieces.filter(piece => piece.coordinateBefore)[0]
      assert.strictEqual(piece.coordinate, 'b4')
      assert.strictEqual(piece.coordinateBefore, 'e7')
      piece = turns[56].pieces.filter(piece => piece.coordinateBefore)[0]
      assert.strictEqual(piece.coordinate, 'e3')
      assert.strictEqual(piece.coordinateBefore, 'e1')
      piece = turns[57].pieces.filter(piece => piece.coordinateBefore)[0]
      assert.strictEqual(piece.coordinate, 'd8')
      assert.strictEqual(piece.coordinateBefore, 'c8')
      piece = turns[58].pieces.filter(piece => piece.coordinateBefore)[0]
      assert.strictEqual(piece.coordinate, 'g3')
      assert.strictEqual(piece.coordinateBefore, 'g2')
      piece = turns[59].pieces.filter(piece => piece.coordinateBefore)[0]
      assert.strictEqual(piece.coordinate, 'd1')
      assert.strictEqual(piece.coordinateBefore, 'd8')
      piece = turns[60].pieces.filter(piece => piece.coordinateBefore)[0]
      assert.strictEqual(piece.coordinate, 'g2')
      assert.strictEqual(piece.coordinateBefore, 'g1')
      piece = turns[61].pieces.filter(piece => piece.coordinateBefore)[0]
      assert.strictEqual(piece.coordinate, 'c5')
      assert.strictEqual(piece.coordinateBefore, 'g5')
      piece = turns[62].pieces.filter(piece => piece.coordinateBefore)[0]
      assert.strictEqual(piece.coordinate, 'f3')
      assert.strictEqual(piece.coordinateBefore, 'e3')
      piece = turns[63].pieces.filter(piece => piece.coordinateBefore)[0]
      assert.strictEqual(piece.coordinate, 'f5')
      assert.strictEqual(piece.coordinateBefore, 'f6')
      piece = turns[64].pieces.filter(piece => piece.coordinateBefore)[0]
      assert.strictEqual(piece.coordinate, 'g4')
      assert.strictEqual(piece.coordinateBefore, 'g3')
      piece = turns[65].pieces.filter(piece => piece.coordinateBefore)[0]
      assert.strictEqual(piece.coordinate, 'd4')
      assert.strictEqual(piece.coordinateBefore, 'd1')
      piece = turns[66].pieces.filter(piece => piece.coordinateBefore)[0]
      assert.strictEqual(piece.coordinate, 'f5')
      assert.strictEqual(piece.coordinateBefore, 'g4')
      assert.strictEqual(turns[66].pieces.length, turns[65].pieces.length - 1)
      piece = turns[67].pieces.filter(piece => piece.coordinateBefore)[0]
      assert.strictEqual(piece.coordinate, 'f5')
      assert.strictEqual(piece.coordinateBefore, 'e6')
      assert.strictEqual(turns[67].pieces.length, turns[66].pieces.length - 1)
      piece = turns[68].pieces.filter(piece => piece.coordinateBefore)[0]
      assert.strictEqual(piece.coordinate, 'b8')
      assert.strictEqual(piece.coordinateBefore, 'b7')
      piece = turns[69].pieces.filter(piece => piece.coordinateBefore)[0]
      assert.strictEqual(piece.coordinate, 'e7')
      assert.strictEqual(piece.coordinateBefore, 'f8')
      piece = turns[70].pieces.filter(piece => piece.coordinateBefore)[0]
      assert.strictEqual(piece.coordinate, 'e3')
      assert.strictEqual(piece.coordinateBefore, 'f3')
      piece = turns[71].pieces.filter(piece => piece.coordinateBefore)[0]
      assert.strictEqual(piece.coordinate, 'f6')
      assert.strictEqual(piece.coordinateBefore, 'e7')
      piece = turns[72].pieces.filter(piece => piece.coordinateBefore)[0]
      assert.strictEqual(piece.coordinate, 'b6')
      assert.strictEqual(piece.coordinateBefore, 'b8')
      piece = turns[73].pieces.filter(piece => piece.coordinateBefore)[0]
      assert.strictEqual(piece.coordinate, 'g7')
      assert.strictEqual(piece.coordinateBefore, 'f6')
      piece = turns[74].pieces.filter(piece => piece.coordinateBefore)[0]
      assert.strictEqual(piece.coordinate, 'g3')
      assert.strictEqual(piece.coordinateBefore, 'e3')
      piece = turns[75].pieces.filter(piece => piece.coordinateBefore)[0]
      assert.strictEqual(piece.coordinate, 'f8')
      assert.strictEqual(piece.coordinateBefore, 'g7')
      piece = turns[76].pieces.filter(piece => piece.coordinateBefore)[0]
      assert.strictEqual(piece.coordinate, 'b8')
      assert.strictEqual(piece.coordinateBefore, 'b6')
      piece = turns[77].pieces.filter(piece => piece.coordinateBefore)[0]
      assert.strictEqual(piece.coordinate, 'e7')
      assert.strictEqual(piece.coordinateBefore, 'f8')
      piece = turns[78].pieces.filter(piece => piece.coordinateBefore)[0]
      assert.strictEqual(piece.coordinate, 'e3')
      assert.strictEqual(piece.coordinateBefore, 'g3')
      piece = turns[79].pieces.filter(piece => piece.coordinateBefore)[0]
      assert.strictEqual(piece.coordinate, 'f6')
      assert.strictEqual(piece.coordinateBefore, 'e7')
      piece = turns[80].pieces.filter(piece => piece.coordinateBefore)[0]
      assert.strictEqual(piece.coordinate, 'b6')
      assert.strictEqual(piece.coordinateBefore, 'b8')
      piece = turns[81].pieces.filter(piece => piece.coordinateBefore)[0]
      assert.strictEqual(piece.coordinate, 'g7')
      assert.strictEqual(piece.coordinateBefore, 'f6')
      piece = turns[82].pieces.filter(piece => piece.coordinateBefore)[0]
      assert.strictEqual(piece.coordinate, 'g3')
      assert.strictEqual(piece.coordinateBefore, 'e3')
      piece = turns[83].pieces.filter(piece => piece.coordinateBefore)[0]
      assert.strictEqual(piece.coordinate, 'f8')
      assert.strictEqual(piece.coordinateBefore, 'g7')
      piece = turns[84].pieces.filter(piece => piece.coordinateBefore)[0]
      assert.strictEqual(piece.coordinate, 'h6')
      assert.strictEqual(piece.coordinateBefore, 'b6')
      assert.strictEqual(turns[84].pieces.length, turns[83].pieces.length - 1)
      piece = turns[85].pieces.filter(piece => piece.coordinateBefore)[0]
      assert.strictEqual(piece.coordinate, 'f4')
      assert.strictEqual(piece.coordinateBefore, 'f5')
      piece = turns[86].pieces.filter(piece => piece.coordinateBefore)[0]
      assert.strictEqual(piece.coordinate, 'h3')
      assert.strictEqual(piece.coordinateBefore, 'g3')
      piece = turns[87].pieces.filter(piece => piece.coordinateBefore)[0]
      assert.strictEqual(piece.coordinate, 'g7')
      assert.strictEqual(piece.coordinateBefore, 'f8')
      piece = turns[88].pieces.filter(piece => piece.coordinateBefore)[0]
      assert.strictEqual(piece.coordinate, 'h5')
      assert.strictEqual(piece.coordinateBefore, 'h6')
      piece = turns[89].pieces.filter(piece => piece.coordinateBefore)[0]
      assert.strictEqual(piece.coordinate, 'f3')
      assert.strictEqual(piece.coordinateBefore, 'f4')
      piece = turns[90].pieces.filter(piece => piece.coordinateBefore)[0]
      assert.strictEqual(piece.coordinate, 'g3')
      assert.strictEqual(piece.coordinateBefore, 'g2')
      piece = turns[91].pieces.filter(piece => piece.coordinateBefore)[0]
      assert.strictEqual(piece.coordinate, 'h5')
      assert.strictEqual(piece.coordinateBefore, 'c5')
      assert.strictEqual(turns[91].pieces.length, turns[90].pieces.length - 1)
      piece = turns[92].pieces.filter(piece => piece.coordinateBefore)[0]
      assert.strictEqual(piece.coordinate, 'h5')
      assert.strictEqual(piece.coordinateBefore, 'h3')
      assert.strictEqual(turns[92].pieces.length, turns[91].pieces.length - 1)
      piece = turns[93].pieces.filter(piece => piece.coordinateBefore)[0]
      assert.strictEqual(piece.coordinate, 'd3')
      assert.strictEqual(piece.coordinateBefore, 'd4')
      piece = turns[94].pieces.filter(piece => piece.coordinateBefore)[0]
      assert.strictEqual(piece.coordinate, 'a5')
      assert.strictEqual(piece.coordinateBefore, 'c4')
      assert.strictEqual(turns[94].pieces.length, turns[93].pieces.length - 1)
      piece = turns[95].pieces.filter(piece => piece.coordinateBefore)[0]
      assert.strictEqual(piece.coordinate, 'g6')
      assert.strictEqual(piece.coordinateBefore, 'g7')
      piece = turns[96].pieces.filter(piece => piece.coordinateBefore)[0]
      assert.strictEqual(piece.coordinate, 'b5')
      assert.strictEqual(piece.coordinateBefore, 'h5')
      piece = turns[97].pieces.filter(piece => piece.coordinateBefore)[0]
      assert.strictEqual(piece.coordinate, 'a5')
      assert.strictEqual(piece.coordinateBefore, 'b4')
      assert.strictEqual(turns[97].pieces.length, turns[96].pieces.length - 1)
      piece = turns[98].pieces.filter(piece => piece.coordinateBefore)[0]
      assert.strictEqual(piece.coordinate, 'a5')
      assert.strictEqual(piece.coordinateBefore, 'b5')
      assert.strictEqual(turns[98].pieces.length, turns[97].pieces.length - 1)
      piece = turns[99].pieces.filter(piece => piece.coordinateBefore)[0]
      assert.strictEqual(piece.coordinate, 'b3')
      assert.strictEqual(piece.coordinateBefore, 'd3')
      assert.strictEqual(turns[99].pieces.length, turns[98].pieces.length - 1)
      piece = turns[100].pieces.filter(piece => piece.coordinateBefore)[0]
      assert.strictEqual(piece.coordinate, 'a8')
      assert.strictEqual(piece.coordinateBefore, 'a5')
      piece = turns[101].pieces.filter(piece => piece.coordinateBefore)[0]
      assert.strictEqual(piece.coordinate, 'a3')
      assert.strictEqual(piece.coordinateBefore, 'b3')
      piece = turns[102].pieces.filter(piece => piece.coordinateBefore)[0]
      assert.strictEqual(piece.coordinate, 'a5')
      assert.strictEqual(piece.coordinateBefore, 'a4')
      piece = turns[103].pieces.filter(piece => piece.coordinateBefore)[0]
      assert.strictEqual(piece.coordinate, 'f5')
      assert.strictEqual(piece.coordinateBefore, 'g6')
      piece = turns[104].pieces.filter(piece => piece.coordinateBefore)[0]
      assert.strictEqual(piece.coordinate, 'a6')
      assert.strictEqual(piece.coordinateBefore, 'a5')
      piece = turns[105].pieces.filter(piece => piece.coordinateBefore)[0]
      assert.strictEqual(piece.coordinate, 'g6')
      assert.strictEqual(piece.coordinateBefore, 'f5')
      piece = turns[106].pieces.filter(piece => piece.coordinateBefore)[0]
      assert.strictEqual(piece.coordinate, 'a7')
      assert.strictEqual(piece.coordinateBefore, 'a6')
      piece = turns[107].pieces.filter(piece => piece.coordinateBefore)[0]
      assert.strictEqual(piece.coordinate, 'g7')
      assert.strictEqual(piece.coordinateBefore, 'g6')
      piece = turns[108].pieces.filter(piece => piece.coordinateBefore)[0]
      assert.strictEqual(piece.coordinate, 'h4')
      assert.strictEqual(piece.coordinateBefore, 'h2')
      piece = turns[109].pieces.filter(piece => piece.coordinateBefore)[0]
      assert.strictEqual(piece.coordinate, 'h7')
      assert.strictEqual(piece.coordinateBefore, 'g7')
      piece = turns[110].pieces.filter(piece => piece.coordinateBefore)[0]
      assert.strictEqual(piece.coordinate, 'h5')
      assert.strictEqual(piece.coordinateBefore, 'h4')
      piece = turns[111].pieces.filter(piece => piece.coordinateBefore)[0]
      assert.strictEqual(piece.coordinate, 'g7')
      assert.strictEqual(piece.coordinateBefore, 'h7')
      piece = turns[112].pieces.filter(piece => piece.coordinateBefore)[0]
      assert.strictEqual(piece.coordinate, 'h6')
      assert.strictEqual(piece.coordinateBefore, 'h5')
      piece = turns[113].pieces.filter(piece => piece.coordinateBefore)[0]
      assert.strictEqual(piece.coordinate, 'h7')
      assert.strictEqual(piece.coordinateBefore, 'g7')
      piece = turns[114].pieces.filter(piece => piece.coordinateBefore)[0]
      assert.strictEqual(piece.coordinate, 'f4')
      assert.strictEqual(piece.coordinateBefore, 'g3')
      // the first nested timeline starts at turn 10
      const timeline1 = turns[19].siblings[0]
      piece = timeline1[0].pieces.filter(piece => piece.coordinateBefore)[0]
      assert.strictEqual(piece.coordinate, 'd2')
      assert.strictEqual(piece.coordinateBefore, 'b4')
      piece = timeline1[1].pieces.filter(piece => piece.coordinateBefore)[0]
      assert.strictEqual(piece.coordinate, 'd2')
      assert.strictEqual(piece.coordinateBefore, 'd1')
      assert.strictEqual(timeline1[1].pieces.length, timeline1[0].pieces.length - 1)
      piece = timeline1[2].pieces.filter(piece => piece.coordinateBefore)[0]
      assert.strictEqual(piece.coordinate, 'e4')
      assert.strictEqual(piece.coordinateBefore, 'd5')
      assert.strictEqual(timeline1[2].pieces.length, timeline1[1].pieces.length - 1)
      piece = timeline1[3].pieces.filter(piece => piece.coordinateBefore)[0]
      assert.strictEqual(piece.coordinate, 'g5')
      assert.strictEqual(piece.coordinateBefore, 'd2')
      // the second nested timeline starts at turn 32
      const timeline2 = turns[63].siblings[0]
      piece = timeline2[0].pieces.filter(piece => piece.coordinateBefore)[0]
      assert.strictEqual(piece.coordinate, 'g7')
      assert.strictEqual(piece.coordinateBefore, 'f8')
      // the third nested timeline starts at turn 44
      const timeline3 = turns[87].siblings[0]
      piece = timeline3[0].pieces.filter(piece => piece.coordinateBefore)[0]
      assert.strictEqual(piece.coordinate, 'g5')
      assert.strictEqual(piece.coordinateBefore, 'c5')
      piece = timeline3[1].pieces.filter(piece => piece.coordinateBefore)[0]
      assert.strictEqual(piece.coordinate, 'f3')
      assert.strictEqual(piece.coordinateBefore, 'g2')
      piece = timeline3[2].pieces.filter(piece => piece.coordinateBefore)[0]
      assert.strictEqual(piece.coordinate, 'e7')
      assert.strictEqual(piece.coordinateBefore, 'f8')
      piece = timeline3[3].pieces.filter(piece => piece.coordinateBefore)[0]
      assert.strictEqual(piece.coordinate, 'h5')
      assert.strictEqual(piece.coordinateBefore, 'h3')
      piece = timeline3[4].pieces.filter(piece => piece.coordinateBefore)[0]
      assert.strictEqual(piece.coordinate, 'h5')
      assert.strictEqual(piece.coordinateBefore, 'g5')
      assert.strictEqual(timeline3[4].pieces.length, timeline3[3].pieces.length - 1)
      piece = timeline3[5].pieces.filter(piece => piece.coordinateBefore)[0]
      assert.strictEqual(piece.coordinate, 'h5')
      assert.strictEqual(piece.coordinateBefore, 'h6')
      assert.strictEqual(timeline3[5].pieces.length, timeline3[4].pieces.length - 1)
      piece = timeline3[6].pieces.filter(piece => piece.coordinateBefore)[0]
      assert.strictEqual(piece.coordinate, 'd3')
      assert.strictEqual(piece.coordinateBefore, 'd4')
      piece = timeline3[7].pieces.filter(piece => piece.coordinateBefore)[0]
      assert.strictEqual(piece.coordinate, 'g4')
      assert.strictEqual(piece.coordinateBefore, 'f3')
      piece = timeline3[8].pieces.filter(piece => piece.coordinateBefore)[0]
      assert.strictEqual(piece.coordinate, 'b3')
      assert.strictEqual(piece.coordinateBefore, 'd3')
      assert.strictEqual(timeline3[8].pieces.length, timeline3[7].pieces.length - 1)
      piece = timeline3[9].pieces.filter(piece => piece.coordinateBefore)[0]
      assert.strictEqual(piece.coordinate, 'b5')
      assert.strictEqual(piece.coordinateBefore, 'h5')
    })
  })
})
