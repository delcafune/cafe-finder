function getLocation() {
    const cards = document.querySelector(".cards");
    cards.innerHTML = "<p>Finding cafes near you... ☕</p>";

    navigator.geolocation.getCurrentPosition(showPosition, showError);
}

function showError(error) {
    const cards = document.querySelector(".cards");

    cards.innerHTML = "<p>Unable to get your location. Please allow location access and try again.</p>";
}

async function showPosition(position) {
    const latitude = position.coords.latitude;
    const longitude = position.coords.longitude;

    console.log("Latitude:", latitude);
    console.log("Longitude:", longitude);

    const { Place } =
        await google.maps.importLibrary("places");
    
    const request = {
        fields: ["displayName", "formattedAddress", "rating", "photos"],
        locationRestriction: {
            center: {
                lat: latitude,
                lng: longitude
            },
            radius: 2000
        },
        includedPrimaryTypes: ["cafe"],
        maxResultCount: 10,
    };

    const { places } = await Place.searchNearby(request);

    const cards = document.querySelector(".cards");

    cards.innerHTML = "";

    places.forEach(place => {
        const cafeName = place.displayName;
        const cafeAddress = place.formattedAddress;
        const cafeRating = place.rating;
        const cafePhoto = place.photos?.[0];

        const photoURL = cafePhoto
            ? cafePhoto.getURI({ maxWidth: 500 })
            : null;

        cards.innerHTML += `
            <div class="card">

                ${photoURL
                    ? `<img src="${photoURL}" alt="${cafeName}" class="cafe-photo">`
                    : `<div class="no-photo">☕</div>`
                }

                <h3>${cafeName}</h3>
                <p>📍 ${cafeAddress}</p>
                <p>⭐ ${cafeRating ?? "No rating yet"}</p>

                <button class="save-btn" onclick='saveCafe(${JSON.stringify({
                    name: cafeName,
                    address: cafeAddress,
                    rating: cafeRating,
                    photo: photoURL
                })})'>
                    Save Cafe
                </button>
            </div>
        `;
    });
}

function saveCafe(cafe) {
        const savedCafes = 
            JSON.parse(localStorage.getItem("savedCafes")) || [];

        const alreadySaved = savedCafes.some(savedCafe =>
            savedCafe.name === cafe.name &&
            savedCafe.address === cafe.address
        );

        if (alreadySaved) {
            alert(`${cafe.name} is already saved!`);
            return;
        }

        savedCafes.push(cafe);

        localStorage.setItem("savedCafes", JSON.stringify(savedCafes));

        alert(`${cafe.name} saved!`);
}

function showSaved() {
    const savedCafes =
        JSON.parse(localStorage.getItem("savedCafes")) || [];
    
    const cards = document.querySelector(".cards");

    cards.innerHTML = "";

    if (savedCafes.length === 0) {
        cards.innerHTML = "<p>No saved cafes yet ☕</p>";
        return;
    }

    savedCafes.forEach(cafe => {
        cards.innerHTML += `
            <div class="card">
                ${cafe.photo
                    ? `<img src="${cafe.photo}" alt="${cafe.name}" class="cafe-photo">`
                    : `<div class="no-photo">☕</div>`
                }

                <h3>${cafe.name}</h3>
                <p>📍 ${cafe.address}</p>
                <p>⭐ ${cafe.rating ?? "No rating yet"}</p>

                <button class="remove-btn" onclick='removeCafe(${JSON.stringify(cafe)})'>
                    Remove Cafe
                </button>
            </div>
        `;
    });
}
function removeCafe(cafe) {
    let savedCafes =
        JSON.parse(localStorage.getItem("savedCafes")) || [];

    savedCafes = savedCafes.filter(savedCafe =>
        !(
            savedCafe.name === cafe.name &&
            savedCafe.address === cafe.address
        )
    );

    localStorage.setItem("savedCafes", JSON.stringify(savedCafes));

    showSaved();
}