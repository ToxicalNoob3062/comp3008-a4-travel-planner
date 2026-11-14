// The surface every screen sits on. Written phone-first: unprefixed classes are the phone layout,
// `sm:` (640px and wider) turns it into the centred card.
// Phone: no card at all. The white surface fills the screen edge to edge, so all the width goes to content.
export const SCREEN_CARD =
  "flex w-full flex-1 flex-col gap-5 bg-white px-4 pt-5 pb-4 " +
  "sm:min-h-[600px] sm:max-w-[760px] sm:flex-none sm:gap-6 sm:rounded-xl sm:border sm:border-line sm:p-8 sm:shadow-[0_4px_16px_rgba(0,0,0,0.06)]";

// The bar that holds a screen's main buttons.
// Phone: it sticks to the bottom of the screen, so the buttons are always in reach without scrolling.
// Wide: it is simply the last row of the card.
export const ACTION_BAR =
  "sticky bottom-0 z-10 -mx-4 -mb-4 border-t border-line bg-white px-4 py-3 " +
  "sm:static sm:m-0 sm:border-0 sm:p-0";
