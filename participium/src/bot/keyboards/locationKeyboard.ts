import { Keyboard } from "grammy";

const locationKeyboard = new Keyboard()
  .requestLocation("📍 Share my location (Mobile only)")
  .resized()
  .oneTime();

export { locationKeyboard };
