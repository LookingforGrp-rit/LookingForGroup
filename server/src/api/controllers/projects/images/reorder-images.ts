import type { Request, Response } from 'express';
import reorderImagesService from '#services/projects/images/reorder-images.ts';

//an array of the imageIds of each of the images in their new order
type ImageOrder = {
  imageOrder?: number[];
};

//reorders the images in a project
const reorderImagesController = async (req: Request, res: Response): Promise<void> => {
  const imageOrder: ImageOrder = req.body as ImageOrder;

  const projId = parseInt(req.params.id);
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
