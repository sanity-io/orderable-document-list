import PropTypes from 'prop-types'
import React, {useState, useEffect} from 'react'
import {DragDropContext, Droppable, Draggable} from 'react-beautiful-dnd'
import sanityClient from 'part:@sanity/base/client'
import {Box, Card, useToast} from '@sanity/ui'

import Document from './Document'
import {reorderDocuments} from './helpers/reorderDocuments'
import {ORDER_FIELD_NAME} from './helpers/constants'

const client = sanityClient.withConfig({
  apiVersion: '2021-09-01',
})

const getItemStyle = (draggableStyle, itemIsUpdating) => ({
  userSelect: 'none',
  transition: `opacity 500ms ease-in-out`,
  opacity: itemIsUpdating ? 0.2 : 1,
  pointerEvents: itemIsUpdating ? `none` : undefined,
  ...draggableStyle,
})

const cardTone = (isGhosting, isDragging, isSelected) => {
  if (isGhosting) return `transparent`
  if (isDragging || isSelected) {
    return `primary`
  }

  return undefined
}

export default function DraggableList({data, isUpdating, setIsUpdating}) {
  const toast = useToast()

  // Maintains local state order before transaction completes
  const [orderedData, setOrderedData] = useState(data)

  // Update local state when documents change from an outside source
  useEffect(() => {
    if (!isUpdating) setOrderedData(data)
    /* eslint-disable-next-line react-hooks/exhaustive-deps */
  }, [data])

  const [draggingId, setDraggingId] = useState(``)
  const [selectedIds, setSelectedIds] = useState([])

  const clearSelected = () => setSelectedIds([])

  const handleSelect = (clickedId, index, nativeEvent) => {
    const isSelected = selectedIds.includes(clickedId)
    const selectMultiple = nativeEvent.shiftKey
    const isUsingWindows = navigator.appVersion.indexOf('Win') !== -1
    const selectAdditional = isUsingWindows ? nativeEvent.ctrlKey : nativeEvent.metaKey

    let updatedIds = []

    // No modifiers, update selected to just this one
    if (!selectMultiple && !selectAdditional) {
      return setSelectedIds([clickedId])
    }

    // Shift key was held, add id's between last selected and this one
    // ...before adding this one
    if (selectMultiple && !isSelected) {
      const lastSelectedId = selectedIds.at(-1)
      const lastSelectedIndex = orderedData.findIndex((item) => item._id === lastSelectedId)

      const firstSelected = index < lastSelectedIndex ? index : lastSelectedIndex
      const lastSelected = index > lastSelectedIndex ? index : lastSelectedIndex

      const betweenIds = orderedData
        .filter((item, itemIndex) => itemIndex > firstSelected && itemIndex < lastSelected)
        .map((item) => item._id)

      updatedIds = [...selectedIds, ...betweenIds, clickedId]
    } else if (isSelected) {
      // Toggle off a single id
      updatedIds = selectedIds.filter((id) => id !== clickedId)
    } else {
      // Toggle on a single id
      updatedIds = [...selectedIds, clickedId]
    }

    return setSelectedIds(updatedIds)
  }

  const transactPatches = async (patches, message) => {
    const transaction = client.transaction()

    patches.forEach((patchArgs) => transaction.patch(...patchArgs))

    await transaction
      .commit()
      .then((updated) => {
        clearSelected()
        setDraggingId(``)
        setIsUpdating(false)
        toast.push({
          title: `${
            updated.results.length === 1 ? `1 Document` : `${updated.results.length} Documents`
          } Reordered`,
          status: `success`,
          description: message,
        })

        // Another "I didn't write tests but I'm going to console.log my way to victory" piece of programming
        // fetch(
        //   `https://i2v7h052.api.sanity.io/v2021-03-25/data/query/production?query=*%5B_type%20%3D%3D%20%22category%22%5D%7Corder(orderRank)%7B%0A%20%20title%2C%20orderRank%0A%7D`
        // )
        //   .then((res) => res.json())
        //   .then((res) => {
        //     console.table(res.result.map((item) => item?.title).join(', '))
        //   })
      })
      .catch(() => {
        setDraggingId(``)
        setIsUpdating(false)
        toast.push({
          title: `Reordering failed`,
          status: `critical`,
        })
      })
  }

  const handleDragEnd = (result, entities) => {
    setDraggingId(``)

    const {source, destination, draggableId} = result ?? {}

    // Don't do anything if nothing changed
    if (source.index === destination.index) return

    // Don't do anything if we don't have the entitites
    if (!entities?.length) return

    // A document can be dragged without being one-of-many-selected
    const effectedIds = selectedIds?.length ? selectedIds : [draggableId]

    // Don't do anything if we don't have ids to effect
    if (!effectedIds?.length) return

    // Update state to update styles + prevent data refetching
    setIsUpdating(true)
    setSelectedIds(effectedIds)

    const {newOrder, patches, message} = reorderDocuments({
      entities,
      selectedIds: effectedIds,
      source,
      destination,
    })

    // Update local state
    if (newOrder?.length) {
      setOrderedData(newOrder)
    }

    // Transact new order patches
    if (patches?.length) {
      transactPatches(patches, message)
    }
  }

  const handleDragStart = (start) => {
    const id = start.draggableId
    const selected = selectedIds.includes(id)

    // if dragging an item that is not selected - unselect all items
    if (!selected) clearSelected()

    setDraggingId(id)
  }

  // Move one document up or down one place, by fake invoking the drag function
  const incrementIndex = (shiftFrom, shiftTo, id, entities) => {
    const result = {
      draggableId: id,
      source: {index: shiftFrom},
      destination: {index: shiftTo},
    }

    return handleDragEnd(result, entities)
  }

  const onWindowKeyDown = (event) => {
    if (event.key === 'Escape') {
      clearSelected()
    }
  }

  useEffect(() => {
    window.addEventListener('keydown', onWindowKeyDown)

    return () => {
      window.removeEventListener('keydown', onWindowKeyDown)
    }
  }, [])

  return (
    <div>
      <DragDropContext
        onDragStart={handleDragStart}
        onDragEnd={(result) => handleDragEnd(result, orderedData)}
        style={{overflow: `auto`}}
      >
        <Droppable droppableId="documentSortZone">
          {(provided, snapshot) => (
            <div {...provided.droppableProps} ref={provided.innerRef}>
              {orderedData.map((item, index) => (
                <Draggable
                  key={`${item._id}-${item[ORDER_FIELD_NAME]}`}
                  draggableId={item._id}
                  index={index}
                  // onClick={(event) => handleDraggableClick(event, provided, snapshot)}
                >
                  {(innerProvided, innerSnapshot) => {
                    const itemIsSelected = selectedIds.includes(item._id)
                    const itemIsDragging = innerSnapshot.isDragging
                    const isGhosting = !itemIsDragging && draggingId && itemIsSelected
                    const itemIsUpdating = isUpdating && itemIsSelected

                    return (
                      <div
                        ref={innerProvided.innerRef}
                        {...innerProvided.draggableProps}
                        {...innerProvided.dragHandleProps}
                        style={getItemStyle(
                          innerProvided.draggableProps.style,
                          itemIsUpdating,
                          isGhosting
                        )}
                      >
                        <Box paddingBottom={1}>
                          <Card
                            tone={cardTone(isGhosting, itemIsDragging, itemIsSelected)}
                            shadow={itemIsDragging ? `2` : undefined}
                            radius={2}
                          >
                            <Document
                              doc={item}
                              entities={orderedData}
                              handleSelect={handleSelect}
                              increment={incrementIndex}
                              index={index}
                              isFirst={index === 0}
                              isLast={index === orderedData.length - 1}
                            />
                          </Card>
                        </Box>
                      </div>
                    )
                  }}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  )
}

DraggableList.propTypes = {
  data: PropTypes.arrayOf(
    PropTypes.shape({
      _id: PropTypes.string,
    }).isRequired
  ).isRequired,
  isUpdating: PropTypes.bool.isRequired,
  setIsUpdating: PropTypes.func.isRequired,
}
