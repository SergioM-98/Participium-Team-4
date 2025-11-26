import { Keyboard } from "grammy";
import { Category } from "../dtos/report.dto";

const CATEGORY_CONFIG: Array<{
  value: Category;
  label: string;
}> = [
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

import { InlineKeyboard } from "grammy";

function createCategoryKeyboard(): InlineKeyboard {
  const keyboard = new InlineKeyboard();
  for (let i = 0; i < CATEGORY_CONFIG.length; i += 1) {
    const row = CATEGORY_CONFIG.slice(i, i + 1);
    keyboard.row(
      ...row.map((config) => ({
        text: config.label,
        callback_data: config.value,
      }))
    );
  }
  return keyboard;
}

const categoryKeyboard = createCategoryKeyboard();

export { categoryKeyboard, CATEGORY_CONFIG, createCategoryKeyboard };
