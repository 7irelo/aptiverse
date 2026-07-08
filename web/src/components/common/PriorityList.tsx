"use client";

import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { alpha } from "@mui/material/styles";
import DragIndicatorIcon from "@mui/icons-material/DragIndicator";
import {
  DragDropContext,
  Droppable,
  Draggable,
  type DropResult,
} from "@hello-pangea/dnd";

// PriorityList — a drag-to-reorder list. The user grabs the handle and drags a
// row to change its rank; the new order is handed back via onReorder so the
// caller can persist it. Generic over the item type. Recreated for aptiverse
// (Graphite & Citron, MUI v7) from the Euphoria drag-list idea, without the
// react-admin coupling.
//
// Persistence is the caller's job: give it the ordered array, and on reorder
// persist the new sequence (e.g. a PATCH that writes each item's sortOrder).

export type PriorityListProps<T> = {
  items: T[];
  /** Stable unique key per item (drag id). */
  getKey: (item: T) => string;
  /** Called with the full reordered array after a drag. */
  onReorder: (ordered: T[]) => void;
  /** Row body (everything except the drag handle and optional rank). */
  renderItem: (item: T, index: number) => React.ReactNode;
  /** Show a 1-based rank number before each row. Default true. */
  showRank?: boolean;
  /** Disable dragging (e.g. while a save is in flight). */
  disabled?: boolean;
  /** Gap between rows on the 8px scale. Default 1. */
  spacing?: number;
};

export function PriorityList<T>({
  items,
  getKey,
  onReorder,
  renderItem,
  showRank = true,
  disabled = false,
  spacing = 1,
}: PriorityListProps<T>) {
  const handleDragEnd = (result: DropResult) => {
    if (!result.destination || result.destination.index === result.source.index) return;
    const next = [...items];
    const [moved] = next.splice(result.source.index, 1);
    next.splice(result.destination.index, 0, moved);
    onReorder(next);
  };

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <Droppable droppableId="priority-list">
        {(dropProvided) => (
          <Stack
            ref={dropProvided.innerRef}
            {...dropProvided.droppableProps}
            spacing={spacing}
          >
            {items.map((item, index) => (
              <Draggable
                key={getKey(item)}
                draggableId={getKey(item)}
                index={index}
                isDragDisabled={disabled}
              >
                {(dragProvided, snapshot) => (
                  <Box
                    ref={dragProvided.innerRef}
                    {...dragProvided.draggableProps}
                    sx={{
                      // The library sets an inline transform for positioning;
                      // we only style the resting/dragging surface.
                      ...dragProvided.draggableProps.style,
                      display: "flex",
                      alignItems: "center",
                      gap: 1.5,
                      p: 1.5,
                      borderRadius: 1.5,
                      border: 1,
                      borderColor: snapshot.isDragging ? "primary.main" : "divider",
                      bgcolor: "background.paper",
                      boxShadow: snapshot.isDragging
                        ? (t) => `0 8px 24px ${alpha(t.palette.common.black, 0.16)}`
                        : "none",
                      transition: "border-color 150ms ease",
                    }}
                  >
                    <Box
                      {...dragProvided.dragHandleProps}
                      aria-label="Drag to reorder"
                      sx={{
                        display: "flex",
                        color: "text.disabled",
                        cursor: disabled ? "default" : "grab",
                        "&:active": { cursor: "grabbing" },
                        "&:hover": { color: disabled ? "text.disabled" : "text.secondary" },
                        touchAction: "none",
                      }}
                    >
                      <DragIndicatorIcon fontSize="small" />
                    </Box>

                    {showRank && (
                      <Typography
                        variant="subtitle2"
                        sx={{
                          minWidth: 20,
                          textAlign: "center",
                          fontWeight: 700,
                          color: "text.secondary",
                          fontVariantNumeric: "tabular-nums",
                        }}
                      >
                        {index + 1}
                      </Typography>
                    )}

                    <Box sx={{ flex: 1, minWidth: 0 }}>{renderItem(item, index)}</Box>
                  </Box>
                )}
              </Draggable>
            ))}
            {dropProvided.placeholder}
          </Stack>
        )}
      </Droppable>
    </DragDropContext>
  );
}
