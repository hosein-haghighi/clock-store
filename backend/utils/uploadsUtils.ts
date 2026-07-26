import fs from "fs";
import path from "path";

export const moveTempToProducts = (files: Express.Multer.File[]) => {

    for (const file of files) {
        const oldPath = file.path;
        const newFileName = file.filename;
        const newPath = path.join(
            process.cwd(),
            "uploads/products",
            newFileName
        );
        fs.renameSync(oldPath, newPath);
    }
};

export const deleteTemp = async (files: Express.Multer.File[]) => {
    if (files?.length) {
        for (const file of files) {
            try {
                fs.unlinkSync(file.path);
            } catch { }
        }
    }
};