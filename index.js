document.addEventListener("DOMContentLoaded", function() {
    fetch('https://ttp.cbp.dhs.gov/schedulerapi/locations/?temporary=false&inviteOnly=false&operational=true&serviceName=Global%20Entry')
    .then(response => response.json())
    .then(locationData => {
        pullData(locationData)
        // console.log(locationData)
    })
})

let locationNames = []
let locationNamesWithIds = []
let validStates = []
let stateSorter;

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
    locationNamesWithIds.unshift({
        name: `${location.name}`,
        locationId: `${location.id}`
        })
    })
    // sorts alphabetically
    validStates.sort()
    renderStates()
}

function renderStates() {
    console.log(validStates)
    validStates.forEach((state) => {
        // console.log(state)
        const stateSelector = document.getElementById('state-selector')
        const generateOptions = document.createElement('button')
        generateOptions.innerText = state
        generateOptions.className = "dropdown-item"
        // event listener for when a state is selected
        generateOptions.addEventListener('click', (e) =>{
            e.preventDefault()
            stateSorter = e.target.innerText
            filterLocationsByState(stateSorter)        
        })
        stateSelector.appendChild(generateOptions)
    })
}

function filterLocationsByState(stateSorter) {
// sorts alphabetically
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
            // grab the state abbrevs. and make them the IDs of each location so we can filter with them
            locationSelector.appendChild(generateOptions)
        }
    })
}