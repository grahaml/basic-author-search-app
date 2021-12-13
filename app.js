// some identifiers
const AUTHOR_SEARCH_RESULTS_LIST = "author-search-results-list";
const AUTHOR_WORKS_LIST = "author-works-list";
const WORK_DETAILS = "work-details";

const authorSearchUrl = (query) =>
  `https://openlibrary.org/search/authors.json?q=${encodeURI(query.trim())}`;
const authorWorksUrl = (authorId) =>
  `https://openlibrary.org/authors/${authorId}/works.json`;
const workDetailsUrl = (worksId) => `https://openlibrary.org${worksId}.json`;
const coverImageUrl = (id) => `https://covers.openlibrary.org/b/id/${id}-L.jpg`;

let viewportElement;
function getViewportElement() {
  viewportElement = viewportElement || document.getElementById("app");
  return viewportElement;
}

let authorSearchList;
function getAuthorSearchListElement() {
  authorSearchList =
    authorSearchList || document.getElementById(AUTHOR_SEARCH_RESULTS_LIST);
  return authorSearchList;
}

let authorWorksList;
function getAuthorWorksListElement() {
  authorWorksList =
    authorWorksList || document.getElementById(AUTHOR_WORKS_LIST);
  return authorWorksList;
}

let workDetailsElement;
function getWorkDetailsElement() {
  workDetailsElement =
    workDetailsElement || document.getElementById(WORK_DETAILS);
  return workDetailsElement;
}

function clearViewport() {
  // Silly utility to just clear out every possible view without really caring
  // about whether or not it exists...
  try {
    getViewportElement().removeChild(getAuthorSearchListElement());
  } catch (e) {}
  try {
    getViewportElement().removeChild(getAuthorWorksListElement());
  } catch (e) {}
  try {
    getViewportElement().removeChild(getWorkDetailsElement());
  } catch (e) {}
}

function renderAuthor(author) {
  const item = document.createElement("li");
  const button = document.createElement("button");
  button.setAttribute("class", "author-button");
  button.setAttribute("data-authorId", author.key);
  button.innerHTML = author.name;
  item.appendChild(button);
  return item;
}

function renderAuthorResultsList(results) {
  const resultsList = results.docs.map(renderAuthor);
  const list = document.createElement("ul");
  list.setAttribute("id", AUTHOR_SEARCH_RESULTS_LIST);
  resultsList.forEach((item) => {
    list.appendChild(item);
  });
  return list;
}

async function handleSearchForAuthor(evt) {
  evt.preventDefault();
  const searchTerm = document.getElementById("search-bar").value;
  console.log({ searchTerm });
  const searchPromise = await fetch(authorSearchUrl(searchTerm));
  const searchResults = await searchPromise.json();
  const resultsList = renderAuthorResultsList(searchResults);
  clearViewport();
  getViewportElement().appendChild(resultsList);
  authorSearchList = resultsList;
}

function renderPieceOfWork(work) {
  const item = document.createElement("li");
  const button = document.createElement("button");
  button.setAttribute("class", "works-button");
  button.setAttribute("data-worksId", work.key);
  button.innerHTML = work.title;
  item.appendChild(button);
  return item;
}

function renderAuthorWorksList(results) {
  const resultsList = results.entries.map(renderPieceOfWork);
  const list = document.createElement("ul");
  list.setAttribute("id", AUTHOR_WORKS_LIST);
  resultsList.forEach((item) => {
    list.appendChild(item);
  });
  return list;
}

async function handleAuthorNameClick(authorId) {
  const authorWorksPromise = await fetch(authorWorksUrl(authorId));
  const authorWorksResults = await authorWorksPromise.json();
  console.log({ authorWorksResults });
  const worksList = renderAuthorWorksList(authorWorksResults);
  console.log({ worksList });
  clearViewport();
  getViewportElement().appendChild(worksList);
  authorWorksList = worksList;
}

function getCoverId(covers) {
  let finalCovers = covers;
  if (!Array.isArray(covers)) {
    finalCovers = [covers];
  }
  let iterator = 0;
  let coverId = finalCovers[iterator];
  while (coverId === -1) {
    coverId = covers[iterator++];
  }
  return coverId;
}

// TODO: actually render a details view
function renderWorkDetails(workDetails) {
  const workDetailsElement = document.createElement("div");
  workDetailsElement.setAttribute("id", "work-details");

  // title
  const titleElement = document.createElement("h2");
  titleElement.innerHTML = workDetails.title;

  // published date
  const publishedDate = document.createElement("h3");
  publishedDate.innerHTML =
    `First published ${workDetails.first_publish_date}` || "";

  // subjects
  let subjectsList;
  if (workDetails.subjects) {
    console.log({ subjects: workDetails.subjects });
    subjectsList = document.createElement("ul");
    workDetails.subjects.forEach((subject) => {
      // const item = document.createElement("li");
      console.log({ subject });
      const item = document.createElement("li");
      item.innerHTML = subject;
      subjectsList.append(item);
      // item.innerHTML = String(subject);
      // subjectsList.appendChild(item);
    });
  } else {
    subjectsList = document.createElement("p");
    subjectsList.innerHTML = "Subjects not avaialable for this title...";
  }

  // cover
  const coverImage = document.createElement("img");
  const coverId = getCoverId(workDetails.covers);
  coverImage.src = coverImageUrl(coverId);

  // put it all together
  workDetailsElement.appendChild(titleElement);
  workDetailsElement.appendChild(publishedDate);
  workDetailsElement.appendChild(coverImage);
  workDetailsElement.appendChild(subjectsList);

  console.log(workDetails);
  return workDetailsElement;
}

async function handleWorksClick(worksId) {
  const workDetailsPromise = await fetch(workDetailsUrl(worksId));
  const workDetailsResults = await workDetailsPromise.json();
  console.log({ workDetailsResults });
  const workDetails = renderWorkDetails(workDetailsResults);
  clearViewport();
  getViewportElement().appendChild(workDetails);
  workDetailsElement = workDetails;
}

async function handleGlobalClicks(evt) {
  const { target } = evt;
  const authorId = target.getAttribute("data-authorId");
  const worksId = target.getAttribute("data-worksId");
  if (authorId) {
    handleAuthorNameClick(authorId);
  } else if (worksId) {
    handleWorksClick(worksId);
  }
  return;
}

async function bootstrap() {
  document
    .getElementById("search-form")
    .addEventListener("submit", handleSearchForAuthor);

  document.addEventListener("click", handleGlobalClicks);
}

bootstrap();
