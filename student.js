// ...existing code...
document.addEventListener('DOMContentLoaded', function () {
  const STORAGE_KEY = 'students_v1';

  function ensureResultsTable() {
    let results = document.getElementById('results');
    if (results) return results;
    results = document.createElement('table');
    results.id = 'results';
    results.border = '2';
    results.style.marginTop = '12px';
    results.innerHTML = `
      <thead>
        <tr><th>Name</th><th>Age</th><th>Gender</th><th>Course</th><th>Email</th><th>Action</th></tr>
      </thead>
      <tbody id="results-body"></tbody>
    `;
    const formTable = document.querySelector('table');
    (formTable && formTable.parentNode)
      ? formTable.parentNode.insertBefore(results, formTable.nextSibling)
      : document.body.appendChild(results);
    return results;
  }

  function loadStorage() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    } catch (e) {
      return [];
    }
  }

  function saveStorage(list) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  }

  function makeTd(text) {
    const td = document.createElement('td');
    td.textContent = text;
    return td;
  }

  function renderRow(student, tbody) {
    const tr = document.createElement('tr');
    tr.dataset.id = student.id;

    tr.appendChild(makeTd(student.name));
    tr.appendChild(makeTd(student.age));
    tr.appendChild(makeTd(student.gender));
    tr.appendChild(makeTd(student.course));
    tr.appendChild(makeTd(student.email));

    const actionTd = document.createElement('td');

    // Edit button
    const editBtn = document.createElement('button');
    editBtn.type = 'button';
    editBtn.textContent = 'Edit';
    editBtn.style.marginRight = '6px';
    editBtn.addEventListener('click', () => enterEditMode(tr, student));
    actionTd.appendChild(editBtn);

    // Delete button
    const delBtn = document.createElement('button');
    delBtn.type = 'button';
    delBtn.textContent = 'Delete';
    delBtn.style.backgroundColor = 'red';
    delBtn.addEventListener('click', () => {
      const list = loadStorage().filter(s => s.id !== student.id);
      saveStorage(list);
      tr.remove();
    });
    actionTd.appendChild(delBtn);

    tr.appendChild(actionTd);
    tbody.appendChild(tr);
  }

  function enterEditMode(tr, student) {
    // Replace text tds with inputs
    tr.innerHTML = '';

    const nameIn = document.createElement('input'); nameIn.value = student.name;
    const ageIn = document.createElement('input'); ageIn.type = 'number'; ageIn.value = student.age;
    const genderIn = document.createElement('input'); genderIn.value = student.gender;
    const courseIn = document.createElement('input'); courseIn.value = student.course;
    const emailIn = document.createElement('input'); emailIn.type = 'email'; emailIn.value = student.email;

    const tdName = document.createElement('td'); tdName.appendChild(nameIn);
    const tdAge = document.createElement('td'); tdAge.appendChild(ageIn);
    const tdGender = document.createElement('td'); tdGender.appendChild(genderIn);
    const tdCourse = document.createElement('td'); tdCourse.appendChild(courseIn);
    const tdEmail = document.createElement('td'); tdEmail.appendChild(emailIn);

    tr.appendChild(tdName);
    tr.appendChild(tdAge);
    tr.appendChild(tdGender);
    tr.appendChild(tdCourse);
    tr.appendChild(tdEmail);

    const actionTd = document.createElement('td');

    const saveBtn = document.createElement('button');
    saveBtn.type = 'button';
    saveBtn.textContent = 'Save';
    saveBtn.style.marginRight = '6px';
    saveBtn.addEventListener('click', () => {
      // update object and storage
      const list = loadStorage();
      const i = list.findIndex(s => s.id === student.id);
      const updated = {
        id: student.id,
        name: nameIn.value.trim(),
        age: ageIn.value.trim(),
        gender: genderIn.value.trim(),
        course: courseIn.value.trim(),
        email: emailIn.value.trim()
      };
      if (i > -1) list[i] = updated;
      saveStorage(list);

      // re-render this row
      tr.replaceWith(renderRowAndReturn(updated, tr.parentElement));
    });
    actionTd.appendChild(saveBtn);

    const cancelBtn = document.createElement('button');
    cancelBtn.type = 'button';
    cancelBtn.textContent = 'Cancel';
    cancelBtn.addEventListener('click', () => {
      // restore original row from storage (in case somebody else edited)
      const current = loadStorage().find(s => s.id === student.id) || student;
      tr.replaceWith(renderRowAndReturn(current, tr.parentElement));
    });
    actionTd.appendChild(cancelBtn);

    tr.appendChild(actionTd);
  }

  function renderRowAndReturn(student, tbody) {
    const newTr = document.createElement('tr');
    newTr.dataset.id = student.id;
    newTr.appendChild(makeTd(student.name));
    newTr.appendChild(makeTd(student.age));
    newTr.appendChild(makeTd(student.gender));
    newTr.appendChild(makeTd(student.course));
    newTr.appendChild(makeTd(student.email));

    const actionTd = document.createElement('td');

    const editBtn = document.createElement('button');
    editBtn.type = 'button';
    editBtn.textContent = 'Edit';
    editBtn.style.marginRight = '6px';
    editBtn.addEventListener('click', () => enterEditMode(newTr, student));
    actionTd.appendChild(editBtn);

    const delBtn = document.createElement('button');
    delBtn.type = 'button';
    delBtn.textContent = 'Delete';
    delBtn.style.backgroundColor = 'red';
    delBtn.addEventListener('click', () => {
      const list = loadStorage().filter(s => s.id !== student.id);
      saveStorage(list);
      newTr.remove();
    });
    actionTd.appendChild(delBtn);

    newTr.appendChild(actionTd);
    tbody.appendChild(newTr);
    return newTr;
  }

  // initialize table and load saved rows
  const results = ensureResultsTable();
  const tbody = results.querySelector('#results-body');
  const saved = loadStorage();
  saved.forEach(s => renderRowAndReturn(s, tbody));

  // exposed function to add new student
  window.submitt = function() {
    const name = document.getElementById('name').value.trim();
    const age = document.getElementById('age').value.trim();
    const email = document.getElementById('email').value.trim();
    const course = document.getElementById('course').value || '';
    const gender = document.querySelector('input[name="gender"]:checked')?.value || '';

    if (!name && !age && !email) return;

    const student = {
      id: Date.now().toString(),
      name, age, gender, course, email
    };

    const list = loadStorage();
    list.push(student);
    saveStorage(list);

    renderRowAndReturn(student, tbody);

    // clear form
    document.getElementById('name').value = '';
    document.getElementById('age').value = '';
    document.getElementById('email').value = '';
    document.getElementById('course').selectedIndex = 0;
    const checked = document.querySelector('input[name="gender"]:checked');
    if (checked) checked.checked = false;
  };
});
// ...existing code...