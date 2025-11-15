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
var QUESTIONS = [
    "Qual è il titolo della segnalazione?",
    "Descrivi il problema in dettaglio:",
    "Qual è la posizione/indirizzo?",
    "Qual è la categoria della segnalazione?",
];
var FIELD_NAMES = ["title", "description", "location", "category"];
function newReport(conversation, ctx) {
    return __awaiter(this, void 0, void 0, function () {
        var reportData, i, nextCtx, response, result, error_1;
        var _a, _b, _c;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    reportData = {};
                    i = 0;
                    _d.label = 1;
                case 1:
                    if (!(i < QUESTIONS.length)) return [3 /*break*/, 5];
                    return [4 /*yield*/, ctx.reply(QUESTIONS[i])];
                case 2:
                    _d.sent();
                    return [4 /*yield*/, conversation.wait()];
                case 3:
                    nextCtx = _d.sent();
                    reportData[FIELD_NAMES[i]] =
                        ((_a = nextCtx.message) === null || _a === void 0 ? void 0 : _a.text) || "";
                    ctx = nextCtx; // Aggiorna ctx al nuovo context
                    _d.label = 4;
                case 4:
                    i++;
                    return [3 /*break*/, 1];
                case 5: return [4 /*yield*/, ctx.reply("Inviando la segnalazione...")];
                case 6:
                    _d.sent();
                    _d.label = 7;
                case 7:
                    _d.trys.push([7, 14, , 16]);
                    return [4 /*yield*/, fetch("http://localhost:3000/api/reports", {
                            method: "POST",
                            headers: {
                                "Content-Type": "application/json",
                            },
                            body: JSON.stringify({
                                title: reportData.title,
                                description: reportData.description,
                                location: reportData.location,
                                category: reportData.category,
                                userId: (_b = ctx.from) === null || _b === void 0 ? void 0 : _b.id,
                                username: (_c = ctx.from) === null || _c === void 0 ? void 0 : _c.username,
                            }),
                        })];
                case 8:
                    response = _d.sent();
                    if (!response.ok) return [3 /*break*/, 11];
                    return [4 /*yield*/, response.json()];
                case 9:
                    result = _d.sent();
                    return [4 /*yield*/, ctx.reply("\u2705 Segnalazione inviata con successo! ID: ".concat(result.id))];
                case 10:
                    _d.sent();
                    return [3 /*break*/, 13];
                case 11: return [4 /*yield*/, ctx.reply("❌ Errore nell'invio della segnalazione. Riprova più tardi.")];
                case 12:
                    _d.sent();
                    _d.label = 13;
                case 13: return [3 /*break*/, 16];
                case 14:
                    error_1 = _d.sent();
                    console.error("Errore durante l'invio della segnalazione:", error_1);
                    return [4 /*yield*/, ctx.reply("❌ Errore di connessione. Riprova più tardi.")];
                case 15:
                    _d.sent();
                    return [3 /*break*/, 16];
                case 16: return [2 /*return*/];
            }
        });
    });
}
