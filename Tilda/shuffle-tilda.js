document.addEventListener('DOMContentLoaded', () => {


  
   // ------------------ Find Elements ------------------
   
  const cardsItems = document.querySelectorAll('.shuffle-card')
  const shuffleButton = document.querySelector('.shuffle-btn')
  const cardsContainer = document.querySelector('.shuffle-cards')
  const totalCards = cardsItems.length
  const buttonLeft = document.querySelector('.shuffle-left')
  const buttonRight = document.querySelector('.shuffle-right')
  const buttons = [shuffleButton, buttonLeft, buttonRight].filter(Boolean)



  buttons.forEach(button => {
  button.style.cursor = 'pointer'
})

  // Cursor
 if (swipe) {
  cardsContainer.style.cursor = cursorImageUrl && cursorImageUrl.trim() !== ""
    ? `url(${cursorImageUrl}), grab`
    : "grab"
}
 

  // Swipe listener
  const listener = SwipeListener(cardsContainer, {
    minHorizontal: 0,
    minVertical: 0,
    preventScroll: false,
  })


  if(swipe){
  cardsContainer.addEventListener('swipe', (e) => {
    const { directions } = e.detail
    if (directions.left) shuffleCards(-1)
    else if (directions.right) shuffleCards(1)
    startAutoplay()
  })
  }


  // ------------------ State ------------------
  let currentTop = 0
  let isAnimating = false
  let buttonDirection = -1 // alternate shuffle direction

  // ------------------ Ensure buttons above cards ------------------
  buttons.forEach((btn) => (btn.style.zIndex = totalCards + 1))

  // ------------------ Counter ------------------
  const currentSlideText = document.querySelector('.shuffle-current .tn-atom')
  const totalSlideText = document.querySelector('.shuffle-total .tn-atom')
  if (totalSlideText) totalSlideText.textContent = totalCards

  function updateSlideCounter() {
    if (currentSlideText) currentSlideText.textContent = currentTop + 1
  }

  // ------------------ Initialize cards ------------------
  cardsItems.forEach((card, index) => {
    card.style.zIndex = totalCards - index
    card.style.transform =
      index % 2
        ? `rotate(${cardRotateAngle}deg)`
        : `rotate(${-cardRotateAngle}deg)`
  })
  updateSlideCounter()

  // ------------------ Shuffle logic ------------------
  function shuffleCards(direction) {
    if (isAnimating) return
    isAnimating = true

    const card = cardsItems[currentTop]

    // Step 1: move card offscreen
    card.style.transition = `transform ${forwardTime}ms ${easing}`
    card.style.transform = `translateX(${movePercent * direction}%)`

    setTimeout(() => {
      // Step 2: return to stack
      card.style.transition = `transform ${forwardTime}ms ${easing}`
      card.style.transform =
        currentTop % 2
          ? `rotate(${cardRotateAngle}deg)`
          : `rotate(${-cardRotateAngle}deg)`

      setTimeout(() => {
        // Cycle z-index for top → back
        cardsItems.forEach((item) => {
          let zIndex = parseInt(item.style.zIndex)
          item.style.zIndex = zIndex < totalCards ? zIndex + 1 : 1
        })

        // Next card
        currentTop = (currentTop + 1) % totalCards
        updateSlideCounter()
        isAnimating = false
      }, 0)
    }, backTime)
  }

  //speed change

  function changeSpeed() {
    if (window.matchMedia(`(max-width:${breakPoint}px)`).matches) {
      forwardTime = forwardTimeMobile
      backTime = backTimeMobile
    } else {
      forwardTime = forwardTime
      backTime = backTime
    }
  }

  changeSpeed()

  window.addEventListener('resize', changeSpeed)


  // ------------------ Buttons ------------------
  if (shuffleButton) {
    shuffleButton.addEventListener('click', () => {
      shuffleCards(buttonDirection)
      buttonDirection *= -1
      startAutoplay()
    })
  }

  if (buttonLeft) {
    buttonLeft.addEventListener('click', () => {
      shuffleCards((buttonDirection = -1))
      startAutoplay()
    })
  }

  if (buttonRight) {
    buttonRight.addEventListener('click', () => {
      shuffleCards((buttonDirection = 1))
      startAutoplay()
    })
  }

  // ------------------ Autoplay ------------------
  let clickerId
  function safeClick(btn, direction) {
    if (!btn) return
    shuffleCards(direction)
  }

  function startAutoplay() {
    clearInterval(clickerId)
    clickerId = setInterval(() => {
      if (!autoplay) return clearInterval(clickerId)

      if (shuffleButton) {
        shuffleButton.click()
      } else {
        if (buttonDirection === 1) safeClick(buttonRight, 1)
        else safeClick(buttonLeft, -1)
        buttonDirection *= -1
      }
    }, autoPlayDelay)
  }

  startAutoplay()
})

