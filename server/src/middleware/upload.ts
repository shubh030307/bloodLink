// Hono native upload middleware mimicking Multer's behavior
import { Context, Next } from 'hono';

export const upload = {
  single: (fieldName: string) => async (req: any, res: any, next: Function) => {
    // This expects to be called via the expressAdaptor
    // So the actual Context is in req's wrapper, but wait, expressAdaptor calls it with standard req,res,next
    // I need to extract the file from the formData which we parsed in the adaptor!
    
    if (req.body && req.body[fieldName]) {
       const file = req.body[fieldName]; // File object from Hono's parseBody()
       
       if (file && typeof file.arrayBuffer === 'function') {
           const buffer = Buffer.from(await file.arrayBuffer());
           req.file = {
              buffer,
              originalname: file.name,
              mimetype: file.type,
              size: file.size
           };
       }
    }
    
    next();
  }
};
