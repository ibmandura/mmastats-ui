function fuzzyAutocomplete(idInputEl, engine, inputName = 'name', name2id) {
  const formEl = idInputEl.parentNode;
  formEl.style.position = 'relative';

  //<input class="ms_fighter_search" name="name" placeholder="Search a fighter...">
  idInputEl.type = 'hidden';
  const searchInputEl = document.createElement('input');
  searchInputEl.classList = [...idInputEl.classList].join(' ')
  searchInputEl.cssText = document.defaultView.getComputedStyle(idInputEl, '').cssText;
  searchInputEl.name = inputName
  searchInputEl.placeholder = idInputEl.placeholder
  formEl.appendChild(searchInputEl);

  //<input class="ms_search_suggestion">
  const autocompleteSuggestionEl = document.createElement('input')
  autocompleteSuggestionEl.classList = [...idInputEl.classList].join(' ')
  autocompleteSuggestionEl.cssText = document.defaultView.getComputedStyle(idInputEl, '').cssText;
  autocompleteSuggestionEl.classList.add('ms_search_suggestion')
  formEl.insertBefore(autocompleteSuggestionEl, searchInputEl)

  const resultBoxEl = document.createElement('div');
  resultBoxEl.classList.add("ms_autocomplete");
  resultBoxEl.style.border = document.defaultView.getComputedStyle(idInputEl, '').border;
  resultBoxEl.style.borderTop = 0;
  formEl.insertBefore(resultBoxEl, searchInputEl);

  let currentlySelectedSearchResultEl = null;

  const onSubmit = function(e) {
    if (currentlySelectedSearchResultEl != null && currentlySelectedSearchResultEl.id !== "ms-autocomplete-tail") {
      searchInputEl.value = currentlySelectedSearchResultEl.innerText;

      const fighterName = currentlySelectedSearchResultEl.innerText;
      if (fighterName in name2id) {
        idInputEl.value = name2id[fighterName];
      }
    }
  };

  const clearAutocompleteSuggestion = function() {
    autocompleteSuggestionEl.style.display = "none";
    autocompleteSuggestionEl.value = '';
  }

  const submit = function() {
    clearAutocompleteSuggestion();
    onSubmit(null);
    formEl.submit();
  };

  const updateAutocompleteSuggestion = function() {
    const userTypedText = searchInputEl.value;
    autocompleteSuggestionEl.style.display = "block";
    autocompleteSuggestionEl.value = userTypedText + currentlySelectedSearchResultEl.innerText.substr(userTypedText.length);
  }

  const changeSelectedSearchResult = function(newSelection) {
    if (currentlySelectedSearchResultEl == newSelection) return;
    clearAutocompleteSuggestion();

    newSelection.classList.add("ms_autocomplete_item_selected");
    if (currentlySelectedSearchResultEl) {
      currentlySelectedSearchResultEl.classList.remove("ms_autocomplete_item_selected");
    }
    currentlySelectedSearchResultEl = newSelection;

    if (newSelection && newSelection.innerText.toLowerCase().startsWith(searchInputEl.value.toLowerCase())) {
      updateAutocompleteSuggestion();
    }
  }

  const addItem = function(text) {
    const el = document.createElement('div');
    el.classList.add("ms_autocomplete_item");
    el.innerText = text;
    el.addEventListener('mouseenter', function(e) {
      changeSelectedSearchResult(el);
    });
    el.addEventListener('mousedown', function(e) {
      submit();
    });
    resultBoxEl.appendChild(el);
    return el;
  };

  const closeSearch = function() {
    clearAutocompleteSuggestion();
    resultBoxEl.classList.remove("is-search-active");
  }

  const ARROW_UP_KEY = 38, ARROW_DOWN_KEY = 40, ENTER_KEY = 13, ESC_KEY = 27, TAB = 9;
  const ARROW_RIGHT = 39;

  const onKeyUp = function(e) {
    switch (e && e.keyCode) {

      case ARROW_RIGHT:
      case TAB:
        if (!currentlySelectedSearchResultEl) return;
        if (!currentlySelectedSearchResultEl.innerText.toLowerCase().startsWith(searchInputEl.value.toLowerCase())) return;
        e.preventDefault(); // prevent "tabbing" to the next DOM element
        clearAutocompleteSuggestion();
        searchInputEl.value = currentlySelectedSearchResultEl.innerText;
        return;

      case ARROW_UP_KEY:
        if (!currentlySelectedSearchResultEl) return changeSelectedSearchResult(resultBoxEl.lastChild);
        const prev = currentlySelectedSearchResultEl.previousSibling;
        if (!prev) return changeSelectedSearchResult(resultBoxEl.lastChild);
        e.preventDefault(); // prevent cursor going back to beginning of input field
        return changeSelectedSearchResult(prev);

      case ARROW_DOWN_KEY:
        if (!currentlySelectedSearchResultEl) return changeSelectedSearchResult(resultBoxEl.firstChild);
        const next = currentlySelectedSearchResultEl.nextSibling;
        if (!next) return changeSelectedSearchResult(resultBoxEl.firstChild);
        return changeSelectedSearchResult(next);

      case ENTER_KEY:
        return submit();

      case ESC_KEY:
        searchInputEl.value = '';
        searchInputEl.blur();
        closeSearch();

      default:
        return;
    }
  }

  const performSearch = function() {
    currentlySelectedSearchResultEl = null;
    resultBoxEl.innerHTML = "";
    clearAutocompleteSuggestion();

    if (searchInputEl.value == "") {
      closeSearch();
      return;
    }

    resultBoxEl.classList.add("is-search-active");
    const matches = engine.search(searchInputEl.value);

    matches.forEach(function(m, i) {
      const el = addItem(m);
      if (i == 0 && el.innerText.toLowerCase().indexOf(searchInputEl.value.toLowerCase()) == 0) {
        changeSelectedSearchResult(el);
      }
    });

    const el = addItem('Search for "' + searchInputEl.value + '" ...');
    el.id = "ms-autocomplete-tail";
  }

  performSearch();

  searchInputEl.addEventListener("keydown", onKeyUp);
  searchInputEl.addEventListener("input", performSearch);
  searchInputEl.addEventListener("focus", performSearch);
  searchInputEl.addEventListener("blur", closeSearch);
  formEl.addEventListener('submit', onSubmit);
}
