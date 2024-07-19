const Referral = require("../../models/adminModels/referral")
const CategoryOffer = require("../../models/adminModels/categoryOffer");
const Category = require("../../models/adminModels/category");

exports.renderManageOfferPage = async (req, res) =>{
    const referralDetails = await Referral.find({}); 
    console.log("render",referralDetails);
    res.render('admin/adminDasbord/offerManage',{referralDetails});
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
        console.log(error);
        res.status(500).json({ error: 'An error occurred while deleting the referral link.' });
    }
}

exports.renderManageOfferCategory = async (req, res) =>{
    try {
        const offerCategorys = await CategoryOffer.find({isActive: true}).populate("category_id"); 
        const categorys = await Category.find({isActive: true}); 

        console.log("render offer",offerCategorys);
        res.render('admin/adminDasbord/categoryOfferManage',{offerCategorys,categorys});
    } catch (error) {
        console.log(error);
    }
}
exports.addNewCategoryOffer = async (req, res) =>{
    try {
        console.log("bosy",req.body);
        const {offerPercentage,category_id, expiryDate} = req.body
        const newCategoryOffer = new CategoryOffer({offerPercentage,category_id, expiryDate});
        await newCategoryOffer.save();
        
        console.log("new",newCategoryOffer);
    } catch (error) {
        console.log(error);
    }
}