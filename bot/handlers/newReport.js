"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.newReport = newReport;
var categoryMenu_1 = require("../menus/categoryMenu");
var QUESTIONS = [
    "Please provide the title of the report:",
    "Please describe the problem in detail:",
    "Insert latitude",
    "Insert longitude",
    "What is the category of the report?",
];
var FIELD_NAMES = [
    "title",
    "description",
    "latitude",
    "longitude",
    "category",
];
var CATEGORY_CONFIG = [
    { value: "WATER_SUPPLY", label: "Water Supply" },
    {
        value: "ARCHITECTURAL_BARRIERS",
        label: "Architectural Barriers",
    },
    { value: "SEWER_SYSTEM", label: "Sewer System" },
    { value: "PUBLIC_LIGHTING", label: "Public Lighting" },
    { value: "WASTE", label: "Waste" },
    {
        value: "ROADS_SIGNS_AND_TRAFFIC_LIGHTS",
        label: "Roads, Signs & Traffic Lights",
    },
    {
        value: "ROADS_AND_URBAN_FURNISHINGS",
        label: "Roads & Urban Furnishings",
    },
    {
        value: "PUBLIC_GREEN_AREAS_AND_BACKGROUNDS",
        label: "Green Areas",
    },
    { value: "OTHER", label: "Other" },
];
function newReport(conversation, ctx) {
    return __awaiter(this, void 0, void 0, function () {
        var title, description, latitudeValue, latitude, longitudeValue, longitude, categoryResponse, reportData, response, result, error_1;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, ctx.reply(QUESTIONS[0])];
                case 1:
                    _b.sent();
                    return [4 /*yield*/, conversation.form.text()];
                case 2:
                    title = _b.sent();
                    return [4 /*yield*/, ctx.reply(QUESTIONS[1])];
                case 3:
                    _b.sent();
                    return [4 /*yield*/, conversation.form.text()];
                case 4:
                    description = _b.sent();
                    return [4 /*yield*/, ctx.reply(QUESTIONS[2])];
                case 5:
                    _b.sent();
                    return [4 /*yield*/, conversation.form.text()];
                case 6:
                    latitudeValue = _b.sent();
                    latitude = parseFloat(latitudeValue) || 0;
                    // Get longitude
                    return [4 /*yield*/, ctx.reply(QUESTIONS[3])];
                case 7:
                    // Get longitude
                    _b.sent();
                    return [4 /*yield*/, conversation.form.text()];
                case 8:
                    longitudeValue = _b.sent();
                    longitude = parseFloat(longitudeValue) || 0;
                    //await ctx.reply(QUESTIONS[4]);
                    return [4 /*yield*/, ctx.reply("Select one of the following categories", {
                            reply_markup: categoryMenu_1.categoryMenu,
                        })];
                case 9:
                    //await ctx.reply(QUESTIONS[4]);
                    _b.sent();
                    return [4 /*yield*/, conversation.form.select(CATEGORY_CONFIG.map(function (_a) {
                            var label = _a.label;
                            return label;
                        }), {
                            otherwise: function (ctx) { return ctx.reply("Please use one of the buttons!"); },
                        })];
                case 10:
                    categoryResponse = _b.sent();
                    reportData = {
                        title: title,
                        description: description,
                        latitude: latitude,
                        longitude: longitude,
                        category: ((_a = CATEGORY_CONFIG.find(function (_a) {
                            var label = _a.label;
                            return label === categoryResponse;
                        })) === null || _a === void 0 ? void 0 : _a.value) ||
                            "OTHER",
                        photos: [],
                    };
                    return [4 /*yield*/, ctx.reply("Sending your report...")];
                case 11:
                    _b.sent();
                    _b.label = 12;
                case 12:
                    _b.trys.push([12, 19, , 21]);
                    return [4 /*yield*/, fetch("http://localhost:3000/api/reports", {
                            method: "POST",
                            headers: {
                                "Content-Type": "application/json",
                            },
                            body: JSON.stringify(reportData),
                        })];
                case 13:
                    response = _b.sent();
                    if (!response.ok) return [3 /*break*/, 16];
                    return [4 /*yield*/, response.json()];
                case 14:
                    result = _b.sent();
                    return [4 /*yield*/, ctx.reply("\u2705 Report sent successfully! ID: ".concat(result.id))];
                case 15:
                    _b.sent();
                    return [3 /*break*/, 18];
                case 16: return [4 /*yield*/, ctx.reply("❌ Error sending the report. Please try again later.")];
                case 17:
                    _b.sent();
                    _b.label = 18;
                case 18: return [3 /*break*/, 21];
                case 19:
                    error_1 = _b.sent();
                    console.error("Error sending the report:", error_1);
                    return [4 /*yield*/, ctx.reply("❌ Connection error. Please try again later.")];
                case 20:
                    _b.sent();
                    return [3 /*break*/, 21];
                case 21: return [2 /*return*/];
            }
        });
    });
}
