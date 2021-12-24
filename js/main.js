let API = "http://localhost:8000/students";

// переменные для инпутов: для добавления фильма
let inpName = $("#studName");
let inpLastName = $("#studLastName");
let inpPhone = $("#studPhone");
let inpWeekly = $("#studWeekly");
let inpMonthly = $("#studMonthly");
let addBtn = $("#btn-add");
let list = $(".list"); // блок куда добавляются карточки фильмов
let loader = $(".loader");

//search
let searchInp = $(".search-inp"); // достаем инпут для поиска
let searchVal = ""; // сохраняем значение из инпута поиска

let currentPage = 1; // текущая страница
let pageTotalCount = 1; // общее количество страниц
let paginationList = $(".pagination-list"); // блок куда добавляются кнопки с цифрами, для переключения между  страницами
let prev = $(".prev"); // кнопка = предыдущая страница
let next = $(".next"); // кнопка = следующая страница

// переменные для инпутов: для редактирования
let editName = $("#edit-name");
let editLastName = $("#edit-lastName");
let editPhone = $("#edit-phone");
let editWeekly = $("#edit-weekly");
let editMonthly = $("#edit-monthly");
let editSaveBtn = $("#btn-save-edit");
let editFormModal = $("#editFormModal");
//  loader
function getData() {
  loader.css("display", "block");
  fetch("https://swapi.dev/api/people")
    .then((result) => result.json())
    .then(({ results }) => {
      results.forEach((item, index) => {
        let elem = drawTableRow(item, index);
        tbody.append(elem);
      });
    })
    .catch((err) => console.log(err))
    .finally(() => {
      loader.css("display", "none");
    });
}
getData();

render();
//todo Отображение товаров на странице
function render() {
  loader.css("display", "block");
  fetch(`${API}?q=${searchVal}&_limit=8&_page=${currentPage}`)
    .then((res) => res.json())
    .then((data) => {
      console.log(data);
      list.html("");
      data.forEach((item) => {
        let elem = drawStudentCard(item);
        list.append(elem);
      });
      drawPaginationButtons();
    })
    .finally(() => {
      loader.css("display", "none");
    });
}

// todo Возвращает верстку карточки для каждого фильма
function drawStudentCard(stud) {
  return `
        <div class="card col-4 my-2 mx-3" style="width: 18rem;">
            <div class="card-body">
                <h5 class="card-title style-stud">${stud.name}</h5>
                <h5 class="card-title style-stud">${stud.lastName}</h5>
                <h6 class="card-title"><span>Phone:</span> ${stud.phone}</h6>
                <p class="card-text"><span>KPI Weekly:</span> ${stud.weekly}</p>
                <p class="card-text"><span>KPI Monthly:</span> ${stud.monthly}</p>

                <button data-bs-toggle="modal" data-bs-target="#editFormModal" class="btn btn-primary btn-edit" id="${stud.id}" type="button">Edit</button>

                <button class="btn btn-danger btn-delete" type="button" id="${stud.id}">Delete</button>
            </div>
        </div>
    `;
}

// TODO SEARCH функция срабатывает на каждый ввод
searchInp.on("input", () => {
  searchVal = searchInp.val(); // записывает значение поисковика в переменную searchVal
  render(); // новая перерисовка страницы
});

// todo PAGINATION
function drawPaginationButtons() {
  fetch(`${API}?q=${searchVal}`) // запрос на сервер чтобы узнать общее количество продуктов
    .then((res) => res.json())
    .then((data) => {
      pageTotalCount = Math.ceil(data.length / 8); //общее количество продуктов делим на кол-во продуктов которые отображаются на одной странице
      //pageTotalCount = кол-во страниц
      paginationList.html("");
      for (let i = 1; i <= pageTotalCount; i++) {
        // создаем кнопки с цифрами
        if (currentPage == i) {
          // сравниваем текущую страницу с цифрой из кнопки. Если они совпадают, то нужно закрасить эту кнопку, обозначая на какой странице мы находимся

          paginationList.append(` 
            <li class="page-item active">
                <a class="page-link page_number" href="#">${i}</a>
            </li>
        `);
        } else {
          paginationList.append(` 
                <li class="page-item">
                    <a class="page-link page_number" href="#">${i}</a>
                </li>
            `);
        }
      }
    });
}

// кнопка переключения на предыдущую страницу
prev.on("click", () => {
  if (currentPage <= 1) {
    return;
  }
  currentPage--;
  render();
});

// кнопка переключения на следующую страницу
next.on("click", () => {
  if (currentPage >= pageTotalCount) {
    return;
  }
  currentPage++;
  render();
});
// кнопки переключения на определенную страницу
$("body").on("click", ".page_number", function () {
  //   console.log(this.innerText);
  currentPage = this.innerText; // обозначаем текущую страницу цифрой из кнопки
  render();
});

//todo EDIT
// открываем модалку и делаем запрос, для того чтобы достать именно этот  И заполняем поля в модалке для редактирования
$("body").on("click", ".btn-edit", function () {
  fetch(`${API}/${this.id}`)
    .then((res) => res.json())
    .then((data) => {
      editName.val(data.name); //заполняем поля данными
      editLastName.val(data.lastName);
      editPhone.val(data.phone);
      editWeekly.val(data.weekly);
      editMonthly.val(data.monthly);
      editSaveBtn.attr("id", data.id); //записываем id student к кнопке сохранения
    });
});

//todo  Cохранить изменения товара
// кнопка из модалки, для  сохранения изменений
editSaveBtn.on("click", function () {
  let id = this.id; // вытаскиваем из кнопки id и ложим его в переменную

  let name = editName.val(); // сохраняем значения инпута из модалки в переменные
  let lastName = editLastName.val();
  let phone = editPhone.val();
  let weekly = editWeekly.val();
  let monthly = editMonthly.val();

  if (!name || !lastName || !phone || !weekly || !monthly) return; // проверяем на заполненность и пустоту полей

  let editedStudent = {
    // формируем новый объект, из новых данных, чтобы отправить на сервер
    name: name,
    lastName: lastName,
    phone: phone,
    weekly: weekly,
    monthly: monthly,
  };
  saveEdit(editedStudent, id); // вызываем функцию для сохранения данных и передаем ей этот новый объект и id
});

// функция для сохранения
function saveEdit(editedStudent, id) {
  fetch(`${API}/${id}`, {
    method: "PATCH",
    headers: {
      "Content-type": "application/json",
    },
    body: JSON.stringify(editedStudent),
  }).then(() => {
    render();
    $("#editFormModal").modal("hide");
  });
}

//todo POST NEW STUDENT
addBtn.on("click", function () {
  let name = inpName.val();
  let lastName = (inpLastName = inpLastName.val());
  let phone = inpPhone.val();
  let weekly = inpWeekly.val();
  let monthly = inpMonthly.val();
  if (!name || !lastName || !phone || !weekly || !monthly) return;

  let newStudent = {
    name,
    lastName,
    phone,
    weekly,
    monthly,
  };
  postStudent(newStudent);
});

function postStudent(newStudent) {
  fetch(API, {
    method: "POST",
    headers: { "Content-type": "application/json" },
    body: JSON.stringify(newStudent),
  }).then(() => {
    render();
    $("#addFormModal").modal("hide");
  });
}

//todo DELETE

$("body").on("click", ".btn-delete", function () {
  fetch(`${API}/${this.id}`, {
    method: "DELETE",
  }).then(() => render());
});
