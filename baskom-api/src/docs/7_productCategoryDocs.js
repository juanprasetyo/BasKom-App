/**
 * @swagger
 * components:
 *   schemas:
 *     ProductCategory:
 *       type: object
 *       properties:
 *         product_id:
 *           type: integer
 *           description: The ID of the product
 *         category_id:
 *           type: integer
 *           description: The ID of the category
 *         created_at:
 *           type: string
 *           format: date-time
 *           description: The date and time when the product category was created
 *         updated_at:
 *           type: string
 *           format: date-time
 *           description: The date and time when the product category was last updated
 */

/**
 * @swagger
 * tags:
 *   name: Product Categories
 *   description: Management of product categories
 */

/**
 * @swagger
 * /product-categories:
 *   post:
 *     summary: Add a product to a category
 *     tags: [Product Categories]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - productId
 *               - categoryId
 *             properties:
 *               productId:
 *                 type: integer
 *                 example: 1
 *               categoryId:
 *                 type: integer
 *                 example: 1
 *     responses:
 *       201:
 *         description: The created product category relationship
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ProductCategory'
 *       403:
 *         description: Unauthorized
 *       404:
 *         description: Product or category not found
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /product-categories:
 *   delete:
 *     summary: Remove a product from a category
 *     tags: [Product Categories]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - productId
 *               - categoryId
 *             properties:
 *               productId:
 *                 type: integer
 *                 example: 1
 *               categoryId:
 *                 type: integer
 *                 example: 1
 *     responses:
 *       204:
 *         description: Product category relationship deleted
 *       403:
 *         description: Unauthorized
 *       404:
 *         description: Product or category not found
 *       500:
 *         description: Server error
 */
