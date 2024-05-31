const { getCategoryById } = require('../models/categoryModel');

const validateCategories = async (categoryIds) => {
  const validationPromises = categoryIds.map(async (categoryId) => {
    const category = await getCategoryById(categoryId);
    return category ? null : categoryId;
  });

  const invalidCategoryIds = (await Promise.all(validationPromises)).filter(Boolean);
  return invalidCategoryIds;
};

module.exports = { validateCategories };
