/* eslint-env mocha */
const assert = require('assert')
const fs = require('fs')
const parser = require('./parser.js')
const path = require('path')

describe('parser.test3.pgn', () => {
  const demoPGN = fs.readFileSync(path.join(__dirname, 'parser.test3.pgn')).toString()
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
      assert.strictEqual(tags.Site, '?')
      assert.strictEqual(tags.Date, '2020.11.08')
      assert.strictEqual(tags.Round, '?')
      assert.strictEqual(tags.White, '5 Traps You Need to Know')
      assert.strictEqual(tags.Black, '?')
      assert.strictEqual(tags.Result, '*')
      assert.strictEqual(tags.ECO, 'C50')
      assert.strictEqual(tags.Annotator, 'Mac')
      assert.strictEqual(tags.PlyCount, '14')
      assert.strictEqual(tags.EventDate, '2020.??.??')
      assert.strictEqual(tags.SourceDate, '2020.11.08')
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

    it('should parse nested timeline1s in', async () => {
      const pgn = parser.parse(demoPGN)
      assert.strictEqual(pgn.turns[0].moveNumber, '1')
      assert.strictEqual(pgn.turns[0].to, 'e4')
      assert.strictEqual(pgn.turns[0].color, 'w')
      assert.strictEqual(pgn.turns[0].siblings.length, 1)
      assert.strictEqual(pgn.turns[0].siblings[0][0].moveNumber, '1')
      assert.strictEqual(pgn.turns[0].siblings[0][0].to, 'd4')
      assert.strictEqual(pgn.turns[0].siblings[0][0].color, 'w')
    })
  })

  describe('tokenizeLine', () => {
    it('should tokenize lines', async () => {
      const tokenizedPGN = parser.tokenizeLines(demoPGN)
      const move1 = parser.tokenizeLine(tokenizedPGN[2])
      assert.strictEqual(move1.length, 3)
      assert.strictEqual(move1[0], '2.')
      assert.strictEqual(move1[1], 'Nf3')
      assert.strictEqual(move1[2], 'Nc6')
      const move2 = parser.tokenizeLine(tokenizedPGN[7])
      assert.strictEqual(move2.length, 7)
      assert.strictEqual(move2[0], '5.')
      assert.strictEqual(move2[1], 'Nxf7')
      assert.strictEqual(move2[2], '$4')
      assert.strictEqual(move2[3], '{[%cal Rf7g5,Rf7h8] After this natural move though, there is no turning back. White went from worse to completely losing with this move.}')
      assert.strictEqual(move2[4], 'Qxg2')
      assert.strictEqual(move2[5], '$1')
      assert.strictEqual(move2[6], '{[%csl Rh1][%cal Rg2h1]}')
    })
  })

  describe('parseTurn', () => {
    it('should parse turn', async () => {
      const tokenizedPGN = parser.tokenizeLines(demoPGN)
      const move1 = parser.parseTurn(tokenizedPGN[1])
      assert.strictEqual(move1.length, 1)
      assert.strictEqual(move1[0].moveNumber, '1')
      assert.strictEqual(move1[0].to, 'e5')
      assert.strictEqual(move1[0].color, 'b')
      const move2 = parser.parseTurn(tokenizedPGN[5])
      assert.strictEqual(move2.length, 1)
      assert.strictEqual(move2[0].moveNumber, '4')
      assert.strictEqual(move2[0].type, 'N')
      assert.strictEqual(move2[0].capturing, true)
      assert.strictEqual(move2[0].to, 'e5')
      assert.strictEqual(move2[0].color, 'w')
      assert.strictEqual(move2[0].sequence.length, 4)
      assert.strictEqual(move2[0].sequence[1], '$2')
      assert.strictEqual(move2[0].sequence[2], '{[%csl Re5,Rg2] This unsuspecting move is a costly mistake, allowing Black a double attack.}')
      assert.strictEqual(move2[0].sequence[3], '(4. Nxd4 $1 exd4 5. O-O {With an advantage})')
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
        try {
          parser.processTurn(turn, turns, pieces)
        } catch (error) {
          // console.log('error processing turn', turn.pgn)
        }
      }
      // approximately true-scale timeline map
      // 0 0 0 0 0 0 0 0 0 0 0 0 0 0
      //             101010    1111
      //         9 9 9 9 9 9 9
      //   5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5 5
      //                         6   8 8 8
      //                         7
      // 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1
      //   2 2 2 2 2 2 2 2 2 2 2 2 2 2 2
      //                   3   4 4

      // the main timeline (0)
      let piece = turns[0].pieces.filter(piece => piece.coordinateBefore)[0]
      assert.strictEqual(piece.coordinate, 'e4')
      assert.strictEqual(piece.coordinateBefore, 'e2')
      piece = turns[1].pieces.filter(piece => piece.coordinateBefore)[0]
      assert.strictEqual(piece.coordinate, 'e5')
      assert.strictEqual(piece.coordinateBefore, 'e7')
      piece = turns[2].pieces.filter(piece => piece.coordinateBefore)[0]
      assert.strictEqual(piece.coordinate, 'f3')
      assert.strictEqual(piece.coordinateBefore, 'g1')
      piece = turns[3].pieces.filter(piece => piece.coordinateBefore)[0]
      assert.strictEqual(piece.coordinate, 'c6')
      assert.strictEqual(piece.coordinateBefore, 'b8')
      piece = turns[4].pieces.filter(piece => piece.coordinateBefore)[0]
      assert.strictEqual(piece.coordinate, 'c4')
      assert.strictEqual(piece.coordinateBefore, 'f1')
      piece = turns[5].pieces.filter(piece => piece.coordinateBefore)[0]
      assert.strictEqual(piece.coordinate, 'd4')
      assert.strictEqual(piece.coordinateBefore, 'c6')
      piece = turns[6].pieces.filter(piece => piece.coordinateBefore)[0]
      assert.strictEqual(piece.coordinate, 'e5')
      assert.strictEqual(piece.coordinateBefore, 'f3')
      assert.strictEqual(turns[6].pieces.length, turns[5].pieces.length - 1)
      piece = turns[7].pieces.filter(piece => piece.coordinateBefore)[0]
      assert.strictEqual(piece.coordinate, 'g5')
      assert.strictEqual(piece.coordinateBefore, 'd8')
      piece = turns[8].pieces.filter(piece => piece.coordinateBefore)[0]
      assert.strictEqual(piece.coordinate, 'f7')
      assert.strictEqual(piece.coordinateBefore, 'e5')
      piece = turns[9].pieces.filter(piece => piece.coordinateBefore)[0]
      assert.strictEqual(piece.coordinate, 'g2')
      assert.strictEqual(piece.coordinateBefore, 'g5')
      piece = turns[10].pieces.filter(piece => piece.coordinateBefore)[0]
      assert.strictEqual(piece.coordinate, 'f1')
      assert.strictEqual(piece.coordinateBefore, 'h1')
      piece = turns[11].pieces.filter(piece => piece.coordinateBefore)[0]
      assert.strictEqual(piece.coordinate, 'e4')
      assert.strictEqual(piece.coordinateBefore, 'g2')
      piece = turns[12].pieces.filter(piece => piece.coordinateBefore)[0]
      assert.strictEqual(piece.coordinate, 'e2')
      assert.strictEqual(piece.coordinateBefore, 'c4')
      piece = turns[13].pieces.filter(piece => piece.coordinateBefore)[0]
      assert.strictEqual(piece.coordinate, 'f3')
      assert.strictEqual(piece.coordinateBefore, 'd4')
      // the first nested timeline
      const timeline1 = turns[0].siblings[0]
      piece = timeline1[0].pieces.filter(piece => piece.coordinateBefore)[0]
      assert.strictEqual(piece.coordinate, 'd4')
      assert.strictEqual(piece.coordinateBefore, 'd2')
      piece = timeline1[1].pieces.filter(piece => piece.coordinateBefore)[0]
      assert.strictEqual(piece.coordinate, 'd5')
      assert.strictEqual(piece.coordinateBefore, 'd7')
      piece = timeline1[2].pieces.filter(piece => piece.coordinateBefore)[0]
      assert.strictEqual(piece.coordinate, 'c4')
      assert.strictEqual(piece.coordinateBefore, 'c2')
      piece = timeline1[3].pieces.filter(piece => piece.coordinateBefore)[0]
      assert.strictEqual(piece.coordinate, 'e6')
      assert.strictEqual(piece.coordinateBefore, 'e7')
      piece = timeline1[4].pieces.filter(piece => piece.coordinateBefore)[0]
      assert.strictEqual(piece.coordinate, 'c3')
      assert.strictEqual(piece.coordinateBefore, 'b1')
      piece = timeline1[5].pieces.filter(piece => piece.coordinateBefore)[0]
      assert.strictEqual(piece.coordinate, 'f6')
      assert.strictEqual(piece.coordinateBefore, 'g8')
      piece = timeline1[6].pieces.filter(piece => piece.coordinateBefore)[0]
      assert.strictEqual(piece.coordinate, 'd5')
      assert.strictEqual(piece.coordinateBefore, 'c4')
      piece = timeline1[7].pieces.filter(piece => piece.coordinateBefore)[0]
      assert.strictEqual(piece.coordinate, 'd5')
      assert.strictEqual(piece.coordinateBefore, 'e6')
      piece = timeline1[8].pieces.filter(piece => piece.coordinateBefore)[0]
      assert.strictEqual(piece.coordinate, 'g5')
      assert.strictEqual(piece.coordinateBefore, 'c1')
      piece = timeline1[9].pieces.filter(piece => piece.coordinateBefore)[0]
      assert.strictEqual(piece.coordinate, 'd7')
      assert.strictEqual(piece.coordinateBefore, 'b8')
      piece = timeline1[10].pieces.filter(piece => piece.coordinateBefore)[0]
      assert.strictEqual(piece.coordinate, 'd5')
      assert.strictEqual(piece.coordinateBefore, 'c3')
      piece = timeline1[11].pieces.filter(piece => piece.coordinateBefore)[0]
      assert.strictEqual(piece.coordinate, 'd5')
      assert.strictEqual(piece.coordinateBefore, 'f6')
      piece = timeline1[12].pieces.filter(piece => piece.coordinateBefore)[0]
      assert.strictEqual(piece.coordinate, 'd8')
      assert.strictEqual(piece.coordinateBefore, 'g5')
      piece = timeline1[13].pieces.filter(piece => piece.coordinateBefore)[0]
      assert.strictEqual(piece.coordinate, 'b4')
      assert.strictEqual(piece.coordinateBefore, 'f8')
      piece = timeline1[14].pieces.filter(piece => piece.coordinateBefore)[0]
      assert.strictEqual(piece.coordinate, 'd2')
      assert.strictEqual(piece.coordinateBefore, 'd1')
      piece = timeline1[15].pieces.filter(piece => piece.coordinateBefore)[0]
      assert.strictEqual(piece.coordinate, 'd2')
      assert.strictEqual(piece.coordinateBefore, 'b4')
      assert.strictEqual(timeline1[15].pieces.length, timeline1[14].pieces.length - 1)
      piece = timeline1[16].pieces.filter(piece => piece.coordinateBefore)[0]
      assert.strictEqual(piece.coordinate, 'd2')
      assert.strictEqual(piece.coordinateBefore, 'e1')
      assert.strictEqual(timeline1[16].pieces.length, timeline1[15].pieces.length - 1)
      piece = timeline1[17].pieces.filter(piece => piece.coordinateBefore)[0]
      assert.strictEqual(piece.coordinate, 'd8')
      assert.strictEqual(piece.coordinateBefore, 'e8')
      assert.strictEqual(timeline1[17].pieces.length, timeline1[16].pieces.length - 1)
      // the second nested timeline comes off the first
      const timeline2 = timeline1[1].siblings[0]
      piece = timeline2[0].pieces.filter(piece => piece.coordinateBefore)[0]
      assert.strictEqual(piece.coordinate, 'e5')
      assert.strictEqual(piece.coordinateBefore, 'e7')
      piece = timeline2[1].pieces.filter(piece => piece.coordinateBefore)[0]
      assert.strictEqual(piece.coordinate, 'e5')
      assert.strictEqual(piece.coordinateBefore, 'd4')
      assert.strictEqual(timeline2[1].pieces.length, timeline2[0].pieces.length - 1)
      piece = timeline2[2].pieces.filter(piece => piece.coordinateBefore)[0]
      assert.strictEqual(piece.coordinate, 'c6')
      assert.strictEqual(piece.coordinateBefore, 'b8')
      piece = timeline2[3].pieces.filter(piece => piece.coordinateBefore)[0]
      assert.strictEqual(piece.coordinate, 'f3')
      assert.strictEqual(piece.coordinateBefore, 'g1')
      piece = timeline2[4].pieces.filter(piece => piece.coordinateBefore)[0]
      assert.strictEqual(piece.coordinate, 'e7')
      assert.strictEqual(piece.coordinateBefore, 'd8')
      piece = timeline2[5].pieces.filter(piece => piece.coordinateBefore)[0]
      assert.strictEqual(piece.coordinate, 'f4')
      assert.strictEqual(piece.coordinateBefore, 'c1')
      piece = timeline2[6].pieces.filter(piece => piece.coordinateBefore)[0]
      assert.strictEqual(piece.coordinate, 'b4')
      assert.strictEqual(piece.coordinateBefore, 'e7')
      piece = timeline2[7].pieces.filter(piece => piece.coordinateBefore)[0]
      assert.strictEqual(piece.coordinate, 'd2')
      assert.strictEqual(piece.coordinateBefore, 'f4')
      piece = timeline2[8].pieces.filter(piece => piece.coordinateBefore)[0]
      assert.strictEqual(piece.coordinate, 'b2')
      assert.strictEqual(piece.coordinateBefore, 'b4')
      assert.strictEqual(timeline2[8].pieces.length, timeline2[7].pieces.length - 1)
      piece = timeline2[9].pieces.filter(piece => piece.coordinateBefore)[0]
      assert.strictEqual(piece.coordinate, 'c3')
      assert.strictEqual(piece.coordinateBefore, 'd2')
      piece = timeline2[10].pieces.filter(piece => piece.coordinateBefore)[0]
      assert.strictEqual(piece.coordinate, 'b4')
      assert.strictEqual(piece.coordinateBefore, 'f8')
      piece = timeline2[11].pieces.filter(piece => piece.coordinateBefore)[0]
      assert.strictEqual(piece.coordinate, 'd2')
      assert.strictEqual(piece.coordinateBefore, 'd1')
      piece = timeline2[12].pieces.filter(piece => piece.coordinateBefore)[0]
      assert.strictEqual(piece.coordinate, 'c3')
      assert.strictEqual(piece.coordinateBefore, 'b4')
      piece = timeline2[13].pieces.filter(piece => piece.coordinateBefore)[0]
      assert.strictEqual(piece.coordinate, 'c3')
      assert.strictEqual(piece.coordinateBefore, 'd2')
      assert.strictEqual(timeline2[13].pieces.length, timeline2[12].pieces.length - 1)
      piece = timeline2[14].pieces.filter(piece => piece.coordinateBefore)[0]
      assert.strictEqual(piece.coordinate, 'c1')
      assert.strictEqual(piece.coordinateBefore, 'b2')
      // the third timeline nests off the second
      const timeline3 = timeline2[9].siblings[0]
      piece = timeline3[0].pieces.filter(piece => piece.coordinateBefore)[0]
      assert.strictEqual(piece.coordinate, 'c3')
      assert.strictEqual(piece.coordinateBefore, 'b1')
      // the fourth timeline nests off the second
      const timeline4 = timeline2[11].siblings[0]
      piece = timeline4[0].pieces.filter(piece => piece.coordinateBefore)[0]
      assert.strictEqual(piece.coordinate, 'b4')
      assert.strictEqual(piece.coordinateBefore, 'c3')
      assert.strictEqual(timeline4[0].pieces.length, timeline2[11].pieces.length - 1)
      piece = timeline4[1].pieces.filter(piece => piece.coordinateBefore)[0]
      assert.strictEqual(piece.coordinate, 'b4')
      assert.strictEqual(piece.coordinateBefore, 'c6')
      assert.strictEqual(timeline4[1].pieces.length, timeline4[0].pieces.length - 1)
      // the fifth timeline nests off the main timeline
      const timeline5 = turns[1].siblings[0]
      piece = timeline5[0].pieces.filter(piece => piece.coordinateBefore)[0]
      assert.strictEqual(piece.coordinate, 'c5')
      assert.strictEqual(piece.coordinateBefore, 'c7')
      piece = timeline5[1].pieces.filter(piece => piece.coordinateBefore)[0]
      assert.strictEqual(piece.coordinate, 'd4')
      assert.strictEqual(piece.coordinateBefore, 'd2')
      piece = timeline5[2].pieces.filter(piece => piece.coordinateBefore)[0]
      assert.strictEqual(piece.coordinate, 'd4')
      assert.strictEqual(piece.coordinateBefore, 'c5')
      assert.strictEqual(timeline5[2].pieces.length, timeline5[1].pieces.length - 1)
      piece = timeline5[3].pieces.filter(piece => piece.coordinateBefore)[0]
      assert.strictEqual(piece.coordinate, 'c3')
      assert.strictEqual(piece.coordinateBefore, 'c2')
      piece = timeline5[4].pieces.filter(piece => piece.coordinateBefore)[0]
      assert.strictEqual(piece.coordinate, 'c3')
      assert.strictEqual(piece.coordinateBefore, 'd4')
      assert.strictEqual(timeline5[4].pieces.length, timeline5[3].pieces.length - 1)
      piece = timeline5[5].pieces.filter(piece => piece.coordinateBefore)[0]
      assert.strictEqual(piece.coordinate, 'c3')
      assert.strictEqual(piece.coordinateBefore, 'b1')
      assert.strictEqual(timeline5[5].pieces.length, timeline5[4].pieces.length - 1)
      piece = timeline5[6].pieces.filter(piece => piece.coordinateBefore)[0]
      assert.strictEqual(piece.coordinate, 'c6')
      assert.strictEqual(piece.coordinateBefore, 'b8')
      piece = timeline5[7].pieces.filter(piece => piece.coordinateBefore)[0]
      assert.strictEqual(piece.coordinate, 'f3')
      assert.strictEqual(piece.coordinateBefore, 'g1')
      piece = timeline5[8].pieces.filter(piece => piece.coordinateBefore)[0]
      assert.strictEqual(piece.coordinate, 'd6')
      assert.strictEqual(piece.coordinateBefore, 'd7')
      piece = timeline5[9].pieces.filter(piece => piece.coordinateBefore)[0]
      assert.strictEqual(piece.coordinate, 'c4')
      assert.strictEqual(piece.coordinateBefore, 'f1')
      piece = timeline5[10].pieces.filter(piece => piece.coordinateBefore)[0]
      assert.strictEqual(piece.coordinate, 'f6')
      assert.strictEqual(piece.coordinateBefore, 'g8')
      piece = timeline5[11].pieces.filter(piece => piece.coordinateBefore)[0]
      assert.strictEqual(piece.coordinate, 'e5')
      assert.strictEqual(piece.coordinateBefore, 'e4')
      piece = timeline5[12].pieces.filter(piece => piece.coordinateBefore)[0]
      assert.strictEqual(piece.coordinate, 'e5')
      assert.strictEqual(piece.coordinateBefore, 'd6')
      assert.strictEqual(timeline5[12].pieces.length, timeline5[11].pieces.length - 1)
      piece = timeline5[13].pieces.filter(piece => piece.coordinateBefore)[0]
      assert.strictEqual(piece.coordinate, 'd8')
      assert.strictEqual(piece.coordinateBefore, 'd1')
      assert.strictEqual(timeline5[13].pieces.length, timeline5[12].pieces.length - 1)
      piece = timeline5[14].pieces.filter(piece => piece.coordinateBefore)[0]
      assert.strictEqual(piece.coordinate, 'd8')
      assert.strictEqual(piece.coordinateBefore, 'c6')
      assert.strictEqual(timeline5[14].pieces.length, timeline5[13].pieces.length - 1)
      piece = timeline5[15].pieces.filter(piece => piece.coordinateBefore)[0]
      assert.strictEqual(piece.coordinate, 'b5')
      assert.strictEqual(piece.coordinateBefore, 'c3')
      piece = timeline5[16].pieces.filter(piece => piece.coordinateBefore)[0]
      assert.strictEqual(piece.coordinate, 'd7')
      assert.strictEqual(piece.coordinateBefore, 'e8')
      piece = timeline5[17].pieces.filter(piece => piece.coordinateBefore)[0]
      assert.strictEqual(piece.coordinate, 'e5')
      assert.strictEqual(piece.coordinateBefore, 'f3')
      piece = timeline5[18].pieces.filter(piece => piece.coordinateBefore)[0]
      assert.strictEqual(piece.coordinate, 'e8')
      assert.strictEqual(piece.coordinateBefore, 'd7')
      piece = timeline5[19].pieces.filter(piece => piece.coordinateBefore)[0]
      assert.strictEqual(piece.coordinate, 'c7')
      assert.strictEqual(piece.coordinateBefore, 'b5')
      // the 6th timeline nests off the 5th timeline, which nests off the main timeline
      const timeline6 = timeline5[12].siblings[0]
      piece = timeline6[0].pieces.filter(piece => piece.coordinateBefore)[0]
      assert.strictEqual(piece.coordinate, 'g4')
      assert.strictEqual(piece.coordinateBefore, 'f6')
      // the seventh timeline is the sixth's sibling
      const timeline7 = timeline5[12].siblings[1]
      piece = timeline7[0].pieces.filter(piece => piece.coordinateBefore)[0]
      assert.strictEqual(piece.coordinate, 'e5')
      assert.strictEqual(piece.coordinateBefore, 'c6')
      piece = timeline7[1].pieces.filter(piece => piece.coordinateBefore)[0]
      assert.strictEqual(piece.coordinate, 'e5')
      assert.strictEqual(piece.coordinateBefore, 'f3')
      assert.strictEqual(timeline7[1].pieces.length, timeline7[0].pieces.length - 1)
      piece = timeline7[2].pieces.filter(piece => piece.coordinateBefore)[0]
      assert.strictEqual(piece.coordinate, 'e5')
      assert.strictEqual(piece.coordinateBefore, 'd6')
      assert.strictEqual(timeline7[2].pieces.length, timeline7[1].pieces.length - 1)
      piece = timeline7[3].pieces.filter(piece => piece.coordinateBefore)[0]
      assert.strictEqual(piece.coordinate, 'f7')
      assert.strictEqual(piece.coordinateBefore, 'c4')
      assert.strictEqual(timeline7[3].pieces.length, timeline7[2].pieces.length - 1)
      piece = timeline7[4].pieces.filter(piece => piece.coordinateBefore)[0]
      assert.strictEqual(piece.coordinate, 'f7')
      assert.strictEqual(piece.coordinateBefore, 'e8')
      assert.strictEqual(timeline7[4].pieces.length, timeline7[3].pieces.length - 1)
      piece = timeline7[5].pieces.filter(piece => piece.coordinateBefore)[0]
      assert.strictEqual(piece.coordinate, 'd8')
      assert.strictEqual(piece.coordinateBefore, 'd1')
      assert.strictEqual(timeline7[5].pieces.length, timeline7[4].pieces.length - 1)
      // the 8th timeline nests off the 5th timeline, which nests off the main timeline
      const timeline8 = timeline5[14].siblings[0]
      piece = timeline8[0].pieces.filter(piece => piece.coordinateBefore)[0]
      assert.strictEqual(piece.coordinate, 'd8')
      assert.strictEqual(piece.coordinateBefore, 'e8')
      assert.strictEqual(timeline8[0].pieces.length, timeline5[13].pieces.length - 1)
      piece = timeline8[1].pieces.filter(piece => piece.coordinateBefore)[0]
      assert.strictEqual(piece.coordinate, 'g5')
      assert.strictEqual(piece.coordinateBefore, 'f3')
      piece = timeline8[2].pieces.filter(piece => piece.coordinateBefore)[0]
      assert.strictEqual(piece.coordinate, 'a5')
      assert.strictEqual(piece.coordinateBefore, 'c6')
      // the 9th timeline nests off the main timeline
      const timeline9 = turns[4].siblings[0]
      piece = timeline9[0].pieces.filter(piece => piece.coordinateBefore)[0]
      assert.strictEqual(piece.coordinate, 'b5')
      assert.strictEqual(piece.coordinateBefore, 'f1')
      piece = timeline9[1].pieces.filter(piece => piece.coordinateBefore)[0]
      assert.strictEqual(piece.coordinate, 'f6')
      assert.strictEqual(piece.coordinateBefore, 'g8')
      piece = timeline9[2].pieces.filter(piece => piece.coordinateBefore)[0]
      assert.strictEqual(piece.coordinate, 'd3')
      assert.strictEqual(piece.coordinateBefore, 'd2')
      piece = timeline9[3].pieces.filter(piece => piece.coordinateBefore)[0]
      assert.strictEqual(piece.coordinate, 'e7')
      assert.strictEqual(piece.coordinateBefore, 'c6')
      piece = timeline9[4].pieces.filter(piece => piece.coordinateBefore)[0]
      assert.strictEqual(piece.coordinate, 'e5')
      assert.strictEqual(piece.coordinateBefore, 'f3')
      assert.strictEqual(timeline9[4].pieces.length, timeline9[3].pieces.length - 1)
      piece = timeline9[5].pieces.filter(piece => piece.coordinateBefore)[0]
      assert.strictEqual(piece.coordinate, 'c6')
      assert.strictEqual(piece.coordinateBefore, 'c7')
      piece = timeline9[6].pieces.filter(piece => piece.coordinateBefore)[0]
      assert.strictEqual(piece.coordinate, 'c4')
      assert.strictEqual(piece.coordinateBefore, 'b5')
      piece = timeline9[7].pieces.filter(piece => piece.coordinateBefore)[0]
      assert.strictEqual(piece.coordinate, 'a5')
      assert.strictEqual(piece.coordinateBefore, 'd8')
      // 10th timeline nests off the main timeline
      const timeline10 = turns[6].siblings[0]
      piece = timeline10[0].pieces.filter(piece => piece.coordinateBefore)[0]
      assert.strictEqual(piece.coordinate, 'd4')
      assert.strictEqual(piece.coordinateBefore, 'f3')
      piece = timeline10[1].pieces.filter(piece => piece.coordinateBefore)[0]
      assert.strictEqual(piece.coordinate, 'd4')
      assert.strictEqual(piece.coordinateBefore, 'e5')
      assert.strictEqual(timeline10[1].pieces.length, timeline10[0].pieces.length - 1)
      piece = timeline10[2].pieces.filter(piece => piece.coordinateBefore)
      assert.strictEqual(piece[0].coordinate, 'g1')
      assert.strictEqual(piece[0].coordinateBefore, 'e1')
      assert.strictEqual(piece[1].coordinate, 'f1')
      assert.strictEqual(piece[1].coordinateBefore, 'h1')
      // 11th timeline nests off the main timeline
      const timeline11 = turns[12].siblings[0]
      piece = timeline11[0].pieces.filter(piece => piece.coordinateBefore)[0]
      assert.strictEqual(piece.coordinate, 'e2')
      assert.strictEqual(piece.coordinateBefore, 'd1')
      piece = timeline11[1].pieces.filter(piece => piece.coordinateBefore)[0]
      assert.strictEqual(piece.coordinate, 'e2')
      assert.strictEqual(piece.coordinateBefore, 'd4')
      assert.strictEqual(timeline11[1].pieces.length, timeline11[0].pieces.length - 1)
    })
  })
})
