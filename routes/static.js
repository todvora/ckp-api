module.exports = function (app) {
    app.get('/about', function (req, res) {
        res.render('about',
            {
                title: 'O projektu'
            }
        );
    });

    app.get('/help', function (req, res) {
        res.render('help',
            {
                title: 'Nápověda'
            }
        );
    });

    app.get('/contact', function (req, res) {
        res.render('contact',
            {
                title: 'Kontakt'
            }
        );
    });
};
