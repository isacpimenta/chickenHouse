// authMiddleware.js
function checkAuth(req, res, next) {
    if (req.session && req.session.userId) {
      return next();
    } else {
      res.redirect('/'); // Redireciona para o login caso o usuário não esteja autenticado
    }
}
  
function checkAdmin(req, res, next) {
    if (req.session && req.session.isAdmin) {
      return next();
    } else {
      res.redirect('/'); // Redireciona caso o usuário não seja administrador
    }
}
  
module.exports = { checkAuth, checkAdmin };
  