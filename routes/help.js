
module.exports = function (app) {
    app.get('/help', function (req, res) {
        res.render('help',
            {
                title: 'Nápověda'
            }
        );
    });
};