import flatpickr from 'flatpickr';

import yearSelectPlugin, { Config as PluginConfig } from '.';

flatpickr.defaultConfig.animate = false;

jest.useFakeTimers();

const createInstance = (options?: flatpickr.Options.Options, pluginConfig?: PluginConfig) =>
  flatpickr(document.createElement('input'), {
    plugins: [yearSelectPlugin({ ...pluginConfig })],
    ...options
  });

describe('yearSelect', () => {
  // memoized instance
  const fp = (): flatpickr.Instance =>
    (fpInstance =
      fpInstance ||
      flatpickr(document.createElement('input'), {
        plugins: [yearSelectPlugin({})],
        ...options
      }));

  let fpInstance: flatpickr.Instance | undefined;
  let options: flatpickr.Options.Options;

  const getPrevButton = (): Element => fp().monthNav.querySelector('.flatpickr-prev-month')!;

  const getNextButton = (): Element => fp().monthNav.querySelector('.flatpickr-next-month')!;

  beforeEach(() => {
    fpInstance = undefined;
    options = {};
  });

  describe('with explicit defaultDate', () => {
    beforeEach(() => {
      options = { defaultDate: new Date('2019-03-20') };
    });

    it('preloads defaultDate', () => {
      expect(fp().input.value).toEqual('2019');
    });

    describe('and locale', () => {
      beforeEach(() => {
        options = {
          defaultDate: new Date('2019-03-20')
        };
      });

      describe('and custom date format', () => {
        beforeEach(() => {
          options = {
            defaultDate: new Date('2019-03-20'),
            plugins: [yearSelectPlugin({ dateFormat: 'm.y' })]
          };
        });

        it('preloads defaultDate', () => {
          expect(fp().input.value).toEqual('03.19');
        });
      });
    });

    describe('and altInput with custom formats', () => {
      beforeEach(() => {
        options = {
          defaultDate: new Date('2019-03-20'),
          altInput: true,
          plugins: [yearSelectPlugin({ dateFormat: 'm.y', altFormat: 'm y' })]
        };
      });

      it('preloads defaultDate and altInput', () => {
        expect(fp().input.value).toEqual('03.19');
        expect(fp().altInput).toBeDefined();
        expect(fp().altInput!.value).toEqual('03 19');
      });
    });
  });

  describe('year nav', () => {
    describe('next/prev year buttons', () => {
      const thisYear = new Date().getFullYear();

      it('updates year value', () => {
        getPrevButton().dispatchEvent(new MouseEvent('click'));
        const startYear = thisYear - (thisYear % 10) - 1;
        const endYear = startYear + 12;
        expect(fp().currentYearElement.value).toEqual(`${startYear - 1}`);

        getNextButton().dispatchEvent(new MouseEvent('click'));
        getNextButton().dispatchEvent(new MouseEvent('click'));
        expect(fp().currentYearElement.value).toEqual(`${endYear}`);
      });

      describe('with minDate/maxDate options', () => {
        beforeEach(() => {
          options = {
            minDate: `${thisYear - 10}-03-20`,
            maxDate: `${thisYear + 10}-03-20`
          };
        });

        it('prohibits paging beyond them', () => {
          getPrevButton().dispatchEvent(new MouseEvent('click'));
          expect(getPrevButton().classList).toContain('flatpickr-disabled');

          getNextButton().dispatchEvent(new MouseEvent('click'));
          getNextButton().dispatchEvent(new MouseEvent('click'));
          expect(getNextButton().classList).toContain('flatpickr-disabled');
        });
      });

      describe('when in range mode, after abandoning input', () => {
        beforeEach(() => {
          options = {
            mode: 'range',
            minDate: `${thisYear - 10}-03-20`
          };

          fp().input.dispatchEvent(new MouseEvent('click')); // open flatpickr

          fp().rContainer!.querySelectorAll('.flatpickr-yearSelect-year')![1].dispatchEvent(new MouseEvent('click')); // pick start date

          document.dispatchEvent(new MouseEvent('click')); // abandon input
        });

        it('still honors minDate options', () => {
          getPrevButton().dispatchEvent(new MouseEvent('click'));
          expect(getPrevButton().classList).toContain('flatpickr-disabled');
        });
      });
    });
  });

  describe('year cell styling', () => {
    describe("for current year of current decade ('today' cell)", () => {
      const getTodayCell = (): Element | null | undefined => fp().rContainer?.querySelector('.today');
      const currentYear = new Date().getFullYear();

      it('applies .today CSS class', () => {
        expect(getTodayCell()?.textContent).toEqual(`${currentYear}`);

        getPrevButton().dispatchEvent(new MouseEvent('click'));
        expect(getTodayCell()).toBeNull();

        getNextButton().dispatchEvent(new MouseEvent('click'));
        expect(getTodayCell()?.textContent).toEqual(`${currentYear}`);
      });
    });

    describe('for selected cells', () => {
      const thisYear = new Date().getFullYear();
      const getSelectedCell = (): Element | null | undefined => fp().rContainer?.querySelector('.selected');

      const getSelectionTarget = (): Element | null | undefined =>
        fp().rContainer!.querySelector('.flatpickr-yearSelect-year:nth-child(6)')!;

      it('applies .selected CSS class', () => {
        expect(getSelectedCell()).toBeNull();

        getSelectionTarget()?.dispatchEvent(new MouseEvent('click'));
        const startYear = thisYear - (thisYear % 10) - 1;
        expect(getSelectedCell()?.textContent).toEqual(`${startYear + 5}`);

        getPrevButton().dispatchEvent(new MouseEvent('click'));
        expect(getSelectedCell()).toBeNull();

        getNextButton().dispatchEvent(new MouseEvent('click'));
        expect(getSelectedCell()?.textContent).toEqual(`${startYear + 5}`);
      });
    });
  });

  describe('range mode', () => {
    const getYearCells = (instance?: flatpickr.Instance): NodeListOf<Element> =>
      (instance || fp()).rContainer!.querySelectorAll('.flatpickr-yearSelect-year')!;

    describe('after first selection/click', () => {
      beforeEach(() => {
        options = { mode: 'range' };

        fp().input.dispatchEvent(new MouseEvent('click')); // open flatpickr
        getYearCells()[1].dispatchEvent(new MouseEvent('click'));
      });

      it('keeps calendar open until second selection/click', () => {
        expect(fp().calendarContainer.classList).toContain('open');

        getYearCells()[5].dispatchEvent(new MouseEvent('click'));
        expect(fp().calendarContainer.classList).not.toContain('open');
      });

      describe('when hovering over other another year cell', () => {
        beforeEach(() => {
          getYearCells()[5].dispatchEvent(new MouseEvent('mouseover', { bubbles: true }));
        });

        it('highlights all cells in the tentative range', () => {
          expect(getYearCells()[1].classList).toContain('startRange');

          Array.from(getYearCells())
            .slice(2, 5)
            .forEach((cell) => {
              expect(cell.classList).toContain('inRange');
            });

          expect(getYearCells()[5].classList).toContain('endRange');
        });

        describe('and then prematurely abandoning input', () => {
          describe('by clicking out', () => {
            beforeEach(() => {
              document.dispatchEvent(new MouseEvent('mousedown')); // close flatpickr
            });

            it('clears the highlighting', () => {
              getYearCells().forEach((cell) => {
                expect(cell.classList).not.toContain('startRange');
                expect(cell.classList).not.toContain('inRange');
                expect(cell.classList).not.toContain('endRange');
              });
            });
          });

          describe('by alt-tabbing out and back in', () => {
            beforeEach(() => {
              window.document.dispatchEvent(new FocusEvent('blur'));
              window.document.dispatchEvent(new FocusEvent('focus'));
            });

            it('clears the highlighting', () => {
              getYearCells().forEach((cell) => {
                expect(cell.classList).not.toContain('startRange');
                expect(cell.classList).not.toContain('inRange');
                expect(cell.classList).not.toContain('endRange');
              });
            });
          });
        });
      });

      describe('when hovering over another year cell in a different decade', () => {
        beforeEach(() => {
          getNextButton().dispatchEvent(new MouseEvent('click'));

          getYearCells()[5].dispatchEvent(new MouseEvent('mouseover', { bubbles: true }));
        });

        it('highlights all visible cells in the tentative range', () => {
          Array.from(getYearCells())
            .slice(0, 5)
            .forEach((cell) => {
              expect(cell.classList).toContain('inRange');
            });

          expect(getYearCells()[5].classList).toContain('endRange');
        });
      });
    });

    describe('after two clicks (completed range selection)', () => {
      beforeEach(() => {
        options = { mode: 'range' };

        fp().input.dispatchEvent(new MouseEvent('click')); // open flatpickr
        getYearCells()[1].dispatchEvent(new MouseEvent('click'));
        getYearCells()[5].dispatchEvent(new MouseEvent('click'));
      });

      describe('when clicking again to start over', () => {
        beforeEach(() => {
          fp().input.dispatchEvent(new MouseEvent('click')); // reopen flatpickr

          getYearCells()[3].dispatchEvent(new MouseEvent('click'));
          getYearCells()[3].dispatchEvent(new MouseEvent('mouseover', { bubbles: true })); // class changes seem to be triggered by hover, not click...
        });

        it('clears the highlighting', () => {
          expect(getYearCells()[3].classList).toContain('startRange');

          [...Array.from(getYearCells()).slice(0, 3), ...Array.from(getYearCells()).slice(4)].forEach((cell) => {
            expect(cell.classList).not.toContain('startRange');
            expect(cell.classList).not.toContain('inRange');
            expect(cell.classList).not.toContain('endRange');
          });
        });
      });
    });

    describe('events', () => {
      it('fires change events', () => {
        const fn = jest.fn();
        const fp = createInstance({
          onChange: fn
        });

        getYearCells(fp)[3].dispatchEvent(new MouseEvent('click'));

        expect(fn).toHaveBeenCalled();
      });
    });
  });
});
