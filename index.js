document.addEventListener("DOMContentLoaded", function() {
    fetch('https://ttp.cbp.dhs.gov/schedulerapi/locations/?temporary=false&inviteOnly=false&operational=true&serviceName=Global%20Entry')
    .then(response => response.json())
    .then(locationData => {
        generateDropDownOptions(locationData)
        console.log(locationData)
    })
})

let locationNames = []
let locationNamesWithIds = []
let validStates = []

function generateDropDownOptions(locationData){
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
    locationNames.sort()
    locationNames.forEach((location) => {
        const locationSelector = document.getElementById('location-selector')
        const generateOptions = document.createElement('option')
        generateOptions.innerText = location
        locationSelector.appendChild(generateOptions)
    })
    validStates.sort()
    validStates.forEach((state) => {
        const stateSelector = document.getElementById('state-selector')
        const generateOptions = document.createElement('option')
        generateOptions.innerText = state
        stateSelector.appendChild(generateOptions)
    })
    const stateSelector = document.getElementById('state-selector')
    stateSelector.onchange = () => {
        alert("You selected a state!")
    }
}