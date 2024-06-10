import { series } from "gulp";
import download from "./download";
import rename from "./rename";
import fileUpload from "./fileUpload";
import compress from "./compress";

export default series(download, rename, compress, fileUpload);
