/**
 * @swagger
 * components:
 *   schemas:
 *     Upgrade Role:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: The auto-generated ID of the upgrade role request.
 *         user_id:
 *           type: integer
 *           description: The ID of the user.
 *         status:
 *           type: string
 *           description: The status of the upgrade role request.
 *           enum: [waiting, accept, reject]
 *         document_url:
 *           type: string
 *           description: The URL of the uploaded document.
 *         created_at:
 *           type: string
 *           format: date-time
 *           description: The date and time when the request was created.
 *         updated_at:
 *           type: string
 *           format: date-time
 *           description: The date and time when the request was last updated.
 */

/**
 * @swagger
 * tags:
 *   name: Upgrade Roles
 *   description: API to manage user upgrade roles.
 */

/**
 * @swagger
 * /upgrade-roles:
 *   post:
 *     summary: Create a new upgrade role request
 *     tags: [Upgrade Roles]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: The document to be uploaded.
 *     responses:
 *       201:
 *         description: The upgrade role request was successfully created.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Upgrade Role'
 *       400:
 *         description: Bad request.
 *       500:
 *         description: Internal server error.
 */

/**
 * @swagger
 * /upgrade-roles/{id}:
 *   put:
 *     summary: Update an upgrade role request
 *     tags: [Upgrade Roles]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: The ID of the upgrade role request.
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: The document to be uploaded.
 *               status:
 *                 type: string
 *                 description: The status of the upgrade role request.
 *                 enum: [waiting, accept, reject]
 *     responses:
 *       200:
 *         description: The upgrade role request was successfully updated.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UpgradeRole'
 *       400:
 *         description: Bad request.
 *       404:
 *         description: Upgrade role request not found.
 *       500:
 *         description: Internal server error.
 */

/**
 * @swagger
 * /upgrade-roles/{id}:
 *   get:
 *     summary: Get an upgrade role request by ID
 *     tags: [Upgrade Roles]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: The ID of the upgrade role request.
 *     responses:
 *       200:
 *         description: The upgrade role request data.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UpgradeRole'
 *       404:
 *         description: Upgrade role request not found.
 *       500:
 *         description: Internal server error.
 */

/**
 * @swagger
 * /upgrade-roles:
 *   get:
 *     summary: Get all upgrade role requests
 *     tags: [Upgrade Roles]
 *     responses:
 *       200:
 *         description: A list of all upgrade role requests.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/UpgradeRole'
 *       500:
 *         description: Internal server error.
 */

/**
 * @swagger
 * /upgrade-roles/{id}:
 *   delete:
 *     summary: Delete an upgrade role request by ID
 *     tags: [Upgrade Roles]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: The ID of the upgrade role request.
 *     responses:
 *       204:
 *         description: Upgrade role request successfully deleted.
 *       404:
 *         description: Upgrade role request not found.
 *       500:
 *         description: Internal server error.
 */
