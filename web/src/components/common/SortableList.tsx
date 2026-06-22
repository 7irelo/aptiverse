"use client";

import {
  DragDropContext,
  Draggable,
  Droppable,
  type DropResult,
} from "@hello-pangea/dnd";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import Stack from "@mui/material/Stack";
import DragIndicatorIcon from "@mui/icons-material/DragIndicator";
import { useTheme } from "@mui/material/styles";

export type SortableListProps<T> = {
  items: T[];
  getId: (item: T, index: number) => string;
  /** Called with the reordered array after a drop. */
  onReorder: (next: T[]) => void;
  renderItem: (item: T, index: number) => React.ReactNode;
  /** Default 'sortable'. Set when you have multiple SortableList instances on one page. */
  droppableId?: string;
  /** Render an extra row at the end (e.g. an "Add item" button). Not draggable. */
  endSlot?: React.ReactNode;
};

// Reusable drag-and-drop sortable list. Items get a left-side drag handle,
// a card-style row, and visual lift while dragging. Inspired by
// Euphoria.v4's GroupMemberListItem pattern.
export function SortableList<T>({
  items,
  getId,
  onReorder,
  renderItem,
  droppableId = "sortable",
  endSlot,
}: SortableListProps<T>) {
  const theme = useTheme();

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    if (result.destination.index === result.source.index) return;
    const next = Array.from(items);
    const [moved] = next.splice(result.source.index, 1);
    next.splice(result.destination.index, 0, moved);
    onReorder(next);
  };

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <Droppable droppableId={droppableId}>
        {(dropProvided) => (
          <Stack
            ref={dropProvided.innerRef}
            {...dropProvided.droppableProps}
            spacing={1}
          >
            {items.map((item, index) => {
              const id = getId(item, index);
              return (
                <Draggable key={id} draggableId={id} index={index}>
                  {(dragProvided, snapshot) => (
                    <Box
                      ref={dragProvided.innerRef}
                      {...dragProvided.draggableProps}
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                        p: 1.5,
                        borderRadius: 1.5,
                        border: 1,
                        borderColor: snapshot.isDragging ? "primary.main" : "divider",
                        bgcolor: "background.paper",
                        boxShadow: snapshot.isDragging
                          ? theme.shadows[6]
                          : "none",
                        transition: snapshot.isDragging
                          ? "none"
                          : "border-color 150ms, box-shadow 150ms",
                      }}
                    >
                      <IconButton
                        size="small"
                        {...dragProvided.dragHandleProps}
                        sx={{ cursor: "grab", color: "text.secondary", "&:active": { cursor: "grabbing" } }}
                        aria-label="Drag to reorder"
                      >
                        <DragIndicatorIcon fontSize="small" />
                      </IconButton>
                      <Box sx={{ flex: 1, minWidth: 0 }}>{renderItem(item, index)}</Box>
                    </Box>
                  )}
                </Draggable>
              );
            })}
            {dropProvided.placeholder}
            {endSlot && <Box sx={{ pt: 1 }}>{endSlot}</Box>}
          </Stack>
        )}
      </Droppable>
    </DragDropContext>
  );
}
