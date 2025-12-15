import {useSortable} from '@dnd-kit/sortable';
import {CSS} from '@dnd-kit/utilities';

/**
 * An draggable and droppable tag.
 * @param props ID of item
 * @returns JSX Element
 */
export const SortableTag = (props: {id: string}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({id: props.id});
  
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };
  
  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      {/* TODO: Use tag information here */}
      <p>SortableItem {props.id}</p>
    </div>
  );
}