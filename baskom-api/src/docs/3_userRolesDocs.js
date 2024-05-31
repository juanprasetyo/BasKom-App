/**
 * @swagger
 * tags:
 *   name: User Roles
 *   description: Manage user roles
 */

/**
 * @swagger
 * /user/roles/add:
 *   post:
 *     summary: Add a role to a user
 *     tags: [User Roles]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *               - roleId
 *             properties:
 *               userId:
 *                 type: integer
 *                 example: 1
 *               roleId:
 *                 type: integer
 *                 example: 2
 *     responses:
 *       201:
 *         description: Role added to user successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user_id:
 *                   type: integer
 *                   example: 1
 *                 role_id:
 *                   type: integer
 *                   example: 2
 *                 created_at:
 *                   type: string
 *                   format: date-time
 *                   example: "2024-05-30T13:45:30Z"
 *                 updated_at:
 *                   type: string
 *                   format: date-time
 *                   example: "2024-05-30T13:45:30Z"
 *       400:
 *         description: Missing required fields
 *       403:
 *         description: Forbidden, You do not have the required permissions
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /user/roles/delete:
 *   delete:
 *     summary: Remove a role from a user
 *     tags: [User Roles]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *               - roleId
 *             properties:
 *               userId:
 *                 type: integer
 *                 example: 1
 *               roleId:
 *                 type: integer
 *                 example: 2
 *     responses:
 *       200:
 *         description: Role removed from user successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Role removed from user successfully
 *       400:
 *         description: Missing required fields or default role cannot be removed
 *       403:
 *         description: Forbidden, You do not have the required permissions
 *       500:
 *         description: Server error
 */
