import type { Request, Response } from 'express';
import reorderImagesService from '#services/projects/images/reorder-images.ts';

//an array of the imageIds of each of the images in their new order
type ImageOrder = {
  imageOrder?: number[];
};

//PUT api/projects/{id}/images/reorder
//reorders the images in a project
//currently unused/not implemented, but it's intended for the project carousel
//ImageOrder is an array of each project image's imageId, ordered how the user wishes
//and those are used to set each image's position parameter, which is currently unused
const reorderImagesController = async (req: Request, res: Response): Promise<void> => {
  const imageOrder: ImageOrder = req.body as ImageOrder;

  const projId = parseInt(req.params.id);

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
