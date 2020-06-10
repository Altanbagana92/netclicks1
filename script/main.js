const leftMenu = document.querySelector('.left-menu')
const hamburger = document.querySelector('.hamburger')
const tvShowsList = document.querySelector('.tv-shows__list')
const modal = document.querySelector('.modal')
const imgURL = 'https://image.tmdb.org/t/p/w185_and_h278_bestv2'
const tvShows = document.querySelector('.tv-shows')

const tvCardImg = document.querySelector('.tv-card__img')
const modalTitle = document.querySelector('.modal__title')
const genresList = document.querySelector('.genres-list')
const rating = document.querySelector('.rating')
const description = document.querySelector('.description')
const modalLink = document.querySelector('.modal__link')
const searchForm = document.querySelector('.search__form')
const searchFormInput = document.querySelector('.search__form-input')
const preloader = document.querySelector('.preloader')
const dropdown = document.querySelectorAll('.dropdown')
const tvShowHead = document.querySelector('.tv-shows__head')
const posterWrapper = document.querySelector('.poster__wrapper')
const modalContent = document.querySelector('.modal__content')
const pagination = document.querySelector('.pagination')

const loading = document.createElement('div')
loading.className = 'loading'

// DB

const DBService = class {

    constructor() {
        this.SERVER = 'https://api.themoviedb.org/3'
        this.API_KEY = '959051f5f3c5715979803fe3fabfca31'
    }
    getData = async (url) => {
        const res = await fetch(url);
        if (res.ok) {
            return res.json();
        } else {
            throw new Error(`Не удалось получить данные по адресу ${url}`)
        }
    }

    getTestData = () => {
        return this.getData('test.json')
    }

    getTestCard = () => {
        return this.getData('card.json')
    }

    getSearchResult = (query) => {
        this.temp = `${this.SERVER}/search/tv?api_key=${this.API_KEY}&query=${query}&language=ru-RU`
        return this.getData(this.temp)
    }

    getNextPage = page => {
        return this.getData(this.temp + '&page=' + page)
    }

    getTvShow = (query) => {
        return this.getData(`${this.SERVER}/tv/${query}?api_key=${this.API_KEY}&language=ru-RU`)
    }

    getTopRated = () => this.getData(`${this.SERVER}/tv/top_rated?api_key=${this.API_KEY}&language=ru-RU`)
    getAiringToday = () => this.getData(`${this.SERVER}/tv/airing_today?api_key=${this.API_KEY}&language=ru-RU`)
    getPopular = () => this.getData(`${this.SERVER}/tv/popular?api_key=${this.API_KEY}&language=ru-RU`)
    getWeek = () => this.getData(`${this.SERVER}/tv/on_the_air?api_key=${this.API_KEY}&language=ru-RU`)
}

const dbService = new DBService()



const renderCard = (response, target) => {
    tvShowsList.textContent = ""

    if (!response.total_results) {
        loading.remove();
        tvShowHead.innerHTML = "По вашему запросу ничего не найдено"
        tvShowHead.style.color = 'red'
        return;
    }
    tvShowHead.innerHTML = target ? target.textContent : "Результат поиска"
    tvShowHead.style.color = 'green'

    response.results.forEach(item => {
        //console.log(item);

        const {
            backdrop_path: backdrop,
            name: title,
            poster_path: poster,
            vote_average: vote,
            id
        } = item;

        const voteElem = vote ? `<span class="tv-card__vote">${vote}</span>` : "";
        const backdropIMG = backdrop ? imgURL + backdrop : "";
        const posterIMG = poster ? imgURL + poster : 'img/no-poster.jpg';


        const card = document.createElement('li')
        card.classList.add('tv-show__item')
        card.innerHTML = `
            <a href="#" id=${id} class="tv-card">
                ${voteElem}
                <img class="tv-card__img"
                        src="${posterIMG}"
                        data-backdrop="${backdropIMG}"
                        alt="${title}">
                <h4 class="tv-card__head">${title}</h4>
            </a>
            `;
        loading.remove()
        tvShowsList.append(card)
    })

    pagination.innerHTML = ""

    if (!target&&(response.total_pages > 1)) {
        for (let i = 1; i <= response.total_pages; i++) {
            pagination.innerHTML += `<li><a href ="#" class = "pages">${i} </a></li>`
        }
    }

}

searchForm.addEventListener('submit', event => {
    event.preventDefault()
    const value = searchFormInput.value.trim();
    if (value) {
        tvShows.append(loading)
        dbService.getSearchResult(value).then(renderCard);
    }
    searchFormInput.value = ""
});

tvShows.append(loading)
dbService.getTestData().then(renderCard);

//открытие закрытие меню

const closeDropdown = () => {
    dropdown.forEach(item => {
        item.classList.remove('active')

    })
};

hamburger.addEventListener('click', () => {
    event.preventDefault();
    leftMenu.classList.toggle('openMenu')
    hamburger.classList.toggle('open')
    closeDropdown();
});

document.addEventListener('click', (event) => {
    event.preventDefault();
    if (!event.target.closest('.left-menu')) {
        leftMenu.classList.remove('openMenu')
        hamburger.classList.remove('open')
        closeDropdown();
    }
});

leftMenu.addEventListener('click', event => {
    event.preventDefault();
    const target = event.target;
    const dropdown = target.closest('.dropdown')
    if (dropdown) {
        dropdown.classList.toggle('active');
        leftMenu.classList.add('openMenu')
        hamburger.classList.add('open')

    }

    if (target.closest('#top-rated')) {
        dbService.getTopRated().then((response) => renderCard(response, target));
    }
    if (target.closest('#popular')) {
        dbService.getPopular().then((response) => renderCard(response, target));
    }
    if (target.closest('#week')) {
        dbService.getWeek().then((response) => renderCard(response, target));
    }
    if (target.closest('#today')) {
        dbService.getAiringToday().then((response) => renderCard(response, target));
    }
    if (target.closest('#search')) {
        tvShowsList.textContent = '';
        tvShowHead.textContent = '';
    }
})


// открытие модального окна

tvShowsList.addEventListener('click', event => {

    event.preventDefault();
    const target = event.target
    const card = target.closest('.tv-card')
    if (card) {

        preloader.style.display = 'block'
        // console.log(card.id);

        dbService
            .getTvShow(card.id)
            .then(data => {


                if (data.poster_path) {
                    console.log(imgURL + data.poster_path);
                    tvCardImg.src = imgURL + data.poster_path;
                    tvCardImg.alt = data.name
                    posterWrapper.style.display = ''
                    modalContent.style.padding = ''
                } else {
                    posterWrapper.style.display = 'none'
                    modalContent.style.padding = '25px'
                }

                modalTitle.textContent = data.name;
                // genresList.innerHTML = data.genres.reduce((acc, item) => {
                //     return `${acc}<li>${item.name}</li>`
                // },'')
                genresList.innerHTML = ""
                for (const item of data.genres) {
                    genresList.innerHTML += `<li>${item.name}</li>`
                }
                rating.innerHTML = data.vote_average
                description.textContent = data.overview
                modalLink.href = data.homepage
            })
            .then(() => {
                document.body.style.overflow = 'hidden'
                modal.classList.remove('hide')
            })
            .finally(() => {
                preloader.style.display = '';
                loading.remove()
            })
    }

})

// закрытие окна

modal.addEventListener('click', event => {
    if (event.target.closest('.cross') ||
        (event.target.classList.contains('modal'))) {
        document.body.style.overflow = '';
        modal.classList.add('hide');
    }
})





// смена карточки

function changeImage(event) {
    const target = event.target;
    const card = target.closest('tv-shows__item');
    //console.log(card)
    if (card) {
        const img = card.querySelector('.tv-card__img');
        if (img.dataset.backdrop) {
            [img.src, img.dataset.backdrop] = [img.dataset.backdrop, img.src];
        }
    }
};

tvShowsList.addEventListener('mouseover', changeImage);
tvShowsList.addEventListener('mouseout', changeImage);

pagination.addEventListener('click', (event) => {
    event.preventDefault();
    const target = event.target;
    if (target.classList.contains('pages')) {
        tvShows.append(loading)
        dbService.getNextPage(target.textContent).then(renderCard)
    }
})