function throttle(func, timeout) {
  let inThrottle = false;

  return function (...args) {
    const context = this;

    if (!inThrottle) {
      inThrottle = true;
      func.apply(context, args);
      setTimeout(() => {
        inThrottle = false;
      }, timeout);
    }
  };
}

function lazyload() {
  const windowHeight = window.innerHeight;
  const images = document.querySelectorAll('.lazyload');

  // Оффсет нужен, что подгружать изображение немного раньше,
  // чем оно появится во вьюпорте
  const offset = 120;

  // eslint-disable-next-line complexity, max-statements
  images.forEach(image => {
    const boundingRect = image.getBoundingClientRect();
    const yPosition = boundingRect.top - windowHeight;
    const yPositionBottom = boundingRect.bottom;

    // Если вверх изображения находится в пределах 100px от низа viewport-а,
    // и низ изображения находится в пределах 100px от вверха viewport-а
    if (yPosition <= offset && yPositionBottom >= -offset) {
      // Заменяем содержимое src из data-src
      if (image.getAttribute('data-src')) {
        image.src = image.getAttribute('data-src');
      }

      // replace the srcset with the data-srcset
      if (image.getAttribute('data-srcset')) {
        image.srcset = image.getAttribute('data-srcset');
      }

      // replace the source srcset's with the data-srcset's
      if (image.parentElement.tagName === 'PICTURE') {
        const sources = image.parentElement.querySelectorAll('source');

        sources.forEach(source => {
          source.srcset = source.getAttribute('data-srcset');
        });
      }

      // Ожимаем пока новое изображение не загрузится
      image.addEventListener('load', function () {
        // Удаляем lazyload класс
        this.classList.remove('lazyload');
      });
    }
  });
}

const throttledLazyLoad = throttle(lazyload, 200);

document.addEventListener('scroll', throttledLazyLoad);
window.addEventListener('resize', throttledLazyLoad);
window.addEventListener('orientationChange', throttledLazyLoad);

window.lazyload = lazyload;

// Если изображение сразу оказалось во вьюпорте, то оно не будет загружено,
// пока не наступит одно из событий (пользователь не проскролит).
// Поэтому нужно вызвать метод для обработки этого кейса
lazyload();

export default lazyload;

/*
const images = document.querySelectorAll('img.lazyload');
const imageObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const image = entry.target;

            image.src = image.getAttribute('data-src');
            image.classList.remove('lazyload');

            imageObserver.unobserve(image);
        }
    });
}, { rootMargin: '0px 0px 200px 0px' });

images.forEach(image => imageObserver.observe(image));
*/
