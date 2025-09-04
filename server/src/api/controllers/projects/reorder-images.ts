import type { RequestHandler } from 'express';
import reorderImagesService from '#services/projects/reorder-images.ts';

//an array of the imageIds of each of the images in their new order
type ImageOrder = {
  imageOrder?: string[];
};

const reorderImagesController: RequestHandler<{ projectId: string }, unknown> = async (
  req,
  res,
): Promise<void> => {
  const { projectId } = req.params;
  const imageOrder: ImageOrder = req.body as ImageOrder;

  const projId = parseInt(projectId);
  if (isNaN(projId)) {
    res.status(400).json({ message: 'Invalid project ID' });
    return;
  }

  const result = await reorderImagesService(projId, imageOrder);

  if (result === 'NOT_FOUND') {
    res.status(404).json({ message: 'Image not found' });
    return;
  }

  if (result === 'INTERNAL_ERROR') {
    res.status(500).json({ message: 'Internal Server Error' });
    return;
  }

  res.status(200).json({ success: true });
};

export default reorderImagesController;
