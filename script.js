const formSearch = document.querySelector('.form-search');
const inputCitiesFrom = document.querySelector('.input__cities-from');
const dropdownCitiesFrom = document.querySelector('.dropdown__cities-from');
const inputCitiesTo = document.querySelector('.input__cities-to');
const dropdownCitiesTo = document.querySelector('.dropdown__cities-to');
const inputDateDepart = document.querySelector('.input__date-depart');
const cheapestTicket = document.getElementById('cheapest-ticket');
const otherCheapTickets = document.getElementById('other-cheap-tickets');

const CITY_API = 'http://api.travelpayouts.com/data/ru/cities.json',
    PROXY = 'https://cors-anywhere.herokuapp.com/',
    API = '853c139c883e1864a947c2d64131e004',
    calendar = 'http://min-prices.aviasales.ru/calendar_preload';

let city = [];

const getData = (url, callback) => {
    fetch(url)
    .then(res => res.json())
    .then(data => {
        callback(data);
    })
    .catch(err=>{
        console.log(err)
    })
    
}

const showCity = (input, list)=>{
    list.textContent = '';

    if(input.value !== ''){

        const filterCity = city.filter(item => {
            const fixItem = item.name.toLowerCase();
            return fixItem.startsWith(input.value.toLowerCase());
        })

        filterCity.forEach(item => {
            const li = document.createElement('li');
            li.classList.add('dropdown__city');
            li.textContent = item.name;
            list.append(li);
        })
    }
}
const handlerCity = (e, input, list) => {
    if(e.target.tagName === "LI"){
        input.value = e.target.textContent;
        list.textContent = ''; 
    }
}

inputCitiesFrom.addEventListener('input', () => {
    showCity(inputCitiesFrom, dropdownCitiesFrom);
});
inputCitiesTo.addEventListener('input', () => {
    showCity(inputCitiesTo, dropdownCitiesTo);
});

dropdownCitiesFrom.addEventListener('click', (e)=>{
    handlerCity(e, inputCitiesFrom, dropdownCitiesFrom);
});
dropdownCitiesTo.addEventListener('click', (e)=>{
    handlerCity(e, inputCitiesTo, dropdownCitiesTo);
});
const getNameCity = code =>{
    const objCity = city.find(item => item.code === code)
    return objCity.name;
}

const getDate = date => {
    return new Date(date).toLocaleString('ru', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    })
}
const getChanges = num => {
    if(num){
        return num === 1? 'С одной пересадкой' : 'Несколько пересадок';
    } else {
        return 'Без пересадок'
    }
}
const createCard = (data) => {
    const ticket =document.createElement('article');
    ticket.classList.add('ticket');
    let deep = '';
    if(data){
        deep = `
        <h3 class="agent">${data.gate}</h3>
        <div class="ticket__wrapper">
            <div class="left-side">
                <a href="https://www.aviasales.ru/search/SVX2905KGD1" class="button button__buy">Купить
                    за ${data.value}₽</a>
            </div>
            <div class="right-side">
                <div class="block-left">
                    <div class="city__from">Вылет из города
                        <span class="city__name">${getNameCity(data.origin)}</span>
                    </div>
                    <div class="date">${getDate(data.depart_date)}</div>
                </div>

                <div class="block-right">
                    <div class="changes">${getChanges(data.number_of_changes)}</div>
                    <div class="city__to">Город назначения:
                        <span class="city__name">${getNameCity(data.destination)}</span>
                    </div>
                </div>
            </div>
        </div>
        `;
    } else {
        deep = `<h3>Не нашлось!</h3>`
    }
    ticket.insertAdjacentHTML('afterbegin', deep);
    return ticket;
}
const renderCheapDay = cheapTicket => {
    cheapestTicket.innerHTML = '';
    const ticket = createCard(cheapTicket[0]);
    cheapestTicket.append(ticket);
}
const renderCheapYear = cheapTicket => {
    otherCheapTickets.innerHTML = '<h2>Самые дешевые билеты на другие даты</h2>';

    cheapTicket.sort((a,b) =>{
        if(a.value > b.value) {
            return 1;
        }
        if(a.value < b.value){
            return -1;
        }
        return 0;
    })
    console.log(cheapTicket)

    for(let i = 0; i < cheapTicket.length && i < 10; i++){
        const ticket = createCard(cheapTicket[i]);
        otherCheapTickets.append(ticket)
    }
}
const renderCheap = (data, date) => {

    const cheapTicketDay = data.best_prices.filter((item) => {
       return item.depart_date === date;
    });

    renderCheapDay(cheapTicketDay);
    renderCheapYear(data.best_prices);
    // console.log(cheapTicketDay)

}

formSearch.addEventListener('submit', (e)=>{
    e.preventDefault();

    const formData = {
        from: city.find(item => inputCitiesFrom.value === item.name),
        to: city.find(item => inputCitiesTo.value === item.name),
        when: inputDateDepart.value
    }
    if(formData.from && formData.to){
        const requestData = `?depart_date=${formData.when}&origin=${formData.from.code}&destination=${formData.to.code}&one_way=true&token=${API}`;

        getData(calendar + requestData, (response) => {

            renderCheap(response, formData.when)
        })
    }
    else alert("Wrong!");


})

getData(PROXY + CITY_API, data => {
    const dataCities = data;

    city = dataCities.filter((item) => item.name);
    city.sort((a,b) =>{
        if(a.name > b.name) {
            return 1;
        }
        if(a.name < b.name){
            return -1;
        }
        return 0;
    })
});

