const sizeDB = require("../../models/adminModels/size");
const { createError } = require("../../utils/errors");
const tagDB = require("../../models/adminModels/tag");
const mongoose = require("mongoose");
const { logCheck } = require("./adminAuthController");

//render tags and size page
exports.renderTagAndSize = async (req, res, next) => {
  try {
    const tags = await tagDB.find({});
    const sizes = await sizeDB.find({});
    return res.render("admin/adminDasbord/tagsAndsize", {
      tags,
      sizes,
    });
  } catch (error) {
    console.log(error);
  }
};

//render add tag page
exports.renderAddTagPage = async (req, res, next) => {
  return res.render("admin/adminDasbord/addTags");
};

//add new tag
exports.AddNewTag = async (req, res, next) => {
  try {
    const { tagName } = req.body;
    const tagNameUpper = tagName.toUpperCase();

    const existingTag = await tagDB.findOne({
      tagName:tagNameUpper,
      isActive: true,
    });

    if (existingTag) {
      return next(createError(400, "This Tag already exists and is active!"));
    }

    const newTag = new tagDB({ tagName: tagNameUpper });

    newTag.save();

    return res.status(200).send(newTag);
  } catch (error) {
    console.log(error);
    return next(createError(null, null));
  }
};

//delete tag
exports.deleteTag = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return next(createError(400, "Invalid ID"));
    }

    const tag = await tagDB.findById(id);
    if (!tag) {
      return next(createError(404, "tag not found"));
    }
    tag.isActive = false;
    await tag.save();

    res.status(200).send(tag);
  } catch (error) {
    console.log(error);
    return next(createError(null, null));
  }
};

//render edit tag page
exports.renderEditTagPage = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).render("errorPages/404");
    }

    const tag = await tagDB.findById(id);
    if (!tag) {
      return next(createError(404, "tag not found"));
    }
    return res.render("admin/adminDasbord/editTag", { tag });
  } catch (error) {
    console.log(error);
    return next(createError(null, null));
  }
};

//edit  tag
exports.editTag = async (req, res, next) => {
  try {
    const { tagName } = req.body;
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).render("errorPages/404");
    }

   const tagNameUpper = tagName.toUpperCase();

   const existingTag = await tagDB.findOne({
    tagName:tagNameUpper,
    isActive: true,
  });

  if (existingTag) {
    return next(createError(400, "This Tag already exists and is active!"));
  }

    const existTag = await tagDB.findOne({ tagName: tagNameUpper, _id: id });
    
    if (existTag) return next(createError(400, "This tag already exists and is active!"));
    
    const updatedTag = await tagDB.findOneAndUpdate(
      { _id: id },
      { $set: { tagName: tagNameUpper } },
      { new: true }
    );

    if (!updatedTag) {
      return next(createError(404, "tag not found"));
    }
    console.log(updatedTag);
    res.status(200).send({ tagName: tagNameUpper });
  } catch (error) {
    console.log(error);
    return next(createError(null, null));
  }
};

// #########################    SIZE   #######################

//render add size page
exports.renderAddSizePage = async (req, res, next) => {
  return res.render("admin/adminDasbord/addSize");
};

//add new size
exports.AddNewSize = async (req, res, next) => {
  try {
    const { size } = req.body;
    const sizeUpper = size.toUpperCase();


    const existingSize = await sizeDB.findOne({
      size: sizeUpper,
      isActive: true,
    });

    if (existingSize) {
      return next(createError(400, "This size already exists and is active!"));
    }

    const newSize = new sizeDB({ size: sizeUpper });

    newSize.save();

    return res.status(200).send(newSize);
  } catch (error) {
    return next(createError(null, null));
  }
};

//delete size
exports.deleteSize = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).render("errorPages/404");
    }

    const size = await sizeDB.findById(id);
    if (!size) {
      return next(createError(404, "size not found"));
    }

    size.isActive = false;
    await size.save();

    res.status(200).send(size);
  } catch (error) {
    return next(createError(null, null));
  }
};

//render edit size page
exports.renderEditSizePage = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).render("errorPages/404");
    }

    const size = await sizeDB.findById(id);
    if (!size) {
      return next(createError(404, "size not found"));
    }
    return res.render("admin/adminDasbord/editSize", { size });
  } catch (error) {
    console.log(error);
    return next(createError(null, null));
  }
};

//edit size
exports.editSize = async (req, res, next) => {
  try {
    const { size } = req.body;
    const { id } = req.params;
    const sizeUpper = size.toUpperCase();

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).render("errorPages/404");
    }

    const existingSize = await sizeDB.findOne({
      size: sizeUpper,
      isActive: true,
    });

    if (existingSize) {
      return next(createError(400, "This size already exists and is active!"));
    }

    const updatedSize = await sizeDB.findOneAndUpdate(
      { _id: id },
      { $set: { size: sizeUpper } },
      { new: true }
    );

    if (!updatedSize) {
      return next(createError(404, "size not found"));
    }
   return res.status(200).send({ updatedSize });
  } catch (error) {
    console.log(error);
    return next(createError(null, null));
  }
};
