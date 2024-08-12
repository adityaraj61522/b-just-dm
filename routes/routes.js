var loginRouter = require('../function/login_router/login_router');
var chatRouter = require('../function/chat_router/chat_router');
const middleware = require('../middleware/authMiddleware');

module.exports = function (app) {
    app.get("/api/health", loginRouter.healthCheck);
    app.get("/api/login", loginRouter.loginViaLinkdin);
    app.get("/auth/linkedin/callback", loginRouter.loginViaLinkdinCallback);
    app.get("/api/getUserDetails", middleware.authMiddleware, loginRouter.getUserDetails);

    app.get("/api/setRate", middleware.authMiddleware, chatRouter.setRate);
    // Chat APis
    app.get("/api/getChatList", middleware.authMiddleware, chatRouter.getChatList);
    app.get("/api/getChatsByRoomId", middleware.authMiddleware, chatRouter.getChatsByRoomId);
}