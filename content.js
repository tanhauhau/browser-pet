function ssh() {
  function onload() {
    let animating = false;
    let eating = false;
    const size = {
      height: 30,
      width: 30,
    };
    const position = {
      x: 0,
      y: 0,
    };
    const pet = document.createElement('div');
    updatePosition(100, 100);
    pet.classList.add('ssh-pet');
    document.body.appendChild(pet);

    scheduleSomething();
    watchMouse();
    watchInput();

    async function doSomething(random) {
      if (animating) return;

      switch (random) {
        // case 0:
        //   return animateRest();
        default:
          // return animateTeleport(300 - position.x, position.y);
          // return animateClass('reappear');
          // return shiftAway();
          return animateRest();
      }
    }

    function animateRest() {
      return animateClass('rest');
    }

    async function shiftAway() {
      if (eating) {
        await animateShiftLeft(true);
      } else if (position.x < 40) {
        await animateShiftRight(true);
      } else if (position.x > window.innerWidth - 40) {
        await animateShiftLeft(true);
      } else if (Math.random() > 0.5) {
        await animateShiftLeft(true);
      } else {
        await animateShiftRight(true);
      }
    }

    async function animateShiftLeft(fast) {
      await animateClass(`shift-left ${fast ? 'fast' : ''}`);
      offsetPosition(-30, 0);
    }

    async function animateShiftRight(fast) {
      await animateClass(`shift-right ${fast ? 'fast' : ''}`);
      offsetPosition(30, 0);
    }

    async function animateTeleport(x, y) {
      await animateClass('disappear');
      pet.style.opacity = 0;
      updatePosition(x, y);
      pet.style.opacity = 100;
      await animateClass('reappear');
    }

    function animateClass(clsses, elem = pet) {
      return new Promise(resolve => {
        clsses.split(/\s+/).forEach(cls => {
          elem.classList.add(cls);
        });
        const onanimationend = () => {
          elem.removeEventListener('animationend', onanimationend);
          clsses.split(/\s+/).forEach(cls => {
            elem.classList.remove(cls);
          });
          resolve();
        };
        elem.addEventListener('animationend', onanimationend);
      });
    }

    function watchMouse() {
      document.body.addEventListener('mousemove', async event => {
        const { clientX, clientY } = event;
        if (onPet(clientX, clientY) && !animating) {
          animating = true;
          await shiftAway();
          animating = false;
        }
      });
      const buttons = document.querySelectorAll('button, input[type="submit"], [role="button"]');
      buttons.forEach(button =>
        button.addEventListener('mousemove', mouseMove)
      );
    }

    function mouseMove(event) {
      debounceByElement(event.currentTarget, removeTheElement, 600, event.currentTarget);
    }

    function watchInput() {
      document.body.addEventListener('input', async event => {
        if (!animating) {
          let pos;
          if ((pos = leftSideOf(event.target))) {
            animating = true;
            await animateTeleport(pos[0], pos[1]);
            animating = false;
            eating = true;
            debounceByElement(event.target, eatInputValue, 1000, event.target);
          } else {
            debounceByElement(event.target, eatInputValue, 1000, event.target);
          }
        }
      });
    }

    async function eatInputValue(elem) {
      if (
        // not at the left side
        leftSideOf(elem) ||
        // nothing to eat liao
        elem.value === ''
      ) {
        eating = false;
        return;
      }

      animating = true;

      await animateClass('eat');

      var start = elem.selectionStart,
        end = elem.selectionEnd;
      elem.value = elem.value.slice(1);
      elem.setSelectionRange(Math.max(start - 1, 0), Math.max(end - 1, 0));
      await animateClass('digest');

      animating = false;

      debounceByElement(elem, eatInputValue, 400, elem);
    }

    async function removeTheElement(elem) {
      if (animating) {
        return;
      }

      animating = true;
      pet.classList.add('hate');
      await timeout(400);

      elem.removeEventListener('mousemove', mouseMove);
      
      await animateClass('item-disappearing', elem);
      elem.style.visibility = 'hidden';
      pet.classList.remove('hate');
      animating = false;
    }

    function scheduleSomething() {
      setTimeout(async () => {
        const choices = 10;
        const random = ~~(Math.random() * choices);
        await doSomething(random);
        scheduleSomething();
      }, 800 + Math.random() * 1000);
    }

    function offsetPosition(x, y) {
      updatePosition(position.x + x, position.y + y);
    }
    function updatePosition(x, y) {
      position.x = x;
      position.y = y;
      pet.style.left = position.x + 'px';
      pet.style.top = position.y + 'px';
    }
    function onPet(x, y) {
      return within(
        x,
        y,
        position.x + size.width / 2,
        position.y + size.height / 2,
        size.width,
        size.height
      );
    }
    function within(x, y, cx, cy, w, h) {
      return x >= cx - w && x <= cx + w && y >= cy - h && y < cy + h;
    }
    function within_2(x, y, cx, cy, w, h) {
      return x >= cx && x <= cx + w && y >= cy && y < cy + h;
    }
    function debounce(fn, timeout = 200) {
      let _id;
      return function(...args) {
        clearTimeout(_id);
        _id = setTimeout(() => {
          fn(...args);
          _id = null;
        }, timeout);
      };
    }
    const _debounceMap = new Map();
    function debounceByElement(elem, fn, timeout, ...args) {
      if (!_debounceMap.has(elem)) {
        _debounceMap.set(elem, debounce(fn, timeout));
      }
      _debounceMap.get(elem)(...args);
    }

    function leftSideOf(elem, outer) {
      const { x, y, width, height } = elem.getBoundingClientRect();
      const to_x =
        x - size.width + (outer ? -marginLeft(elem) : paddingLeft(elem));
      const to_y = y + height / 2 - size.height / 2;
      if (position.x !== to_x || position.y !== to_y) {
        return [to_x, to_y];
      }
    }

    function paddingLeft(elem) {
      return (
        Number(
          window
            .getComputedStyle(elem)
            .getPropertyValue('padding-left')
            .replace(/px|r?em/, '')
        ) || 0
      );
    }

    function marginLeft(elem) {
      return (
        Number(
          window
            .getComputedStyle(elem)
            .getPropertyValue('margin-left')
            .replace(/px|r?em/, '')
        ) || 0
      );
    }
    function timeout(time) {
      return new Promise(resolve => setTimeout(resolve, time));
    }
  }
  window.addEventListener('load', onload);
}

let script = document.createElement('script');
script.type = 'text/javascript';
script.text = `(${ssh.toString()})()`;
script.onload = function() {
  this.parentNode.removeChild(this);
};
(document.head || document.documentElement).appendChild(script);
