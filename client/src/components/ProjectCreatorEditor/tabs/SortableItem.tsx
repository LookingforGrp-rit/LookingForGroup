import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Tag } from '@looking-for-group/shared';
import { ThemeIcon } from '../../ThemeIcon';
import { Tag as TagElement } from '../../Tag';

/**
 * A single draggable/sortable selected tag used in the project editor Tags tab.
 * The drag handle (the grip icon) starts the drag; clicking the tag body
 * removes it. Reordering is wired up by the parent's DndContext/SortableContext.
 *
 * @param id The tag's id, used as the sortable identifier
 * @param tag The tag data to display
 * @param onRemove Called with the tag id when the tag's close button is clicked
 * @returns JSX Element
 */
export const SortableTag = ({
  id,
  tag,
  onRemove,
}: {
  id: number;
  tag: Tag;
  onRemove: (tagId: number) => void;
}) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className="tag-draggable">
      <button
        type="button"
        className="tag-drag-handle button-reset"
        aria-label={`Reorder ${tag.label}`}
        {...attributes}
        {...listeners}
      >
        <ThemeIcon width={21} height={21} id={'drag'} ariaLabel="drag" />
      </button>
      <TagElement
        selected={true}
        type={tag.type.toLowerCase()}
        onClick={() => onRemove(tag.tagId)}
      >
        <i className="fa fa-close"></i>
        <p>{tag.label}</p>
      </TagElement>
    </div>
  );
};
