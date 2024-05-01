let createOption = (str, val) => {
    let item = document.createElement('option');
    item.text = str;
    item.value = val;
    return item;
}

let selectedOptions = {}

let setSortSelect = (head, sortSelect) => {

    sortSelect.append(createOption('Нет', 0));
    for (let i in head) {
        let option = createOption(head[i], Number(i) + 1)
        sortSelect.append(option);
        selectedOptions[option.value] = false
    }
}
// формируем поля со списком для многоуровневой сортировки
let setSortSelects = (data, dataForm) => {
    // выделяем ключи словаря в массив
    let head = Object.keys(data);
    // находим все SELECT в форме
    let allSelect = dataForm.getElementsByTagName('select');

    for (let j = 0; j < allSelect.length; j++) {
        //формируем опции очередного SELECT
        setSortSelect(head, allSelect[j]);
        if (j != 0) {
            allSelect[j].disabled = true
        }
    }
}


let changeNextSelect = (nextSelectId, curSelect) => {

    let nextSelect = document.getElementById(nextSelectId);
    //selectedOptions[prevSelect] = false

    nextSelect.disabled = false;
    selectedOptions[curSelect.oldValue] = false
    // в следующем SELECT выводим те же option, что и в текущем
    nextSelect.innerHTML = curSelect.innerHTML;

    // удаляем в следующем SELECT уже выбранную в текущем опцию

    if (curSelect.value != 0) {
        selectedOptions[curSelect.value] = true
        for (let key in selectedOptions) {
            if (selectedOptions[key]) {
                let options = nextSelect.options
                for (let index = 0; index < options.length; index++) {
                    if (options[index].value == key) {
                        nextSelect.remove(index)
                    }
                }
            }
        }
        //nextSelect.remove(curSelect.value);
    } else {
        let allSelect = document.getElementById('sort').getElementsByTagName('select');
        let allSelectArray = Array.from(allSelect)
        for (let j = allSelectArray.indexOf(curSelect); j < allSelect.length; j++) {
            selectedOptions[allSelect[j].oldValue] = false
            allSelect[j].value = 0
            if (j != allSelectArray.indexOf(curSelect)) {
                allSelect[j].disabled = true
            }

        }

        //nextSelect.disabled = true;
    }
    curSelect.oldValue = curSelect.value

    console.log(selectedOptions)
}

let createSortArr = (data) => {
    let sortArr = [];

    let sortSelects = data.getElementsByTagName('select');

    for (let i = 0; i < sortSelects.length; i++) {

        // получаем номер выбранной опции
        let keySort = sortSelects[i].value;
        // в случае, если выбрана опция Нет, заканчиваем формировать массив
        if (keySort == 0) {
            break;
        }
        // получаем номер значение флажка для порядка сортировки
        // имя флажка сформировано как имя поля SELECT и слова Desc
        let desc = document.getElementById(sortSelects[i].id + 'Dec').checked;
        sortArr.push({
            column: keySort - 1,
            order: desc
        });
    }
    return sortArr;
}
let sortTable = (idTable, data) => {

    // формируем управляющий массив для сортировки
    let sortArr = createSortArr(data);

    // сортировать таблицу не нужно, во всех полях выбрана опция Нет
    if (sortArr.length === 0) {
        return false;
    }
    //находим нужную таблицу
    let table = document.getElementById(idTable);
    // преобразуем строки таблицы в массив
    let rowData = Array.from(table.rows);

    // удаляем элемент с заголовками таблицы
    rowData.shift();

    //сортируем данные по возрастанию по всем уровням сортировки
    rowData.sort((first, second) => {
        for (let i = 0; i < sortArr.length; i++) {
            let key = sortArr[i].column;
            let order = sortArr[i].order;
            if (order) {
                if (key == 3) {
                    if (Number(first.cells[key].innerHTML) < Number(second.cells[key].innerHTML)) {
                        return 1;
                    } else if (Number(first.cells[key].innerHTML) > Number(second.cells[key].innerHTML)) {
                        return -1;
                    }
                } else {
                    if (first.cells[key].innerHTML < second.cells[key].innerHTML) {
                        return 1;
                    } else if (first.cells[key].innerHTML > second.cells[key].innerHTML) {
                        return -1;
                    }
                }
            } else {
                if (key == 3) {
                    if (Number(first.cells[key].innerHTML) > Number(second.cells[key].innerHTML)) {
                        return 1;
                    } else if (Number(first.cells[key].innerHTML) < Number(second.cells[key].innerHTML)) {
                        return -1;
                    }
                } else {
                    if (first.cells[key].innerHTML > second.cells[key].innerHTML) {
                        return 1;
                    } else if (first.cells[key].innerHTML < second.cells[key].innerHTML) {
                        return -1;
                    }
                }
            }

        }
        return 0;
    });

    //выводим отсортированную таблицу на страницу
    table.innerHTML = table.rows[0].innerHTML;

    rowData.forEach(item => {
        table.append(item);
    });
}

function resetSort(idTable) {
    deleteRows(idTable)
    createTable(filteredTableBackup, idTable)
    for (let key in selectedOptions) {
        selectedOptions[key] = false
    }
    let allSelect = document.getElementById('sort').getElementsByTagName('select');
    for (let j = 0; j < allSelect.length; j++) {
        if (j != 0) {
            allSelect[j].disabled = true
        }
        allSelect[j].value = 0
    }
}

document.addEventListener("DOMContentLoaded", setSortSelects(
    tableData[0],
    document.getElementById('sort')));

document.getElementById('sortFirst').onchange = () => {
    changeNextSelect('sortSecond', document.getElementById('sortFirst'))
}
document.getElementById('sortSecond').onchange = () => {
    changeNextSelect('sortThird', document.getElementById('sortSecond'))
}

document.getElementById('sortBtn').onclick = () => {
    sortTable('sightsTable', document.getElementById('sort'))
}

document.getElementById('resetSort').onclick = () => {
    resetSort('sightsTable')
}