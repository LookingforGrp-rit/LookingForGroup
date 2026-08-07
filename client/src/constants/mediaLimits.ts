/**
 * Upload limits for the media galleries.
 *
 * WHERE THESE APPLY
 * Both the project editor's Media tab and the profile editor's Gallery tab
 * render through `ImageVideoDisplay`, and that component is the single place
 * these are enforced. Changing a number here changes it for both galleries;
 * there is no separate project/profile limit. If the two ever need to differ,
 * add a prop to `ImageVideoDisplay` rather than re-checking in each tab, or
 * the two will drift apart.
 *
 * HOW THEY'RE ENFORCED
 * At the limit the uploader is swapped for a "limit reached" notice, and the
 * upload handlers refuse anything further as a second line of defence.
 *
 * IMPORTANT — CLIENT-SIDE ONLY
 * The API does not reject uploads past these counts. Anything calling the
 * endpoints directly can still exceed them. If that matters, the same limits
 * need enforcing server-side in the project image/video and gallery routes.
 *
 * These are deliberately generous. They exist to stop one account filling
 * storage, not to constrain normal use — raise them freely if they get in
 * people's way.
 */

/** Maximum images in a single project gallery or profile gallery. */
export const MAX_GALLERY_IMAGES = 30;

/** Maximum linked videos in a single project gallery or profile gallery. */
export const MAX_GALLERY_VIDEOS = 15;
