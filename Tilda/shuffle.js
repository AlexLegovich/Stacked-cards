document.addEventListener('DOMContentLoaded', () => {


  // ------------------ Elements ------------------
  const cardsItems = document.querySelectorAll('.stacked-card');
  const shuffleButton = document.querySelector('.shuffle-btn');
  const cardsContainer = document.querySelector('.stacked-cards');
  const totalCards = cardsItems.length;

  //cursor


if (cursorImageUrl) {
  cardsContainer.style.cursor = `url(${cursorImageUrl}), grab`;
}
  let currentTop = 0;
  let isAnimating = false;
  let buttonDirection = -1; // alternate shuffle direction



  // Make sure button is above cards
  shuffleButton.style.zIndex = totalCards + 1;

  // ------------------ Counter ------------------
  const currentSlideText = document.querySelector('.current .tn-atom');
  const totalSlideText = document.querySelector('.total .tn-atom');
  if (totalSlideText) totalSlideText.textContent = totalCards;

  function updateSlideCounter() {
    if (currentSlideText) currentSlideText.textContent = currentTop + 1;
  }

  // ------------------ Initialize ------------------
  cardsItems.forEach((card, index) => {
    // TOP-to-bottom: first card in DOM is on top
    card.style.zIndex = totalCards - index; 
    card.style.transform =
      index % 2 === 1
        ? `rotate(${cardRotateAngle}deg)`
        : `rotate(${-cardRotateAngle}deg)`;
  });
  cardsItems[currentTop].classList.add('active');
  updateSlideCounter();

  // ------------------ Shuffle ------------------
  function shuffleCards(direction) {
    const card = cardsItems[currentTop];
    if (isAnimating) return;
    isAnimating = true;

    // Remove active from others
    cardsItems.forEach((c) => c.classList.remove('active'));
    card.classList.add('active');

    // Step 1: move card offscreen
    card.style.transition = `transform ${forwardTime}ms ${easing}`;
    card.style.transform = `translateX(${movePercent * direction}%)`;

    setTimeout(() => {
      // Step 2: return to stack
      card.style.transition = `transform ${forwardTime}ms ${easing}`;
      card.style.transform =
        currentTop % 2 === 1
          ? `rotate(${cardRotateAngle}deg)`
          : `rotate(${-cardRotateAngle}deg)`;

      setTimeout(() => {
        // Cycle z-index for top → back
        cardsItems.forEach((item) => {
          let zIndex = parseInt(item.style.zIndex);
          item.style.zIndex = zIndex < totalCards ? zIndex + 1 : 1;
        });

        // Next card
        currentTop = (currentTop + 1) % totalCards;

        updateSlideCounter();
        isAnimating = false;
      }, 0);
    }, backTime);
  }

  // ------------------ Button ------------------
  shuffleButton.addEventListener('click', () => {
    shuffleCards(buttonDirection);
    buttonDirection *= -1; // alternate direction
    startAutoplay()
  });

  // ------------------ Hammer.js Swipe & Drag ------------------
  const cardContainer = document.querySelector('.stacked-cards');
  const hammer = new Hammer(cardContainer);
  hammer.get('swipe').set({ direction: Hammer.DIRECTION_HORIZONTAL });
  hammer.get('pan').set({ direction: Hammer.DIRECTION_HORIZONTAL });

  // Drag start
  hammer.on('panstart', () => {
    const activeCard = cardsItems[currentTop];
    activeCard.style.transition = 'none';
  });

  // Drag move
  hammer.on('panmove', (ev) => {
    const activeCard = cardsItems[currentTop];
    activeCard.style.transform = `translateX(${ev.deltaX}px)`;
  });

  // Drag end
  hammer.on('panend', (ev) => {
    const activeCard = cardsItems[currentTop];
    const threshold = 15;

    if (Math.abs(ev.deltaX) > threshold) {
      shuffleCards(ev.deltaX > 0 ? 1 : -1);
       startAutoplay(); // reset autoplay timer
    } else {
      // Snap back
      activeCard.style.transition = `transform ${forwardTime}ms ${easing}`;
      activeCard.style.transform =
        currentTop % 2 === 1
          ? `rotate(${cardRotateAngle}deg)`
          : `rotate(${-cardRotateAngle}deg)`;
    }
  });

  // Swipe only
  hammer.on('swipe', (ev) => {
    if (ev.direction === Hammer.DIRECTION_LEFT) shuffleCards(-1);
    if (ev.direction === Hammer.DIRECTION_RIGHT) shuffleCards(1);
  });

  // ------------------ Autoplay ------------------
  let clickerId;
  function startAutoplay() {
    clearInterval(clickerId);
    clickerId = setInterval(() => {
      if (autoplay) shuffleButton.click();
      else clearInterval(clickerId);
    }, autoPlayDelay);
  }
  startAutoplay();
});
