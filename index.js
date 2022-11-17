// TO DO: Clean up code
// TO DO: Remove extranious console logs
// STRETCH TO DO: Make date not grey why the hell is that happening
// STRETCH TO DO: If they have already selected an end date adn they change their start date,
// run the function to find the nearest appointment and render the info in the cloud 

document.addEventListener("DOMContentLoaded", function() {
    initializeGEAL()
    renderNavBar()
    createAlertListener()
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
        datePicker()
    })
}

let locationNames = []
let locationInfo = []
let validStates = []
let stateSorter
let currentLocationId

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
            stateButtonText.innerText = stateSorter
            renderLocations(stateSorter)
            console.log(stateButtonText)       
        })
        stateSelector.appendChild(generateOptions)
    })
}

let nameNoAbbreviation

function renderLocations(stateSorter) {
    const locationSelector = document.getElementById('location-selector')
    console.log(`State Sorter: ${stateSorter}`)
    while (locationSelector.firstChild) {
        locationSelector.removeChild(locationSelector.firstChild)
    }
    locationNames.sort()
    // let validLocations = locationNames.filter(location => (`${location[0] + location[1]}`) === stateSorter)
    // console.log(typeof validLocations, `Valid Locations: ${[validLocations]}`)
    let validLocations = []
    locationNames.forEach(stateValidator)
    function stateValidator(location){
        if ((`${location[0] + location[1]}`) === stateSorter){
            validLocations.unshift(location)
        }
    }
    // console.log(`Valid Locations ${validLocations}`)
    validLocations.forEach(renderLocationDropdown)
    function renderLocationDropdown(location){
        console.log(`Location: ${location}`)
        const generateOptions = document.createElement('button')
        generateOptions.innerText = location
        generateOptions.className = "dropdown-item"
        const stringName = `${location}`
        generateOptions.id = location.locationId
        console.log(`Id: ${generateOptions.id}`)
        nameNoAbbreviation = stringName.substring(4)
        console.log(`Name: ${nameNoAbbreviation}`)
        console.log(generateOptions)
        // grab the state abbrevs. and make them the IDs of each location so we can filter with them
        locationSelector.appendChild(generateOptions)
        generateOptions.addEventListener('click', (e) =>{
            e.preventDefault()
            renderLocationInfo(nameNoAbbreviation)     
        })
    }
}

function renderLocationInfo(locationInput){
    let addyPlaceholder = document.getElementById('locationAddress')
    let namePlaceholder = document.getElementById('locationName')
    let phonePlaceholder = document.getElementById('locationPhone')
    let locationMenu = document.getElementById('location-menu')
    let cityStatePlaceholder = document.getElementById('locationCityState')
    locationInfo.forEach((location) => {
        if (location.name === locationInput) {
            // console.log(location)
            currentLocationId = location.locationId
            // console.log(currentLocationId)
            addyPlaceholder.innerText = location.address
            namePlaceholder.innerText = location.name
            phonePlaceholder.innerText = location.phoneNumber
            locationMenu.innerText = location.name
            cityStatePlaceholder.innerText = location.city + ", " + location.state
            generateSoonestAppt(location.locationId)
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

let monthWord

let cloudApptInfo
let cloudApptInfoAgain
let cloudApptHeader

// converts the month in number to the month word src="https://codingbeautydev.com/blog/javascript-convert-month-number-to-name/#:~:text=To%20convert%20a%20month%20number%20to%20a%20month%20name%2C%20create,a%20specified%20locale%20and%20options.&text=Our%20getMonthName()%20function%20takes,the%20month%20with%20that%20position."
function getMonthName(monthNumber) {
    const date = new Date();
    date.setMonth(monthNumber - 1);
    monthWord = date.toLocaleString('en-US', { month: 'long' });
}

// TO DO: If we have extra time we can make the start time not in military time
function generateSoonestAppt(locationId) {
    let JSONcontainer
    fetch(`https://ttp.cbp.dhs.gov/schedulerapi/slots?orderBy=soonest&limit=1&locationId=${locationId}&minimum=1`)
    .then(response => response.json())
    .then(appointmentData => {
        JSONcontainer = appointmentData
        cloudApptInfo = document.getElementById("timeAptInfo")
        cloudApptInfoAgain = document.getElementById("dateAptInfo")
        cloudApptHeader = document.getElementById("appointmentHeader")
        cloudApptInfoAgain.innerText = ("Would you like to set an alert for this location?")
        if (JSONcontainer.length != 0){
            console.log(JSONcontainer)
            cloudApptHeader.style.display = "block"
            appointmentTimeData = appointmentData[0].startTimestamp
            appointmentDuration = appointmentData[0].duration
            appointmentStartTime = appointmentTimeData.slice(11)
            appointmentMonth = appointmentTimeData.substring(5,7)
            getMonthName(appointmentMonth)
            appointmentDay = appointmentTimeData.substring(8,10)
            appointmentYear = appointmentTimeData.substring(0,4)
            appointmentDate = `${appointmentDay} ${monthWord} ${appointmentYear}`
            appointmentTimestamp = appointmentData[0].startTimestamp
            cloudApptInfo.innerText = `${appointmentDate} at ${appointmentStartTime}`
            displayToggleForm()
        } else {
            cloudApptHeader.style.display = 'block'
            cloudApptInfo.innerText = ("No available appointments at this location.")
            displayToggleForm()
        }
    })
}

function createAlertListener() {
    // console.log("I was invoked!")
    let alertForm = document.getElementById('alertForm')
    alertForm.addEventListener('submit', function (e) {
        e.preventDefault()
        setAnAlert()
    })
}

function alertMe() {
    alert(`An appointment has become available at ${nameNoAbbreviation}.`)
    window.open('https://ttp.cbp.dhs.gov/schedulerui/schedule-interview/location?lang=en&vo=true')
}

function setAnAlert() {
    let JSONcontainer = []
    fetch(`https://ttp.cbp.dhs.gov/schedulerapi/locations/${currentLocationId}/slots?startTimestamp=${desiredDateStart}T00%3A00%3A00&endTimestamp=${desiredDateEnd}T00%3A00%3A00`)
    .then(response => response.json())
    .then(appointmentData => {
        let validAppointment = appointmentData.find((appointmentSlot) => appointmentSlot.active === 1 && (Date.parse(appointmentSlot.timestamp) >= Date.now()))
            if (validAppointment !== undefined) {
                JSONcontainer.unshift(validAppointment)
                alertChime.play()
                alertMe()
            } else {
                console.log(validAppointment);
                console.log(JSONcontainer)
                console.log("Searching for an appointment...")
                setTimeout(setAnAlert, 5000)
            }
    }) 
}

function displayToggleForm() {
    cloudBottomBox.style.display = 'block'
    let toggleOn = document.querySelector('.btn.btn-default.active.toggle-off')
    let toggleOff = document.querySelector('.btn.btn-primary.toggle-on')
    toggleOff.addEventListener('click', function (e) {
        formInstructions.style.display = 'none'
        formBox.style.display = 'none'
    })
    toggleOn.addEventListener('click', function (e) {
        formInstructions.style.display = 'block'
        formBox.style.display = 'block'
    })
}

let today = new Date();
let todayFuture
let dd = String(today.getDate()).padStart(2, '0');
let mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
let yyyy = today.getFullYear();
let yyyyf = (parseInt(yyyy) + 3)

today = `${yyyy}-${mm}-${dd}`
todayFuture = `${yyyyf}-${mm}-${dd}`

let endDate
let startDate

function generateApptInRange(){
    let JSONcontainer = []
    let validAppointment
    fetch(`https://ttp.cbp.dhs.gov/schedulerapi/locations/${currentLocationId}/slots?startTimestamp=${desiredDateStart}T00%3A00%3A00&endTimestamp=${desiredDateEnd}T00%3A00%3A00`)
    .then(response => response.json())
    .then(appointmentData => {
        validAppointment = appointmentData.find((appointmentSlot) => appointmentSlot.active === 1 && (Date.parse(appointmentSlot.timestamp) >= Date.now()))
            if (validAppointment !== undefined) {
                JSONcontainer.unshift(validAppointment)
                console.log(JSONcontainer)
                appointmentTimeData = validAppointment.timestamp
                appointmentDuration = validAppointment.duration
                appointmentStartTime = appointmentTimeData.slice(11)
                appointmentMonth = appointmentTimeData.substring(5,7)
                getMonthName(appointmentMonth)
                appointmentDay = appointmentTimeData.substring(8,10)
                appointmentYear = appointmentTimeData.substring(0,4)
                appointmentDate = `${appointmentDay} ${monthWord} ${appointmentYear}`
                appointmentTimestamp = validAppointment.timestamp
                console.log(JSONcontainer.length)
                cloudApptInfo.innerText = `${appointmentDate} at ${appointmentStartTime}`
            } else {
                alert("There are no appointments in this range yet! Set up an alert for this location.")
            }
    })
            
} 

function datePicker() {
    startDate = document.getElementById('startDate')
    endDate = document.getElementById('endDate')
    startDate.value = `${today}`
    startDate.min = `${today}`
    endDate.value = ``
    endDate.min = `${today}`
    let startDatepicker = document.getElementById('startDate');
    desiredDateStart = `${today}`
    startDatepicker.onchange = e => {
        e.preventDefault()
        desiredDateStart = e.target.value
        endDate.min = `${startDate.value}`
        }
    let endDatePicker = document.getElementById('endDate');
    desiredDateEnd = endDatePicker.value
    endDatePicker.onchange = e => {
        e.preventDefault()
        desiredDateEnd = e.target.value
        console.log(desiredDateEnd)
        startDate.max = `${desiredDateEnd}`
        // generateApptInRange(currentLocationId)
        generateApptInRange()
        endDatePicker.value = ``
        startDatepicker.value = `${today}` 
    }
}