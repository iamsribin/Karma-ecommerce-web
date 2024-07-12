const Referral = require("../../models/adminModels/referral")


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