import { Router } from 'express';
import { getCategoriesController, getCategoryByIdController } from '../services/categoryService';

const router = Router();

/**
 * @swagger
 * /api/meal/categories:
 *   get:
 *     summary: Get all meal categories
 *     tags: [Categories]
 *     responses:
 *       200:
 *         description: Categories retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                         example: "507f1f77bcf86cd799439011"
 *                       name:
 *                         type: string
 *                         example: "Pizza"
 *                       nameAr:
 *                         type: string
 *                         example: "البيتزا"
 *                       count:
 *                         type: number
 *                         example: 5
 *                       color:
 *                         type: string
 *                         example: "#ff6b6b"
 *                 message:
 *                   type: string
 *                   example: "Categories retrieved successfully"
 *       500:
 *         description: Server error
 */
router.get('/', getCategoriesController);

/**
 * @swagger
 * /api/meal/categories/{categoryId}:
 *   get:
 *     summary: Get category by ID
 *     tags: [Categories]
 *     parameters:
 *       - in: path
 *         name: categoryId
 *         required: true
 *         schema:
 *           type: string
 *         description: Category ID
 *     responses:
 *       200:
 *         description: Category retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                       example: "507f1f77bcf86cd799439011"
 *                     name:
 *                       type: string
 *                       example: "Pizza"
 *                     nameAr:
 *                       type: string
 *                       example: "البيتزا"
 *                     count:
 *                       type: number
 *                       example: 5
 *                     color:
 *                       type: string
 *                       example: "#ff6b6b"
 *                 message:
 *                   type: string
 *                   example: "Category retrieved successfully"
 *       404:
 *         description: Category not found
 *       500:
 *         description: Server error
 */
router.get('/:categoryId', getCategoryByIdController);

export default router;
