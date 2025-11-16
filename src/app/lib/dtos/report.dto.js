"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.reportResponseSchema = exports.retrieveReportResponseSchema = exports.reportRequestSchema = exports.reportBaseSchema = void 0;
var zod_1 = require("zod");
var categoryEnum = zod_1.z.enum([
    "WATER_SUPPLY",
    "ARCHITECTURAL_BARRIERS",
    "SEWER_SYSTEM",
    "PUBLIC_LIGHTING",
    "WASTE",
    "ROADS_SIGNS_AND_TRAFFIC_LIGHTS",
    "ROADS_AND_URBAN_FURNISHINGS",
    "PUBLIC_GREEN_AREAS_AND_BACKGROUNDS",
    "OTHER",
]);
exports.reportBaseSchema = zod_1.z.object({
    title: zod_1.z.string().min(5).max(100),
    description: zod_1.z.string().min(10).max(1000),
    photos: zod_1.z.array(zod_1.z.string()).min(1).max(3),
    category: categoryEnum,
    longitude: zod_1.z.number(),
    latitude: zod_1.z.number(),
});
exports.reportRequestSchema = exports.reportBaseSchema.extend({
    userId: zod_1.z.string(),
    isAnonymous: zod_1.z.boolean(),
});
exports.retrieveReportResponseSchema = exports.reportBaseSchema.extend({
    id: zod_1.z.string(),
});
exports.reportResponseSchema = zod_1.z.object({
    id: zod_1.z.string(),
    title: zod_1.z.string().min(5).max(100),
    description: zod_1.z.string(),
    category: zod_1.z.string(),
    createdAt: zod_1.z.string().refine(function (val) { return !isNaN(Date.parse(val)); }, {
        message: "Invalid date format",
    }),
});
