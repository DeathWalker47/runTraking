import leaflet from 'leaflet';
const form = document.querySelector('.form');
const containerWorkouts = document.querySelector('.workouts');
const inputType = document.querySelector('.form__input--type');
const inputDistance = document.querySelector('.form__input--distance');
const inputDuration = document.querySelector('.form__input--duration');
const inputTemp = document.querySelector('.form__input--temp');
const inputClimp = document.querySelector('.form__input--climb');
const sidebar = document.querySelector('.sidebar');

class Workout {
  date = new Date();
  id = (Date.now() + '').slice(-10);

  constructor(coords, distance, duration) {
    this.coords = coords;
    this.distance = distance;
    this.duration = duration;
  }

  _setDescr() {
    if (this.type === 'running') {
      this.description = `Пробежка ${new Intl.DateTimeFormat('ru-RU').format(this.date)}`;
    }
    if (this.type === 'cycling') {
      this.description = `Велотренировка ${new Intl.DateTimeFormat('ru-RU').format(this.date)}`;
    }
  }
}

class Running extends Workout {
  type = 'running';
  constructor(coords, distance, duration, temp) {
    super(coords, distance, duration);
    this.temp = temp;
    this.calculatePace();
    this._setDescr();
  }
  calculatePace() {
    this.pace = this.duration / this.distance;
  }
}
class Cycling extends Workout {
  type = 'cycling';

  constructor(coords, distance, duration, climb) {
    super(coords, distance, duration);
    this.climb = climb;
    this.calculateSpeed();
    this._setDescr();
  }

  calculateSpeed() {
    this.speed = this.distance / this.duration / 60;
  }
}

class App {
  #map;
  #mapEv;
  #workouts = [];
  #markersArr = [];
  constructor() {
    //получение метосположения
    this._getPosition();
    //Получение данных из локал
    this._getLocalStorageData();
    //обработчики событтия
    form.addEventListener('submit', this._newWorkout.bind(this));
    inputType.addEventListener('change', this._toggleClimbField);
    containerWorkouts.addEventListener('click', this._moveToWorkout.bind(this));

    document.querySelector('.sort-btns__btns').addEventListener('click', this._sortType);
    document.addEventListener('DOMContentLoaded', function() {
      const sortBy = localStorage.getItem('sortBy');
      if (sortBy === 'distance') {
        app.sortElements('distance');
      } else if (sortBy === 'time') {
        app.sortElements('time');
      } else {
        app.sortElements();
      }
    });
  }
  _sortType(e) {
    const sortBy = e.target.dataset.sortBy;
    if (!sortBy) return;
    localStorage.setItem('sortBy', sortBy);
    app.sortElements(sortBy);
  }
  _getPosition() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(this._loadMap.bind(this), () => {
        console.log('Нельзя получить ваше местоположение');
      });
    }
  }
  _loadMap(position) {
    const { latitude } = position.coords;
    const { longitude } = position.coords;
    const coords = [latitude, longitude];

    this.#map = L.map('map').setView(coords, 15);

    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '© OpenStreetMap'
    }).addTo(this.#map);

    this.#map.locate({ setView: true, maxZoom: 16 });

    //Обработка кликов по карте
    this.#map.on('click', this._showForm.bind(this));
    document.querySelector('.sort-btns__reset').addEventListener('click', this.reset);
    document.querySelector('.sidebar__top').addEventListener('click', this.addClassSidebar);

    document.querySelector('.btn-type-sort-distance').addEventListener('click', (e) => {
      this.sortElements('distance');
      e.currentTarget.classList.add('btn-type--active')
      if(document.querySelector('.btn-type-sort-time').classList.contains('btn-type--active')) document.querySelector('.btn-type-sort-time').classList.remove('btn-type--active')
    });

    document.querySelector('.btn-type-sort-time').addEventListener('click', (e) => {
      app.sortElements('time');
      e.currentTarget.classList.add('btn-type--active')
      if(document.querySelector('.btn-type-sort-distance').classList.contains('btn-type--active')) document.querySelector('.btn-type-sort-distance').classList.remove('btn-type--active')
    });


    this.#workouts.forEach((el) => {
      this._displayWorkout(el);
    });
  }
  _showForm(e) {
    this.#mapEv = e;
    form.classList.remove('hidden');
    if (!sidebar.classList.contains('sidebar--active')) {
      sidebar.classList.add('sidebar--active');
    } else {
      sidebar.classList.remove('sidebar--active');
    }
  }
  _hidenForm() {
    inputDistance.value = inputDuration.value = inputClimp.value = inputTemp.value = '';
    form.classList.add('hidden');
  }
  _toggleClimbField() {
    inputClimp.closest('.form__row').classList.toggle('form__row--hidden');
    inputTemp.closest('.form__row').classList.toggle('form__row--hidden');
  }
  _newWorkout(e) {
    const areNumbers = (...numbers) => numbers.every((num) => Number.isFinite(num));

    const areNumbersPositive = (...numbers) => numbers.every((num) => num > 0);

    e.preventDefault();
    const { lat, lng } = this.#mapEv.latlng;
    let workout;

    // данные из формы
    const type = inputType.value;
    const distance = +inputDistance.value;
    const duration = +inputDuration.value;
    const climb = +inputClimp.value;
    // валидные лии введенные данные

    // Если пробежка - то обьект ран
    if (type === 'running') {
      const temp = +inputTemp.value;
      if (!areNumbers(distance, duration, temp) || !areNumbersPositive(distance, duration, temp)) return alert('Введите положительное число');
      workout = new Running([lat, lng], distance, duration, temp);
    }
    //Если велотренировака  - сайклинг
    if (type === 'cycling') {
      const cycling = +inputClimp.value;
      if (!areNumbers(distance, duration, cycling) || !areNumbersPositive(distance, duration)) return alert('Введите положительное число');
      workout = new Cycling([lat, lng], distance, duration, climb);
    }
    // Добавить нвоый обьек в массив тренировок
    this.#workouts.push(workout);
    console.log(workout);

    //отобразить тренировку на карте
    this._displayWorkout(workout);
    //отобрать на списке
    this._displayWorkoutSidebar(workout);
    //Спрятать форму и поля ввода
    this._hidenForm();

    // добавить тренировки в хранилище
    this._addWorkoutsLocalStorage();

    if (sidebar.classList.contains('sidebar--active')) sidebar.classList.remove('sidebar--active');


    document.querySelector('.footer__copyright-block').classList.add('footer__copyright-block--active');
    document.querySelector('body').focus();
    this.sortElements();

    document.querySelector('.sort-btns__reset').classList.remove('hidden')
    document.querySelector('.sort-btns').classList.remove('hidden')
  }

  _displayWorkout(workout) {
    var myIcon = L.icon({
      iconUrl: '../img/marker-icon.png',
      iconRetinaUrl: '../img/marker-icon.png',
      iconSize: [24, 40],
      iconAnchor: [16, 25],
      popupAnchor: [-3, -76],
      riseOnHover: true
    });
    const marker = L.marker(workout.coords, { icon: myIcon });
    marker
      .bindPopup(
        L.popup({
          maxWidth: 200,
          closeOnClick: false,
          // autoClose: false,
          className: `${workout.type}-popup`,
          offset: (0, 0)
        })
      )
      .setPopupContent(`${workout.type === 'running' ? '🏃' : '🚵‍♂️'} ${workout.description}`)
      .openPopup();
    marker.addTo(this.#map);
    // добавление маркера в массив
    this.#markersArr.push(marker);

    // создание границ видимости карты, чтобы включить все маркеры
    const bounds = new L.LatLngBounds();
    this.#markersArr.forEach(function (marker) {
      bounds.extend(marker.getLatLng());
    });

    // масштабирование карты, чтобы включить все маркеры
    this.#map.fitBounds(bounds);

    if (this.#markersArr.length == 1) {
      this.#map.setView(marker.getLatLng(), 15);
    }
  }
  _displayWorkoutSidebar(workout) {
    let html = `
    <li class="workout workout--${workout.type}" data-id="${workout.id}" data-distance="${workout.distance}" data-time="${workout.duration}">
      <h2 class="workout__title">${workout.description}</h2>
      <div class="workout__details">
        <span class="workout__icon">${workout.type === 'running' ? '🏃' : '🚵‍♂️'}</span>
        <span class="workout__value">${workout.distance}</span>
        <span class="workout__unit">км</span>
      </div>
      <div class="workout__details">
        <span class="workout__icon">⏱</span>
        <span class="workout__value">${workout.duration}</span>
        <span class="workout__unit">мин</span>
      </div>
    `;
    if (workout.type === 'running') {
      html += `
       <div class="workout__details">
            <span class="workout__icon">📏⏱</span>
            <span class="workout__value">${workout.pace.toFixed(2)}</span>
            <span class="workout__unit">мин/км</span>
          </div>
          <div class="workout__details">
            <span class="workout__icon">👟⏱</span>
            <span class="workout__value">${workout.temp}</span>
            <span class="workout__unit">шаг/мин</span>
          </div>
        </li>
            `;
    }
    if (workout.type === 'cycling') {
      html += `
         <div class="workout__details">
              <span class="workout__icon">📏⏱</span>
              <span class="workout__value">${workout.speed.toFixed(2)}</span>
              <span class="workout__unit">км/ч</span>
            </div>
            <div class="workout__details">
              <span class="workout__icon">🏔</span>
              <span class="workout__value">${workout.climb}</span>
              <span class="workout__unit">м</span>
            </div>
        </li>
            `;
    }
    containerWorkouts.insertAdjacentHTML('afterbegin', html);
    // form.insertAdjacentHTML('afterend', html);
  }
  _moveToWorkout(e) {
    const workoutElem = e.target.closest('.workout');
    if (!workoutElem) return;
    const workout = this.#workouts.find((elem) => elem.id === workoutElem.dataset.id);
    this.#map.setView(workout.coords, 15, {
      animate: true,
      pan: {
        duration: 1
      }
    });
    if (sidebar.classList.contains('sidebar--active')) sidebar.classList.remove('sidebar--active');
  }

  _addWorkoutsLocalStorage() {
    // localStorage.setItem('workouts', JSON.stringify(this.#workouts));
     // Сортировка массива #workouts по атрибуту data-distance в порядке убывания
  this.#workouts.sort((a, b) => parseInt(b.distance) - parseInt(a.distance));
  localStorage.setItem('workouts', JSON.stringify(this.#workouts));
  }
  _getLocalStorageData() {
    const data = JSON.parse(localStorage.getItem('workouts'));
    if (!data) return;

    // this.#workouts = data;

    // this.#workouts.forEach((el) => {
    //   this._displayWorkoutSidebar(el);
    // });

    //сортировка
    data.sort((a, b) => parseInt(b.distance) - parseInt(a.distance));
    this.#workouts = [];
    data.forEach((el) => {
      this.#workouts.push(el);
      this._displayWorkoutSidebar(el);
    });
    document.querySelector('.footer__copyright-block').classList.add('footer__copyright-block--active');
  }
  reset() {
    localStorage.removeItem('workouts');
    location.reload();
    document.querySelector('.sort-btns__reset').classList.add('hidden')
    document.querySelector('.sort-btns').classList.add('hidden')
  }
  addClassSidebar() {
    // sidebar.classList.toggle('sidebar--active');
    if (!sidebar.classList.contains('sidebar--active')) {
      sidebar.classList.add('sidebar--active');
    } else {
      sidebar.classList.remove('sidebar--active');
      if(!form.classList.contains('hidden')) form.classList.add('hidden')
    }
  }

   sortElements(sortBy = 'distance') {
    let elements;
  if (sortBy === 'distance') {
    elements = document.querySelectorAll('[data-distance]');

    document.querySelector('.btn-type-sort-distance').classList.add('btn-type--active')
    if(document.querySelector('.btn-type-sort-time').classList.contains('btn-type--active')) document.querySelector('.btn-type-sort-time').classList.remove('btn-type--active')
  } else if (sortBy === 'time') {
    elements = document.querySelectorAll('[data-time]');

    document.querySelector('.btn-type-sort-time').classList.add('btn-type--active')
    if(document.querySelector('.btn-type-sort-distance').classList.contains('btn-type--active')) document.querySelector('.btn-type-sort-distance').classList.remove('btn-type--active')

  }
  let elementsArray = Array.from(elements);
  elementsArray.sort(function(a, b) {
    if (sortBy === 'distance') {
      return parseInt(b.getAttribute('data-distance')) - parseInt(a.getAttribute('data-distance'));
    } else if (sortBy === 'time') {
      return parseInt(b.getAttribute('data-time')) - parseInt(a.getAttribute('data-time'));
    }
  });
  // Удаляем все элементы с родительского элемента
  const parent = document.querySelector('.workouts'); // Замените 'parent-element' на ID родительского элемента
  while (parent.firstChild) {
    parent.removeChild(parent.firstChild);
  }
  elementsArray.forEach(function(element) {
    parent.appendChild(element);
  });
  localStorage.setItem('sortBy', sortBy);
}
}

const app = new App();
// function updateInterface() {
//   const trainingList = document.getElementById('training-list');
//   trainingList.innerHTML = '';

//   // обновляем карту (если требуется)
//   const map = document.getElementById('map');
//   map.setCenter(initialCenter); // устанавливаем начальный центр карты
//   map.setZoom(initialZoom); // устанавливаем начальный уровень зума карты
// }
