import { Router } from 'express';
import PROJECT from '#controllers/projects/index.ts';
import requiresLogin from '../middleware/requires-login.ts';

const router = Router();

//Receive all projects
router.get('/', PROJECT.getProjects);

//Create a new project
router.post('/', PROJECT.createProject);

//Get a specific project
router.get('/:id', PROJECT.getProjectByID);

//Edits a project through a specific id
router.put('/:id', requiresLogin, PROJECT.updateProject);

//Deletes project through a specific id
router.delete('/:id', requiresLogin, PROJECT.deleteProject);

//Edits a project thumbnail through a specific id
router.put('/:id/thumbnail', requiresLogin, PROJECT.updateThumbnail);

//Receives pictures from project through id
router.get('/:id/pictures', PROJECT.getProjectPics);

//Creates a new picture for a project
router.post('/:id/pictures', PROJECT.addImage);

//Changes a picture for a project
router.put('/:id/pictures', requiresLogin, PROJECT.updateImage);

//Removes picture from a project
// router.delete('/:id/pictures' /* deletePicture */);

//Adds member to a specific project through id
router.post('/:id/members', PROJECT.addMember);

//Edits a member of a specific project through id
router.put('/:id/members', PROJECT.updateMember);

//Removes a member from a specific project through project and user ID
router.delete('/:id/members', requiresLogin, PROJECT.deleteMember);

export default router;
