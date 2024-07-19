const Referral = require("../../models/adminModels/referral")
const CategoryOffer = require("../../models/adminModels/categoryOffer");
const Category = require("../../models/adminModels/category");
const Product = require("../../models/adminModels/product");

exports.renderManageOfferPage = async (req, res) =>{
    const referralDetails = await Referral.find({}); 
    const CategoryOfferCount = await CategoryOffer.countDocuments();

    console.log("render",referralDetails,CategoryOfferCount);
    res.render('admin/adminDasbord/offerManage',{referralDetails,CategoryOfferCount});
}


exports.updateReferralLink = async (req, res) => {
    try {
        const { reward } = req.body;
        console.log("reward", reward);
        const exist = await Referral.find({});
        let referral;
        if (exist.length === 0) {
            referral = await Referral.create({ reward: reward });
        } else {
            referral = await Referral.findOneAndUpdate({}, { reward: reward }, { new: true });
        }

        res.status(200).json({ referral: referral });
    } catch (error) {
        console.log("errrrrrrr", error);
        res.status(500).json({ error: 'An error occurred while updating the referral link.' });
    }
}


exports.deleteReferral = async (req, res) => {
    try {
        const referral = await Referral.findOneAndDelete({});

        if (referral) {
            res.status(200).json({ message: 'Referral link deleted successfully.' });
        } else {
            res.status(404).json({ message: 'No referral link found to delete.' });
        }
    } catch (error) {
        res.status(500).json({ error: 'An error occurred while deleting the referral link.' });
    }
}

exports.renderManageOfferCategory = async (req, res) =>{
    try {
        const offerCategorys = await CategoryOffer.find({isActive: true}).populate("category_id"); 
        const categorys = await Category.find({isActive: true}); 

        const offerCategorysWithExpiryStatus = offerCategorys.map((category) => {
            const isExpired = category.expiryDate < Date.now();
            return {
              ...category.toObject(),
              isExpired,
            };
          });

        console.log("render offer",offerCategorysWithExpiryStatus);
        res.render('admin/adminDasbord/categoryOfferManage',{offerCategorysWithExpiryStatus,categorys});
    } catch (error) {
        console.log(error);
    }
}
exports.addNewCategoryOffer = async (req, res) => {
    try {
        console.log("body", req.body);
        const { offerPercentage, category_id, expiryDate } = req.body;
        
        const newCategoryOffer = new CategoryOffer({ offerPercentage, category_id, expiryDate });
        await newCategoryOffer.save();
        
        // Update products with no offerAmount or empty offerAmount
        await Product.updateMany(
            {
                category: category_id,
                $or: [
                    { offerAmount: { $exists: false } },
                    { offerAmount: null },
                    { offerAmount: "" }
                ]
            },
            [
                {
                    $set: {
                        categoryOfferAmount: {
                            $toDouble: {
                                $substr: [
                                    {
                                        $toString: {
                                            $ceil: [
                                                {
                                                    $subtract: [
                                                        "$basePrice",
                                                        {
                                                            $multiply: [
                                                                "$basePrice",
                                                                { $divide: [parseInt(offerPercentage), 100] }
                                                            ]
                                                        }
                                                    ]
                                                }
                                            ]
                                        }
                                    },
                                    0,
                                    -1
                                ]
                            }
                        },
                        categoryOfferExpiryDate: expiryDate
                    }
                }
            ]
        );


        console.log("new", newCategoryOffer);
        return res.status(200).json({ newCategoryOffer });
    } catch (error) {
        console.log(error);
        
        if (error.code === 11000) {
            return res.status(400).json({ error: "This category has already been added" });
        }
        return res.status(500).json({ error: error.message });
    }
}

exports.updateCategoryOffer = async (req, res) => {
    try {
        const { offerPercentage, category_id, expiryDate, id } = req.body;

        const updatedCategoryOffer = await CategoryOffer.findByIdAndUpdate(id, {
            offerPercentage,
            category_id,
            expiryDate
        }, { new: true });

        await Product.updateMany(
            {
                category: category_id,
                $or: [
                    { offerAmount: { $exists: false } },
                    { offerAmount: null },
                    { offerAmount: "" }
                ]
            },
            [
                {
                    $set: {
                        categoryOfferAmount: {
                            $toDouble: {
                                $substr: [
                                    {
                                        $toString: {
                                            $ceil: [
                                                {
                                                    $subtract: [
                                                        "$basePrice",
                                                        {
                                                            $multiply: [
                                                                "$basePrice",
                                                                { $divide: [parseInt(offerPercentage), 100] }
                                                            ]
                                                        }
                                                    ]
                                                }
                                            ]
                                        }
                                    },
                                    0,
                                    -1
                                ]
                            }
                        },
                        categoryOfferExpiryDate: expiryDate
                    }
                }
            ]
        );


        return res.status(200).json({ updatedCategoryOffer });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ error: "This category has already been added" });
        }
        return res.status(500).json({ error: error.message });
    }
}

exports.deleteCategoryOffer = async (req, res) =>{
    try {
        const id = req.params.id;
        
        const deletedCategoryOffer = await CategoryOffer.findByIdAndDelete(id);
        
        if (!deletedCategoryOffer) {
            return res.status(404).json({ error: "Category offer not found" });
        }

        await Product.updateMany(
            { category: deletedCategoryOffer.category_id },
            {
                $unset: {
                    categoryOfferAmount: "",
                    categoryOfferExpiryDate: ""
                }
            }
        );

        return res.status(200).json({ message: "Category offer deleted successfully" });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "Something went wrong" });
    }
}
