import flatpickr from "flatpickr";
type DayElement = HTMLSpanElement & { dateObj: Date; $i: number };

function clearNode(node: HTMLElement) {
  while (node.firstChild) node.removeChild(node.firstChild);
}

function getEventTarget(event: Event): EventTarget | null {
  try {
    if (typeof event.composedPath === "function") {
      const path = event.composedPath();
      return path[0];
    }
    return event.target;
  } catch (error) {
    return event.target;
  }
}

export interface Config {
  dateFormat: string;
  altFormat: string;
  theme: string;
}

export interface ElementDate extends Element {
  dateObj: Date;
}

export type MonthElement = HTMLSpanElement & { dateObj: Date; $i: number };

const defaultConfig: Config = {
  dateFormat: "Y",
  altFormat: "Y",
  theme: "light",
};

function yearSelectPlugin(
  pluginConfig?: Partial<Config>
): flatpickr.Options.Plugin {
  const config = { ...defaultConfig, ...pluginConfig };

  return (fp: flatpickr.Instance) => {
    fp.config.dateFormat = config.dateFormat;
    fp.config.altFormat = config.altFormat;

    const self = {
      stubbedCurrentYear: null as null | number,
      yearsContainer: null as null | HTMLDivElement,
      headerWrapper: null as null | ParentNode,
      rangeEl: null as null | Node,
    };

    function setRangeElement() {
      if (!fp.rContainer) return;

      self.headerWrapper = fp.yearElements[0].parentNode?.parentNode || null;
    }

    function clearUnnecessaryDOMElements(): void {
      if (!fp.rContainer) return;

      clearNode(fp.rContainer);

      for (let i = 0; i < fp.monthElements.length; i += 1) {
        const element = fp.monthElements[i];
        if (!element.parentNode) continue;

        element.parentNode.removeChild(element);
      }

      for (let i = 0; i < fp.yearElements.length; i += 1) {
        const element = fp.yearElements[i];
        if (!element.parentNode) continue;

        element.parentNode.removeChild(element);
      }

      while (self.headerWrapper?.lastElementChild) {
        self.headerWrapper.removeChild(self.headerWrapper.lastElementChild);
      }
    }

    function build() {
      if (!fp.rContainer) return;

      self.yearsContainer = fp._createElement<HTMLDivElement>(
        "div",
        "flatpickr-yearSelect-years"
      );

      if (!self.yearsContainer) return;

      self.yearsContainer.tabIndex = -1;

      buildYears();

      fp.rContainer.appendChild(self.yearsContainer);
      self.rangeEl = fp._createElement<HTMLDivElement>(
        "div",
        "flatpickr-yearSelect-range"
      );

      const startYear = fp.currentYear - (fp.currentYear % 10);
      const endYear = startYear + 10;
      self.rangeEl.textContent = `${startYear} - ${endYear}`;

      self.headerWrapper?.appendChild(self.rangeEl);

      fp.calendarContainer.classList.add(
        `flatpickr-yearSelect-theme-${config.theme}`
      );
    }

    function buildYears() {
      if (!self.yearsContainer) return;

      clearNode(self.yearsContainer);

      const frag = document.createDocumentFragment();

      const startYear = fp.currentYear - (fp.currentYear % 10) - 1;
      const endYear = startYear + 12;

      for (let i = 0; i < 12; i += 1) {
        const year = fp.createDay(
          "flatpickr-yearSelect-year",
          new Date(startYear + i, 0, 1),
          0,
          i
        );
        if (year.dateObj.getFullYear() === new Date().getFullYear())
          year.classList.add("today");
        year.textContent = String(year.dateObj.getFullYear());
        year.setAttribute("data-year", year.textContent);
        year.addEventListener("click", selectYear);
        frag.appendChild(year);
      }

      self.yearsContainer.appendChild(frag);

      if (fp.config.minDate && startYear <= fp.config.minDate.getFullYear()) {
        fp.prevMonthNav.classList.add("flatpickr-disabled");
      } else {
        fp.prevMonthNav.classList.remove("flatpickr-disabled");
      }

      if (fp.config.maxDate && endYear > fp.config.maxDate.getFullYear()) {
        fp.nextMonthNav.classList.add("flatpickr-disabled");
      } else {
        fp.nextMonthNav.classList.remove("flatpickr-disabled");
      }
    }

    function bindEvents() {
      fp._bind(fp.prevMonthNav, "click", (e) => {
        e.preventDefault();
        e.stopPropagation();

        const startYear = fp.currentYear - (fp.currentYear % 10) - 1;

        fp.changeYear(startYear - 1);
        buildYears();

        if (self.rangeEl) {
          const startToDisplay = fp.currentYear - (fp.currentYear % 10);
          const endToDisplay = startToDisplay + 10;
          self.rangeEl.textContent = `${startToDisplay} - ${endToDisplay}`;
        }
      });

      fp._bind(fp.nextMonthNav, "click", (e) => {
        e.preventDefault();
        e.stopPropagation();

        const startYear = fp.currentYear - (fp.currentYear % 10) - 1;
        const endYear = startYear + 12;

        fp.changeYear(endYear);
        buildYears();

        if (self.rangeEl) {
          const startToDisplay = fp.currentYear - (fp.currentYear % 10);
          const endToDisplay = startToDisplay + 10;
          self.rangeEl.textContent = `${startToDisplay} - ${endToDisplay}`;
        }
      });

      fp._bind(
        self.yearsContainer as HTMLElement,
        "mouseover",
        (e: MouseEvent) => {
          const target = getEventTarget(e);
          if (fp.config.mode === "range" && target) {
            fp.onMouseOver(target as DayElement, "flatpickr-yearSelect-year");
          }
        }
      );
    }

    function setCurrentlySelected() {
      if (!fp.rContainer) return;
      if (!fp.selectedDates.length) return;

      const currentlySelected = fp.rContainer.querySelectorAll(
        ".flatpickr-yearSelect-year.selected"
      );

      for (let i = 0; i < currentlySelected.length; i += 1) {
        currentlySelected[i].classList.remove("selected");
      }

      const targetYear = fp.selectedDates[0].getFullYear();
      const year = fp.rContainer.querySelector(
        `.flatpickr-yearSelect-year[data-year="${targetYear}"]`
      );

      if (targetYear && year) {
        year.classList.add("selected");
      }
    }

    function selectYear(e: Event) {
      e.preventDefault();
      e.stopPropagation();

      const eventTarget = getEventTarget(e);

      if (!(eventTarget instanceof Element)) return;
      if (eventTarget.classList.contains("flatpickr-disabled")) return;
      if (eventTarget.classList.contains("notAllowed")) return; // necessary??

      setYear((eventTarget as MonthElement).dateObj);

      if (fp.config.closeOnSelect) {
        const single = fp.config.mode === "single";
        const range =
          fp.config.mode === "range" && fp.selectedDates.length === 2;

        if (single || range) fp.close();
      }
    }

    function setYear(date: Date) {
      const selectedDate = new Date(
        date.getFullYear(),
        date.getMonth(),
        date.getDate()
      );

      let selectedDates: Date[] = [];

      switch (fp.config.mode) {
        case "single":
          selectedDates = [selectedDate];
          break;

        case "multiple":
          selectedDates.push(selectedDate);
          break;

        case "range":
          if (fp.selectedDates.length === 2) {
            selectedDates = [selectedDate];
          } else {
            selectedDates = fp.selectedDates.concat([selectedDate]);
            selectedDates.sort((a, b) => a.getTime() - b.getTime());
          }

          break;
      }

      fp.setDate(selectedDates, true);
      setCurrentlySelected();
    }

    const shifts: Record<string, number> = {
      ArrowLeft: -1,
      ArrowRight: 1,
      ArrowDown: 3,
      ArrowUp: -3,
    };

    function onKeyDown(
      _v: Date[],
      _vs: string,
      _instance: flatpickr.Instance,
      e: KeyboardEvent
    ) {
      const shouldMove = shifts[e.key] !== undefined;
      if (!shouldMove && e.key !== "Enter") {
        return;
      }

      if (!fp.rContainer || !self.yearsContainer) return;

      const currentlySelected = fp.rContainer.querySelector(
        ".flatpickr-yearSelect-year.selected"
      ) as HTMLElement;

      let idx = Array.prototype.indexOf.call(
        self.yearsContainer.children,
        document.activeElement
      );

      if (idx === -1) {
        const target =
          currentlySelected || self.yearsContainer.firstElementChild;
        target.focus();
        idx = (target as MonthElement).$i;
      }

      if (shouldMove) {
        (
          self.yearsContainer.children[
            (12 + idx + shifts[e.key]) % 12
          ] as HTMLElement
        ).focus();
      } else if (
        e.key === "Enter" &&
        self.yearsContainer.contains(document.activeElement)
      ) {
        setYear((document.activeElement as MonthElement).dateObj);
      }
    }

    function closeHook() {
      if (fp.config?.mode === "range" && fp.selectedDates.length === 1) {
        fp.clear(false);
      }

      if (!fp.selectedDates.length) {
        buildYears();
      }
    }

    // Help the prev/next year nav honor config.minDate
    function stubCurrentYear() {
      self.stubbedCurrentYear = fp._initialDate.getFullYear();
      fp._initialDate.setFullYear(self.stubbedCurrentYear);
      fp.currentYear = self.stubbedCurrentYear;
      fp.currentMonth = 0;
    }

    function unstubCurrentYear() {
      if (!self.stubbedCurrentYear) return;
      fp._initialDate.setFullYear(self.stubbedCurrentYear);
      fp.currentYear = self.stubbedCurrentYear;
      self.stubbedCurrentYear = null;
      fp.currentMonth = 0;
    }

    function destroyPluginInstance() {
      if (self.yearsContainer === null) return;

      const years = self.yearsContainer.querySelectorAll(
        ".flatpickr-yearSelect-year"
      );

      for (let i = 0; i < years.length; i += 1) {
        years[i].removeEventListener("click", selectYear);
      }
    }

    return {
      onParseConfig() {
        fp.config.enableTime = false;
      },
      onValueUpdate: setCurrentlySelected,
      onKeyDown,
      onReady: [
        stubCurrentYear,
        setRangeElement,
        clearUnnecessaryDOMElements,
        build,
        bindEvents,
        setCurrentlySelected,
        () => {
          fp.config.onClose.push(closeHook);
          fp.loadedPlugins.push("yearSelect");
        },
      ],
      onDestroy: [
        unstubCurrentYear,
        destroyPluginInstance,
        () => {
          fp.config.onClose = fp.config.onClose.filter(
            (hook) => hook !== closeHook
          );
        },
      ],
    };
  };
}

export default yearSelectPlugin;
