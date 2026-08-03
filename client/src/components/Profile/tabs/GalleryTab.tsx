import { useCallback, useEffect, useMemo, useState } from "react";
import { GalleryImage, GalleryVideo, PendingGalleryImage } from "@looking-for-group/shared";
import { getGalleryImages, getGalleryVideos, } from "../../../api/users";
import ImageVideoDisplay from "../../ImageVideoDisplay";
import { PendingUserProfile } from "../../../../types/types";
import { userDataManager } from "../../../api/data-managers/user-data-manager";

let localIdIncrement = 1;

type GalleryTabProps = {
  profile: PendingUserProfile;
  dataManager: Awaited<ReturnType<typeof userDataManager>>;
}

export const GalleryTab: React.FC<GalleryTabProps> = ({
  profile,
  dataManager,
}) => {
  const userID = useMemo(() => profile.userId, [profile]);

  const [galleryImages, setGalleryImages] = useState<GalleryImage[]>([]);
  const [galleryVideos, setGalleryVideos] = useState<GalleryVideo[]>([]);

  const [newImages, setNewImages] = useState<(PendingGalleryImage)[]>([]);
  const [newVideos, setNewVideos] = useState<GalleryVideo[]>([]);

  const [deleteImages, setDeleteImages] = useState<GalleryImage[]>([]);
  const [deleteVideos, setDeleteVideos] = useState<GalleryVideo[]>([]);

  const [uploadError, setUploadError] = useState<string>("");

  useEffect(() => {
    if (userID === undefined || userID === -1) return;

    const loadGallery = async () => {
      const imageResponse = await getGalleryImages(userID);
      const videoResponse = await getGalleryVideos(userID);

      if (imageResponse.data)
        setGalleryImages(imageResponse.data);

      if (videoResponse.data)
        setGalleryVideos(videoResponse.data);
    }

    loadGallery();
  }, [userID]);
  
  /**
   * if the image has yet to be uploaded, removes it from the new image array, otherwise adds it to the remove queue
   * @param image a refference to the image that must be deleted
   */
  const handleImageDelete = useCallback((image: GalleryImage | PendingGalleryImage) => {
    if ((image as PendingGalleryImage).localId) {
      setNewImages(newImages.filter(i => i !== image));
      dataManager.removeGalleryImage({
        id: {
          type: "local",
          value: (image as PendingGalleryImage).localId,
        },
        data: null
      });
    }
    else {
      setDeleteImages([...deleteImages, (image as GalleryImage)]);
      dataManager.removeGalleryImage({
        id: {
          type: "canon",
          value: (image as GalleryImage).galleryImageId,
        },
        data: null
      });
    }
  }, [newImages, deleteImages]);

  /**
   * adds a new image to the new image array, for uploading after saving
   * @param image the file uploaded by the user
   */
  const handleImageUpload = useCallback((image: File, altText?: string) => {
    if (image.size > 2000000) {
      setUploadError("File too large!");
      return;
    }
    else {
      setUploadError("");
    }
    setNewImages([
      ...newImages, 
      { 
        image, 
        altText: altText ?? "Gallery Image", 
        localId: localIdIncrement,
      }
    ]);
    dataManager.addGalleryImage({ 
      id: {
        type: "local",
        value: localIdIncrement,
      },
      data: {
        file: image,
        altText: altText ?? "Gallery Image",
      }
    });
    localIdIncrement++;
  }, [newImages, galleryImages]);

  /**
   * if the video has yet to be uploaded remove it from the new videos array, otherwise add it to the deletion queue
   * @param video reference of the video to be removed
   */
  const handleDeleteVideo = useCallback((video: GalleryVideo) => {
    if (newVideos.includes(video)) {
      setNewVideos(newVideos.filter(v => v !== video));
      dataManager.removeGalleryVideo({
        id: {
          type: "local",
          value: video.galleryVideoId,
        },
        data: null,
      });
    }
    else {
      setDeleteVideos([...deleteVideos, video]);
      dataManager.removeGalleryVideo({
        id: {
          type: "canon",
          value: video.galleryVideoId,
        },
        data: null,
      });
    }
  }, [newVideos, deleteVideos]);

  /**
   * adds a video to the new videos array
   * @param video a reference of the video that is to be added after saving
   */
  const handleAddVideo = useCallback((video: GalleryVideo) => {
    setNewVideos([...newVideos, {...video, galleryVideoId: localIdIncrement}]);
    dataManager.addGalleryVideo({
      id: {
        type: "local",
        value: localIdIncrement,
      },
      data: video,
    });
    localIdIncrement++;
  }, [newVideos]);

  return (
    <div id="user-gallery-edit">
      <ImageVideoDisplay<GalleryImage | PendingGalleryImage, GalleryVideo>
        images={[
          ...galleryImages.filter(image => !deleteImages.includes(image)), 
          ...newImages,
        ]}
        videos={[
          ...galleryVideos.filter(video => !deleteVideos.includes(video)),
          ...newVideos
        ]}
        saveable={true}
        message=""
        handleImageDelete={handleImageDelete}
        handleImageUpload={handleImageUpload}
        handleDeleteVideo={handleDeleteVideo}
        handleAddVideo={handleAddVideo}
        imageError={uploadError}
      />
    </div>
  );
}