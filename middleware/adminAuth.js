
exports.adminAuthCheck = async (req, res,next) =>{
    if(req.session.admin){
        next()
    }else{
        res.redirect("/admin/login");
    }
}

exports.checkAdmin = async (req, res, next) =>{
    if(req.session.admin){
        res.redirect("/admin/dashboard");
    }else{
        next();
    }
}

exports.verifyAdmin = async (req, res, next) =>{
if(req.session.admin){
return next()
}else{
    res.redirect("/admin/login");
}
}