import { Menu } from "@grammyjs/menu";
import { Context } from "grammy";
import type { Category } from "../../app/lib/dtos/report.dto";

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

const CATEGORY_LABELS: Record<Category, string> = Object.fromEntries(
  CATEGORY_CONFIG.map(({ value, label }) => [value, label])
) as Record<Category, string>;

export const categoryMenu = new Menu<Context>("category_menu");

const handleCategorySelection = (category: Category) => {
  return async (ctx: Context) => {
    await ctx.answerCallbackQuery(`Selected: ${CATEGORY_LABELS[category]}`);
  };
};

const categories = Object.keys(CATEGORY_LABELS) as Category[];
for (let i = 0; i < categories.length; i++) {
  const category = categories[i];
  categoryMenu.text(
    CATEGORY_LABELS[category],
    handleCategorySelection(category)
  );

  if ((i + 1) % 2 === 0 && i < categories.length - 1) {
    categoryMenu.row();
  }
}

if (categories.length % 2 !== 0) {
  categoryMenu.row();
}
