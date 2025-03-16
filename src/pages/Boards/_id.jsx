//Board detail - id
import AppBar from '~/components/AppBar/AppBar'
import BoardBar from '~/pages/Boards/BoardBar/BoardBar'
import BoardContent from '~/pages/Boards/BoardContent/BoardContent'
import { Box, CircularProgress, Container, Typography } from '@mui/material'
import { useState } from 'react'
import { createNewCardAPI, createNewColumnAPI, deleteColumnDetailsAPI, fetchBoardDetailsAPI, moveCardToDifferentColumnsAPI, updateBoardDetailsAPI, updateColumnDetailsAPI } from '~/apis'
import { mockData } from '~/apis/mock-data'
import { generatePlaceholderCard } from '~/utils/formatters'
import { isEmpty } from 'lodash'
import { mapOrder } from '~/utils/sorts'
import { toast } from 'react-toastify'

function Board() {
  const [board, setBoard] = useState(null)

  useState(() => {
    //react-router-dom
    const boardId = '67c42b85ce570875714f1672'
    //call api
    fetchBoardDetailsAPI(boardId).then(board => {

      board.columns = mapOrder(board.columns, board.columnOrderIds, '_id')

      board.columns.forEach(column => {
        if (isEmpty(column.cards)) {
          column.cards = [generatePlaceholderCard(column)]
          column.cardOrderIds = [generatePlaceholderCard(column)._id]
        } else {
          column.cards = mapOrder(column.cards, column.cardOrderIds, '_id')
        }
      })
      setBoard(board)
    })
  }, [])

  //Func này có nhiệm vụ gọi API và làm mới ds card, column, board, ...
  const createNewColumn = async (newColumnData) => {
    const createColumn = await createNewColumnAPI({
      ...newColumnData,
      boardId: board._id
    })
    createColumn.cards = [generatePlaceholderCard(createColumn)]
    createColumn.cardOrderIds = [generatePlaceholderCard(createColumn)._id]

    //Cập nhật state board
    const newBoard = { ...board }
    newBoard.columns.push(createColumn)
    newBoard.columnOrderIds.push(createColumn._id)
    setBoard(newBoard)
  }

  const createNewCard = async (data) => {
    const createNewCard = await createNewCardAPI({
      ...data,
      boardId: board._id
    })
    console.log('🚀 ~ createNewCard ~ createNewCard:', createNewCard)
    console.log('createColumn', createNewCard)

    //Cập nhật state board
    const newBoard = { ...board }
    const columnToUpdate = newBoard.columns.find(column => column._id === createNewCard.columnId)
    if (columnToUpdate) {
      if (columnToUpdate.cards.some(card => card.FE_PlaceholderCard)) {
        columnToUpdate.cards = [createNewCard]
        columnToUpdate.cardOrderIds = [createNewCard._id]
      } else {
        columnToUpdate.cards.push(createNewCard)
        columnToUpdate.cardOrderIds.push(createNewCard._id)
      }
    }
    setBoard(newBoard)
  }

  //Func này có nhiệm vụ gọi API và xử lý khi kéo thả Column xong xuôi
  const moveColumns = (dndOrderedColumns) => {
    // Update cho chuẩn dữ liệu state board
    const dndOrderedColumnsIds = dndOrderedColumns.map(c => c._id)
    const newBoard = { ...board }
    newBoard.columns = dndOrderedColumns
    newBoard.columnOrderIds = dndOrderedColumnsIds
    console.log('newBoard', newBoard)

    setBoard(newBoard)

    //Gọi API
    updateBoardDetailsAPI(board._id, { columnOrderIds: dndOrderedColumnsIds })
  }

  //Function gọi API và xử lý khi kéo thả Card xong xuôi
  const moveCardIntheSameColumn = (dndOrderedCards, dndOrderedCardIds, columnId) => {
    //UPdate cho chuẩn dữ liệu state board
    const newBoard = { ...board }
    const columnToUpdate = newBoard.columns.find(column => column._id === columnId)
    if (columnToUpdate) {
      columnToUpdate.cards = dndOrderedCards
      columnToUpdate.cardOrderIds = dndOrderedCardIds
    }
    setBoard(newBoard)

    //Gọi API
    updateColumnDetailsAPI(columnId, { cardOrderIds: dndOrderedCardIds })
  }

  /**
   * Khi di chuyển card sang cilumn khác:
   * B1: Cập nhật mảng cardOrderIds của column ban đầu chứa nó (Bản chất là xóa card ra khỏi mảng)
   * B2: Cập nhật mảng cardOrderIds của coumn tiếp theo (Bản chất là thêm card với mảng cardOrderIds)
   * B3: Cập nhật lại trường columnId mới của cái card đã kéo
   * => Làm một API support riêng
   */
  const moveCardToDifferentColumns = (currentCardId, prevColumnId, nextColumnId, dndOrderedColumns) => {
    console.log('currentCardId', currentCardId, 'prevColumnId', prevColumnId, 'nextColumnId', nextColumnId, 'dndOrderedColumns', dndOrderedColumns)
    // Update cho chuẩn dữ liệu state board
    const dndOrderedColumnsIds = dndOrderedColumns.map(c => c._id)
    const newBoard = { ...board }
    newBoard.columns = dndOrderedColumns
    newBoard.columnOrderIds = dndOrderedColumnsIds
    console.log('newBoard', newBoard)

    let prevCardOrderIds = dndOrderedColumns.find(c => c._id === prevColumnId)?.cardOrderIds
    //Xử lý vấn đề khi kéo Card cuối cùng ra khỏi Column, Column rỗng sẽ có placeholder card, cần xóa nó đi trước khi gửi data lên BE
    if (prevCardOrderIds[0].includes('placeholder-card')) prevCardOrderIds = []

    //Gọi API
    moveCardToDifferentColumnsAPI({
      currentCardId,
      prevColumnId,
      prevCardOrderIds,
      nextColumnId,
      nextCardOrderIds:
      dndOrderedColumns.find(c => c._id === nextColumnId)?.cardOrderIds
    })
  }

  //Xử lý xóa một column và cards bên trong nó
  const deleteColumnDetails = (columnId) => {
    // Update cho chuẩn dữ liệu state board
    const newBoard = { ...board }
    newBoard.columns = newBoard.columns.filter(c => c._id !== columnId)
    newBoard.columnOrderIds = newBoard.columnOrderIds.filter(_id => _id !== columnId)
    setBoard(newBoard)
    //Gọi API
    deleteColumnDetailsAPI(columnId).then(res => {
      toast.success(res?.deleteResult)
    })
  }

  if (!board) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', width: '100vw', gap: 2 }}>
        <CircularProgress />
        <Typography>Loading...</Typography>
      </Box>
    )
  }

  return (
    <Container disableGutters maxWidth={false} sx={{ height: '100vh' }}>
      <AppBar />
      {/* <BoardBar board={mockData?.board}/>
      <BoardContent board={mockData?.board}/> */}
      <BoardBar board={board}/>
      <BoardContent
        board={board}
        createNewColumn={createNewColumn}
        createNewCard={createNewCard}
        moveColumns={moveColumns}
        moveCardIntheSameColumn={moveCardIntheSameColumn}
        moveCardToDifferentColumns={moveCardToDifferentColumns}
        deleteColumnDetails={deleteColumnDetails}
      />
    </Container>
  )
}

export default Board