declare global {
  interface Window {
    lazyload: () => void;
  }
}

function throttle(func: () => void, timeout: number) {
  let inThrottle = false;

  return function (...args: unknown[]) {
    if (!inThrottle) {
      inThrottle = true;
      func.apply(this, args);
      setTimeout(() => {
        inThrottle = false;
      }, timeout);
    }
  };
}

function lazyload() {
  const windowHeight = window.innerHeight;
  const images: NodeListOf<HTMLImageElement> = document.querySelectorAll('.lazyload');
  const offset = 120;

  images.forEach(image => {
    const boundingRect = image.getBoundingClientRect();
    const yPosition = boundingRect.top - windowHeight;
    const yPositionBottom = boundingRect.bottom;

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
lazyload();

export { lazyload };
