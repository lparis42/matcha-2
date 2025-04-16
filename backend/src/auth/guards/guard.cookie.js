"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
exports.CookieAuthGuard = void 0;
var common_1 = require("@nestjs/common");
var CookieAuthGuard = /** @class */ (function () {
    function CookieAuthGuard(pool, databaseService) {
        this.pool = pool;
        this.databaseService = databaseService;
    }
    CookieAuthGuard.prototype.canActivate = function (context) {
        return __awaiter(this, void 0, void 0, function () {
            var request, signedCookies, userId, select, result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        request = context.switchToHttp().getRequest();
                        signedCookies = request.signedCookies;
                        // Check if the signed cookies are present and contain the access token
                        // If the signed cookies are not present or do not contain the access token, throw an unauthorized exception
                        if (!signedCookies || !signedCookies.access_token) {
                            throw new common_1.HttpException('Access token is missing or invalid!', common_1.HttpStatus.UNAUTHORIZED);
                        }
                        userId = Number(signedCookies.access_token);
                        if (!userId || !Number.isInteger(userId) || userId <= 0) {
                            throw new common_1.HttpException('Invalid user ID!', common_1.HttpStatus.UNAUTHORIZED);
                        }
                        select = this.databaseService.selectQuery('users', ['id'], "id = '".concat(userId, "'"));
                        return [4 /*yield*/, this.pool.query(select)];
                    case 1:
                        result = _a.sent();
                        if (result.rowCount === 0) {
                            throw new common_1.HttpException('User not found!', common_1.HttpStatus.UNAUTHORIZED);
                        }
                        // If the user exists, attach the user id to the request object
                        request.body.user = __assign(__assign({}, request.body.user), { id: userId });
                        // Return true to indicate that the request is authenticated
                        return [2 /*return*/, true];
                }
            });
        });
    };
    return CookieAuthGuard;
}());
exports.CookieAuthGuard = CookieAuthGuard;
