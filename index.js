document.addEventListener("DOMContentLoaded", function() {
    initializeGEAL()
    datePicker()
    renderNavBar()
})

function renderNavBar() {
    // nav bar help from https://www.youtube.com/watch?v=1E-oj_81Caw&ab_channel=WebKitCoding
    let bar1 = document.querySelector(".bar1")
    let bar2 = document.querySelector(".bar2")
    let bar3 = document.querySelector(".bar3")

    bar1.addEventListener("click", function() {
        let data1 = document.querySelector(".data1")
        data1.classList.toggle('show')
    })

    bar2.addEventListener("click", function() {
        let data2 = document.querySelector(".data2")
        data2.classList.toggle('show')
    })

    bar3.addEventListener("click", function() {
        let data3 = document.querySelector(".data3")
        data3.classList.toggle('show')
    })
}

function initializeGEAL(){
    fetch('https://ttp.cbp.dhs.gov/schedulerapi/locations/?temporary=false&inviteOnly=false&operational=true&serviceName=Global%20Entry')
    .then(response => response.json())
    .then(locationData => {
        pullData(locationData)
    })
}

let locationNames = []
let locationInfo = []
let validStates = []
let stateSorter

const alertChime = new Audio('./assets/alert-chime.mp3')

function pullData(locationData){
    locationData.forEach((location) => {
        if (location.shortName !== "Permanently Closed") {
            if (location.state !== "" && location.countryCode === "US") {
                locationNames.unshift(location.state + ": " + location.name)
                if (validStates.includes(location.state) === false) {
                    validStates.unshift(location.state)
                }
            }
        }
    locationInfo.unshift(
        {name: `${location.name}`,
        locationId: `${location.id}`,
        address: `${location.address}`,
        city: `${location.city}`,
        state: `${location.state}`,
        phoneNumber: `${location.phoneNumber}`,}
        )
    })
    validStates.sort()
    renderStates()
    renderLocations()
}

function renderStates() {
    validStates.forEach((state) => {
        const stateSelector = document.getElementById('state-selector')
        const generateOptions = document.createElement('button')
        generateOptions.innerText = state
        generateOptions.className = "dropdown-item"
        // event listener for when a state is selected
        generateOptions.addEventListener('click', (e) =>{
            e.preventDefault()
            stateSorter = e.target.innerText
            let stateButtonText = document.getElementById('state-menu')
            // I THINK WE SHOULD CONSIDER THE DROP DOWN NOT HAVING THE STATE
            // AS THE DISPLAY TEXT BECAUSE IT MAKES IT SO THE LOCATION IS MUCH TOO LONG
            // MAYBE WE CAN DISPLAY IT UNDERNEITH INSTEAD
            stateButtonText.innerText = stateSorter
            renderLocations(stateSorter)        
        })
        stateSelector.appendChild(generateOptions)
    })
}

function renderLocations(stateSorter) {
    const locationSelector = document.getElementById('location-selector')
    while (locationSelector.firstChild) {
        locationSelector.removeChild(locationSelector.firstChild)
    }
    locationNames.sort()
    locationNames.forEach((location) => {
        if ((`${location[0] + location[1]}`) === stateSorter) {
            const generateOptions = document.createElement('button')
            generateOptions.innerText = location
            generateOptions.className = "dropdown-item"
            const stringName = `${location}`
            generateOptions.id = stringName.substring(4)
            const nameNoAbbreviation = stringName.substring(4)
        // grab the state abbrevs. and make them the IDs of each location so we can filter with them
            locationSelector.appendChild(generateOptions)
            generateOptions.addEventListener('click', (e) =>{
                e.preventDefault()
                renderLocationInfo(nameNoAbbreviation)     
            })
        }
    })
}

function renderLocationInfo(locationInput){
    let addyPlaceholder = document.getElementById('locationAddress')
    let namePlaceholder = document.getElementById('locationName')
    let phonePlaceholder = document.getElementById('locationPhone')
    let locationMenu = document.getElementById('location-menu')
    let cityStatePlaceholder = document.getElementById('locationCityState')
    locationInfo.forEach((location) => {
        if (location.name === locationInput) {
            addyPlaceholder.innerText = location.address
            namePlaceholder.innerText = location.name
            phonePlaceholder.innerText = location.phoneNumber
            locationMenu.innerText = location.name
            cityStatePlaceholder.innerText = location.city + ", " + location.state
            generateApptInRange(location.locationId)
        }
    })
}

let appointmentDay
let appointmentMonth
let appointmentYear
let appointmentDate
let appointmentDateForMachine
let appointmentDuration
let appointmentStartTime
let appointmentTimeData
let desiredDateStart
let desiredDateEnd
let appointmentTimestamp

// converts the month in number to the month word src="https://codingbeautydev.com/blog/javascript-convert-month-number-to-name/#:~:text=To%20convert%20a%20month%20number%20to%20a%20month%20name%2C%20create,a%20specified%20locale%20and%20options.&text=Our%20getMonthName()%20function%20takes,the%20month%20with%20that%20position."
function getMonthName(monthNumber) {
    const date = new Date();
    date.setMonth(monthNumber - 1);
    monthWord = date.toLocaleString('en-US', { month: 'long' });
}

// TO DO: If we have extra time we can make the start time not in military time
function generateSoonestAppt(locationId) {
    fetch(`https://ttp.cbp.dhs.gov/schedulerapi/slots?orderBy=soonest&limit=1&locationId=${locationId}&minimum=1`)
    .then(response => response.json())
    .then(appointmentData => {
        let monthWord
        appointmentTimeData = appointmentData[0].startTimestamp
        appointmentDuration = appointmentData[0].duration
        appointmentStartTime = appointmentTimeData.slice(11)
        appointmentMonth = appointmentTimeData.substring(5,7)
        getMonthName(appointmentMonth)
        appointmentDay = appointmentTimeData.substring(8,10)
        appointmentYear = appointmentTimeData.substring(0,4)
        appointmentDate = `${appointmentDay} ${monthWord} ${appointmentYear}`
        appointmentTimestamp = appointmentData[0].startTimestamp
        
    })
}

function generateApptInRange(locationId){
    let JSONcontainer
    fetch(`https://ttp.cbp.dhs.gov/schedulerapi/locations/${locationId}/slots?startTimestamp=${desiredDateStart}T00%3A00%3A00&endTimestamp=${desiredDateEnd}T00%3A00%3A00`)
    .then(response => response.json())
    .then(appointmentData => {
        JSONcontainer = appointmentData
        console.log(JSONcontainer)
        let monthWord
        if (JSONcontainer.length != 0) {
            console.log(JSONcontainer.length)
            alertChime.play()
            alert(`There are ${JSONcontainer.length} appointments that match your search.`)
            window.open('https://ttp.cbp.dhs.gov/schedulerui/schedule-interview/location?lang=en&vo=true')
            // appointmentTimeData = appointmentData[0].startTimestamp
            // appointmentDuration = appointmentData[0].duration
            // appointmentStartTime = appointmentTimeData.slice(11)
            // appointmentMonth = appointmentTimeData.substring(5,7)
            // getMonthName(appointmentMonth)
            // appointmentDay = appointmentTimeData.substring(8,10)
            // appointmentYear = appointmentTimeData.substring(0,4)
            // appointmentDate = `${appointmentDay} ${monthWord} ${appointmentYear}`
            // appointmentTimestamp = appointmentData[0].startTimestamp
        } else {
            alertChime.play()
            alert("There are no appointments yet!")
        }
    })
}

// get today's date to populate the default value of the base picker

let today = new Date();
let dd = String(today.getDate()).padStart(2, '0');
let mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
let yyyy = today.getFullYear();

today = `${yyyy}-${mm}-${dd}`

function datePicker() {
    let startDate = document.getElementById('startDate')
    let endDate = document.getElementById('endDate')
    startDate.value = `${today}`
    startDate.min = `${today}`
    endDate.value = `${today}`
    endDate.min = `${today}`
    let startDatepicker = document.getElementById('startDate');
    desiredDateStart = startDatepicker.value
    startDatepicker.onchange = e => {
        e.preventDefault();
        desiredDateStart = e.target.value
        console.log(desiredDateStart)
        }  
    let endDatePicker = document.getElementById('endDate');
    desiredDateEnd = endDatePicker.value
    endDatePicker.onchange = e => {
        e.preventDefault();
        desiredDateEnd = e.target.value
        console.log(desiredDateEnd)
        }
    }
