"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.helpMenu = void 0;
var menu_1 = require("@grammyjs/menu");
var start_1 = require("../handlers/start");
var help_1 = require("../handlers/help");
exports.helpMenu = new menu_1.Menu("help_menu")
    .text("Start", start_1.handleStart)
    .row()
    .text("New Report", function (ctx) { return ctx.conversation.enter("newReport"); })
    .row()
    .text("Help", help_1.handleHelp);
