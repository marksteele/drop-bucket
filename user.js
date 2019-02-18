
module.exports.disable = (e, ctx, cb) => {
    console.log(JSON.stringify(e));
    cb(null,"OK");
};
