;; ((exports) => {
  exports.addColumn = addColumn
  exports.addColumnAndRow = addColumnAndRow
  exports.addRow = addRow
  exports.calculatePieceMovement = calculatePieceMovement
  exports.cleanSpacing = cleanSpacing
  exports.createTurnObject = createTurnObject
  exports.extractNextLine = extractNextLine
  exports.findClosingBracket = findClosingBracket
  exports.findCoordinates = findCoordinates
  exports.tokenizeLine = tokenizeLine
  exports.tokenizeLines = tokenizeLines
  exports.parse = parse
  exports.parseRecursively = parseRecursively
  exports.parseTags = parseTags
  exports.parseTurn = parseTurn
  exports.parseTurns = parseTurns
  exports.processTurn = processTurn
  exports.nextCoordinateUpLeft = nextCoordinateUpLeft
  exports.nextCoordinateUpRight = nextCoordinateUpRight
  exports.nextCoordinateDownLeft = nextCoordinateDownLeft
  exports.nextCoordinateDownRight = nextCoordinateDownRight
  exports.nextCoordinateUp = nextCoordinateUp
  exports.nextCoordinateDown = nextCoordinateDown
  exports.nextCoordinateLeft = nextCoordinateLeft
  exports.nextCoordinateRight = nextCoordinateRight

  const knightMoveDirections = {
    upLeft: [nextCoordinateUp, nextCoordinateUp, nextCoordinateLeft],
    upRight: [nextCoordinateUp, nextCoordinateUp, nextCoordinateRight],
    downLeft: [nextCoordinateDown, nextCoordinateDown, nextCoordinateLeft],
    downRight: [nextCoordinateDown, nextCoordinateDown, nextCoordinateRight],
    leftUp: [nextCoordinateLeft, nextCoordinateLeft, nextCoordinateUp],
    leftDown: [nextCoordinateLeft, nextCoordinateLeft, nextCoordinateDown],
    rightUp: [nextCoordinateRight, nextCoordinateRight, nextCoordinateUp],
    rightDown: [nextCoordinateRight, nextCoordinateRight, nextCoordinateDown]
  }
  const kingMoveDirections = [nextCoordinateUp, nextCoordinateDown, nextCoordinateLeft, nextCoordinateRight, nextCoordinateUpLeft, nextCoordinateUpRight, nextCoordinateDownLeft, nextCoordinateDownRight]
  const queenMoveDirections = [nextCoordinateUp, nextCoordinateDown, nextCoordinateLeft, nextCoordinateRight, nextCoordinateUpLeft, nextCoordinateUpRight, nextCoordinateDownLeft, nextCoordinateDownRight]
  const bishopMoveDirections = [nextCoordinateUpLeft, nextCoordinateUpRight, nextCoordinateDownLeft, nextCoordinateDownRight]
  const rookMoveDirections = [nextCoordinateUp, nextCoordinateDown, nextCoordinateLeft, nextCoordinateRight]
  const defaultPieces = JSON.stringify([
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
  ])

  /*
   * parses a PGN file of text and recursively extracts all of the turns and
   * and their descriptors and creates an object representation
  */
  function parse (pgn) {
    const tags = parseTags(pgn)
    const moveData = tokenizeLines(pgn)
    const turns = parseRecursively(moveData)
    let pieces
    if (tags.FEN && tags.SetUp === '1') {
      pieces = toPieces(tags.FEN)
    } else {
      pieces = JSON.parse(defaultPieces)
    }
    const startingFEN = tags.FEN || toFen(pieces)
    for (const turn of turns) {
      processTurn(turn, turns, pieces)
    }
    return {
      FEN: startingFEN,
      tags,
      turns,
      toString: () => {
        const tagText = []
        const tagKeys = Object.keys(tags)
        for (const tag of tagKeys) {
          tagText.push(`[${tag} "${tags[tag]}"]`)
        }
        const moveText = []
        for (const turn of turns) {
          const prepend = turn.pgn.substring(0, turn.pgn.indexOf(turn.sequence[0]))
          moveText.push(prepend + turn.sequence.join(' '))
        }
        return `${tagText.join('\n')}\n\n${moveText.join(' ')}`
      }
    }
  }

  /*
   * recursively parses the turns from a block of PGN-text
   * that has been truncated to exclude tags, the board
   * state for each turn is progressively determined
  */
  function parseRecursively (pgnData, results) {
    const turns = parseTurns(pgnData)
    results = results || []
    for (const turn of turns) {
      results.push(turn)
      for (const item of turn.sequence) {
        if (!item.startsWith('(')) {
          continue
        }
        const itemLines = tokenizeLines(item.substring(1, item.length - 1))
        turn.siblings = turn.siblings || []
        turn.siblings.push(parseRecursively(itemLines))
      }
    }
    return results
  }

  /*
   * receives a turn and array of pieces and applies the turn
   * then returns the modified array of pieces
   */
  function processTurn (turn, turns, pieces) {
    for (const piece of pieces) {
      delete (piece.coordinateBefore)
      delete (piece.moveSteps)
    }
    const previousPieces = JSON.stringify(pieces)
    if (turn.queenSideCastling || turn.kingSideCastling) {
      const moveKingAmount = turn.queenSideCastling ? -2 : 2
      const moveRookAmount = turn.queenSideCastling ? 3 : -2
      const rookColumn = turn.queenSideCastling ? 'a' : 'h'
      if (turn.color === 'w') {
        const whiteKing = pieces.filter(obj => obj.type === 'K' && obj.color === 'w').pop()
        whiteKing.coordinateBefore = whiteKing.coordinate
        whiteKing.coordinate = addColumn(whiteKing.coordinate, moveKingAmount)
        whiteKing.moveSteps = [whiteKing.coordinateBefore, whiteKing.coordinate]
        const whiteQueenSideRook = pieces.filter(obj => obj.type === 'R' && obj.start.startsWith(rookColumn) && obj.color === 'w').pop()
        whiteQueenSideRook.coordinateBefore = whiteQueenSideRook.coordinate
        whiteQueenSideRook.coordinate = addColumn(whiteQueenSideRook.coordinate, moveRookAmount)
        whiteQueenSideRook.moveSteps = [whiteQueenSideRook.coordinateBefore, whiteQueenSideRook.coordinate]
      } else {
        const blackKing = pieces.filter(obj => obj.type === 'K' && obj.color === 'b').pop()
        blackKing.coordinateBefore = blackKing.coordinate
        blackKing.coordinate = addColumn(blackKing.coordinate, moveKingAmount)
        blackKing.moveSteps = [blackKing.coordinateBefore, blackKing.coordinate]
        const blackQueenSideRook = pieces.filter(obj => obj.type === 'R' && obj.start.startsWith(rookColumn) && obj.color === 'b').pop()
        blackQueenSideRook.coordinateBefore = blackQueenSideRook.coordinate
        blackQueenSideRook.coordinate = addColumn(blackQueenSideRook.coordinate, moveRookAmount)
        blackQueenSideRook.moveSteps = [blackQueenSideRook.coordinateBefore, blackQueenSideRook.coordinate]
      }
    } else {
      const movingPiece = findMovingPiece(turn, pieces)
      movingPiece.coordinateBefore = movingPiece.coordinate
      movingPiece.coordinate = turn.to
      if (turn.capturing) {
        for (const piece of pieces) {
          if (piece.coordinate === movingPiece.coordinate && piece !== movingPiece) {
            pieces.splice(pieces.indexOf(piece), 1)
            break
          }
        }
      }
    }
    if (turn.siblings && turn.siblings.length) {
      for (const sibling of turn.siblings) {
        const piecesFork = JSON.parse(previousPieces)
        for (const turn of sibling) {
          processTurn(turn, JSON.parse(JSON.stringify(turns)), piecesFork)
        }
      }
    }
    turn.pieces = JSON.parse(JSON.stringify(pieces))
    turn.fen = toFen(pieces, turn, turns)
  }

  function toPieces (fen) {
    // TODO: convert starting FEN to piece array
  }

  function toFen (pieces, turn, turns) {
    const board = [
      ['', '', '', '', '', '', '', ''],
      ['', '', '', '', '', '', '', ''],
      ['', '', '', '', '', '', '', ''],
      ['', '', '', '', '', '', '', ''],
      ['', '', '', '', '', '', '', ''],
      ['', '', '', '', '', '', '', ''],
      ['', '', '', '', '', '', '', ''],
      ['', '', '', '', '', '', '', '']
    ]
    for (const piece of pieces) {
      const row = piece.coordinate.substring(1)
      const rowIndex = '87654321'.indexOf(row)
      const column = piece.coordinate.substring(0, 1)
      const columnIndex = 'abcdefgh'.indexOf(column)
      board[rowIndex][columnIndex] = `${piece.color}${piece.type}`
    }
    let result = ''
    for (let y = 0; y < board.length; y++) {
      let empty = 0
      for (let x = 0; x < board[y].length; x++) {
        const c = board[y][x][0]
        if (c === 'w' || c === 'b') {
          if (empty > 0) {
            result += empty.toString()
            empty = 0
          }
          if (c === 'w') {
            result += board[y][x][1].toUpperCase()
          } else {
            result += board[y][x][1].toLowerCase()
          }
        } else {
          empty += 1
        }
      }
      if (empty > 0) {
        result += empty.toString()
      }
      if (y < board.length - 1) {
        result += '/'
      }
    }
    if (!turn) {
      return `${result} w KQkq - 0 1`
    }
    const halfTurns = halfTurnCount(turn, turns)
    const castling = fenCastling(pieces)
    const enPassant = fenEnPassant(pieces)
    result += ` ${turn.color} ${castling} ${enPassant} ${halfTurns} ${turn.moveNumber}`
    return result
  }

  function halfTurnCount (currentTurn, turns) {
    let count = 0
    for (const turn of turns) {
      if (turn === currentTurn) {
        return count
      }
      if (turn.capturing) {
        count = 0
        continue
      }
      if (turn.type === 'P') {
        count = 0
        continue
      }
      count++
    }
    // return the number of turns since a capture or a pawn advanced
    return 0
  }

  function fenEnPassant (pieces) {
    for (const piece of pieces) {
      if (piece.type !== 'P' || !piece.coordinateBefore || piece.moveSteps.length !== 3) {
        continue
      }
      return piece.moveSteps[1]
    }
    return '-'
  }

  function fenCastling (pieces) {
    const whiteKing = pieces.filter(piece => piece.type === 'K' && piece.color === 'w' && piece.coordinate === piece.start)
    const whiteKingSideRook = pieces.filter(piece => piece.type === 'R' && piece.color === 'w' && piece.coordinate === piece.start && piece.start === 'h1')
    const whiteQueenSideRook = pieces.filter(piece => piece.type === 'R' && piece.color === 'w' && piece.coordinate === piece.start && piece.start === 'a1')
    const blackKing = pieces.filter(piece => piece.type === 'K' && piece.color === 'b' && piece.coordinate === piece.start)
    const blackKingSideRook = pieces.filter(piece => piece.type === 'R' && piece.color === 'b' && piece.coordinate === piece.start && piece.start === 'h8')
    const blackQueenSideRook = pieces.filter(piece => piece.type === 'R' && piece.color === 'b' && piece.coordinate === piece.start && piece.start === 'a8')
    const parts = []
    if (whiteKing.length && whiteKingSideRook.length) {
      parts.push('K')
    }
    if (whiteKing.length && whiteQueenSideRook.length) {
      parts.push('Q')
    }
    if (blackKing.length && blackKingSideRook.length) {
      parts.push('k')
    }
    if (blackKing.length && blackQueenSideRook.length) {
      parts.push('q')
    }
    if (!parts.length) {
      return '-'
    }
    return parts.join('')
  }

  function parseTurns (lines) {
    const moves = []
    for (const line of lines) {
      const turn = parseTurn(line)
      for (const move of turn) {
        moves.push(move)
      }
    }
    return moves
  }

  /**
   * formats PGN for consistent spacing especially around brackets
   */
  function cleanSpacing (text) {
    text = text.split('\n').join(' ')
    const doubleSpacing = [
      { single: ' ', double: '  ' },
      { single: '{', double: '{ ' },
      { single: '(', double: '( ' },
      { single: '[', double: '[ ' },
      { single: '}', double: ' }' },
      { single: ')', double: ' )' },
      { single: ']', double: ' ]' }
    ]
    for (const spacing of doubleSpacing) {
      while (text.indexOf(spacing.double) > -1) {
        text = text.split(spacing.double).join(spacing.single)
      }
    }
    for (let i = 1, len = 150; i < len; i++) {
      if (text.indexOf(i.toString()) === -1) {
        continue
      }
      text = text.split(`${i}. `).join(`${i}.`)
      text = text.split(`${i}... `).join(`${i}...`)
    }
    return text.trim()
  }

  /*
    * parses PGN until it is reduced to an array of moves each
    * consisting of a pair or a single turn
    *
    * [
    *   '1. a5 {[%csl a5]} b7',
    *   '2. f3 (2. d4 {an annotated turn})',
    *   '2... a6',
    *   '{prepended annotation} 3. f7'
    * ]
    */
  function tokenizeLines (pgnFileData) {
    const movesDataStart = pgnFileData.indexOf(']\n\n') + 1
    let rawMoveData = movesDataStart > 0 ? pgnFileData.substring(movesDataStart) : pgnFileData
    rawMoveData = cleanSpacing(rawMoveData)
    const tokens = []
    while (rawMoveData.length) {
      const line = extractNextLine(rawMoveData)
      rawMoveData = rawMoveData.substring(line.length + 1)
      if (line) {
        tokens.push(line.trim())
      }
    }
    return tokens
  }

  /*
    * parses a turn line of PGN that may include coordinates
    * and annotations, nags, highlights or nested moves and
    * have moves for one or both players
    *
    *   '1. a5 {[%csl a5]} b7',
    *    [ '1.', 'a5', '{[%csl a5]}', 'b7' ]
    *
    *   '2.f3 (2. d4 {an annotated turn})',
    *    [ 'f3', '(2. d4 {an annotated turn})' ]
    *   '2... a6'
    *    [ '2...', 'a6' ]
    */
  function tokenizeLine (lineData) {
    const parts = lineData.split(' ')
    const line = []
    let index = 0
    while (index < parts.length) {
      const part = parts[index]
      if (part.indexOf('(') > -1 || part.indexOf('{') > -1 || part.indexOf('[') > -1) {
        const closingIndex = findClosingBracket(index, parts)
        line.push(parts.slice(index, closingIndex).join(' '))
        index = closingIndex
        continue
      }
      const tripleDotIndex = part.indexOf('...')
      if (tripleDotIndex > -1) {
        const moveNumber = part.substring(0, tripleDotIndex)
        let moveInt
        try {
          moveInt = parseInt(moveNumber, 10)
        } catch (error) {
        }
        if (moveInt.toString() === moveNumber) {
          line.push(`${moveNumber}...`)
          if (part.length > `${moveNumber}...`.length) {
            line.push(part.substring(`${moveNumber}...`.length))
          }
          index++
          continue
        }
      }
      const dotIndex = part.indexOf('.')
      if (dotIndex > -1) {
        const moveNumber = part.substring(0, dotIndex)
        let moveInt
        try {
          moveInt = parseInt(moveNumber, 10)
        } catch (error) {
        }
        if (moveInt.toString() === moveNumber) {
          line.push(`${moveNumber}.`)
          if (part.length > `${moveNumber}.`.length) {
            line.push(part.substring(`${moveNumber}.`.length))
          }
          index++
          continue
        }
      }
      line.push(part)
      index++
    }
    return line
  }

  /**
   * extracts the next move from the PGN including any nested
   * moves within (), the end result is a line like:
   *
   * 1. e4 [ %cal Ra1b2 ] e5
   */
  function extractNextLine (moveText) {
    const parts = moveText.split(' ')
    const line = []
    let index = 0
    let annotated
    let moveNumber
    while (index < parts.length) {
      const part = parts[index]
      if (part.indexOf('(') === 0 || part.indexOf('{') === 0 || part.indexOf('[') === 0) {
        const closingIndex = findClosingBracket(index, parts)
        line.push(parts.slice(index, closingIndex).join(' '))
        index = closingIndex
        annotated = true
        continue
      }
      const dotIndex = part.indexOf('.')
      if (dotIndex > 0 && dotIndex < 4) {
        moveNumber = part.substring(0, dotIndex)
        let moveInt
        try {
          moveInt = parseInt(moveNumber, 10)
        } catch (error) {
        }
        if (moveInt.toString() === moveNumber && ((line.length > 1 && annotated) || (line.length && !annotated))) {
          break
        }
      }
      line.push(part)
      index++
    }
    return line.join(' ').replace(`${moveNumber}. `, `${moveNumber}.`).replace(`${moveNumber}... `, `${moveNumber}...`)
  }

  /**
   * parses the moves from a string
   */
  function parseTurn (line) {
    const lineParts = tokenizeLine(line)
    let moveNumber, numberPart
    for (const part of lineParts) {
      if (part.indexOf('.') === -1) {
        continue
      }
      moveNumber = part.substring(0, part.indexOf('.'))
      try {
        if (parseInt(moveNumber, 10).toString() === moveNumber) {
          numberPart = part
          break
        }
      } catch (error) {
      }
    }
    const coordinates = findCoordinates(lineParts)
    let color
    const moves = []
    if (coordinates.first) {
      color = numberPart === `${moveNumber}...` ? 'b' : 'w'
      const sequence = lineParts.slice(0, coordinates.secondIndex || lineParts.length)
      const pgn = line.substring(0, coordinates.second ? line.indexOf(coordinates.second) : line.length)
      moves.push(createTurnObject(color, moveNumber, coordinates.first, sequence, pgn))
    }
    if (coordinates.second) {
      color = color === 'w' ? 'b' : 'w'
      const sequence = lineParts.slice(coordinates.secondIndex)
      const pgn = line.substring(line.indexOf(coordinates.second))
      moves.push(createTurnObject(color, moveNumber, coordinates.second, sequence, pgn))
    }
    return moves
  }

  /**
   * Creates an object holding turn data and any flags that are described
   * in the PGN file, like whether the move results in check or if there
   * is a column specified with the coordinate to disambiguate pieces
   * @param {*} color
   * @param {*} moveNumber
   * @param {*} to
   * @param {*} sequence
   * @param {*} pgn
   * @returns
   */
  function createTurnObject (color, moveNumber, to, sequence, pgn) {
    let type
    const firstCharacter = to.charAt(0)
    if ('KQBRNP'.indexOf(firstCharacter) > -1) {
      type = firstCharacter
      to = to.substring(1)
    }
    type = type || 'P'
    const queenSideCastling = to.indexOf('O-O-O') > -1
    if (queenSideCastling) {
      to = to.replace('O-O-O', '')
    }
    const kingSideCastling = to.indexOf('O-O') > -1
    if (kingSideCastling) {
      to = to.replace('O-O', '')
    }
    const capturing = to.indexOf('x') > -1
    if (capturing) {
      to = to.replace('x', '')
    }
    const check = to.indexOf('+') > -1
    if (check) {
      to = to.replace('+', '')
    }
    const checkMate = to.indexOf('#') > -1
    if (checkMate) {
      to = to.replace('#', '')
    }
    const promoted = to.indexOf('=') > -1
    let promotedTo
    if (promoted) {
      promotedTo = to.substring(to.indexOf('=') + 1).trim()
      promotedTo = promotedTo || 'Q'
      to = to.substring(0, to.indexOf('='))
    }
    let requireRow, requireColumn
    if (to.length > 2) {
      const firstCharacter = to.charAt(0)
      if ('abcdefgh'.indexOf(firstCharacter) > -1) {
        requireColumn = firstCharacter
        to = to.substring(1)
      } else if ('12345678'.indexOf(firstCharacter) > -1) {
        requireRow = firstCharacter
        to = to.substring(1)
      }
    }
    const move = {
      type,
      color,
      moveNumber,
      to,
      requireRow,
      requireColumn,
      sequence,
      pgn,
      queenSideCastling,
      kingSideCastling,
      capturing,
      check,
      checkMate,
      promoted,
      promotedTo
    }
    for (const key in move) {
      if (move[key] === false || move[key] === undefined) {
        delete (move[key])
      }
    }
    return move
  }

  /**
   * Recieves a tokenized array of PGN for a turn and identifies where the
   * coordinates are, which may be white-then-black or a single move.
   * eg '1.|e5|{a notes}|$3|Nxc7|$4|{another note}
   * returns {
   *  first: e5
   *  firstIndex: 3,
   *  second: Nxc7
   *  secondIndex: 19
   * }
   * @param {} lineArray
   * @returns
   */
  function findCoordinates (lineArray) {
    let first, firstIndex, second, secondIndex
    for (const index in lineArray) {
      const part = lineArray[index]
      if (part.startsWith('(') || part.startsWith('[') || part.startsWith('{')) {
        continue
      }
      if (part.startsWith('$')) {
        continue
      }
      if (part.indexOf('*') > -1 || part.indexOf('/') > -1 || part.indexOf('.') > -1) {
        continue
      }
      if (part.indexOf('O-O') === -1 && part.indexOf('-') > -1) {
        continue
      }
      if (!first) {
        first = part
        firstIndex = parseInt(index, 10)
      } else {
        second = part
        secondIndex = parseInt(index, 10)
      }
    }
    return {
      first,
      firstIndex,
      second,
      secondIndex
    }
  }

  /*
  * Finds the ending of a { or ( or [ text block from an array of PGN
  * that has been split by spaces (but not tokenized, this is part of the
  * raw PGN processing that creates the tokenized version)
  */
  function findClosingBracket (index, array) {
    let openParantheses = 0
    let openSquare = 0
    let openBrace = 0
    const bracket = array[index].charAt(0)
    let finish = index
    while (finish < array.length) {
      let part = '' + array[finish]
      if (bracket === '(') {
        while (part.indexOf('(') > -1) {
          openParantheses++
          part = part.replace('(', '')
        }
        while (part.indexOf(')') > -1) {
          openParantheses--
          part = part.replace(')', '')
        }
      } else if (bracket === '{') {
        while (part.indexOf('{') > -1) {
          openBrace++
          part = part.replace('{', '')
        }
        while (part.indexOf('}') > -1) {
          openBrace--
          part = part.replace('}', '')
        }
      } else if (bracket === '[') {
        while (part.indexOf('[') > -1) {
          openSquare++
          part = part.replace('[', '')
        }
        while (part.indexOf(']') > -1) {
          openSquare--
          part = part.replace(']', '')
        }
      }
      if (!openParantheses && !openSquare && !openBrace) {
        return finish + 1
      }
      finish++
    }
    return finish
  }

  /**
   * PGN tags are specified with enclosed [] and there may
   * be any number of them before the move text
   * eg:
   * [name "value"]
   */
  function parseTags (pgnFileData) {
    const tags = {}
    let blank = false
    for (const line of pgnFileData.split('\n')) {
      if (!line.startsWith('[')) {
        if (blank) {
          break
        }
        blank = true
        continue
      }
      const lineParts = line.split(' ')
      const field = lineParts[0].substring(1)
      const valueParts = lineParts.slice(1).join(' ')
      const value = valueParts.substring(1, valueParts.lastIndexOf('"'))
      tags[field] = value
    }
    return tags
  }

  /**
   * identifies the moving piece based on the pieces that have a valid option
   * to move to the target coordinate and matching any criteria noted in the PGN
   */
  function findMovingPiece (move, pieces) {
    for (const piece of pieces) {
      if (move.type && move.type !== piece.type) {
        continue
      }
      if (move.color !== piece.color) {
        continue
      }
      if (move.requireColumn && !piece.coordinate.startsWith(move.requireColumn)) {
        continue
      }
      if (move.requireRow && !piece.coordinate.endsWith(move.requireRow)) {
        continue
      }
      const moves = calculatePieceMovement(piece, move, pieces)
      if (!moves || !moves.length || moves.indexOf(move.to) === -1) {
        continue
      }
      piece.moveSteps = moves
      return piece
    }
    throw new Error('could not determine piece for coordinate "' + move.to + '"')
  }

  function calculatePieceMovement (piece, move, pieces) {
    if (piece.type === 'N') {
      for (const knightJumpDirection in knightMoveDirections) {
        const knightMoves = [piece.coordinate]
        const stepList = knightMoveDirections[knightJumpDirection]
        let coordinate = piece.coordinate
        for (const step of stepList) {
          coordinate = step(coordinate)
          if (!coordinate) {
            break
          }
          knightMoves.push(coordinate)
        }
        if (!coordinate) {
          continue
        }
        const blockingPiece = checkObstructed(coordinate, pieces)
        if (blockingPiece && !(move.capturing || blockingPiece.color === piece.color)) {
          coordinate = false
        }
        if (move.to === coordinate) {
          return knightMoves
        }
      }
      return
    }
    if (piece.type === 'P') {
      const nextPawnCoordinate = piece.color === 'w' ? nextCoordinateUp : nextCoordinateDown
      if (move.capturing) {
        const nextValue = nextPawnCoordinate(piece.coordinate)
        const captureLeft = addColumn(nextValue, -1)
        if (move.to === captureLeft) {
          const captureLeftPiece = checkObstructed(captureLeft, pieces)
          if (captureLeftPiece && captureLeftPiece.color !== piece.color) {
            return [piece.coordinate, captureLeft]
          }
          if (piece.color === 'w') {
            const enPassantDownCoordinate = addRow(move.to, -1)
            if (enPassantDownCoordinate) {
              const downPiece = checkObstructed(enPassantDownCoordinate, pieces)
              if (downPiece && downPiece.type === 'P' && downPiece.color !== piece.color) {
                return [piece.coordinate, captureLeft]
              }
            }
          } else if (piece.color === 'b') {
            const enPassantUpCoordinate = addRow(move.to, -1)
            if (enPassantUpCoordinate) {
              const upPiece = checkObstructed(enPassantUpCoordinate, pieces)
              if (upPiece && upPiece.type === 'P' && upPiece.color !== piece.color) {
                return [piece.coordinate, captureRight]
              }
            }
          }
        }
        const captureRight = addColumn(nextValue)
        if (move.to === captureRight) {
          const captureRightPiece = checkObstructed(captureRight, pieces)
          if (captureRightPiece && captureRightPiece.color !== piece.color) {
            return [piece.coordinate, captureRight]
          }
          if (piece.color === 'w') {
            const enPassantDownCoordinate = addRow(move.to, -1)
            if (enPassantDownCoordinate) {
              const downPiece = checkObstructed(enPassantDownCoordinate, pieces)
              if (downPiece && downPiece.type === 'P' && downPiece.color !== piece.color) {
                return [piece.coordinate, captureLeft]
              }
            }
          } else if (piece.color === 'b') {
            const enPassantUpCoordinate = addRow(move.to, -1)
            if (enPassantUpCoordinate) {
              const upPiece = checkObstructed(enPassantUpCoordinate, pieces)
              if (upPiece && upPiece.type === 'P' && upPiece.color !== piece.color) {
                return [piece.coordinate, captureRight]
              }
            }
          }
        }
      } else if (piece.coordinate === piece.start) {
        const firstJump = nextPawnCoordinate(piece.coordinate)
        if (firstJump) {
          if (firstJump === move.to) {
            return [piece.coordinate, firstJump]
          }
          const obstructed = checkObstructed(firstJump, pieces)
          if (obstructed) {
            return
          }
          const secondJump = nextPawnCoordinate(firstJump)
          if (secondJump === move.to) {
            return [piece.coordinate, firstJump, secondJump]
          }
          const obstructed2 = checkObstructed(secondJump, pieces)
          if (obstructed2) {
            return [piece.coordinate, firstJump]
          }
        }
      } else {
        const oneJump = nextPawnCoordinate(piece.coordinate)
        if (oneJump === move.to) {
          return [piece.coordinate, oneJump]
        }
      }
      return
    }
    if (piece.type === 'K') {
      for (const moveDirectionMethod of kingMoveDirections) {
        const nextCoordinate = moveDirectionMethod(piece.coordinate)
        if (nextCoordinate === move.to) {
          const capturePiece = checkObstructed(nextCoordinate, pieces)
          if (!capturePiece || (move.capturing && capturePiece.color !== piece.color)) {
            return [piece.coordinate, nextCoordinate]
          }
        }
      }
      return
    }
    let moveUntilEndDirections
    switch (piece.type) {
      case 'R':
        moveUntilEndDirections = rookMoveDirections
        break
      case 'B':
        moveUntilEndDirections = bishopMoveDirections
        break
      case 'Q':
        moveUntilEndDirections = queenMoveDirections
        break
    }
    for (const moveDirectionMethod of moveUntilEndDirections) {
      const moves = moveAllPossibleSpaces(moveDirectionMethod, piece, pieces, move)
      if (moves && moves.length && moves.indexOf(move.to) > -1) {
        return moves
      }
    }
  }

  /**
   * checks the pieces array to see if anything occupies a coordinate
   */
  function checkObstructed (coordinate, pieces) {
    for (const piece of pieces) {
      if (piece.coordinate === coordinate) {
        return piece
      }
    }
  }

  function moveAllPossibleSpaces (moveMethod, piece, pieces, move) {
    const moves = [piece.coordinate]
    let nextValue = piece.coordinate
    while (nextValue) {
      nextValue = moveMethod(nextValue)
      if (nextValue) {
        const blockingPiece = checkObstructed(nextValue, pieces)
        if (blockingPiece && (!move.capturing || blockingPiece.color === piece.color)) {
          nextValue = false
        } else {
          moves.push(nextValue)
          if (nextValue === move.to) {
            return moves
          }
        }
      }
    }
    if (moves.length > 1) {
      return moves
    }
  }

  /**
   * calculates the coordinate up left
   */
  function nextCoordinateUpLeft (coordinate) {
    return addColumnAndRow(coordinate, -1, 1)
  }

  /**
   * calculates the coordinate up right
   */
  function nextCoordinateUpRight (coordinate) {
    return addColumnAndRow(coordinate, 1, 1)
  }

  /**
   * calculates the coordinate down left
   */
  function nextCoordinateDownLeft (coordinate) {
    return addColumnAndRow(coordinate, -1, -1)
  }

  /**
   * calculates the coordinate down right
   */
  function nextCoordinateDownRight (coordinate) {
    return addColumnAndRow(coordinate, 1, -1)
  }

  /**
   * calculates the coordinate up
   */
  function nextCoordinateUp (coordinate) {
    return addRow(coordinate, 1)
  }

  /**
   * calculates the coordinate down
   */
  function nextCoordinateDown (coordinate) {
    return addRow(coordinate, -1)
  }

  /**
   * calculates the coordinate left
   */
  function nextCoordinateLeft (coordinate) {
    return addColumn(coordinate, -1)
  }

  /**
   * calculates the coordinate right
   */
  function nextCoordinateRight (coordinate) {
    return addColumn(coordinate, 1)
  }

  /**
   * Adds +/- row to a coordinate if possible
   * @returns coordinate or undefined
   */
  function addColumnAndRow (coordinate, columnAmount, rowAmount) {
    let nextCoordinate = coordinate
    if (nextCoordinate && columnAmount && columnAmount !== 0) {
      nextCoordinate = addColumn(nextCoordinate, columnAmount)
    }
    if (nextCoordinate && rowAmount && rowAmount !== 0) {
      nextCoordinate = addRow(nextCoordinate, rowAmount)
    }
    if (nextCoordinate) {
      return nextCoordinate
    }
  }

  /**
   * Adds +/- row to a coordinate if possible
   * @returns coordinate or undefined
   */
  function addRow (coordinate, amount) {
    amount = amount || 1
    if (!coordinate) {
      return
    }
    const parts = coordinate.split('')
    const row = parseInt(parts[1], 10)
    if (row + amount < 1 || row + amount > 8) {
      return
    }
    return parts[0] + (row + amount)
  }

  /**
   * Adds +/- column to a coordinate if possible
   * @returns coordinate or undefined
   */
  function addColumn (coordinate, amount) {
    amount = amount || 1
    const parts = coordinate.split('')
    const columns = 'abcdefgh'
    const column = columns.indexOf(parts[0])
    if (column + amount < 0 || column + amount >= columns.length) {
      return
    }
    return columns[column + amount] + parts[1]
  }
})(typeof exports === 'undefined' ? this.parser = {} : exports)
