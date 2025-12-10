import { useState } from "react";
import placeholder from "../images/project_temp.png";

/**
 * Displays an image preview from a provided File object. Reads the file
 * client-side using FileReader and falls back to a placeholder image if
 * the file fails to load.
 *
 * @param file - The file to be displayed as an image preview.
 * @param alt - Alt text applied to the rendered <img>.
 * @returns An <img> element showing the file preview or a placeholder.
 */
export const FileImage = ({ file, alt }: { file: File; alt: string }) => {
  // State to hold the current image source
  const [src, setSrc] = useState<string>();

  // Create a FileReader to read the file as a data URL
  const fileReader = new FileReader();
  // When the file is sucessfully read, update the state
  fileReader.onload = () => setSrc(fileReader.result as string);
  // If reading fails, use a placeholder image instead
  fileReader.onerror = () => setSrc(placeholder);
  // Start reading the file as a data URL
  fileReader.readAsDataURL(file);
  // Render the image
  return <img src={src} alt={alt} />;
};
