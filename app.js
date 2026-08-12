const ADMIN_PASSWORD = "1234";

const SUBJECTS = [
  "독서와 작문",
  "문학과 영상",
  "미적분I",
  "수학과제탐구",
  "영어II",
  "영미문학읽기",
  "정치",
  "인문학과 윤리",
  "동아시아 역사기행",
  "한국지리탐구",
  "역학과 에너지",
  "물질과 에너지",
  "세포와 물질대사",
  "지구시스템과학",
  "인공지능 기초"
];

let performances = [];

try {
  const savedData = localStorage.getItem("performances");

  if (savedData) {
    const parsedData = JSON.parse(savedData);

    if (Array.isArray(parsedData)) {
      performances = parsedData;
    }
  }
} catch (error) {
  console.error("저장된 데이터를 불러오는 데 실패했습니다.", error);
  performances = [];
}

function saveData() {
  localStorage.setItem(
    "performances",
    JSON.stringify(performances)
  );
}

function sortPerformances() {
  performances.sort(
    (a, b) =>
      new Date(a.date) - new Date(b.date)
  );
}

function getToday() {
  const today = new Date();

  today.setHours(0, 0, 0, 0);

  return today;
}

function getDDay(dateString) {
  const today = getToday();

  const target = new Date(`${dateString}T00:00:00`);

  const difference =
    target.getTime() - today.getTime();

  return Math.ceil(
    difference / (1000 * 60 * 60 * 24)
  );
}

function getDDayText(dday) {
  if (dday === 0) {
    return "D-DAY";
  }

  if (dday > 0) {
    return `D-${dday}`;
  }

  return "완료";
}

function getDDayClass(dday) {
  if (dday >= 0 && dday <= 3) {
    return "dday-danger";
  }

  if (dday >= 0 && dday <= 7) {
    return "dday-warning";
  }

  return "dday-normal";
}

function formatDate(dateString) {
  const parts = dateString.split("-");

  if (parts.length !== 3) {
    return dateString;
  }

  return `${parts[0]}.${parts[1]}.${parts[2]}`;
}

function escapeHTML(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function createPerformanceCard(item) {
  const dday = getDDay(item.date);

  return `
    <article class="performance-card">

      <div class="performance-top">

        <span class="subject">
          ${escapeHTML(item.subject)}
        </span>

        <span class="dday ${getDDayClass(dday)}">
          ${getDDayText(dday)}
        </span>

      </div>

      <h3 class="performance-title">
        ${escapeHTML(item.title)}
      </h3>

      <div class="performance-date">
        📅 ${formatDate(item.date)}
      </div>

      ${
        item.materials
          ? `
            <div class="materials">
              📌 ${escapeHTML(item.materials)}
            </div>
          `
          : ""
      }

      ${
        item.description
          ? `
            <div class="description">
              ${escapeHTML(item.description)}
            </div>
          `
          : ""
      }

    </article>
  `;
}

function renderUpcoming() {
  const container =
    document.getElementById("upcomingList");

  sortPerformances();

  const upcoming =
    performances.filter(
      item => getDDay(item.date) >= 0
    );

  const visible =
    upcoming.slice(0, 5);

  if (visible.length === 0) {
    container.innerHTML = `
      <div class="empty">
        다가오는 수행평가가 없습니다 🎉
      </div>
    `;

    return;
  }

  container.innerHTML =
    visible
      .map(createPerformanceCard)
      .join("");
}

function renderAll() {
  const container =
    document.getElementById("allList");

  const filter =
    document.getElementById("subjectFilter").value;

  sortPerformances();

  let list =
    performances.filter(
      item => getDDay(item.date) >= 0
    );

  if (filter !== "all") {
    list =
      list.filter(
        item => item.subject === filter
      );
  }

  if (list.length === 0) {
    container.innerHTML = `
      <div class="empty">
        등록된 수행평가가 없습니다.
      </div>
    `;

    return;
  }

  container.innerHTML =
    list
      .map(createPerformanceCard)
      .join("");
}

function initializeSubjects() {
  const subjectFilter =
    document.getElementById("subjectFilter");

  const adminSubject =
    document.getElementById("adminSubject");

  SUBJECTS.forEach(subject => {

    const option1 =
      document.createElement("option");

    option1.value = subject;
    option1.textContent = subject;

    subjectFilter.appendChild(option1);


    const option2 =
      document.createElement("option");

    option2.value = subject;
    option2.textContent = subject;

    adminSubject.appendChild(option2);

  });
}

function renderAdminList() {
  const subject =
    document.getElementById("adminSubject").value;

  const container =
    document.getElementById("adminList");

  const title =
    document.getElementById("selectedSubjectName");

  title.textContent = subject;

  const list =
    performances
      .filter(
        item => item.subject === subject
      )
      .sort(
        (a, b) =>
          new Date(a.date) -
          new Date(b.date)
      );

  if (list.length === 0) {
    container.innerHTML = `
      <div class="empty">
        등록된 수행평가가 없습니다.
      </div>
    `;

    return;
  }

  container.innerHTML =
    list
      .map(item => `
        <div class="admin-performance">

          <div>

            <strong>
              ${escapeHTML(item.title)}
            </strong>

            <div>
              ${formatDate(item.date)}
            </div>

            ${
              item.materials
                ? `
                  <small>
                    📌 ${escapeHTML(item.materials)}
                  </small>
                `
                : ""
            }

          </div>

          <button
            class="delete-button"
            data-id="${escapeHTML(item.id)}"
          >
            삭제
          </button>

        </div>
      `)
      .join("");

  container
    .querySelectorAll(".delete-button")
    .forEach(button => {

      button.addEventListener(
        "click",
        () => {
          deletePerformance(button.dataset.id);
        }
      );

    });
}

function addPerformance() {
  const subject =
    document.getElementById("adminSubject").value;

  const title =
    document
      .getElementById("performanceTitle")
      .value
      .trim();

  const date =
    document
      .getElementById("performanceDate")
      .value;

  const materials =
    document
      .getElementById("performanceMaterials")
      .value
      .trim();

  const description =
    document
      .getElementById("performanceDescription")
      .value
      .trim();

  if (!title) {
    alert("수행평가명을 입력하세요.");
    return;
  }

  if (!date) {
    alert("날짜를 입력하세요.");
    return;
  }

  const newPerformance = {
    id: crypto.randomUUID
      ? crypto.randomUUID()
      : Date.now().toString(),

    subject,
    title,
    date,
    materials,
    description
  };

  performances.push(newPerformance);

  saveData();

  document
    .getElementById("performanceTitle")
    .value = "";

  document
    .getElementById("performanceDate")
    .value = "";

  document
    .getElementById("performanceMaterials")
    .value = "";

  document
    .getElementById("performanceDescription")
    .value = "";

  renderAll();
  renderUpcoming();
  renderAdminList();

  alert("수행평가가 추가되었습니다.");
}

function deletePerformance(id) {
  const confirmed =
    confirm(
      "정말 이 수행평가를 삭제할까요?"
    );

  if (!confirmed) {
    return;
  }

  performances =
    performances.filter(
      item => item.id !== id
    );

  saveData();

  renderAll();
  renderUpcoming();
  renderAdminList();
}

function openLogin() {
  document
    .getElementById("loginModal")
    .classList.remove("hidden");

  document
    .getElementById("passwordInput")
    .focus();
}

function closeLogin() {
  document
    .getElementById("loginModal")
    .classList.add("hidden");

  document
    .getElementById("loginError")
    .textContent = "";
}

function login() {
  const password =
    document
      .getElementById("passwordInput")
      .value;

  if (password === ADMIN_PASSWORD) {

    closeLogin();

    document
      .getElementById("adminPanel")
      .classList.remove("hidden");

    document
      .getElementById("adminPanel")
      .scrollIntoView({
        behavior: "smooth"
      });

    renderAdminList();

    document
      .getElementById("passwordInput")
      .value = "";

  } else {

    document
      .getElementById("loginError")
      .textContent =
        "비밀번호가 올바르지 않습니다.";

  }
}

function logout() {
  document
    .getElementById("adminPanel")
    .classList.add("hidden");
}

function renderToday() {
  const today = new Date();

  const year =
    today.getFullYear();

  const month =
    today.getMonth() + 1;

  const day =
    today.getDate();

  document
    .getElementById("todayText")
    .textContent =
      `${year}.${month}.${day} 기준`;
}

document
  .getElementById("adminButton")
  .addEventListener(
    "click",
    openLogin
  );

document
  .getElementById("closeLogin")
  .addEventListener(
    "click",
    closeLogin
  );

document
  .getElementById("loginButton")
  .addEventListener(
    "click",
    login
  );

document
  .getElementById("logoutButton")
  .addEventListener(
    "click",
    logout
  );

document
  .getElementById("addPerformance")
  .addEventListener(
    "click",
    addPerformance
  );

document
  .getElementById("adminSubject")
  .addEventListener(
    "change",
    renderAdminList
  );

document
  .getElementById("subjectFilter")
  .addEventListener(
    "change",
    renderAll
  );

document
  .getElementById("passwordInput")
  .addEventListener(
    "keydown",
    event => {

      if (event.key === "Enter") {
        login();
      }

    }
  );

initializeSubjects();
renderToday();
renderUpcoming();
renderAll();