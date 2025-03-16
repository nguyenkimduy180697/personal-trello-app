import { Box } from '@mui/material'
import ListColumns from './ListColumns/ListColumns'
import { mapOrder } from '~/utils/sorts'
import {
  DndContext,
  // MouseSensor,
  // PointerSensor
  // TouchSensor,
  useSensor,
  useSensors,
  DragOverlay,
  defaultDropAnimationSideEffects,
  closestCorners,
  pointerWithin,
  getFirstCollision
} from '@dnd-kit/core'
import { MouseSensor, TouchSensor } from '~/customLibraries/DndKitSensors'
import { useEffect, useState, useCallback, useRef} from 'react'
import { arrayMove } from '@dnd-kit/sortable'
import Column from './ListColumns/Column/Column'
import Card from './ListColumns/Column/ListCards/Card/Card'
import { cloneDeep, isEmpty } from 'lodash'
import { generatePlaceholderCard } from '~/utils/formatters'

const ACTIVE_DRAG_ITEM_TYPE = {
  COLUMN: 'ACTIVE_DRAG_ITEM_TYPE_COLUMN',
  CARD: 'ACTIVE_DRAG_ITEM_TYPE_CARD'
}

function BoardContent({ board, createNewColumn, createNewCard, moveColumns, moveCardIntheSameColumn, moveCardToDifferentColumns, deleteColumnDetails }) {
  //https://docs.dndkit.com/api-documentation/sensors
  // Yêu cầu chuột di chuyển 10 pixel trước khi kích hoạt
  // const pointerSensor = useSensor(PointerSensor, { activationConstraint: { distance: 10 } })

  const mouseSensor = useSensor(MouseSensor, { activationConstraint: { distance: 10 } })

  const touchSensor = useSensor(TouchSensor, { activationConstraint: { delay: 250, tolerance: 500 } })
  // const sensors = useSensors(pointerSensor)
  const sensors = useSensors(mouseSensor, touchSensor)

  const [orderedColumns, setOrderedColumns] = useState([])

  // Cùng một thời điểm chỉ có một phần từ đang được kéo (column hoặc card)
  const [activeDragItemId, setActiveDragItemId] = useState([])
  const [activeDragItemType, setActiveDragItemType] = useState([])
  const [activeDragItemData, setActiveDragItemData] = useState([])
  const [oldColumnWhenDragginCard, setOldColumnWhenDragginCard] = useState([])

  const lastOverId = useRef(null)

  useEffect (() => {
    //Đã sắp xếp ở component cha cao nhất
    setOrderedColumns(board.columns)
  }, [board])

  // Tìm một cái Column theo CardId
  const findColumnByCardId = (cardId) => {
    return orderedColumns.find(column => column?.cards?.map(card => card._id)?.includes(cardId))
  }

  //Khởi tạo Function chung xử lý việc cập nhật lại state trong trường di chuyển card giữa các column khác nhau
  const moveCardBetweenDifferentColumns = (
    overColumn,
    overCardId,
    active,
    over,
    activeColumn,
    activeDraggingCardId,
    activeDraggingCardData,
    triggerForm
  ) => {
    setOrderedColumns(prevColumn => {
      const overCardIndex = overColumn?.cards?.findIndex(card => card._id === overCardId)
      let newCardIndex
      const isBelowOverItem = active.rect.current.translate && active.rect.current.translate.top > over.rect.top + over.rect.height
      const modifier = isBelowOverItem ? 1 : 0
      newCardIndex = overCardIndex >= 0 ? overCardIndex + modifier : overColumn?.cards?.length + 1
      // Clone mảng OrderedColumnsState cũ ra một cái mới để xử lý data rồi return - cập nhật lại OrderedColumnsState mới
      const nextColumns = cloneDeep(prevColumn)
      const nextActiveColumn = nextColumns.find(column => column._id === activeColumn._id)
      const nextOverColumn = nextColumns.find(column => column._id === overColumn._id)
      //Column cũ
      if (nextActiveColumn) {
        //Xóa card ở cái column active - là column cũ
        nextActiveColumn.cards = nextActiveColumn.cards.filter(card => card._id !== activeDraggingCardId)

        //Thêm placeholderCard vào nếu List Card không còn
        if (isEmpty(nextActiveColumn.cards)) {
          nextActiveColumn.cards = [generatePlaceholderCard(nextActiveColumn)]
        }
        // Cập nhật lại mảng cardOrderIds cho chuẩn dữ liệu
        nextActiveColumn.cardOrderIds = nextActiveColumn.cards.map(card => card._id)
      }
      //Column mới
      if (nextOverColumn) {
        //Kiểm tra xen card đang kéo nó có tồn tại ở overColumn chưa, nếu có thì cần xóa nó trước
        nextOverColumn.cards = nextOverColumn.cards.filter(card => card._id !== activeDraggingCardId)

        //Đối với trường hợp dragEnd thì phải cập nhật lại chuẩn dữ liệu columnId trong card sau khi kéo card giwuax 2 column khác nhau
        const rebuild_activeDraggingCardData = {
          ...activeDraggingCardData,
          columnId: nextOverColumn._id
        }
        // Tiếp theo là thêm cái card đang kéo vào orverColumn theo vị trí index mới
        nextOverColumn.cards = nextOverColumn.cards.toSpliced(newCardIndex, 0, rebuild_activeDraggingCardData)
        //Xóa cái Placeholder Card đi nếu nó đang tồn tại
        nextOverColumn.cards = nextOverColumn.cards.filter(card => !card.FE_PlaceholderCard)
        // Cập nhật lại mảng cardOrderIds cho chuẩn dữ liệu
        nextOverColumn.cardOrderIds = nextActiveColumn.cards.map(card => card._id)
      }
      if (triggerForm === 'handleDragEnd') {
        moveCardToDifferentColumns(activeDraggingCardId, oldColumnWhenDragginCard._id, nextOverColumn._id, nextColumns)
      }
      return nextColumns
    })
  }

  const handleDragStart = (event) => {
    setActiveDragItemId(event?.active?.id)
    setActiveDragItemType(event?.active?.data?.current?.columnId ? ACTIVE_DRAG_ITEM_TYPE.CARD : ACTIVE_DRAG_ITEM_TYPE.COLUMN)
    setActiveDragItemData(event?.active?.data?.current)

    //Nếu là kéo card thì mới thực hiện hành động set giá trị oldColumn
    if (event?.active?.data?.current?.columnId) {
      setOldColumnWhenDragginCard(findColumnByCardId(event?.active?.id))
    }
  }

  // Quá trình kéo một phần tử
  const handleDragOver = (event) => {
    // Không xử lý khi kéo COLUMN
    if (activeDragItemType === ACTIVE_DRAG_ITEM_TYPE.COLUMN) return
    const { active, over } = event
    // Kiểm tra nếu không tồn tại over (kéo nhưng không thay đổi)
    if (!active || !over) return

    //Xử lý cho trường hợp kéo CARD
    const { id : activeDraggingCardId, data: { current: activeDraggingCardData } } = active
    const { id : overCardId } = over

    //Tìm 2 cái columns theo cardId
    const activeColumn = findColumnByCardId(activeDraggingCardId)
    const overColumn = findColumnByCardId(overCardId)

    //Nếu không tồn tại 1 trong 2 thì return
    if (!activeColumn || !overColumn) return

    //Kiểm tra xem 2 column khác nhau thì đi xử lý
    if (activeColumn._id !== overColumn._id) {
      moveCardBetweenDifferentColumns(
        overColumn,
        overCardId,
        active,
        over,
        activeColumn,
        activeDraggingCardId,
        activeDraggingCardData,
        'handleDragOver'
      )
    }
  }

  const handleDragEnd = (event) => {
    const { active, over } = event
    // Kiểm tra nếu không tồn tại over (kéo nhưng không thay đổi)
    if (!active || !over) return

    //Xử lý CARD
    if (activeDragItemType === ACTIVE_DRAG_ITEM_TYPE.CARD) {
      //Xử lý cho trường hợp kéo CARD
      const { id : activeDraggingCardId, data: { current: activeDraggingCardData } } = active
      const { id : overCardId } = over

      //Tìm 2 cái columns theo cardId
      const activeColumn = findColumnByCardId(activeDraggingCardId)
      const overColumn = findColumnByCardId(overCardId)

      //Nếu không tồn tại 1 trong 2 thì return
      if (!activeColumn || !overColumn) return

      if (oldColumnWhenDragginCard._id !== overColumn._id) {
        //Hành động kéo thả card khác column
        moveCardBetweenDifferentColumns(
          overColumn,
          overCardId,
          active,
          over,
          activeColumn,
          activeDraggingCardId,
          activeDraggingCardData,
          'handleDragEnd'
        )
      } else {
        //Hành động kéo thả card trong cùng một cái column
        const oldCardIndex = oldColumnWhenDragginCard?.cards?.findIndex(c => c._id === activeDragItemId)
        const newCardIndex = overColumn?.cards?.findIndex(c => c._id === overCardId)
        //
        const dndOrderedCards = arrayMove(oldColumnWhenDragginCard?.cards, oldCardIndex, newCardIndex)
        const dndOrderedCardIds = dndOrderedCards.map(card => card._id)
        setOrderedColumns(prevColumn => {
          // Clone mảng OrderedColumnsState cũ ra một cái mới để xử lý data rồi return - cập nhật lại OrderedColumnsState mới
          const nextColumns = cloneDeep(prevColumn)
          //Tìm tới cái Column mà chung ta đang thả
          const targetColumn = nextColumns.find(c => c._id === overColumn._id)
          //Cập nhật lại 2 giá trị mới là card và cardOrderIds trong cái ttargetColumn
          targetColumn.cards = dndOrderedCards
          // Cập nhật lại mảng cardOrderIds cho chuẩn dữ liệu
          targetColumn.cardOrderIds = dndOrderedCardIds
          return nextColumns
        })


        moveCardIntheSameColumn(dndOrderedCards, dndOrderedCardIds, oldColumnWhenDragginCard._id)
      }
    }
    //Xử lý COLUMN
    if (activeDragItemType === ACTIVE_DRAG_ITEM_TYPE.COLUMN) {
      // Nếu vị trí sau khi kéo thả khác với vị trí ban đuầ
      if (active.id !== over.id) {
        const oldColumnIndex = orderedColumns.findIndex(c => c._id === active.id)
        const newColumnIndex = orderedColumns.findIndex(c => c._id === over.id)
        const dndOrderedColumns = arrayMove(orderedColumns, oldColumnIndex, newColumnIndex)
        // const dndOrderedColumnsIds = dndOrderedColumns.map(c => c._id)
        // console.log('dndOrderedColumns', dndOrderedColumns)
        // console.log('dndOrderedColumnsIds', dndOrderedColumnsIds)

        // Vẫn gọi update State ở đây để tránh delay hoặc Fickering giao diện lúc kéo thả cần phải chờ gọi API
        setOrderedColumns(dndOrderedColumns)
        //Gọi lên hàm moveColumns ở file _id.jsx
        moveColumns(dndOrderedColumns)
      }
    }

    //Những dữ liệu sau khi kéo thả này phải trả về giá trị mull mặc định ban đầu
    setActiveDragItemId(null)
    setActiveDragItemType(null)
    setActiveDragItemData(null)
    setOldColumnWhenDragginCard(null)
  }

  const customDropAnimation = {
    sideEffects: defaultDropAnimationSideEffects({
      styles: {
        active: {
          opacity: '0.5'
        }
      }
    })
  }

  const collisionDetectionStrategy = useCallback ((args) => {
    if (activeDragItemType === ACTIVE_DRAG_ITEM_TYPE.COLUMN) {
      return closestCorners({ ...args })
    }
    const pointerIntersections = pointerWithin(args)

    if (!pointerIntersections?.length) return

    let overId = getFirstCollision(pointerIntersections, 'id' )
    if (overId) {
      const checkColumn = orderedColumns.find(column => column._id === overId);
      if (checkColumn) {
        overId = closestCorners({
          ...args,
          droppableContainers: args.droppableContainers.filter(
            (container) =>
              container.id !== overId &&
              checkColumn.cardOrderIds?.includes(container.id)
          )
        })[0]?.id
      }

      lastOverId.current = overId
      return [{ id: overId }]
    }

    return lastOverId.current ? [{ id: overId }] : []
  }, [activeDragItemType])

  return (
    <DndContext
      onDragEnd={handleDragEnd}
      onDragOver={handleDragOver}
      onDragStart={handleDragStart}
      collisionDetection={collisionDetectionStrategy}
      sensors={sensors}
    >
      <Box sx={{
        bgcolor: (theme) => (theme.palette.mode === 'dark' ? '#34495e' : '#1976d2' ),
        width: '100%',
        height: (theme) => theme.trello.boardContentHeight,
        p: '10px 0'
      }}>
        <ListColumns
          columns={orderedColumns}
          createNewColumn={createNewColumn}
          createNewCard={createNewCard}
          deleteColumnDetails={deleteColumnDetails}
        />
        <DragOverlay dropAnimation={customDropAnimation}>
          {(!activeDragItemType) && null}
          {(activeDragItemType === ACTIVE_DRAG_ITEM_TYPE.COLUMN ) && <Column column={activeDragItemData}/>}
          {(activeDragItemType === ACTIVE_DRAG_ITEM_TYPE.CARD ) && <Card card={activeDragItemData}/>}
        </DragOverlay>
      </Box>
    </DndContext>
  )
}

export default BoardContent