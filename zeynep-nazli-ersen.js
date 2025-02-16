(() => {
  const CONFIG = {
      CLASSES: {
          PRODUCT_DETAIL: 'product-detail',
          CAROUSEL_CONTAINER: 'recommended-products',
          CAROUSEL: 'product-carousel',
          PRODUCT_CARD: 'product-card',
          LIKE_BUTTON: 'new-product-card-like-button',
          FAVORITE: 'favorite',
          PREV_BUTTON: 'prev-button',
          NEXT_BUTTON: 'next-button',
          CAROUSEL_WRAPPER: 'carousel-wrapper',
          IMG_CONTAINER: 'img-container',
          PRODUCT_LINK: 'product-link',
          PRODUCT_INFO: 'product-info',
          PRICE: 'price',
          INACTIVE: 'inactive'
      },
      TEXTS: {
          TITLE: 'You Might Also Like',
          PREV_BUTTON_TEXT: '&#9665;',
          NEXT_BUTTON_TEXT: '&#9655;'
      },
      LOCAL_STORAGE_KEYS: {
          PRODUCTS: 'carouselProducts',
          FAVORITES: 'carouselFavorites'
      },
      API_URL: 'https://gist.githubusercontent.com/sevindi/5765c5812bbc8238a38b3cf52f233651/raw/56261d81af8561bf0a7cf692fe572f9e1e91f372/products.json',
      SVG: {
          HEART: `
              <svg xmlns="http://www.w3.org/2000/svg" width="20.576" height="19.483" viewBox="0 0 20.576 19.483">
                  <path fill="none" stroke="#555" stroke-width="1.5px" d="M19.032 7.111c-.278-3.063-2.446-5.285-5.159-5.285a5.128 5.128 0 0 0-4.394 2.532 4.942 4.942 0 0 0-4.288-2.532C2.478 1.826.31 4.048.032 7.111a5.449 5.449 0 0 0 .162 2.008 8.614 8.614 0 0 0 2.639 4.4l6.642 6.031 6.755-6.027a8.615 8.615 0 0 0 2.639-4.4 5.461 5.461 0 0 0 .163-2.012z" transform="translate(.756 -1.076)"></path>
              </svg>
          `,
          LEFT_ARROW: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#555" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>`,
          RIGHT_ARROW: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#555" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>`
      }
  };

  const { CLASSES, TEXTS, LOCAL_STORAGE_KEYS, API_URL, SVG } = CONFIG;

  const init = () => {
      
      reset();
      
      if (!isProductPage()) return;
      fetchProducts().then(products => buildCarousel(products));
      buildCSS();
  };

  const reset = () => {

      const existingContainer = document.querySelector(`.${CLASSES.CAROUSEL_CONTAINER}`);
      if (existingContainer) {
          existingContainer.remove();
      }
  
      const existingStyleElement = document.querySelector('style');
      if (existingStyleElement) {
          existingStyleElement.remove();
      }
  };

  const isProductPage = () => !!document.querySelector(`.${CLASSES.PRODUCT_DETAIL}`);

  const fetchProducts = async () => {
      let products = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEYS.PRODUCTS));
      if (!products) {
          try {
              const response = await fetch(API_URL);
              products = await response.json();
              localStorage.setItem(LOCAL_STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
          } catch (error) {
              console.error('Products could not be loaded:', error);
          }
      }
      return products || [];
  };

  const createCarouselContainer = () => {
      const container = document.createElement('div');
      container.classList.add(CLASSES.CAROUSEL_CONTAINER);
      container.innerHTML = `
          <h2>${TEXTS.TITLE}</h2>
          <div class="${CLASSES.CAROUSEL_WRAPPER}">
              <button class="${CLASSES.PREV_BUTTON}">${TEXTS.PREV_BUTTON_TEXT}</button>
              <div class="${CLASSES.CAROUSEL}"></div>
              <button class="${CLASSES.NEXT_BUTTON}">${TEXTS.NEXT_BUTTON_TEXT}</button>
          </div>
      `;
      return container;
  };

  const createProductCard = (product) => {
      const productCard = document.createElement('div');
      productCard.classList.add(CLASSES.PRODUCT_CARD);
      productCard.innerHTML = `
          <div class="${CLASSES.LIKE_BUTTON}" data-id="${product.id}">
              ${SVG.HEART}
          </div>
          <div class="${CLASSES.IMG_CONTAINER}">
              <a href="${product.url}" class="${CLASSES.PRODUCT_LINK}" target="_blank">
                  <img src="${product.img}" alt="${product.name}">
              </a>
          </div>
          <div class="${CLASSES.PRODUCT_INFO}">
              <a href="${product.url}" class="${CLASSES.PRODUCT_LINK}" target="_blank">
                  <p>${product.name}</p>
              </a>
              <span class="${CLASSES.PRICE}">${product.price} TL</span>
          </div>
      `;

      productCard.querySelector(`.${CLASSES.LIKE_BUTTON}`).addEventListener('click', (e) => {
          e.stopPropagation();
          toggleFavorite(product.id, e.currentTarget);
      });

      return productCard;
  };

  const buildCarousel = (products) => {
      if (!products.length) return;

      const container = createCarouselContainer();
      const productCarousel = container.querySelector(`.${CLASSES.CAROUSEL}`);

      products.forEach(product => {
          const productCard = createProductCard(product);
          productCarousel.appendChild(productCard);
      });

      document.querySelector(`.${CLASSES.PRODUCT_DETAIL}`).after(container);
      addCarouselFunctionality();
      loadFavorites();
  };

  const addCarouselFunctionality = () => {
      const carousel = document.querySelector(`.${CLASSES.CAROUSEL}`);
      const prevButton = document.querySelector(`.${CLASSES.PREV_BUTTON}`);
      const nextButton = document.querySelector(`.${CLASSES.NEXT_BUTTON}`);
  
      prevButton.innerHTML = SVG.LEFT_ARROW;
      nextButton.innerHTML = SVG.RIGHT_ARROW;
  
      const calculateScrollAmount = () => {
          return carousel.clientWidth / 6.5;
      };
  
      const updateScrollButtons = () => {
          const isAtStart = carousel.scrollLeft <= 10;
          const isAtEnd = carousel.scrollLeft >= carousel.scrollWidth - carousel.clientWidth - 10;
      
          prevButton.classList.toggle(`${CLASSES.INACTIVE}`, isAtStart);
          nextButton.classList.toggle(`${CLASSES.INACTIVE}`, isAtEnd);
      };
  
      nextButton.addEventListener('click', () => {
          carousel.scrollLeft += calculateScrollAmount();
      });
  
      prevButton.addEventListener('click', () => {
          carousel.scrollLeft -= calculateScrollAmount();
      });
  
      carousel.addEventListener('scroll', updateScrollButtons);
      window.addEventListener('resize', updateScrollButtons);
      updateScrollButtons();
  };

  const toggleFavorite = (id, element) => {
      let favorites = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEYS.FAVORITES)) || [];
      const isFavorite = favorites.includes(id);

      favorites = isFavorite ? favorites.filter(favId => favId !== id) : [...favorites, id];
      localStorage.setItem(LOCAL_STORAGE_KEYS.FAVORITES, JSON.stringify(favorites));

      element.classList.toggle(CLASSES.FAVORITE, !isFavorite);
      const svgPath = element.querySelector('svg path');
      if (svgPath) {
          svgPath.setAttribute('fill', isFavorite ? 'none' : '#193db0');
          svgPath.setAttribute('stroke', isFavorite ? '#555' : '#193db0');
      }
  };

  const loadFavorites = () => {
      const favorites = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEYS.FAVORITES)) || [];
      document.querySelectorAll(`.${CLASSES.LIKE_BUTTON}`).forEach(button => {
          const id = parseInt(button.dataset.id);
          if (favorites.includes(id)) {
              button.classList.add(CLASSES.FAVORITE);
              const svgPath = button.querySelector('svg path');
              if (svgPath) {
                  svgPath.setAttribute('fill', '#193db0');
                  svgPath.setAttribute('stroke', '#193db0');
              }
          }
      });
  };

  const buildCSS = () => {
      const styles = `
          <style>
              .${CLASSES.INACTIVE} {
                  opacity: 0.5;
                  cursor: default;
                  pointer-events: none;
              }
  
              .${CLASSES.CAROUSEL_CONTAINER} {
                  margin: 0;
                  width: 100%;
                  padding: 20px 40px;
                  background-color: #f8f9fa;
                  position: relative;
                  font-family: 'Open Sans', sans-serif;
              }
  
              .${CLASSES.CAROUSEL_CONTAINER} h2 {
                  width: 80%;
                  margin: 0 auto;
                  text-align: left;
                  font-family: 'Open Sans', sans-serif !important;
                  box-sizing: border-box;
                  color: #29323b;
                  font-weight: lighter;
                  padding: 15px 0;
                  font-size: 32px;
                  line-height: 43px;
                  -webkit-text-size-adjust: 100%;
                  -webkit-tap-highlight-color: rgba(0,0,0,0);
                  --swiper-theme-color: #007aff;
                  --swiper-navigation-size: 44px;
              }
  
              .${CLASSES.CAROUSEL_WRAPPER} {
                  position: relative;
                  width: 100%;
                  overflow: hidden;
              }
  
              .${CLASSES.CAROUSEL} {
                  display: flex;
                  overflow-x: auto;
                  scroll-behavior: smooth;
                  scroll-snap-type: x mandatory;
                  white-space: nowrap;
                  scrollbar-width: none;
                  -ms-overflow-style: none;
                  gap: 10px;
                  width: 80%;
                  margin: auto;
              }
  
              .${CLASSES.CAROUSEL}::-webkit-scrollbar {
                  display: none;
              }
  
              .${CLASSES.PRODUCT_CARD} {
                  flex: 0 0 calc((100% - (6.5 * 10px)) / 6.5); 
                  scroll-snap-align: start;
                  height: 400px; 
                  min-width: 200px;
                  position: relative;
                  padding: 0;
                  box-sizing: border-box;
                  background: #fff;
                  transition: transform 0.3s ease;
                  color: #555;
                  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
                  overflow: hidden;
                  display: flex;
                  flex-direction: column;
              }
  
              .${CLASSES.IMG_CONTAINER} {
                  width: 100%;
                  height: 280px;
                  position: relative;
                  background: #fff;
                  overflow: hidden;
                  margin: 0;
                  padding: 0;
              }
  
              .${CLASSES.PRODUCT_CARD} img {
                  position: absolute;
                  top: 0;
                  left: 0;
                  width: 100%;
                  height: 280px;
                  object-fit: cover;
                  object-position: center top;
              }
  
              .${CLASSES.PRODUCT_INFO} {
                  flex-grow: 1;
                  display: flex;
                  flex-direction: column;
                  justify-content: space-between;
                  padding: 15px;
                  overflow: hidden;
              }
  
              .${CLASSES.PRODUCT_LINK} {
                  text-decoration: none;
                  color: inherit;
              }
  
              .${CLASSES.PRODUCT_CARD} p {
                  margin: 0;
                  padding: 5px 0;
                  white-space: normal;
                  font-size: 14px; 
                  line-height: 1.4;
                  color: #302e2b;
                  overflow: hidden;
                  text-overflow: ellipsis;
                  display: -webkit-box;
                  -webkit-line-clamp: 3;
                  -webkit-box-orient: vertical;
              }
  
              .${CLASSES.PRICE} {
                  font-weight: bold;
                  color: #193db0;
                  font-size: 16px; 
              }
  
              .${CLASSES.LIKE_BUTTON} {
                  cursor: pointer;
                  position: absolute;
                  top: 10px;
                  right: 11px;
                  width: 34px;
                  height: 34px;
                  background-color: #fff;
                  border-radius: 5px;
                  box-shadow: 0 3px 6px 0 rgba(0, 0, 0, .16);
                  border: solid .5px #b6b7b9;
                  display: flex;
                  justify-content: center;
                  align-items: center;
                  z-index: 10;
              }
  
              .${CLASSES.PREV_BUTTON}, .${CLASSES.NEXT_BUTTON} {
                  background: none;
                  border: none;
                  width: 150px; 
                  height: 60px; 
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  cursor: pointer;
                  position: absolute;
                  top: 50%;
                  transform: translateY(-50%);
                  z-index: 10;
                  transition: opacity 0.3s ease;
                  padding: 0;
              }
  
              .${CLASSES.PREV_BUTTON} {
                  left: 15px; 
              }
  
              .${CLASSES.NEXT_BUTTON} {
                  right: 15px; 
              }
  
              .${CLASSES.PREV_BUTTON}:hover, .${CLASSES.NEXT_BUTTON}:hover {
                  opacity: 0.7;
              }
  
              @media (max-width: 1024px) {
              .${CLASSES.CAROUSEL_CONTAINER} {
                  padding: 10px 5px; 
              }
              .${CLASSES.CAROUSEL_CONTAINER} h2 {
                  width: calc(100% - 20px);
                  margin-left: 10%;
                  padding: 15px 0;
              }
              .${CLASSES.CAROUSEL} {
                  width: 80%;
                  margin: auto;
              }
              .${CLASSES.PRODUCT_CARD} {
                  flex: 0 0 calc((100% - (3.5 * 10px)) / 3.5); 
                  height: 360px; 
              }
              .${CLASSES.PREV_BUTTON}, .${CLASSES.NEXT_BUTTON} {
                  display: flex; 
                  width: 50px; 
                  height: 50px; 
              }

              @media (max-width: 767px) {
              .${CLASSES.CAROUSEL_CONTAINER} {
                  padding: 10px 0; 
              }
              .${CLASSES.CAROUSEL_CONTAINER} h2 {
                  width: calc(100% - 20px);
                  margin-left: 10%;
                  padding: 15px 0;
              }
              .${CLASSES.CAROUSEL} {
                  width: 80%;
                  margin: auto;
              }
              .${CLASSES.PRODUCT_CARD} {
                  flex: 0 0 calc((100% - (2.5 * 10px)) / 2.5); 
                  height: 320px; 
              }
              .${CLASSES.PREV_BUTTON}, .${CLASSES.NEXT_BUTTON} {
                  display: none;
              }
          }

          </style>
      `;
  
      document.head.insertAdjacentHTML('beforeend', styles);
  };

  init();
})();
