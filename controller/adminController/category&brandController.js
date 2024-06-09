const categoryDB = require("../../models/adminModels/category");
const { createError } = require("../../utils/errors");
const brandDB = require("../../models/adminModels/brand");
const mongoose = require("mongoose");

//render categories and brand page
exports.renderCategoriesAndBrands = async (req, res, next) => {
  try {
    const categories = await categoryDB.find({});
    const brands = await brandDB.find({});

    return res.render("admin/adminDasbord/categoriesAndBrands", {
      categories,
      brands,
    });

  } catch (error) {
    console.log(error);
  }
};

//render add category page
exports.renderAddCategoryPage = async (req, res, next) => {
  return res.render("admin/adminDasbord/addCategory");
};

//add new category
exports.AddNewCategory = async (req, res, next) => {
  try {
    const { name, discription } = req.body;

    const upperCategoryName = name.toUpperCase();

    const existingCategory = await categoryDB.findOne({
      name : upperCategoryName,
      isActive: true,
    });

    if (existingCategory) {
      return next(
        createError(400, "This category already exists and is active!")
      );
    }

    const newCategory = new categoryDB({ name: upperCategoryName, discription });

    newCategory.save();

    return res.status(200).send(newCategory);
  } catch (error) {
    console.log(error);
    return next(createError(null, null));
  }
};

//delete category
exports.deleteCategory = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).render("errorPages/404");
    }

    const category = await categoryDB.findById(id);
    if (!category) {
      return next(createError(404, "category not found"));
    }
    category.isActive = false;
    await category.save();

    res.status(200).send(category);
  } catch (error) {
    console.log(error);
    return next(createError(null, null));
  }
};

//render edit category page
exports.renderEditCategoryPage = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).render("errorPages/404");
    }

    const category = await categoryDB.findById(id);
    if (!category) {
      return next(createError(404, "category not found"));
    }
    return res.render("admin/adminDasbord/editCategory",{category});
    
  } catch (error) {
    console.log(error);
    return next(createError(null, null));
  }
}

//edit  category 
exports.editCategory = async (req, res, next) =>{
  try {
const {name , discription} = req.body;
const {id} = req.params;

const upperCategoryName = name.toUpperCase();

if (!mongoose.Types.ObjectId.isValid(id)) {
  return res.status(404).render("errorPages/404");
}

// const existingCategory = await categoryDB.findOne({
//   name : upperCategoryName,
//   isActive: true,
// });

// if (existingCategory) {
//   return next(
//     createError(400, "This category already exists and is active!")
//   );
// }

const category = await categoryDB.findOneAndUpdate(
  { _id: id },
  { $set: { name : upperCategoryName, discription } },
  { new: true }
);

if (!category) {
  return next(createError(404, "category not found"));
}
console.log(category);
res.status(200).send({ category });

}catch(error){
  console.log(error);
return next(createError(null, null));
}
}

// #########################    BRAND   #######################


//render add brand page
exports.renderAddBrandPage = async (req, res, next) => {
  return res.render("admin/adminDasbord/addBrand");
};

//add new brand
exports.AddNewBrand = async (req, res, next) => {
  try {
    const { name, discription } = req.body;

   const upperBrandName = name.toUpperCase();

    const existingBrand = await brandDB.findOne({
      name: upperBrandName,
      isActive: true,
    });

    if (existingBrand) {
      return next(createError(400, "This brand already exists and is active!"));
    }

    const newBrand = new brandDB({ name: upperBrandName, discription });

    newBrand.save();

    return res.status(200).send(newBrand);
  } catch (error) {

    return next(createError(null, null));
  }
};

//delete brand
exports.deleteBrand = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).render("errorPages/404");
    }

    const brand = await brandDB.findById(id);
    if (!brand) {
      return next(createError(404, "brand not found"));
    }
    brand.isActive = false;
    await brand.save();

    res.status(200).send(brand);
  } catch (error) {

    return next(createError(null, null));
  }
};

//render edit brand page
exports.renderEditBrandPage = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).render("errorPages/404");
    }

    const brand = await brandDB.findById(id);
    if (!brand) {
      return next(createError(404, "brand not found"));
    }
    return res.render("admin/adminDasbord/editBrand",{brand});
    
  } catch (error) {
    console.log(error);
    return next(createError(null, null));
  }

}

//edit brand
exports.editBrand = async (req, res, next) =>{
  try {
const {name , discription} = req.body;
const {id} = req.params;


if (!mongoose.Types.ObjectId.isValid(id)) {
  return res.status(404).render("errorPages/404");
}

const upperBrandName = name.toUpperCase()

const brand = await brandDB.findOneAndUpdate(
  { _id: id },
  { $set: { name : upperBrandName, discription } },
  { new: true }
);

if (!brand) {
  return next(createError(404, "category not found"));
}
console.log(brand);
res.status(200).send({ brand });

}catch(error){
  console.log(error);
return next(createError(null, null));
}
}