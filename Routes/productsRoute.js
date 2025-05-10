import express from 'express';
import { listProducts, addProducts, singleProducts, deleteProducts, updateProduct } from '../controllers/productsController.js';
import upload from '../middleware/multers.js';
import adminVerify from '../middleware/adminverify.js';

const productsRouter = express.Router();

productsRouter.post('/add',
  adminVerify,
  upload.fields([{ name: 'image1', maxCount: 1 }, { name: 'image2', maxCount: 1 }, { name: 'image3', maxCount: 1 }, { name: 'image4', maxCount: 1 }]),
  addProducts
);

productsRouter.delete('/delete/:id', adminVerify, deleteProducts);
productsRouter.put('/update/:id', adminVerify, updateProduct);  

productsRouter.post('/single', singleProducts);
productsRouter.get('/list', listProducts);

export default productsRouter;
