var loginRouter = require('../function/login_router/login_router');
var chatRouter = require('../function/chat_router/chat_router');
const authMiddleware = require('../middleware/authMiddleware');

module.exports = function (app) {
    app.get("/api/health", loginRouter.healthCheck);
    app.get("/api/login", loginRouter.loginViaLinkdin);
    app.get("/auth/linkedin/callback", loginRouter.loginViaLinkdinCallback);
    app.get("/api/getUserDetails", loginRouter.loginViaLinkdinCallback);

    // Chat APis
    app.get("/api/getChatList", authMiddleware, chatRouter.getChatList);
    app.get("/api/getChatsByUserId", authMiddleware, chatRouter.getChatsByUserId);
}