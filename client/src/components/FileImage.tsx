import { useState } from "react";
import placeholder from "../images/project_temp.png";

export const FileImage = ({ file, alt }: { file: File; alt: string }) => {
  const [src, setSrc] = useState("");

  const fileReader = new FileReader();
  fileReader.onload = () => setSrc(fileReader.result as string);
  fileReader.onerror = () => setSrc(placeholder);
  fileReader.readAsDataURL(file);

  return <img src={src} alt={alt} />;
};
